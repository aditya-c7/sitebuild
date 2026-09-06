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
  Github,
  Linkedin,
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

export const SOCIAL_LINKS: {
  name: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { name: "GitHub", href: "https://github.com/aditya-c7", icon: Github },
  { name: "LinkedIn", href: "https://linkedin.com/in/adityachitragar", icon: Linkedin },
  { name: "Email", href: "mailto:adityac@googlegroups.com", icon: Mail },
  { name: "Resume", href: "#", icon: FileText },
];
