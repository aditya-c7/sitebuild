"use client";

import { useEffect, useRef, useState } from "react";
import { SiGithub } from "react-icons/si";
import SectionHeading from "@/components/ui/SectionHeading";

interface GithubDay {
  date: string;
  contributionCount: number;
  color: string;
}

interface GithubWeek {
  contributionDays: GithubDay[];
}

interface GithubData {
  total: number;
  weeks: GithubWeek[];
  stats?: {
    commits: number;
    pullRequests: number;
    issues: number;
    reviews: number;
  };
}

const EMPTY_CELL = "#161b22";

function cellColor(day: GithubDay): string {
  if (!day || typeof day !== "object") return EMPTY_CELL;
  // Count-based dark scale (GitHub dark greens). The API returns
  // light-scheme colors, which wash out on a black theme.
  const c = typeof day.contributionCount === "number" ? day.contributionCount : 0;
  if (c <= 0) return EMPTY_CELL;
  if (c <= 3) return "#0e4429";
  if (c <= 6) return "#006d32";
  if (c <= 9) return "#26a641";
  return "#39d353";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthLabels(weeks: GithubWeek[]): (string | null)[] {
  let prev = -1;
  return weeks.map((w) => {
    const days = w && Array.isArray(w.contributionDays) ? w.contributionDays : [];
    const d = days[0]?.date;
    if (!d) return null;
    const m = new Date(d + "T00:00:00").getMonth();
    if (!Number.isFinite(m)) return null;
    if (m !== prev) {
      prev = m;
      return MONTHS[m] ?? null;
    }
    return null;
  });
}

function validStats(s: unknown): s is GithubData["stats"] {
  if (!s || typeof s !== "object") return false;
  const r = s as Record<string, unknown>;
  return ["commits", "pullRequests", "issues", "reviews"].every(
    (k) => typeof r[k] === "number" && Number.isFinite(r[k])
  );
}

export default function GitHubActivity() {
  const [data, setData] = useState<GithubData | null>(null);
  const [failed, setFailed] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const snappedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/github")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j: GithubData) => {
        if (cancelled) return;
        // Stats are optional: the token-free fallback serves heatmap only.
        if (
          typeof j.total === "number" &&
          Array.isArray(j.weeks) &&
          (j.stats === undefined || validStats(j.stats))
        )
          setData(j);
        else setFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Start scrolled fully right (latest month) wherever the grid overflows.
  // One-shot per data load so it never fights manual scrolling.
  useEffect(() => {
    if (!data || snappedRef.current) return;
    snappedRef.current = true;
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el && el.scrollWidth > el.clientWidth + 1) el.scrollLeft = el.scrollWidth;
    });
  }, [data]);

  const labels = data ? monthLabels(data.weeks) : [];

  return (
    <section id="activity" className="mx-auto max-w-4xl px-5 pb-10 md:max-w-[832px] md:px-6 md:pb-16 no-select select-none">
      <SectionHeading title="GitHub Activity" />

      <div>
        {!data && !failed && (
          <div
            role="status"
            aria-label="Loading contribution graph"
            className="animate-pulse min-h-[220px]"
          >
            <div className="h-4 w-48 rounded bg-white/[0.06]" />
            <div className="mt-4 flex gap-[2px]">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-[2px]">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <div key={j} className="h-[12px] w-[12px] rounded-[2px] bg-white/[0.05] md:h-[14px] md:w-[14px]" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        {data ? (
          <>
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-xs md:text-sm text-zinc-400">
                {data.total.toLocaleString()} contributions in the last year
              </p>
              <a
                href="https://github.com/aditya-c7"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs md:text-sm text-zinc-400 transition-colors hover:text-zinc-200 hover:underline hover:underline-offset-4"
              >
                @aditya-c7
              </a>
            </div>

            <div ref={scrollRef} className="no-scrollbar mt-3 overflow-x-auto">
              <div className="flex w-max gap-[2px]">
                <div className="sticky left-0 z-10 flex flex-col gap-[2px] bg-black pr-1 pt-[14px] shadow-[8px_0_12px_0_#000]">
                  {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                    <span
                      key={i}
                      className="flex h-[12px] items-center font-mono text-[10px] leading-none text-white md:h-[14px]"
                    >
                      {d}
                    </span>
                  ))}
                </div>
                {data.weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[2px]">
                    <span className="flex h-[12px] text-xs leading-none text-zinc-400">
                      {labels[wi] ?? ""}
                    </span>
                    {week.contributionDays.map((day, di) =>
                      !day || typeof day !== "object" ? null : (
                        <span
                          key={di}
                          title={`${day.contributionCount ?? 0} on ${day.date ?? ""}`}
                          className="h-[12px] w-[12px] rounded-[2px] md:h-[14px] md:w-[14px]"
                          style={{ backgroundColor: cellColor(day) }}
                        />
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-end gap-1 font-mono text-[10px] text-zinc-600">
              Less
              {["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"].map((c) => (
                <span
                  key={c}
                  className="h-[12px] w-[12px] rounded-[2px] md:h-[14px] md:w-[14px]"
                  style={{ backgroundColor: c }}
                />
              ))}
              More
            </div>
          </>) : null}
      </div>

        {failed && (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-zinc-400">
              Live contribution data is unavailable right now.
            </p>
            <a
              href="https://github.com/aditya-c7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0A0A0A] px-3 py-1.5 text-xs font-medium text-blue-400 transition-colors hover:border-blue-500/50 hover:text-blue-300 md:px-3.5 md:py-2 md:text-sm"
            >
              <SiGithub className="h-3.5 w-3.5" aria-hidden="true" />
              View GitHub profile <span aria-hidden>→</span>
            </a>
          </div>
        )}
    </section>
  );
}
