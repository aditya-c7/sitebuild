// RAG bank: exact presets + scored Q&A pairs. Zero API cost.
// Every entry carries its own reply + followups + action.

export type BankIcon = "email" | "github" | "linkedin" | "link";

export interface BankAction {
  label: string;
  url: string;
  icon?: BankIcon;
}

export interface BankAnswer {
  reply: string;
  followups: [string, string];
  action: BankAction | null;
}

// Exact-match presets (key = normalized message). Checked before scoring.
export const PRESETS: Record<string, BankAnswer> = {
  hi: { reply: "Yo! What's up?", followups: ["What projects has he built?", "What is his tech stack?"], action: null },
  hello: { reply: "Hey there!", followups: ["What projects has he built?", "How to contact Aditya?"], action: null },
  hey: { reply: "Hey! How can I help?", followups: ["Tell me about Precedent", "What is his experience?"], action: null },
  gm: { reply: "Morning! Ready to build something?", followups: ["What is he currently building?", "What projects has he built?"], action: null },
  "good morning": { reply: "Morning! Ready to build something?", followups: ["What is he currently building?", "What projects has he built?"], action: null },
  "how are you": { reply: "Doing great, you?", followups: ["What projects has he built?", "What is his tech stack?"], action: null },
  hru: { reply: "Doing great, you?", followups: ["What projects has he built?", "What is his tech stack?"], action: null },
  "whats up": { reply: "Not much, just here to help. What's on your mind?", followups: ["Tell me about Precedent", "How to contact Aditya?"], action: null },
  sup: { reply: "Not much, just here to help. What's on your mind?", followups: ["Tell me about Precedent", "How to contact Aditya?"], action: null },
  thanks: { reply: "Anytime!", followups: ["What projects has he built?", "How to contact Aditya?"], action: null },
  ty: { reply: "Anytime!", followups: ["What projects has he built?", "How to contact Aditya?"], action: null },
  "thank you": { reply: "No sweat, happy to help.", followups: ["What projects has he built?", "How to contact Aditya?"], action: null },
  awesome: { reply: "Glad you think so!", followups: ["Tell me about Precedent", "How to contact Aditya?"], action: null },
  cool: { reply: "Glad you think so!", followups: ["Tell me about Precedent", "How to contact Aditya?"], action: null },
  ok: { reply: "Got it.", followups: ["What projects has he built?", "How to contact Aditya?"], action: null },
  k: { reply: "Got it.", followups: ["What projects has he built?", "How to contact Aditya?"], action: null },
  bye: { reply: "Catch you later!", followups: ["How to contact Aditya?", "What projects has he built?"], action: null },
  cya: { reply: "Peace! Let me know if you need anything else.", followups: ["How to contact Aditya?", "What projects has he built?"], action: null },
  gn: { reply: "Have a good one!", followups: ["How to contact Aditya?", "What projects has he built?"], action: null },
  "good night": { reply: "Have a good one!", followups: ["How to contact Aditya?", "What projects has he built?"], action: null },
  help: { reply: "Sure thing, what are you looking for?", followups: ["What projects has he built?", "How to contact Aditya?"], action: null },
  "who are you": { reply: "I'm Aditya's AI assistant. How can I help you today?", followups: ["Who is Aditya?", "What projects has he built?"], action: null },
  "what are you": { reply: "I'm Aditya's AI assistant. How can I help you today?", followups: ["Who is Aditya?", "What projects has he built?"], action: null },
};

export interface BankEntry extends BankAnswer {
  id: string;
  patterns: string[];
}

