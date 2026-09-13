// Pure-RAG matcher: exact presets -> hard rules -> TF-IDF cosine over the bank.
// Zero API cost. Groq is only called when nothing matches confidently.
import { PRESETS, BANK, type BankAnswer, type BankAction } from "./rag-bank";

export type { BankAction };

export interface MatchResult extends BankAnswer {
  source: "preset" | "rules" | "bank";
  confident: boolean;
  score: number;
}

export const MATCH_THRESHOLD = 0.22;

const STOP = new Set([
  "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be", "been",
  "to", "of", "in", "on", "at", "for", "with", "about", "me", "my", "you", "your",
  "he", "him", "his", "it", "its", "this", "that", "what", "whats", "which", "who",
  "how", "does", "do", "did", "can", "could", "would", "should", "i", "we", "they",
  "them", "their", "there", "here", "so", "as", "by", "from", "up", "out", "if",
  "then", "than", "too", "very", "just", "like", "into", "over", "after", "before",
  "tell", "give", "show", "know", "want", "need", "please", "pls", "hey", "hi",
  "doesnt", "dont", "didnt", "isnt", "arent", "any", "some", "more", "most", "all",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

export function exactKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

interface DocVec {
  id: string;
  weights: Map<string, number>;
  norm: number;
}

function buildIndex(): { docs: DocVec[]; idf: Map<string, number> } {
  const tokenized = BANK.map((e) => tokenize([...e.patterns, e.reply].join(" ")));
  const df = new Map<string, number>();
  for (const toks of tokenized) {
    for (const t of new Set(toks)) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const n = BANK.length;
  const idf = new Map<string, number>();
  for (const [t, c] of df) idf.set(t, Math.log((n + 1) / (c + 1)) + 1);
  const docs = BANK.map((e, i) => {
    const tf = new Map<string, number>();
    for (const t of tokenized[i]) tf.set(t, (tf.get(t) ?? 0) + 1);
    const weights = new Map<string, number>();
    let sum = 0;
    for (const [t, c] of tf) {
      const w = c * (idf.get(t) ?? 1);
      weights.set(t, w);
      sum += w * w;
    }
    return { id: e.id, weights, norm: Math.sqrt(sum) || 1 };
  });
  return { docs, idf };
}

const INDEX = buildIndex();

function scoreQuery(query: string): { id: string; score: number } {
  const toks = tokenize(query);
  if (toks.length === 0) return { id: "", score: 0 };
  const tf = new Map<string, number>();
  for (const t of toks) tf.set(t, (tf.get(t) ?? 0) + 1);
  const qv = new Map<string, number>();
  let qsum = 0;
  for (const [t, c] of tf) {
    const w = c * (INDEX.idf.get(t) ?? Math.log(BANK.length + 1) + 1);
    qv.set(t, w);
    qsum += w * w;
  }
  const qnorm = Math.sqrt(qsum) || 1;
  let best = { id: "", score: 0 };
  for (const d of INDEX.docs) {
    let dot = 0;
    for (const [t, w] of qv) dot += w * (d.weights.get(t) ?? 0);
    const s = dot / (qnorm * d.norm);
    if (s > best.score) best = { id: d.id, score: s };
  }
  return best;
}

// Hard rules: always win, never matchable, never sent to Groq.
function hardRules(m: string): BankAnswer | null {
  if (/salary|compensation|\bctc\b|package\b|\bpay\b|stipend|expected pay/.test(m)) {
    return {
      reply: "Salary details are not shared here, please reach out via LinkedIn or email for professional discussions.",
      followups: ["How to contact Aditya?", "Why should I hire Aditya?"],
      action: { label: "Contact on LinkedIn", url: "https://linkedin.com/in/adityachitragar", icon: "linkedin" },
    };
  }
  if (/middle name/.test(m)) {
    return {
      reply: "That stays private. Anything else about his work I can help with?",
      followups: ["What projects has he built?", "How to contact Aditya?"],
      action: null,
    };
  }
  if (/phone|mobile number|call him|address|home address|family|parents|politics|religion|date of birth|\bdob\b|\bage\b|girlfriend|boyfriend|relationship/.test(m)) {
    return {
      reply: "That's personal and stays private. For anything professional, reaching out via LinkedIn or email works best.",
      followups: ["How to contact Aditya?", "What projects has he built?"],
      action: { label: "Email Aditya", url: "mailto:adityac@googlegroups.com", icon: "email" },
    };
  }
  return null;
}

// Complex questions need synthesis — always escalate to Groq, never bank.
const COMPLEX = /compar|versus|\bvs\b|differen|\bbest\b|\bbetter\b|recommend|opinion|\brank\b|which one|which project|pros and cons|trade.?off|explain in detail|deeply|step by step/;

// Anti-echo: never suggest what was just asked. Drops any followup sharing
// over half its content tokens with the current query or last 2 user turns.
const GENERIC_TOKENS = new Set(["aditya", "adityas"]);

export function contentTokens(s: string): string[] {
  return tokenize(s).filter((t) => !GENERIC_TOKENS.has(t));
}

function overlapRatio(a: string[], b: string[]): number {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size === 0 || sb.size === 0) return 0;
  let hit = 0;
  for (const t of sa) if (sb.has(t)) hit += 1;
  return hit / Math.min(sa.size, sb.size);
}

const BACKFILL = [
  "What is his tech stack?",
  "How to contact Aditya?",
  "Tell me about Precedent",
  "Tell me about Farmer's Swag",
  "What is his experience?",
];

export function dedupeFollowups(
  followups: [string, string],
  currentQuery: string,
  history: { role: string; content: string }[]
): [string, string] {
  const recent = [currentQuery, ...history.filter((h) => h.role === "user").slice(-2).map((h) => h.content)];
  const recentToks = recent.map(contentTokens);
  const isEcho = (q: string) => {
    const qt = contentTokens(q);
    return recentToks.some((rt) => overlapRatio(qt, rt) > 0.5);
  };
  const out: string[] = [];
  for (const q of followups) {
    if (!isEcho(q) && !out.includes(q)) out.push(q);
  }
  for (const q of BACKFILL) {
    if (out.length >= 2) break;
    if (!isEcho(q) && !out.includes(q)) out.push(q);
  }
  while (out.length < 2) out.push(BACKFILL[out.length % BACKFILL.length]);
  return [out[0], out[1]];
}

export function matchQuery(raw: string): MatchResult {
  const key = exactKey(raw);
  const preset = PRESETS[key];
  if (preset) {
    return { ...preset, source: "preset", confident: true, score: 1 };
  }
  const ruled = hardRules(key);
  if (ruled) {
    return { ...ruled, source: "rules", confident: true, score: 1 };
  }
  if (COMPLEX.test(key)) {
    return {
      reply: "",
      followups: ["What projects has he built?", "How to contact Aditya?"],
      action: null,
      source: "bank",
      confident: false,
      score: 0,
    };
  }
  const best = scoreQuery(raw);
  const entry = BANK.find((e) => e.id === best.id);
  if (entry && best.score >= MATCH_THRESHOLD) {
    return { reply: entry.reply, followups: entry.followups, action: entry.action, source: "bank", confident: true, score: best.score };
  }
  return {
    reply: "",
    followups: ["What projects has he built?", "How to contact Aditya?"],
    action: null,
    source: "bank",
    confident: false,
    score: best.score,
  };
}
