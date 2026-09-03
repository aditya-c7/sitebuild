"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  phase: number;
  freq: number;
}

interface HeroBannerProps {
  imageSrc?: string;
}

const PARTICLE_COLORS = ["#38bdf8", "#3b82f6", "#818cf8", "#ffffff"];
const PARTICLE_COUNT = 40;
const EDGE_BUFFER = 6;

const STRIPE_CLASS =
  "h-3 w-full border-y border-zinc-800/80 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.06),rgba(255,255,255,0.06)_1px,transparent_1px,transparent_8px)]";

const EDGE_MASK =
  "radial-gradient(ellipse 92% 82% at 50% 50%, black 45%, transparent 100%)";

export default function HeroBanner({ imageSrc = "/banner.jpg" }: HeroBannerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];

    const spawn = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.24,
      vy: -(0.15 + Math.random() * 0.25),
      r: 0.8 + Math.random() * 1.6,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      phase: Math.random() * Math.PI * 2,
      freq: 0.4 + Math.random() * 1.2,
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length !== PARTICLE_COUNT) {
        particles = Array.from({ length: PARTICLE_COUNT }, spawn);
      }
    };

    const step = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const seconds = time / 1000;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -EDGE_BUFFER) p.y = height + EDGE_BUFFER;
        if (p.y > height + EDGE_BUFFER) p.y = -EDGE_BUFFER;
        if (p.x < -EDGE_BUFFER) p.x = width + EDGE_BUFFER;
        if (p.x > width + EDGE_BUFFER) p.x = -EDGE_BUFFER;

        const alpha = 0.15 + 0.7 * (0.5 + 0.5 * Math.sin(seconds * p.freq + p.phase));

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(step);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      className="relative mx-auto mt-16 mb-2 w-full max-w-5xl select-none px-4"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className={STRIPE_CLASS} />

      <div
        className="relative aspect-[4096/1365] w-full select-none overflow-hidden bg-[#0d0d10]"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        <Image
          src={imageSrc}
          alt="Panoramic banner"
          fill
          draggable={false}
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="pointer-events-none select-none object-cover object-top opacity-90"
          style={{
            maskImage: EDGE_MASK,
            WebkitMaskImage: EDGE_MASK,
            userSelect: "none",
            pointerEvents: "none",
          } as CSSProperties}
        />
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        />
        {/* Transparent overlay to block double-click, drag, right-click — keeps banner view-only */}
        <div
          className="absolute inset-0 z-20 select-none"
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          aria-hidden="true"
          style={{ WebkitUserDrag: "none", userSelect: "none" } as CSSProperties}
        />
      </div>

      <div className={STRIPE_CLASS} />
    </div>
  );
}
