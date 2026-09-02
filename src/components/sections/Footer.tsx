import { Github, Linkedin, Mail } from "lucide-react";
import { HERO_DATA } from "@/data/portfolioData";
import VisitorCounter from "@/components/ui/VisitorCounter";
import VisitorLocation from "@/components/ui/VisitorLocation";

const PAGES = [
  { label: "Projects", href: "#projects" },
  { label: "Resume", href: "#" },
];

const SOCIALS = [
  { label: "GitHub", href: HERO_DATA.socials.github, icon: Github },
  { label: "LinkedIn", href: HERO_DATA.socials.linkedin, icon: Linkedin },
  { label: "Email", href: `mailto:${HERO_DATA.socials.email}`, icon: Mail },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/80">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <p className="font-mono text-sm font-semibold text-zinc-100">
              {HERO_DATA.name}
              <span className="ml-1 animate-pulse text-blue-500">_</span>
            </p>
            {/* Visitor stats — placed below name in footer */}
            <div className="mt-3 flex flex-col gap-1.5">
              <VisitorCounter />
              <VisitorLocation />
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
