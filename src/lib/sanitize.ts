// Lightweight prompt-injection defense + truncation. Mirrors the example architecture.
const INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions/gi,
  /ignore\s+all\s+previous/gi,
  /you\s+are\s+now\s+dan/gi,
  /override\s+system\s+prompt/gi,
  /system\s*:\s*you/gi,
  /<\s*system\s*>/gi,
  /jailbreak/gi,
  /do\s+anything\s+now/gi,
];

export function sanitizeUserMessage(input: string, maxLen = 500): string {
  let s = input.trim().slice(0, maxLen);
  for (const re of INJECTION_PATTERNS) {
    s = s.replace(re, "[filtered]");
  }
  // Strip control chars except newline/tab
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return s;
}
