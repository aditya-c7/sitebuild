"use client";

import { useEffect, useState } from "react";

const COLORS = ["text-red-500", "text-emerald-500", "text-yellow-400", "text-blue-500"] as const;

export default function BlinkingUnderscore({ className = "ml-1" }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % COLORS.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return <span className={`animate-pulse ${COLORS[index]} ${className}`} aria-hidden="true">_</span>;
}
