"use client";

import { useEffect, useState } from "react";

const NAMESPACE = "adityahq";
const KEY = "visitors";
const VISITED_FLAG = "adityahq_visited";
const VISITOR_ID_KEY = "adityahq_visitor_id";

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasVisited = localStorage.getItem(VISITED_FLAG);

    // create persistent unique visitor ID (never counted twice on same browser)
    if (!localStorage.getItem(VISITOR_ID_KEY)) {
      try {
        localStorage.setItem(VISITOR_ID_KEY, crypto.randomUUID());
      } catch {
        localStorage.setItem(VISITOR_ID_KEY, `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      }
    }

    const endpoint = hasVisited
      ? `https://api.countapi.xyz/get/${NAMESPACE}/${KEY}`
      : `https://api.countapi.xyz/hit/${NAMESPACE}/${KEY}`;

    if (!hasVisited) {
      localStorage.setItem(VISITED_FLAG, "1");
    }

    fetch(endpoint)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.value === "number") {
          setCount(data.value);
        } else {
          // fallback: try get
          return fetch(`https://api.countapi.xyz/get/${NAMESPACE}/${KEY}`)
            .then((r) => r.json())
            .then((d) => {
              if (typeof d.value === "number") setCount(d.value);
            });
        }
      })
      .catch(() => {
        // if countapi is down, show 0 gracefully and don't break location
        fetch(`https://api.countapi.xyz/get/${NAMESPACE}/${KEY}`)
          .then((r) => r.json())
          .then((d) => {
            if (typeof d.value === "number") setCount(d.value);
            else setCount(null);
          })
          .catch(() => setCount(null));
      })
      .finally(() => setLoading(false));
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
