import {
  Bot,
  BrainCircuit,
  Calculator,
  Code,
  Container,
  Cpu,
  DatabaseZap,
  FileCode,
  FileText,
  Mail,
  MessageSquare,
  Network,
  Ship,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import {
  SiC,
  SiFastapi,
  SiFirebase,
  SiGit,
  SiGithubactions,
  SiGnubash,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiNumpy,
  SiPostman,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiVercel,
  SiGithub,
} from "react-icons/si";
import type { IconType } from "react-icons";

// Brand icons (react-icons) + Lucide fallbacks share one union type so the
// whole map compiles and TechStack can render either transparently.
export type TechIcon = IconType | LucideIcon;

export interface TechIconEntry {
  icon: TechIcon;
  className: string;
}

const TECH_ICON_MAP: Record<string, TechIconEntry> = {
  Python: { icon: SiPython, className: "text-sky-400" },
  JavaScript: { icon: SiJavascript, className: "text-yellow-400" },
  HTML: { icon: SiHtml5, className: "text-orange-400" },
  C: { icon: SiC, className: "text-blue-400" },
  SQL: { icon: SiMysql, className: "text-violet-400" },
  NumPy: { icon: SiNumpy, className: "text-emerald-400" },
  "Linux": { icon: SiGnubash, className: "text-zinc-300" },
  "CI/CD": { icon: Workflow, className: "text-amber-400" },
  FastAPI: { icon: SiFastapi, className: "text-teal-400" },
  "Node.js": { icon: SiNodedotjs, className: "text-green-500" },
  MongoDB: { icon: SiMongodb, className: "text-emerald-500" },
  Firebase: { icon: SiFirebase, className: "text-amber-500" },
  React: { icon: SiReact, className: "text-cyan-400" },
  "Next.js": { icon: SiNextdotjs, className: "text-zinc-100" },
  "Tailwind CSS": { icon: SiTailwindcss, className: "text-sky-300" },
  ReAct: { icon: BrainCircuit, className: "text-purple-400" },
  RAG: { icon: DatabaseZap, className: "text-rose-400" },
  Git: { icon: SiGit, className: "text-orange-500" },
  "GitHub Actions": { icon: SiGithubactions, className: "text-zinc-100" },
  Postman: { icon: SiPostman, className: "text-orange-400" },
  Vercel: { icon: SiVercel, className: "text-zinc-100" },
  // legacy fallbacks keep old portfolio working
  TypeScript: { icon: FileCode, className: "text-blue-400" },
  Docker: { icon: Container, className: "text-blue-400" },
  Kubernetes: { icon: Ship, className: "text-indigo-400" },
  LangGraph: { icon: Network, className: "text-rose-400" },
  AutoGen: { icon: Bot, className: "text-purple-400" },
  Calculator: { icon: Calculator, className: "text-teal-400" },
  Cpu: { icon: Cpu, className: "text-zinc-400" },
};

export function getTechIcon(name: string): TechIconEntry {
  return TECH_ICON_MAP[name] ?? { icon: Code, className: "text-zinc-400" };
}

// LinkedIn pulled its brand mark from Simple Icons, so react-icons no longer
// ships it — this is the official LinkedIn "in" glyph (24x24, currentColor).
export function LinkedinBrand({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

export const SOCIAL_LINKS: {
  name: string;
  href: string;
  icon: TechIcon;
}[] = [
  { name: "GitHub", href: "https://github.com/aditya-c7", icon: SiGithub },
  { name: "LinkedIn", href: "https://linkedin.com/in/adityachitragar", icon: LinkedinBrand },
  { name: "Email", href: "mailto:adityac@googlegroups.com", icon: Mail },
  { name: "Resume", href: "#", icon: FileText },
];
