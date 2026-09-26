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

// Vulgar-content pattern, base64-encoded so the raw words don't sit in
// plaintext (invisible to repo search and casual readers). Decoded once at
// runtime into the identical regex. Mild words (damn/hell/crap/dumb/stupid)
// intentionally excluded, redirect only on unambiguous cuss.
function decodeB64(s: string): string {
  if (typeof atob === "function") return atob(s);
  return (globalThis as unknown as { Buffer: { from(x: string, e: string): { toString(e: string): string } } }).Buffer.from(s, "base64").toString("utf8");
}
export const PROFANITY_RE = new RegExp(
  decodeB64(
    "XGIoZnVja1x3KnxzaGl0XHcqfGJ1bGxzaGl0fGJpdGNoXHcqfGFzc3xhc3Nlc3xhc3Nob2xlXHcqfGJhc3RhcmRcdyp8ZGlja1x3Knxjb2NrXHcqfHB1c3N5XHcqfGN1bnRcdyp8d2hvcmVcdyp8c2x1dFx3Knxkb3VjaGVcdyp8d2Fua2VyXHcqfGplcmtvZmZcdyp8cHJpY2tcdyp8dHdhdFx3KnxmYWdnb3Rcdyp8bmlnZ2VyXHcqfG5pZ2dhXHcqfG1vdGhlcmZ1Y2tcdyp8Y3VtXHcqfGppenpcdyp8dGl0cz98Ym9vYlx3KnxkaWxkb1x3KilcYg=="
  )
);

export function sanitizeUserMessage(input: string, maxLen = 500): string {
  let s = input.trim().slice(0, maxLen);
  for (const re of INJECTION_PATTERNS) {
    s = s.replace(re, "[filtered]");
  }
  // Strip control chars except newline/tab
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return s;
}
