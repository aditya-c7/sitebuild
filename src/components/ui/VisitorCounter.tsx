"use client";

import { useEffect, useState } from "react";
import Skeleton from "@/components/ui/Skeleton";

// Uses our own /api/visitors (Upstash Redis if env, else in-memory). External countapi is dead/behind Cloudflare.
const VISITED_FLAG = "adityahq_visited";

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

export default function VisitorCounter({ active = true }: { active?: boolean }) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!active) return;

    const hasVisited = localStorage.getItem(VISITED_FLAG);
    const endpoint = hasVisited ? "/api/visitors?action=get" : "/api/visitors?action=hit";
    if (!hasVisited) localStorage.setItem(VISITED_FLAG, "1");

    const load = async () => {
      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        const data = await res.json().catch(() => null);
        const n = parseCount(data);
        if (!cancelled) setCount(n);
      } catch {
        if (!cancelled) setCount(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
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
