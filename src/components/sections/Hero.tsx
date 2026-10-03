"use client";

import {
  Mail,
} from "lucide-react";
import { SiGithub } from "react-icons/si";
import { useEffect } from "react";
import { HERO_DATA } from "@/data/portfolioData";
import { TimeOffset } from "@/components/ui/TimeOffset";
import { LinkedinBrand } from "@/components/ui/TechIcons";

const SOCIALS = [
  { name: "GitHub", href: HERO_DATA.socials.github, icon: SiGithub },
  { name: "LinkedIn", href: HERO_DATA.socials.linkedin, icon: LinkedinBrand },
];

export default function Hero() {
  // Load LinkedIn badge script once
  useEffect(() => {
    const existing = document.querySelector(
      'script[src="https://platform.linkedin.com/badges/js/profile.js"]'
    );
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://platform.linkedin.com/badges/js/profile.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <section className="relative mx-auto max-w-4xl px-5 pt-6 pb-12 text-center md:max-w-[960px] md:px-6 md:pt-8 md:pb-20 md:text-left">
      <div>
        <p className="mb-4 font-mono text-sm text-blue-500">~/hello-world</p>

        <h1 className="text-[2.6rem] font-normal leading-none tracking-tight text-zinc-50 sm:text-5xl md:text-7xl font-editorial no-select select-none">
          {HERO_DATA.name.split(" ")[0]}{" "}
          <span className="text-white">
            {HERO_DATA.name.split(" ").slice(1).join(" ")}
          </span>
        </h1>

        <p className="mt-4 font-mono text-lg text-zinc-400 md:text-xl">
          {HERO_DATA.role}
        </p>

        <div className="mt-5">
          <TimeOffset
            targetTimeZone={HERO_DATA.targetTimeZone}
            city={HERO_DATA.locationName}
          />
        </div>

        <p className="mt-6 mx-auto max-w-2xl leading-relaxed text-zinc-400 md:mx-0">
          {HERO_DATA.bioPart1}
          <span>{HERO_DATA.bioHighlight}</span>
          {HERO_DATA.bioPart2}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
          <a
            href={`mailto:${HERO_DATA.socials.email}`}
            className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25),0_0_0_1px_rgba(0,0,0,0.35),0_8px_24px_-6px_rgba(37,99,235,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-[1.08] hover:shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.3),0_0_0_1px_rgba(0,0,0,0.35),0_12px_32px_-6px_rgba(59,130,246,0.6)]"
          >
            Contact me
            <Mail className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
          {SOCIALS.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              className="rounded-xl bg-[linear-gradient(180deg,#1C1C1E_0%,#101012_45%,#0A0A0B_100%)] p-2.5 text-zinc-400 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_0_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.55),0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:text-blue-400 hover:brightness-[1.08]"
            >
              <social.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}