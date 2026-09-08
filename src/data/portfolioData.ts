export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  previewGradient: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  period: string;
  location: string;
  type: "REMOTE" | "HYBRID" | "ONSITE";
  highlights: string[];
  logo?: string;
}

export interface Article {
  id: string;
  title: string;
  date: string;
  readTime: string;
  slug: string;
}

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  avatarColor: string;
}

export const HERO_DATA = {
  name: "Aditya Chitragar",
  role: "Developer",
  locationName: "India",
  targetTimeZone: "Asia/Kolkata",
  bioPart1: "CS student @ ",
  bioHighlight: "VTU",
  bioPart2:
    ". I occasionally touch grass.",
  socials: {
    github: "https://github.com/aditya-c7",
    linkedin: "https://linkedin.com/in/adityachitragar",
    twitter: "https://twitter.com/x",
    discord: "YOUR_DISCORD_HANDLE",
    email: "adityac@googlegroups.com",
  },
};

export const TECH_STACK = [
  { name: "Python", category: "Stack" },
  { name: "JavaScript", category: "Stack" },
  { name: "HTML", category: "Stack" },
  { name: "C", category: "Stack" },
  { name: "SQL", category: "Stack" },
  { name: "NumPy", category: "Stack" },
  { name: "Linux", category: "Stack" },
  { name: "CI/CD", category: "Stack" },
  { name: "FastAPI", category: "Stack" },
  { name: "Node.js", category: "Stack" },
  { name: "MongoDB", category: "Stack" },
  { name: "Firebase", category: "Stack" },
  { name: "React", category: "Stack" },
  { name: "Next.js", category: "Stack" },
  { name: "Tailwind CSS", category: "Stack" },
  { name: "RAG", category: "Stack" },
  { name: "Git", category: "Stack" },
  { name: "GitHub Actions", category: "Stack" },
  { name: "Postman", category: "Stack" },
  { name: "Vercel", category: "Stack" },
];

export const PROJECTS_DATA: Project[] = [
  {
    id: "agentic-triage",
    title: "Agentic Workflow Automation & Telemetry Triage Pipeline",
    description:
      "Autonomous data pipeline using AutoGen and localized LLMs to categorize, diagnose, and structure high-volume technical telemetry into strict schemas, mitigating reasoning degradation and manual toil.",
    tags: ["Python", "FastAPI", "AutoGen"],
    githubUrl: "https://github.com/aditya-c7",
    previewGradient: "from-blue-600/30 via-indigo-600/20 to-purple-600/30",
  },
  {
    id: "farmers-swag",
    title: "Farmer's Swag (Agricultural AI Platform)",
    description:
      "AI-powered agricultural decision-support web application featuring automated crop disease diagnosis, live market commodity pricing trackers, and offline support for rural accessibility.",
    tags: ["React", "FastAPI", "Gemini API", "Tailwind"],
    githubUrl: "https://github.com/aditya-c7",
    previewGradient: "from-emerald-600/30 via-teal-600/20 to-blue-600/30",
  },
];

export const EXPERIENCE_DATA: ExperienceItem[] = [
  {
    id: "marvedge-sdet",
    role: "SDET",
    organization: "Marvedge",
    period: "Sep 2026 - Present",
    location: "Remote",
    type: "REMOTE",
    highlights: ["Updating soon..."],
    logo: "/marvedge-logo.jpg",
  },
];

export const ARTICLES_DATA: Article[] = [
  {
    id: "autogen-triage",
    title: "Building Deterministic Triage Pipelines with AutoGen & Pydantic",
    date: "Jul 2026",
    readTime: "6 min read",
    slug: "autogen-triage-pipelines",
  },
  {
    id: "realtime-systems",
    title: "Architecting Resilient Real-Time Systems with Firebase & React",
    date: "May 2026",
    readTime: "5 min read",
    slug: "realtime-systems-firebase-react",
  },
  {
    id: "prompt-engineering",
    title: "Fine-Tuning Prompts for High-Fidelity Domain-Specific Reasoning",
    date: "Apr 2026",
    readTime: "4 min read",
    slug: "fine-tuning-prompts-reasoning",
  },
];

export const GUESTBOOK_ROW_1: GuestbookEntry[] = [
  { id: "1", name: "Rohan K.", message: "The agentic triage pipeline is insanely clean. Great architecture!", avatarColor: "bg-blue-500" },
  { id: "2", name: "Naga Sai", message: "One of the most responsive developer portfolios I've seen.", avatarColor: "bg-indigo-500" },
  { id: "3", name: "Avi", message: "Clean terminal minimalism with great micro-interactions.", avatarColor: "bg-purple-500" },
  { id: "4", name: "Rohit D.", message: "Love the blue accent spotlight and the smooth Cmd+K modal.", avatarColor: "bg-emerald-500" },
];

export const GUESTBOOK_ROW_2: GuestbookEntry[] = [
  { id: "5", name: "Arman", message: "Goated dev! Building real-world AI tools that matter.", avatarColor: "bg-amber-500" },
  { id: "6", name: "SreeCharan", message: "Minimalist, aesthetic, and blazing fast.", avatarColor: "bg-rose-500" },
  { id: "7", name: "Haruki", message: "The cursor spotlight and grid crosshairs give it an authentic blueprint vibe.", avatarColor: "bg-teal-500" },
  { id: "8", name: "Ananya", message: "Impressive focus on systems engineering alongside web dev.", avatarColor: "bg-violet-500" },
];
