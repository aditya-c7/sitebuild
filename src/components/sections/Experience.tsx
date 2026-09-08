"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { EXPERIENCE_DATA } from "@/data/portfolioData";
import SectionHeading from "@/components/ui/SectionHeading";
import { Crosshairs } from "@/components/ui/Crosshairs";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Experience() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="experience" className="no-select mx-auto max-w-4xl select-none px-5 pb-10 md:max-w-[960px] md:px-6 md:pb-16">
      <SectionHeading index="02" title="Experience" />

      <div className="relative rounded-xl border border-zinc-800 bg-[#2E2A27]">
        <Crosshairs />

        {EXPERIENCE_DATA.map((item, i) => {
          const open = openId === item.id;
          const expandable = item.highlights.length > 0;
          return (
            <div key={item.id} className={i > 0 ? "border-t border-zinc-800/80" : ""}>
              <button
                onClick={() => setOpenId(open ? null : item.id)}
                aria-expanded={open}
                aria-label={`${item.organization} — ${item.role}`}
                className="flex h-[72.5px] w-full items-center justify-between gap-3 px-5 text-left md:px-6"
              >
                <div className="flex items-center gap-4">
                  {item.logo ? (
                    <img
                      src={item.logo}
                      alt={`${item.organization} logo`}
                      draggable={false}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-mono text-xs font-semibold text-zinc-300"
                    >
                      {initials(item.organization)}
                    </span>
                  )}
                  <div>
                    <h3 className="font-display text-base font-semibold tracking-tight text-zinc-100 md:text-lg">
                      {item.organization}
                    </h3>
                    <p className="mt-0.5 text-sm text-zinc-400">{item.role}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 pl-14 sm:pl-0">
                  <div className="flex flex-col items-end gap-1">
                    <span className="whitespace-nowrap text-sm text-zinc-400">{item.period}</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                      {item.type}
                    </span>
                  </div>
                  {expandable && (
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {open && expandable && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <ul className="flex flex-col gap-3 px-5 pb-6 md:px-6">
                      {item.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex gap-3 text-sm leading-relaxed text-zinc-300"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-zinc-500"
                          />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
