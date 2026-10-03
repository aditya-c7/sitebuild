import { NextResponse } from "next/server";

export const revalidate = 21600; // 6h CDN cache — contribution data moves slowly

interface GithubDay {
  date: string;
  contributionCount: number;
  color: string;
}

interface GithubWeek {
  contributionDays: GithubDay[];
}

const QUERY = `
query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
          }
        }
      }
    }
  }
}
`;

interface ProxyDay {
  date?: unknown;
  count?: unknown;
}

// Token-free fallback: public contributions proxy (no auth).
// Returns normalized { total, weeks } or null on any failure.
async function fetchProxyCalendar(): Promise<{
  total: number;
  weeks: GithubWeek[];
} | null> {
  try {
    const res = await fetch(
      "https://github-contributions-api.jogruber.de/v4/aditya-c7?y=last",
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.error || !Array.isArray(json?.contributions)) return null;
    const total =
      typeof json?.total?.lastYear === "number" ? json.total.lastYear : null;
    const days: GithubDay[] = [];
    for (const d of json.contributions as ProxyDay[]) {
      if (
        !d ||
        typeof d !== "object" ||
        typeof d.date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(d.date) ||
        typeof d.count !== "number" ||
        !Number.isFinite(d.count)
      ) {
        continue;
      }
      days.push({ date: d.date, contributionCount: Math.max(0, Math.floor(d.count)), color: "" });
    }
    if (days.length === 0) return null;
    const sum = days.reduce((a, d) => a + d.contributionCount, 0);
    const weeks: GithubWeek[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push({ contributionDays: days.slice(i, i + 7) });
    }
    return { total: total ?? sum, weeks };
  } catch {
    return null;
  }
}

export async function GET() {
  const token = process.env.GITHUB_TOKEN;

  // Official GraphQL first (richest: totals + per-day colors + stats).
  if (token) {
    try {
      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: QUERY, variables: { login: "aditya-c7" } }),
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 21600 },
      });
      if (res.ok) {
        const json = await res.json();
        if (!json?.errors) {
          const col = json?.data?.user?.contributionsCollection;
          const cal = col?.contributionCalendar;
          const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
          if (
            cal &&
            Array.isArray(cal.weeks) &&
            num(cal.totalContributions) !== null &&
            num(col.totalCommitContributions) !== null &&
            num(col.totalPullRequestContributions) !== null &&
            num(col.totalIssueContributions) !== null &&
            num(col.totalPullRequestReviewContributions) !== null
          ) {
            const weeks: GithubWeek[] = cal.weeks.filter(
              (w: unknown): w is GithubWeek =>
                !!w && typeof w === "object" && Array.isArray((w as GithubWeek).contributionDays)
            );
            return NextResponse.json(
              {
                total: cal.totalContributions as number,
                weeks,
                stats: {
                  commits: col.totalCommitContributions as number,
                  pullRequests: col.totalPullRequestContributions as number,
                  issues: col.totalIssueContributions as number,
                  reviews: col.totalPullRequestReviewContributions as number,
                },
              },
              {
                headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" },
              }
            );
          }
        }
      }
    } catch {
      // Fall through to the token-free proxy below.
    }
  }

  // Token-free fallback: no stats breakdown available, heatmap only.
  const proxy = await fetchProxyCalendar();
  if (proxy) {
    return NextResponse.json(proxy, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  }

  return NextResponse.json(
    { error: "Contribution data unavailable." },
    { status: 502 }
  );
}
