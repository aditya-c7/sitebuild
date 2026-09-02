import {
  Atom,
  Bot,
  Braces,
  BrainCircuit,
  Calculator,
  Code,
  CodeXml,
  Container,
  Cpu,
  Database,
  DatabaseZap,
  FileCode,
  FileCode2,
  Flame,
  GitBranch,
  Github,
  Layers,
  Linkedin,
  Mail,
  MessageSquare,
  Network,
  Send,
  Server,
  Ship,
  Sigma,
  SquareTerminal,
  Table2,
  Triangle,
  Wind,
  Workflow,
  Zap,
  FileText,
  type LucideIcon,
} from "lucide-react";

export interface TechIconEntry {
  icon: LucideIcon;
  className: string;
}

const TECH_ICON_MAP: Record<string, TechIconEntry> = {
  Python: { icon: FileCode2, className: "text-sky-400" },
  JavaScript: { icon: Braces, className: "text-yellow-400" },
  HTML: { icon: CodeXml, className: "text-orange-400" },
  C: { icon: Code, className: "text-blue-400" },
  SQL: { icon: Table2, className: "text-violet-400" },
  NumPy: { icon: Sigma, className: "text-emerald-400" },
  "Linux CLI": { icon: SquareTerminal, className: "text-zinc-300" },
  "CI/CD": { icon: Workflow, className: "text-amber-400" },
  FastAPI: { icon: Zap, className: "text-teal-400" },
  "Node.js": { icon: Server, className: "text-green-500" },
  MongoDB: { icon: Database, className: "text-emerald-500" },
  Firebase: { icon: Flame, className: "text-amber-500" },
  React: { icon: Atom, className: "text-cyan-400" },
  "Next.js": { icon: Layers, className: "text-zinc-100" },
  "Tailwind CSS": { icon: Wind, className: "text-sky-300" },
  ReAct: { icon: BrainCircuit, className: "text-purple-400" },
  RAG: { icon: DatabaseZap, className: "text-rose-400" },
  Git: { icon: GitBranch, className: "text-orange-500" },
  "GitHub Actions": { icon: Github, className: "text-zinc-100" },
  Postman: { icon: Send, className: "text-orange-400" },
  Vercel: { icon: Triangle, className: "text-zinc-100" },
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