export const BANK: BankEntry[] = [
  {
    id: "who-is-aditya",
    patterns: ["who is aditya", "about aditya", "tell me about aditya", "introduce aditya", "aditya background", "know about aditya"],
    reply: "Aditya is a computer science student specializing in agentic AI, testing frameworks, and scalable web applications.",
    followups: ["What is his experience?", "What projects has he built?"],
    action: null,
  },
  {
    id: "experience",
    patterns: ["experience", "internship", "internships", "work experience", "where does he work", "marvedge", "qa engineer", "sdet", "job", "work history", "employment"],
    reply: "He serves as a QA Engineer / SDET Intern at Marvedge, focusing on rigorous API testing, platform reliability, and remediating critical security vulnerabilities.",
    followups: ["What did he find at Marvedge?", "What is his tech stack?"],
    action: { label: "View Experience", url: "/#experience", icon: "link" },
  },
  {
    id: "marvedge-findings",
    patterns: ["what did he find at marvedge", "vulnerabilities", "vulnerability", "security findings", "bugs found", "unauthenticated file upload", "email injection", "patches"],
    reply: "Before officially starting at Marvedge, Aditya evaluated the platform and found two critical vulnerabilities: Unauthenticated File Upload and Email Injection. He prepared patches using auth middleware, sanitization, and rate-limiting.",
    followups: ["What does he do at Marvedge?", "Why should I hire Aditya?"],
    action: null,
  },
  {
    id: "education",
    patterns: ["education", "college", "university", "study", "degree", "vtu", "jain college", "graduation", "course", "where does he study", "student"],
    reply: "Aditya is pursuing a B.Tech in Computer Science and Engineering at Jain College of Engineering and Technology (VTU), with an expected graduation in 2029.",
    followups: ["What is his CGPA?", "What is his experience?"],
    action: null,
  },
  {
    id: "cgpa",
    patterns: ["cgpa", "gpa", "grades", "marks", "percentage", "score", "academic performance"],
    reply: "Aditya holds a CGPA of 8.05 in his B.Tech CSE at Jain College of Engineering and Technology (VTU). His coursework includes Machine Learning Foundations, Systems Architecture, Data Structures and Algorithms, and Advanced Computation.",
    followups: ["What coursework has he done?", "Which year is he in?"],
    action: null,
  },
  {
    id: "coursework-clubs",
    patterns: ["coursework", "subjects", "courses", "clubs", "hackerrank", "gdg", "extracurricular", "hackathon", "orchestrate"],
    reply: "His coursework covers Machine Learning Foundations, Systems Architecture, Data Structures and Algorithms, and Advanced Computation. He also takes part in the HackerRank Orchestrate AI challenge and GDG Hubli.",
    followups: ["What is his CGPA?", "What is his tech stack?"],
    action: null,
  },
  {
    id: "farmers-swag",
    patterns: ["farmers swag", "farmer swag", "agriculture", "crop disease", "farming app", "agricultural", "livestock", "market price"],
    reply: "Farmer's Swag is an AI-powered agricultural decision-support web app built in Google AI Studio, with crop disease detection, live market price tracking, and livestock care assistance. It uses React, FastAPI, Gemini API, and Tailwind.",
    followups: ["How was Farmer's Swag built?", "Tell me about Precedent"],
    action: { label: "View Projects", url: "/#projects", icon: "link" },
  },
  {
    id: "precedent",
    patterns: ["precedent", "legal", "contract", "litmus", "testlitmus", "law firm", "clause", "negotiation playbook"],
    reply: "Precedent is an AI legal contract reviewer and Litmus submission. Its two-stage agent extracts firm positions into a negotiation playbook, then reviews inbound drafts clause by clause while citing precedent. It runs as an API with caching and self-validation.",
    followups: ["How does the two-stage agent work?", "Tell me about Farmer's Swag"],
    action: { label: "View Precedent Repo", url: "https://github.com/aditya-c7/testlitmus", icon: "github" },
  },
  {
    id: "farmers-how",
    patterns: ["how was farmers swag built", "farmers swag built with", "how farmers swag works", "farmers swag architecture", "farmers swag implementation"],
    reply: "Farmer's Swag was built in Google AI Studio: the Gemini API powers crop disease detection, FastAPI serves live market price tracking, and the React and Tailwind frontend adds livestock care assistance with offline support for rural areas.",
    followups: ["Tell me about Precedent", "What is his tech stack?"],
    action: { label: "View Projects", url: "/#projects", icon: "link" },
  },
  {
    id: "precedent-how",
    patterns: ["how does the two-stage agent work", "two-stage agent explained", "negotiation playbook process", "precedent clause review process", "how precedent reviews contracts"],
    reply: "Stage one extracts the firm's consistent positions into a negotiation playbook. Stage two reviews each inbound clause against that playbook, cites the precedent behind every accept, counter, or escalate call, and serves it all through a caching, self-validating API.",
    followups: ["Tell me about Farmer's Swag", "How to contact Aditya?"],
    action: { label: "View Precedent Repo", url: "https://github.com/aditya-c7/testlitmus", icon: "github" },
  },
  {
    id: "projects-general",
    patterns: ["projects", "built", "portfolio", "work samples", "showcase", "what has he built", "side projects"],
    reply: "Aditya mainly showcases two projects: Farmer's Swag for agriculture and Precedent for legal contract review. For everything else, his GitHub has the full list.",
    followups: ["Tell me about Precedent", "Tell me about Farmer's Swag"],
    action: { label: "Open GitHub", url: "https://github.com/aditya-c7", icon: "github" },
  },
  {
    id: "tech-stack",
    patterns: ["tech stack", "technologies", "skills", "tools", "programming languages", "stack", "what can he build with"],
    reply: "His core stack: Advanced Python (Pandas, NumPy, Pydantic, OOP), JavaScript, SQL, FastAPI, Node.js, React, MongoDB, Firebase, plus RAG architectures, multi-agent orchestration (CrewAI, AutoGen), Linux, CI/CD, Playwright, and Vercel.",
    followups: ["What is his experience?", "What projects has he built?"],
    action: null,
  },
  {
    id: "spoken-languages",
    patterns: ["spoken languages", "languages does he speak", "hindi", "german", "kannada", "marathi", "mother tongue"],
    reply: "Aditya speaks Hindi, Marathi, English, German, and Kannada.",
    followups: ["Where is he based?", "How to contact Aditya?"],
    action: null,
  },
  {
    id: "ai-skills",
    patterns: ["ai", "rag", "agents", "llm", "autogen", "crewai", "machine learning", "artificial intelligence", "multi agent", "react loops", "evaluation"],
    reply: "His AI work centers on agentic systems: multi-agent orchestration with CrewAI and AutoGen, ReAct reasoning loops, RAG architectures, and LLM evaluation frameworks.",
    followups: ["Tell me about Precedent", "What projects has he built?"],
    action: null,
  },
  {
    id: "backend-skills",
    patterns: ["backend", "fastapi", "node", "api", "database", "mongodb", "cloud", "aws", "devops", "ci cd", "deployment", "firebase", "frontend", "react"],
    reply: "On the backend he builds with FastAPI and Node.js, RESTful APIs, MongoDB and Firebase, deploying on AWS/GCP infrastructure with CI/CD pipelines and Linux-based DevSecOps workflows.",
    followups: ["What projects has he built?", "What is his experience?"],
    action: null,
  },
  {
    id: "contact",
    patterns: ["contact", "email", "mail", "reach out", "get in touch", "how to reach", "how to contact"],
    reply: "You can reach Aditya via email at adityac@googlegroups.com or connect with him on LinkedIn (adityachitragar).",
    followups: ["Is Aditya open to internships?", "What projects has he built?"],
    action: { label: "Email Aditya", url: "mailto:adityac@googlegroups.com", icon: "email" },
  },
  {
    id: "github-link",
    patterns: ["github", "repo", "repositories", "open source", "source code", "git hub"],
    reply: "Aditya's open-source contributions and repositories can be viewed at github.com/aditya-c7.",
    followups: ["Tell me about Precedent", "How to contact Aditya?"],
    action: { label: "Open GitHub", url: "https://github.com/aditya-c7", icon: "github" },
  },
  {
    id: "resume",
    patterns: ["resume", "cv", "biodata", "qualifications summary"],
    reply: "You can access his complete resume via his LinkedIn profile, or I can provide a detailed summary of his qualifications here.",
    followups: ["Summarize his qualifications", "How to contact Aditya?"],
    action: { label: "Open LinkedIn", url: "https://linkedin.com/in/adityachitragar", icon: "linkedin" },
  },
  {
    id: "qualifications-summary",
    patterns: ["summarize his qualifications", "summary of qualifications", "overview of skills", "profile summary"],
    reply: "2nd year B.Tech CSE at VTU (CGPA 8.05), SDET Intern at Marvedge testing APIs and platform security, builder of Farmer's Swag and Precedent, fluent across Python, JavaScript, FastAPI, React, RAG and multi-agent AI systems.",
    followups: ["Why should I hire Aditya?", "How to contact Aditya?"],
    action: null,
  },
  {
    id: "linkedin",
    patterns: ["linkedin", "connect professionally", "professional network"],
    reply: "You can connect with Aditya on LinkedIn at linkedin.com/in/adityachitragar, best for professional and internship discussions.",
    followups: ["Is Aditya open to internships?", "How to contact via email?"],
    action: { label: "Open LinkedIn", url: "https://linkedin.com/in/adityachitragar", icon: "linkedin" },
  },
  {
    id: "availability",
    patterns: ["available", "availability", "open to internships", "internship openings", "freelance", "looking for work", "hiring", "opportunities", "currently building", "what is he building"],
    reply: "Aditya is open to selective engineering internships and freelance opportunities. Reach out via LinkedIn or email to discuss.",
    followups: ["How to contact Aditya?", "Why should I hire Aditya?"],
    action: { label: "Contact on LinkedIn", url: "https://linkedin.com/in/adityachitragar", icon: "linkedin" },
  },
  {
    id: "hire-pitch",
    patterns: ["why hire aditya", "hire aditya", "should i hire", "strengths", "why you", "convince me", "pitch"],
    reply: "Aditya is a highly adaptable engineer who prioritizes shipping functional, real-world projects. He learns rapidly and is prepared to demonstrate his capabilities through applied technical tasks.",
    followups: ["Hear his pitch in full?", "What projects has he built?"],
    action: null,
  },
  {
    id: "hire-pitch-full",
    patterns: ["pitch in full", "full pitch", "in his own words", "test him"],
    reply: "In his own words: production lvl experience, learns anything fast, ships real projects instead of talking about them, and will outwork whatever the bar is if given a chance. Not asking you to take his word for it, test him on something real and he will deliver.",
    followups: ["How to contact Aditya?", "What projects has he built?"],
    action: { label: "Contact on LinkedIn", url: "https://linkedin.com/in/adityachitragar", icon: "linkedin" },
  },
  {
    id: "location",
    patterns: ["where", "location", "based", "from", "city", "hubli", "dharwad", "india", "lives"],
    reply: "Aditya is based in Hubli-Dharwad, Karnataka, India, and is open to remote and flexible work.",
    followups: ["What does he study?", "How to contact Aditya?"],
    action: null,
  },
  {
    id: "goal",
    patterns: ["goal", "aim", "career", "future", "wants to become", "ambition", "plans"],
    reply: "His goal is AI and Full-Stack Software Engineering: AI-driven web apps, scalable backends, and automated testing workflows.",
    followups: ["What projects has he built?", "What is his tech stack?"],
    action: null,
  },
  {
    id: "year",
    patterns: ["which year", "what year", "graduate", "graduation", "2029", "second year", "2nd year", "senior", "junior", "fresher"],
    reply: "He is a 2nd year B.Tech CSE student, graduating in 2029.",
    followups: ["What is his CGPA?", "What is his experience?"],
    action: null,
  },
  {
    id: "remote",
    patterns: ["remote", "relocate", "relocation", "onsite", "hybrid", "work from home", "wfh"],
    reply: "Aditya is open to remote and flexible work configurations from Hubli-Dharwad, India.",
    followups: ["Is Aditya open to internships?", "How to contact Aditya?"],
    action: null,
  },
  {
    id: "more-projects",
    patterns: ["cybench", "triage", "other projects", "more projects", "evaluation harness", "telemetry", "all projects", "everything he built"],
    reply: "Beyond the two featured builds, Aditya's wider work lives on GitHub, including evaluation harnesses and automation pipelines. Take a look there for the full list.",
    followups: ["Tell me about Precedent", "How to contact Aditya?"],
    action: { label: "Open GitHub", url: "https://github.com/aditya-c7", icon: "github" },
  },
  {
    id: "default-fallback",
    patterns: ["default fallback", "unrecognized input", "didnt catch", "rephrase"],
    reply: "My bad, I didn't quite catch that. Could you rephrase?",
    followups: ["What projects has he built?", "How to contact Aditya?"],
    action: null,
  },
];
