"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  MessageSquare,
} from "lucide-react";
import { HERO_DATA } from "@/data/portfolioData";

const NAV_ITEMS = [
  { label: "Tech Stack", href: "#tech-stack" },
  { label: "Projects", href: "#projects" },
];

const SOCIAL_ITEMS = [
  { label: "GitHub", icon: Github, href: HERO_DATA.socials.github },
  { label: "LinkedIn", icon: Linkedin, href: HERO_DATA.socials.linkedin },
  { label: "Email", icon: Mail, href: `mailto:${HERO_DATA.socials.email}` },
];

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("adityahq:open-command-menu", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("adityahq:open-command-menu", onOpenEvent);
    };
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(HERO_DATA.socials.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable - ignore
    }
  };

  const navigate = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      overlayClassName="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
      contentClassName="fixed left-1/2 top-[18%] z-[100] w-[92vw] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-zinc-800 bg-[#121215] shadow-2xl shadow-black/60"
    >
      <div className="flex items-center gap-3 border-b border-zinc-800 px-4">
        <span className="font-mono text-xs text-blue-500">&gt;</span>
        <Command.Input
          placeholder="Type a command or search..."
          className="w-full bg-transparent py-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
        />
        <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">ESC</kbd>
      </div>

      <Command.List className="max-h-80 overflow-y-auto overflow-x-hidden p-2">
        <Command.Empty className="px-4 py-10 text-center font-mono text-sm text-zinc-500">
          No results found.
        </Command.Empty>

        <Command.Group heading="Navigation">
          {NAV_ITEMS.map((item) => (
            <Command.Item
              key={item.href}
              value={`navigate ${item.label}`}
              onSelect={() => navigate(item.href)}
              className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors data-[selected=true]:bg-blue-600/10 data-[selected=true]:text-blue-300"
            >
              <ArrowRight className="h-4 w-4 text-zinc-600 transition-transform group-data-[selected=true]:translate-x-0.5 group-data-[selected=true]:text-blue-400" />
              {item.label}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Socials">
          {SOCIAL_ITEMS.map((item) => (
            <Command.Item
              key={item.label}
              value={`open ${item.label}`}
              onSelect={() => {
                setOpen(false);
                window.open(item.href, "_blank", "noopener,noreferrer");
              }}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors data-[selected=true]:bg-blue-600/10 data-[selected=true]:text-blue-300"
            >
              <item.icon className="h-4 w-4 text-zinc-500 data-[selected=true]:text-blue-400" />
              {item.label}
              <ExternalLink className="ml-auto h-3.5 w-3.5 text-zinc-700" />
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Actions">
          <Command.Item
            value="copy email"
            onSelect={copyEmail}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors data-[selected=true]:bg-blue-600/10 data-[selected=true]:text-blue-300"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 text-zinc-500" />
            )}
            {copied ? "Copied!" : "Copy email address"}
          </Command.Item>
          <Command.Item
            value="copy discord"
            onSelect={async () => {
              try {
                await navigator.clipboard.writeText(HERO_DATA.socials.discord);
              } catch {
                // clipboard unavailable - ignore
              }
              setOpen(false);
            }}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors data-[selected=true]:bg-blue-600/10 data-[selected=true]:text-blue-300"
          >
            <MessageSquare className="h-4 w-4 text-zinc-500" />
            Copy Discord handle
          </Command.Item>
        </Command.Group>
      </Command.List>

      <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-2.5 font-mono text-[10px] text-zinc-600">
        <span>Navigation</span>
        <span>
          <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1 py-0.5">Ctrl</kbd>{" "}
          +{" "}
          <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1 py-0.5">K</kbd>{" "}
          to toggle
        </span>
      </div>
    </Command.Dialog>
  );
}
