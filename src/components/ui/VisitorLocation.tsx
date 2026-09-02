"use client";

import { useEffect, useState } from "react";

const LOCATION_CACHE_KEY = "adityahq_location";

export default function VisitorLocation() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (cached) {
      setText(cached);
      return;
    }

    fetch("https://ipapi.co/json/")
      .then((r) => {
        if (!r.ok) throw new Error("ipapi failed");
        return r.json();
      })
      .then((data) => {
        const city = (data.city as string) || "";
        const country = (data.country_name as string) || (data.country as string) || "";
        let location = "";
        if (city && country) location = `${city}, ${country}`;
        else if (city) location = city;
        else if (country) location = country;
        else location = "your area";

        const full = `You're visiting from ${location}`;
        setText(full);
        try {
          localStorage.setItem(LOCATION_CACHE_KEY, full);
        } catch {
          // ignore storage error
        }
      })
      .catch(() => {
        setText("You're visiting from your location");
      });
  }, []);

  if (!text) {
    return <span className="font-mono text-xs text-zinc-500">Detecting location…</span>;
  }

  return <span className="font-mono text-xs text-zinc-400">{text}</span>;
}
