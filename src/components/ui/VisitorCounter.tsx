"use client";

import { useEffect, useState } from "react";

// countapi.xyz is dead (2024+). Using its drop-in replacement:
// https://countapi.mileshilliard.com — same idea, no signup, free.
// Docs: GET /api/v1/get/:key, HIT /api/v1/hit/:key
const API_BASE = "https://countapi.mileshilliard.com/api/v1";
const KEY = "adityahq-visitors";
const VISITED_FLAG = "adityahq_visited";
const VISITOR_ID_KEY = "adityahq_visitor_id";

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

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const hasVisited = localStorage.getItem(VISITED_FLAG);

    // create persistent unique visitor ID (never counted twice on same browser)
    if (!localStorage.getItem(VISITOR_ID_KEY)) {
      try {
        localStorage.setItem(VISITOR_ID_KEY, crypto.randomUUID());
      } catch {
        localStorage.setItem(VISITOR_ID_KEY, `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      }
    }

    // Unique rule: hit (+1) only on first visit from this browser, else get.
    const endpoint = hasVisited
      ? `${API_BASE}/get/${KEY}`
      : `${API_BASE}/hit/${KEY}`;

    if (!hasVisited) {
      localStorage.setItem(VISITED_FLAG, "1");
    }

    const load = async () => {
      try {
        let res = await fetch(endpoint, { cache: "no-store" });
        // If key never existed, GET returns 404 — create it with a HIT.
        if (!res.ok && hasVisited) {
          res = await fetch(`${API_BASE}/hit/${KEY}`, { cache: "no-store" });
        }
        const data = await res.json().catch(() => null);
        let n = parseCount(data);
        // If HIT failed but GET might work (or vice versa), try the other once.
        if (n === null) {
          const fallback = hasVisited ? `${API_BASE}/hit/${KEY}` : `${API_BASE}/get/${KEY}`;
          try {
            const r2 = await fetch(fallback, { cache: "no-store" });
            const d2 = await r2.json().catch(() => null);
            n = parseCount(d2);
          } catch {
            // ignore, will show fallback below
          }
        }
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
  }, []);

  if (loading) {
    return <span className="font-mono text-xs text-zinc-500">Counting visitors…</span>;
  }

  if (count === null) {
    return <span className="font-mono text-xs text-zinc-500">— visitors so far</span>;
  }

  const formatted = new Intl.NumberFormat("en-IN").format(count);

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/70" aria-hidden="true" />
      {formatted} visitors so far
    </span>
  );
}
