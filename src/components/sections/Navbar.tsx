"use client";

import { useEffect, useState } from "react";
import { Command } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

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
      className={`fixed top-0 left-0 right-0 z-50 border-b border-white/[0.07] backdrop-blur-lg transition-colors duration-300 ${
        scrolled ? "bg-black/70 shadow-[0_4px_24px_rgba(0,0,0,0.6)]" : "bg-black/40"
      }`}
      style={{
        backdropFilter: "blur(8px) saturate(150%)",
        WebkitBackdropFilter: "blur(8px) saturate(150%)",
      }}
    >
      <nav className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5 md:h-16 md:max-w-[832px] md:px-6">
        <a href="#top" className="font-mono text-[15px] font-semibold tracking-tight text-zinc-100 transition-colors hover:text-white">
          adityahq<span className="ml-1 text-blue-500">_</span>
        </a>

        <div className="-mr-2 flex items-center gap-2.5">
          <button
            onClick={openCommandMenu}
            aria-label="Open command menu"
            className="flex h-8 items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.06] px-2.5 font-mono text-xs text-zinc-400 transition-all hover:border-white/[0.16] hover:text-zinc-200 sm:px-2.5"
          >
            <Command className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ctrl</span>
            <span className="hidden text-zinc-500 sm:inline">+</span>
            <span className="hidden sm:inline">K</span>
          </button>

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
