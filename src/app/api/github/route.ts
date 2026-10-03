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

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "GitHub token not configured." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login: "aditya-c7" } }),
      next: { revalidate: 21600 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "GitHub API unavailable." },
        { status: 502 }
      );
    }
    const json = await res.json();
    if (json?.errors) {
      return NextResponse.json(
        { error: "GitHub API rejected the request." },
        { status: 502 }
      );
    }
    const col = json?.data?.user?.contributionsCollection;
    const cal = col?.contributionCalendar;
    const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
    if (
      !cal ||
      !Array.isArray(cal.weeks) ||
      num(cal.totalContributions) === null ||
      num(col.totalCommitContributions) === null ||
      num(col.totalPullRequestContributions) === null ||
      num(col.totalIssueContributions) === null ||
      num(col.totalPullRequestReviewContributions) === null
    ) {
      return NextResponse.json(
        { error: "GitHub API returned no calendar." },
        { status: 502 }
      );
    }
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
  } catch {
    return NextResponse.json(
      { error: "GitHub API unreachable." },
      { status: 502 }
    );
  }
}
