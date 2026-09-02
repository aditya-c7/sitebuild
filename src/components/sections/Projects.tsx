"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { ExternalLink, Github, Lock } from "lucide-react";
import { PROJECTS_DATA, type Project } from "@/data/portfolioData";
import SectionHeading from "@/components/ui/SectionHeading";
import { Crosshairs } from "@/components/ui/Crosshairs";

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 200;

function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);

  useEffect(() => {
    if (!showPrivate) return;
    const t = setTimeout(() => setShowPrivate(false), 3000);
    return () => clearTimeout(t);
  }, [showPrivate]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 20, stiffness: 300 });
  const springY = useSpring(y, { damping: 20, stiffness: 300 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    x.set(Math.min(Math.max(relX - PREVIEW_WIDTH / 2, 8), rect.width - PREVIEW_WIDTH - 8));
    y.set(relY + 20);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    x.jump(Math.min(Math.max(relX - PREVIEW_WIDTH / 2, 8), rect.width - PREVIEW_WIDTH - 8));
    y.jump(relY + 20);
    setHovered(true);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHovered(false)}
      className="group relative rounded-xl border border-zinc-800 bg-[#121215] p-6 transition-colors duration-200 hover:border-zinc-600 hover:bg-[#18181b]"
    >
      <Crosshairs />

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{ x: springX, y: springY }}
            className="pointer-events-none absolute left-0 top-0 z-50 hidden md:block"
          >
            <div
              className="overflow-hidden rounded-xl border border-zinc-700 bg-[#18181b] shadow-2xl shadow-black/60"
              style={{ width: PREVIEW_WIDTH }}
            >
              <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-red-500/80" />
                <span className="h-2 w-2 rounded-full bg-yellow-500/80" />
                <span className="h-2 w-2 rounded-full bg-green-500/80" />
                <span className="ml-2 flex-1 truncate rounded bg-zinc-800/80 px-2 py-0.5 font-mono text-[10px] text-zinc-500">
                  {project.liveUrl ?? project.githubUrl ?? "localhost:3000"}
                </span>
              </div>
              <div
                className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${project.previewGradient}`}
                style={{ height: PREVIEW_HEIGHT - 56 }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_60%)]" />
                <div className="relative w-[75%]">
                  <div className="h-2 w-1/3 rounded-full bg-white/20" />
                  <div className="mt-2 h-1.5 w-full rounded-full bg-white/10" />
                  <div className="mt-1.5 h-1.5 w-5/6 rounded-full bg-white/10" />
                  <div className="mt-1.5 h-1.5 w-2/3 rounded-full bg-white/10" />
                  <div className="mt-3 flex gap-1.5">
                    <span className="h-4 w-12 rounded bg-white/15" />
                    <span className="h-4 w-12 rounded bg-white/10" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-widest text-white/40">
                  {project.id}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-semibold text-zinc-100 transition-colors duration-200 group-hover:text-blue-300">
          {project.title}
        </h3>
        <div className="relative flex shrink-0 items-center gap-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="rounded-md border border-zinc-800 p-2 text-zinc-400 transition-colors hover:border-blue-500/50 hover:text-blue-400"
            >
              <Github className="h-4 w-4" />
            </a>
          )}
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Live demo"
              className="rounded-md border border-zinc-800 p-2 text-zinc-400 transition-colors hover:border-blue-500/50 hover:text-blue-400"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <>
              <button
                onClick={() => setShowPrivate((v) => !v)}
                aria-label="Private demo"
                className="rounded-md border border-zinc-800 p-2 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {showPrivate && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute bottom-full right-0 z-20 mb-2 w-64 overflow-hidden rounded-xl border border-zinc-800/80 bg-[#0d0d10]/75 backdrop-blur-xl shadow-2xl shadow-black/60"
                  >
                    <div className="bg-gradient-to-br from-zinc-900/60 via-zinc-900/30 to-transparent p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                          <Lock className="h-3.5 w-3.5 text-zinc-300" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-100">Private</p>
                          <p className="text-[11px] text-zinc-400">Demo not public</p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                        This project demo is private.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        {project.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-zinc-800/60 px-2 py-1 font-mono text-xs text-zinc-400 transition-colors group-hover:text-zinc-300"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-4xl px-6 pb-16 md:pb-20">
      <SectionHeading index="02" title="Projects" />

      <div className="flex flex-col gap-6">
        {PROJECTS_DATA.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
