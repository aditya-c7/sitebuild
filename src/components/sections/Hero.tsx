"use client";

import {
  ArrowRight,
  FileText,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";
import { useEffect } from "react";
import { HERO_DATA } from "@/data/portfolioData";
import { TimeOffset } from "@/components/ui/TimeOffset";

const SOCIALS = [
  { name: "GitHub", href: HERO_DATA.socials.github, icon: Github },
  { name: "LinkedIn", href: HERO_DATA.socials.linkedin, icon: Linkedin },
  { name: "Email", href: `mailto:${HERO_DATA.socials.email}`, icon: Mail },
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
    <section className="relative mx-auto max-w-4xl px-6 pt-6 pb-16 text-center md:text-left md:pt-8 md:pb-20">
      <div>
        <p className="mb-4 font-mono text-sm text-blue-500">~/hello-world</p>

        <h1 className="text-[2.6rem] font-normal leading-none tracking-tight text-zinc-50 sm:text-5xl md:text-7xl font-editorial">
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
            className="group inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-blue-glow hover:shadow-blue-500/30"
          >
            Get in touch
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
          <a
            href={HERO_DATA.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#121215] px-5 py-2.5 text-sm font-medium text-zinc-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-600 hover:bg-[#18181b]"
          >
            <FileText className="h-4 w-4" />
            Resume
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
          {SOCIALS.map((social) =>
            social.name === "LinkedIn" ? (
              <div key={social.name} className="group relative inline-flex">
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex rounded-lg border border-zinc-800 bg-[#121215] p-2.5 text-zinc-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/50 hover:text-blue-400"
                >
                  <social.icon className="h-4 w-4" />
                </a>

                {/* LinkedIn badge – only on hover, body = badge */}
                <div className="hidden group-hover:block absolute left-1/2 top-full z-50 mt-3 w-fit -translate-x-1/2 md:left-0 md:translate-x-0">
                  <div className="w-fit overflow-hidden rounded-lg shadow-xl">
                    <div
                      className="badge-base LI-profile-badge"
                      data-locale="en_US"
                      data-size="medium"
                      data-theme="light"
                      data-type="VERTICAL"
                      data-vanity="adityachitragar"
                      data-version="v1"
                    >
                      <a
                        className="badge-base__link LI-simple-link"
                        href="https://in.linkedin.com/in/adityachitragar?trk=profile-badge"
                      >
                        Aditya Chitragar
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="rounded-lg border border-zinc-800 bg-[#121215] p-2.5 text-zinc-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/50 hover:text-blue-400"
              >
                <social.icon className="h-4 w-4" />
              </a>
            )
          )}
        </div>
      </div>
    </section>
  );
}