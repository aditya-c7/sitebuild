"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Mounts children only after this box first enters the viewport, so every
// data fetch inside stays dormant until the user actually scrolls here.
// threshold 0 fires the instant the first pixel crosses the viewport edge.
// One-shot: the observer disconnects after firing. SSR renders the fallback
// (deterministic — no hydration mismatch). Without IntersectionObserver
// support, children start immediately.
// NOTE: children must be plain elements, never a function — functions can't
// cross the server/client serialization boundary.

interface LazyMountProps {
  children: ReactNode;
  fallback: ReactNode;
  className?: string;
  // "self" observes this box; "footer" observes the enclosing <footer> element
  // so loading starts the instant the footer's top edge crosses the viewport bottom.
  observe?: "self" | "footer";
}

export default function LazyMount({ children, fallback, className, observe = "self" }: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }
    const target = observe === "footer" ? (el.closest("footer") ?? el) : el;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px" }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [observe]);

  return (
    <div ref={ref} className={className}>
      {started ? children : fallback}
    </div>
  );
}
