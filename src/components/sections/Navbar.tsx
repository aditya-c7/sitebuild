"use client";

import { useEffect, useState } from "react";
import { Command, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Tech Stack", href: "#tech-stack" },
  { label: "Projects", href: "#projects" },
];

const MOBILE_LINKS = [
  { label: "Tech Stack", href: "#tech-stack" },
  { label: "Projects", href: "#projects" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openCommandMenu = () => {
    window.dispatchEvent(new CustomEvent("adityahq:open-command-menu"));
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-xl transition-colors duration-300 ${
        scrolled ? "bg-[#0a0a0a]/70 shadow-[0_8px_30px_rgba(0,0,0,0.35)]" : "bg-[#0a0a0a]/40"
      }`}
      style={{
        backdropFilter: "blur(12px) saturate(180%)",
        WebkitBackdropFilter: "blur(12px) saturate(180%)",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
        <a href="#top" className="font-mono text-[15px] font-semibold tracking-tight text-zinc-100 transition-colors hover:text-white">
          adityahq<span className="animate-pulse text-blue-500">_</span>
        </a>

        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-400 transition-colors hover:text-blue-400"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#"
            className="text-sm text-zinc-400 transition-colors hover:text-blue-400"
          >
            Resume
          </a>
          <button
            onClick={openCommandMenu}
            aria-label="Open command menu"
            className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-[#121215] px-2.5 py-1.5 font-mono text-xs text-zinc-400 transition-all hover:border-zinc-600 hover:text-zinc-200"
          >
            <Command className="h-3.5 w-3.5" />
            <span>Ctrl</span>
            <span className="text-zinc-600">+</span>
            <span>K</span>
          </button>
        </div>

        <button
          className="flex items-center text-zinc-400 transition-colors hover:text-zinc-100 md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0a0a0a]/70 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-4xl flex-col gap-1 px-6 py-4">
            {MOBILE_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-blue-400"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                openCommandMenu();
              }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-left font-mono text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-blue-400"
            >
              <Command className="h-4 w-4" />
              Command Menu
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
