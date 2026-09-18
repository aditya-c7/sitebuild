import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "404 error",
  description: "This page drifted away. Head back home or ask Aditya's AI assistant.",
};

// Slow, sparse falling comets behind the content.
// Negative delays keep them mid-flight on first paint.
const COMETS = [
  { left: "8%", duration: "22s", delay: "-6s", length: 110, tone: "white" },
  { left: "22%", duration: "17s", delay: "-14s", length: 80, tone: "white" },
  { left: "38%", duration: "24s", delay: "-3s", length: 130, tone: "blue" },
  { left: "55%", duration: "19s", delay: "-11s", length: 90, tone: "white" },
  { left: "68%", duration: "23s", delay: "-17s", length: 120, tone: "white" },
  { left: "82%", duration: "16s", delay: "-8s", length: 75, tone: "blue" },
  { left: "93%", duration: "21s", delay: "-19s", length: 100, tone: "white" },
] as const;

export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      {/* Comet field — decorative only */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {COMETS.map((c, i) => (
          <span
            key={i}
            className="animate-comet absolute top-0 block w-px rounded-full"
            style={{
              left: c.left,
              height: c.length,
              animationDuration: c.duration,
              animationDelay: c.delay,
              background:
                c.tone === "blue"
                  ? "linear-gradient(to bottom, transparent, rgba(96, 165, 250, 0.85))"
                  : "linear-gradient(to bottom, transparent, rgba(231, 229, 228, 0.55))",
              boxShadow:
                c.tone === "blue"
                  ? "0 0 8px 1px rgba(96, 165, 250, 0.35)"
                  : "0 0 6px 1px rgba(231, 229, 228, 0.22)",
            }}
          />
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
    </div>
  );
}
