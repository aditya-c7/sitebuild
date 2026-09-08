import { Mail } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { HERO_DATA } from "@/data/portfolioData";
import { LinkedinBrand } from "@/components/ui/TechIcons";
import VisitorCounter from "@/components/ui/VisitorCounter";
import VisitorLocation from "@/components/ui/VisitorLocation";
import VisitorDevice from "@/components/ui/VisitorDevice";
import VisitorBrowser from "@/components/ui/VisitorBrowser";
import LazyMount from "@/components/ui/LazyMount";
import Skeleton from "@/components/ui/Skeleton";
import BlinkingUnderscore from "@/components/ui/BlinkingUnderscore";

const PAGES = [
  { label: "Projects", href: "#projects" },
  { label: "Resume", href: "#" },
];

const SOCIALS = [
  { label: "GitHub", href: HERO_DATA.socials.github, icon: SiGithub },
  { label: "LinkedIn", href: HERO_DATA.socials.linkedin, icon: LinkedinBrand },
  { label: "Email", href: `mailto:${HERO_DATA.socials.email}`, icon: Mail },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/80">
      <div className="mx-auto max-w-4xl px-6 py-12 md:max-w-[960px]">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <p className="font-mono text-sm font-semibold text-zinc-100">
              {HERO_DATA.name}
              <BlinkingUnderscore />
            </p>
            {/* Visitor stats — fetch once the footer top crosses the viewport bottom */}
            <div className="mt-3">
              <LazyMount
                observe="footer"
                className="flex flex-col gap-1.5"
                fallback={
                  <>
                    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                      <Skeleton className="w-36" />
                    </span>
                    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
                      <Skeleton className="w-44" />
                    </span>
                    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
                      <span className="block h-3.5 w-3.5 rounded bg-zinc-800" />
                      <Skeleton className="w-28" />
                    </span>
                    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
                      <span className="block h-3.5 w-3.5 rounded bg-zinc-800" />
                      <Skeleton className="w-32" />
                    </span>
                  </>
                }
              >
                <VisitorCounter />
                <VisitorLocation />
                <VisitorDevice />
                <VisitorBrowser />
              </LazyMount>
            </div>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-600">Pages</p>
              <ul className="mt-3 flex flex-col gap-2">
                {PAGES.map((page) => (
                  <li key={page.label}>
                    <a href={page.href} className="text-sm text-zinc-400 transition-colors hover:text-blue-400">
                      {page.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-600">Socials</p>
              <ul className="mt-3 flex flex-col gap-2">
                {SOCIALS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-blue-400"
                    >
                      <social.icon className="h-3.5 w-3.5" />
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center border-t border-zinc-800/80 pt-6 text-center font-mono text-xs text-zinc-600">
          <span>Copyright 2026 Aditya Chitragar. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
