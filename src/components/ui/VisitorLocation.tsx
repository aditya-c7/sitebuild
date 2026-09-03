"use client";

import { useEffect, useState } from "react";

const LOCATION_CACHE_KEY = "adityahq_location";

export default function VisitorLocation() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (cached) {
      setText(cached);
      return;
    }

    const formatLocation = (data: Record<string, unknown>): string | null => {
      const city = typeof data.city === "string" ? data.city : "";
      // ipwho.is uses `country`, ipapi.co uses `country_name`
      const country =
        (typeof data.country_name === "string" && data.country_name) ||
        (typeof data.country === "string" && data.country) ||
        "";
      if (data.success === false) return null;
      if ((data as { error?: unknown }).error === true) return null;
      if (city && country) return `${city}, ${country}`;
      if (city) return city;
      if (country) return country;
      return null;
    };

    const save = (full: string) => {
      if (cancelled) return;
      setText(full);
      try {
        localStorage.setItem(LOCATION_CACHE_KEY, full);
      } catch {
        // ignore storage error
      }
    };

    const load = async () => {
      // Primary: ipwho.is (free, no key, CORS-enabled). Fallback: ipapi.co
      const sources = ["https://ipwho.is/", "https://ipapi.co/json/"];
      for (const url of sources) {
        try {
          const r = await fetch(url, { cache: "no-store" });
          if (!r.ok) continue;
          const data = (await r.json().catch(() => null)) as Record<string, unknown> | null;
          if (!data) continue;
          const location = formatLocation(data);
          if (location) {
            save(`You're visiting from ${location}`);
            return;
          }
        } catch {
          // try next source
        }
      }
      save("You're visiting from your location");
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!text) {
    return <span className="font-mono text-xs text-zinc-500">Detecting location…</span>;
  }

  return <span className="font-mono text-xs text-zinc-400">{text}</span>;
}
