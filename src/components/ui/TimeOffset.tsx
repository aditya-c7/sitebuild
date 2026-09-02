"use client";
import { useEffect, useState } from "react";

export function TimeOffset({
  targetTimeZone = "Asia/Kolkata",
    city = "India",
}: {
  targetTimeZone?: string;
  city?: string;
}) {
  const [timeString, setTimeString] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      const localFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: targetTimeZone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      setTimeString(localFormatter.format(now));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [targetTimeZone]);

  if (!mounted) {
    return (
      <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-3 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>{city}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-3 py-1 rounded-full shadow-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <span>{city}</span>
      <span className="text-zinc-600">&middot;</span>
      <span>{timeString}</span>
    </div>
  );
}
