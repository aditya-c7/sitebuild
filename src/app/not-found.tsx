import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "404 error",
  description: "This page drifted away. Head back home or ask Aditya's AI assistant.",
};

// Sparse meteor shower: 3 ambient + 1 blue hero. Shared parallel path —
// uniform-phase delays keep ≤2 on screen and mid-flight on first paint.
// Lanes stay off the center text band.
const COMETS = [
  { left: "12%", duration: "9s", delay: "-1.25s", length: 100, width: 1.5, head: 3, tone: "white" },
  { left: "30%", duration: "9s", delay: "-3.75s", length: 120, width: 1.5, head: 3, tone: "white" },
  { left: "70%", duration: "9s", delay: "-6.25s", length: 95, width: 1.5, head: 3, tone: "white" },
  { left: "88%", duration: "7s", delay: "-8.75s", length: 140, width: 2, head: 4, tone: "blue" },
] as const;

const TAIL_BG = {
  white:
    "linear-gradient(to bottom, transparent 0%, rgba(231, 229, 228, 0) 15%, rgba(231, 229, 228, 0.25) 55%, rgba(255, 255, 255, 0.85) 88%, #fff 100%)",
  blue: "linear-gradient(to bottom, transparent 0%, rgba(96, 165, 250, 0) 10%, rgba(147, 197, 253, 0.35) 60%, rgba(219, 234, 254, 0.95) 90%, #fff 100%)",
} as const;

export default function NotFound() {
  return (
    <>
      {/* Comet field — viewport-locked decorative layer */}
      <div aria-hidden="true" className="comet-field pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {COMETS.map((c, i) => (
          <span
            key={i}
            className="animate-comet absolute top-0 block rounded-full"
            style={{
              left: c.left,
              width: c.width,
              height: c.length,
              animationDuration: c.duration,
              animationDelay: c.delay,
              background: TAIL_BG[c.tone],
              boxShadow:
                c.tone === "blue"
                  ? "0 0 8px 0 rgba(147, 197, 253, 0.45)"
                  : "0 0 6px 0 rgba(255, 255, 255, 0.35)",
            }}
          >
            <span
              className="absolute left-1/2 block rounded-full"
              style={{
                width: c.head,
                height: c.head,
                bottom: -c.head / 2,
                transform: "translateX(-50%)",
                background:
                  "radial-gradient(circle, #fff 0%, rgba(255, 255, 255, 0.9) 30%, rgba(191, 219, 254, 0.35) 55%, transparent 70%)",
                boxShadow:
                  c.tone === "blue"
                    ? "0 0 10px 2px rgba(147, 197, 253, 0.7)"
                    : "0 0 8px 2px rgba(255, 255, 255, 0.8)",
              }}
            />
          </span>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-4xl flex-col items-center justify-center px-5 pt-14 text-center md:min-h-[calc(100dvh-4rem)] md:max-w-[960px] md:px-6 md:pt-16">
<p className="mb-4 font-mono text-sm text-blue-500">Error</p>
        <h1 className="font-editorial text-[6rem] font-normal leading-none tracking-tight text-zinc-50 no-select select-none sm:text-8xl md:text-9xl">
          404
        </h1>
        <p className="mt-6 max-w-md leading-relaxed text-zinc-400">
          This page drifted away into the void. The good stuff is still one click away.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="/chat"
            className="group inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-blue-glow hover:shadow-blue-500/30"
          >
            Ask my AI assistant
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#2E2A27] px-5 py-2.5 text-sm font-medium text-zinc-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-600 hover:bg-[#38332F]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </a>
        </div>
      </div>
    </>
  );
}
