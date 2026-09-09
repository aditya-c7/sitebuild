"use client";

import { useEffect, useState } from "react";
import Skeleton from "@/components/ui/Skeleton";

// Uses our own /api/visitors (Abacus persistent store, Upstash if env, memory fallback).
// Rule: one count per browser — hit is sent only on first-ever visit (localStorage flag),
// refreshes only read. Live number re-fetches every 10s while the tab is visible.
const VISITED_FLAG = "adityahq_visited";
const CACHED_COUNT_KEY = "adityahq_visitor_count";
const POLL_MS = 10000;

function parseCount(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const v = (data as { value?: unknown }).value;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function readCachedCount(): number | null {
  try {
    const raw = localStorage.getItem(CACHED_COUNT_KEY);
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function writeCachedCount(n: number) {
  try {
    localStorage.setItem(CACHED_COUNT_KEY, String(n));
  } catch {
    // private mode — ignore
  }
}

async function fetchCount(endpoint: string): Promise<number | null> {
  try {
    const res = await fetch(endpoint, { cache: "no-store" });
    if (!res.ok) return null;
    return parseCount(await res.json().catch(() => null));
  } catch {
    return null;
  }
}

export default function VisitorCounter({ active = true }: { active?: boolean }) {
  // Stale-while-revalidate: show last known count instantly, refresh in background.
  // Skeleton only on a true first-ever load with no cache.
  const [count, setCount] = useState<number | null>(() => readCachedCount());
  const [loading, setLoading] = useState(() => readCachedCount() === null);

  useEffect(() => {
    let cancelled = false;
    if (!active) return;

    const hasVisited = localStorage.getItem(VISITED_FLAG);
    // First visit from this browser counts once; every later load only reads.
    const firstEndpoint = hasVisited ? "/api/visitors?action=get" : "/api/visitors?action=hit";
    if (!hasVisited) localStorage.setItem(VISITED_FLAG, "1");

    const refresh = async (endpoint: string) => {
      const n = await fetchCount(endpoint);
      if (!cancelled && n !== null) {
        setCount(n);
        writeCachedCount(n);
      }
      if (!cancelled) setLoading(false);
    };

    refresh(firstEndpoint);

    // Live updates: re-read every 10s while tab is visible. Never increments locally —
    // the server is the single source of truth, so the number can only go up, never reset.
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refresh("/api/visitors?action=get");
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [active]);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5" aria-hidden="true">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
        <Skeleton className="w-36" />
      </span>
    );
  }

  if (count === null) {
    return <span className="animate-fade-rise font-mono text-xs text-zinc-500">— visitors so far</span>;
  }

  const formatted = new Intl.NumberFormat("en-IN").format(count);

  return (
    <span className="animate-fade-rise inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/70" aria-hidden="true" />
      {formatted} visitors so far
    </span>
  );
}
