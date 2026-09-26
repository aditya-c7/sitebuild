"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Bot, User, ArrowLeft, Mail, CornerDownRight } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { StreamingText } from "@/components/ui/StreamingText";
import ChatComposerBox from "@/components/ui/ChatComposerBox";
import { LinkedinBrand } from "@/components/ui/TechIcons";
import { PROFANITY_RE } from "@/lib/sanitize";

type ChatRole = "user" | "assistant";
type ActionIcon = "email" | "github" | "linkedin" | "link";
type Msg = {
  role: ChatRole;
  content: string;
  followups?: [string, string];
  action?: { label: string; url: string; icon?: ActionIcon } | null;
  streaming?: boolean;
  streamId?: number;
};



function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  const key = "adityahq:chat-session";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

const THINKING_STEPS = ["Thinking…", "Analyzing your question…", "Generating response…"];
const LIMIT_STORAGE_KEY = "adityahq:chat:blockUntil";
const BLOCK_REASON_KEY = "adityahq:chat:blockReason";
type BlockReason = "profanity" | "rate-limit";

const formatBlockedLeft = (ms: number) => {
  const totalSec = Math.min(600, Math.max(0, Math.ceil(ms / 1000)));
  return `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, "0")}`;
};
// Hidden sizer holds the longest state so the box never resizes mid-swap
const THINK_SIZER = THINKING_STEPS.reduce((a, b) => (a.length >= b.length ? a : b));
const THINK_HOLD_MS = 2000;
const THINK_ENTER_MS = 30;
const THINK_SETTLE_MS = 260;

// Matrix dot loader (scan variant): 4x4 grid, delay = col * cycle/10 (cycle 1200ms → 120ms per column)
const MATRIX_DOTS = Array.from({ length: 16 }, (_, i) => (i % 4) * 120);

// Word-by-word stream pacing (mirrors StreamingText defaults)
const STREAM_WORD_GAP = 45;
const STREAM_FADE_MS = 320;

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const msgIdRef = useRef(0);
  const streamTimerRef = useRef(0);
  const thinkTimerRef = useRef(0);
  const [thinkShown, setThinkShown] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const v = localStorage.getItem(LIMIT_STORAGE_KEY);
      const n = v ? Number(v) : 0;
      if (n > Date.now()) return n;
      if (v) localStorage.removeItem(LIMIT_STORAGE_KEY);
      try {
        localStorage.removeItem(BLOCK_REASON_KEY);
      } catch {}
      return null;
    } catch {
      return null;
    }
  });
  const [blockReason, setBlockReason] = useState<BlockReason | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const v = localStorage.getItem(LIMIT_STORAGE_KEY);
      if (!v || Number(v) <= Date.now()) return null;
      const r = localStorage.getItem(BLOCK_REASON_KEY);
      return r === "profanity" || r === "rate-limit" ? r : null;
    } catch {
      return null;
    }
  });
  const [blockedLeft, setBlockedLeft] = useState(() =>
    blockedUntil ? Math.max(0, blockedUntil - Date.now()) : 0
  );
  const [thinkLeaving, setThinkLeaving] = useState<number | null>(null);
  const [thinkEntering, setThinkEntering] = useState<number | null>(null);
  const [thinkEnterStart, setThinkEnterStart] = useState(false);
  const thinkIdxRef = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // iOS Safari ignores interactive-widget: track the visual viewport so
  // auto-scroll goes instant (not smooth) while the keyboard is open —
  // smooth + native scroll-into-view fighting is half the bounce.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onChange = () => {
      setKeyboardOpen(vv.height < window.innerHeight * 0.85);
    };
    onChange();
    vv.addEventListener("resize", onChange);
    vv.addEventListener("scroll", onChange);
    return () => {
      vv.removeEventListener("resize", onChange);
      vv.removeEventListener("scroll", onChange);
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: keyboardOpen ? "auto" : "smooth",
    });
  }, [messages, loading, streaming, blockedUntil, keyboardOpen]);

  const isBlocked = blockedUntil !== null && blockedUntil > Date.now();

  // Blocked countdown + auto-unblock after 10m (survives refresh via localStorage)
  useEffect(() => {
    if (!blockedUntil) return;
    const tick = () => {
      const left = blockedUntil - Date.now();
      if (left <= 0) {
        try {
          localStorage.removeItem(LIMIT_STORAGE_KEY);
        } catch {}
        try {
          localStorage.removeItem(BLOCK_REASON_KEY);
        } catch {}
        setBlockedUntil(null);
        setBlockedLeft(0);
        setBlockReason(null);
      } else {
        setBlockedLeft(left);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [blockedUntil]);

  useEffect(() => {
    return () => {
      window.clearTimeout(streamTimerRef.current);
      window.clearTimeout(thinkTimerRef.current);
    };
  }, []);

  // Thinking-states swap machine: every THINK_HOLD_MS the outgoing line
  // exits upward (.is-exit) while the incoming line enters from below
  // (.is-enter-start → release), then settles as the shown line
  useEffect(() => {
    if (!loading) return;
    thinkIdxRef.current = 0;
    setThinkShown(0);
    setThinkLeaving(null);
    setThinkEntering(null);
    setThinkEnterStart(false);
    let tEnter = 0;
    let tSettle = 0;
    const id = setInterval(() => {
      const cur = thinkIdxRef.current;
      const next = (cur + 1) % THINKING_STEPS.length;
      thinkIdxRef.current = next;
      setThinkLeaving(cur);
      setThinkEntering(next);
      setThinkEnterStart(true);
      tEnter = window.setTimeout(() => setThinkEnterStart(false), THINK_ENTER_MS);
      tSettle = window.setTimeout(() => {
        setThinkShown(next);
        setThinkLeaving(null);
        setThinkEntering(null);
      }, THINK_SETTLE_MS);
    }, THINK_HOLD_MS);
    return () => {
      clearInterval(id);
      window.clearTimeout(tEnter);
      window.clearTimeout(tSettle);
    };
  }, [loading]);

  const send = async (text: string) => {
    if (isBlocked) return;
    const trimmed = text.trim();
    // Vulgar content stops the chat: short session block, then home.
    if (PROFANITY_RE.test(trimmed.toLowerCase())) {
      const until = Date.now() + 10 * 60 * 1000;
      try {
        localStorage.setItem(LIMIT_STORAGE_KEY, String(until));
      } catch {}
      try {
        localStorage.setItem(BLOCK_REASON_KEY, "profanity");
      } catch {}
      setBlockedUntil(until);
      setBlockReason("profanity");
      window.location.href = "/";
      return;
    }
    if (!trimmed || loading || streaming) return;
    setError(null);
    const userMsg: Msg = { role: "user", content: trimmed };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const sentAt = Date.now();
    window.clearTimeout(streamTimerRef.current);
    window.clearTimeout(thinkTimerRef.current);
    setLoading(true);
    setStreaming(false);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history,
          sessionId: getSessionId(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (res.status === 403 && (data as { code?: string })?.code === "PROFANITY_BLOCK") {
          const retryAfter = (data as { retryAfter?: number })?.retryAfter ?? 600;
          const until = Date.now() + retryAfter * 1000;
          try {
            localStorage.setItem(LIMIT_STORAGE_KEY, String(until));
          } catch {}
          try {
            localStorage.setItem(BLOCK_REASON_KEY, "profanity");
          } catch {}
          setBlockedUntil(until);
          setBlockReason("profanity");
          setLoading(false);
          window.location.href = "/";
          return;
        }
        if (res.status === 429) {
          const retryAfter = (data as { retryAfter?: number })?.retryAfter ?? 600;
          const until = Date.now() + retryAfter * 1000;
          try {
            localStorage.setItem(LIMIT_STORAGE_KEY, String(until));
          } catch {}
          try {
            localStorage.setItem(BLOCK_REASON_KEY, "rate-limit");
          } catch {}
          setBlockedUntil(until);
          setBlockReason("rate-limit");
          setLoading(false);
          return;
        }
        throw new Error((data as { error?: string })?.error || "Failed to get reply");
      }
      const reply: string = typeof data.reply === "string" ? data.reply : "I had trouble replying, please try again.";
      const followups: [string, string] =
        Array.isArray(data.followups) && data.followups.length >= 2
          ? [String(data.followups[0]), String(data.followups[1])]
          : ["What projects has he built?", "How to contact Aditya?"];
      const action =
        data.action && typeof data.action.label === "string" && typeof data.action.url === "string"
          ? { label: data.action.label, url: data.action.url }
          : null;

      // Brief hold so the thinking shimmer reads even on instant answers
      const MIN_THINK_MS = 700;
      const thinkWait = Math.max(0, MIN_THINK_MS - (Date.now() - sentAt));

      thinkTimerRef.current = window.setTimeout(() => {
        // Switch from thinking to word-by-word streaming
        setLoading(false);
        const id = ++msgIdRef.current;
        const wordCount = reply.split(/\s+/).filter(Boolean).length;
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: reply, followups, action, streaming: true, streamId: id },
        ]);
        setStreaming(true);
        // Reveal followups/action once the last word has resolved
        streamTimerRef.current = window.setTimeout(() => {
          setMessages((prev) => prev.map((m) => (m.streamId === id ? { ...m, streaming: false } : m)));
          setStreaming(false);
        }, wordCount * STREAM_WORD_GAP + STREAM_FADE_MS + 150);
      }, thinkWait);
    } catch {
      setLoading(false);
      setStreaming(false);
      const fallback: Msg = {
        role: "assistant",
        content: "I had trouble processing that, please try again. You can also reach Aditya via LinkedIn or email.",
        followups: ["How to contact Aditya?", "What is Precedent?"],
        action: { label: "Contact on LinkedIn", url: "https://linkedin.com/in/adityachitragar" },
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      // Dismiss the keyboard after send instead of refocusing (refocus bounce)
      inputRef.current?.blur();
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const isEmpty = messages.length === 0 && !loading && !streaming && !isBlocked;
  const busy = loading || streaming || isBlocked;

  return (
    <>
      <style>{`:root{--think-hold:2000ms;--think-swap:150ms;--think-gap:50ms;--think-distance:8px;--think-blur:2px;--think-shimmer:2000ms;--think-base:#9a9a9a;--think-highlight:#f5f5f5;--think-ease:ease-in-out} .t-think{position:relative;display:inline-block;text-align:center} .t-think-sizer{display:block;visibility:hidden;white-space:nowrap} .t-think-text{position:absolute;top:0;left:0;right:0;display:block;color:var(--think-base);white-space:nowrap;transform:translateY(0);filter:blur(0);opacity:1;transition:transform var(--think-swap) var(--think-ease),filter var(--think-swap) var(--think-ease),opacity var(--think-swap) var(--think-ease);will-change:transform,filter,opacity} .t-think-text::before{content:attr(data-text);position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(90deg,transparent 0%,transparent 40%,var(--think-highlight) 50%,transparent 60%,transparent 100%);background-size:400% 100%;background-repeat:no-repeat;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:t-think-shimmer var(--think-shimmer) linear infinite} @keyframes t-think-shimmer{0%{background-position:100% 0}100%{background-position:0% 0}} .t-think-text.is-exit{transform:translateY(calc(var(--think-distance)*-1));filter:blur(var(--think-blur));opacity:0} .t-think-text.is-enter-start{transition:none;transform:translateY(var(--think-distance));filter:blur(var(--think-blur));opacity:0} @media (prefers-reduced-motion:reduce){.t-think-text{transition:none !important;transform:none !important;filter:none !important}.t-think-text::before{display:none !important}} :root{--matrix-cycle:1200ms;--matrix-base:#3a3a3e;--matrix-active:#b8b8c2;--matrix-ease:ease-in-out} .t-matrix{display:grid;grid-template-columns:repeat(4,2px);grid-auto-rows:2px;gap:2px} .t-matrix i{display:block;background:var(--matrix-base);animation:t-matrix-pulse var(--matrix-cycle) var(--matrix-ease) infinite;animation-delay:calc(var(--d,0)*1ms)} .t-matrix i.is-gap{visibility:hidden;animation:none} @keyframes t-matrix-pulse{0%,45%,100%{background-color:var(--matrix-base)}15%{background-color:var(--matrix-active)}} @media (prefers-reduced-motion:reduce){.t-matrix i{animation:none !important}} .chat-scroll{scroll-behavior:smooth;will-change:scroll-position} .st-stream{--word-blur:3px;--ease-out-quart:cubic-bezier(0.25,1,0.5,1)} .st-word{display:inline-block;opacity:0;filter:blur(var(--word-blur));transition:opacity var(--fade-duration,320ms) var(--ease-out-quart),filter var(--fade-duration,320ms) var(--ease-out-quart)} .st-word[data-in]{opacity:1;filter:blur(0)} .st-stream[data-resetting] .st-word{transition:none} @media (prefers-reduced-motion:reduce){.st-word{transition:none !important;filter:none !important;opacity:1 !important}}`}</style>
      <div className="mx-auto max-w-4xl px-5 pb-10 pt-24 md:max-w-[960px] md:px-6 md:pt-28 md:pb-16">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 transition-colors hover:text-blue-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </a>

        <div className="mt-6 flex flex-col">
          <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-4 md:gap-3.5 md:pb-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-[13px] md:h-9 md:w-9 md:text-[15px]">✦</span>
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight text-zinc-100 md:text-[18px]">Ask my AI assistant</h1>
              <p className="text-xs text-zinc-500 md:text-[13px]">Trained on Aditya&apos;s Data</p>
            </div>
          </div>

          <div
            ref={listRef}
            className="chat-scroll flex max-h-[52vh] min-h-[340px] flex-col gap-3 overflow-y-auto py-6 pr-1 scrollbar-thin supports-[height:100dvh]:max-h-[52dvh] md:max-h-[60vh] md:min-h-[480px] supports-[height:100dvh]:md:max-h-[60dvh] md:gap-4 md:py-8"
            style={{ scrollbarWidth: "thin" }}
          >
            {isEmpty ? (
              <div className="flex flex-1 flex-col items-center justify-center py-6 text-center md:py-10">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-base md:h-11 md:w-11 md:text-lg">✦</div>
                <h2 className="mt-4 text-[15px] font-semibold text-zinc-100 md:mt-5 md:text-lg">Hey, I&apos;m Aditya&apos;s AI assistant 👋</h2>
                <p className="mt-1 text-xs text-zinc-500 md:mt-1.5 md:text-sm">Ask about his stack, projects, or availability.</p>
                <div className="mt-5 flex max-w-[620px] flex-wrap justify-center gap-2 md:mt-6 md:gap-2.5">
                  {[
                    "What's Aditya's tech stack?",
                    "Tell me about Precedent",
                    "Is Aditya open to internships?",
                    "What is Precedent known for?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      disabled={busy}
                      className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-white/15 hover:bg-white/[0.07] hover:text-zinc-200 disabled:opacity-50 md:px-4 md:py-2 md:text-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {!isEmpty &&
              messages.map((m, i) => (
                <div key={i} className={`flex gap-2 md:gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-[#1c1917] text-zinc-400 md:h-8 md:w-8">
                      <Bot className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </div>
                  )}
                  <div className={`flex max-w-[80%] flex-col gap-2 md:max-w-[84%] md:gap-2.5 ${m.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed md:px-5 md:py-3 md:text-[15px] ${
                        m.role === "user"
                          ? "bg-blue-600 text-white"
                          : "border border-zinc-800 bg-[#1c1917] text-zinc-200"
                      }`}
                    >
                      {m.role === "assistant" ? (
                        <StreamingText
                          active={!!m.streaming}
                          text={m.content}
                          wordGap={STREAM_WORD_GAP}
                          fadeDuration={STREAM_FADE_MS}
                        />
                      ) : (
                        m.content
                      )}
                    </div>
                    {m.role === "assistant" && !m.streaming && m.followups && m.followups.length === 2 && (
                      <div className="flex w-full flex-col">
                        {m.followups.map((q) => (
                          <button
                            key={q}
                            onClick={() => send(q)}
                            disabled={busy}
                            className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-zinc-100 transition-colors hover:bg-white/[0.04] hover:text-white disabled:opacity-50 md:text-[15px]"
                          >
                            <CornerDownRight className="h-4 w-4 shrink-0 text-zinc-500 transition-colors group-hover:text-zinc-200" aria-hidden="true" />
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                    {m.role === "assistant" && !m.streaming && m.action && (
                      <a
                        href={m.action.url}
                        target={m.action.url.startsWith("/") ? undefined : "_blank"}
                        rel={m.action.url.startsWith("/") ? undefined : "noopener noreferrer"}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#1c1917] px-3 py-1.5 text-xs font-medium text-blue-400 transition-colors hover:border-blue-500/50 hover:text-blue-300 md:px-3.5 md:py-2 md:text-sm"
                      >
                        {m.action.icon === "email" && <Mail className="h-3.5 w-3.5" aria-hidden="true" />}
                        {m.action.icon === "github" && <SiGithub className="h-3.5 w-3.5" aria-hidden="true" />}
                        {m.action.icon === "linkedin" && <LinkedinBrand className="h-3.5 w-3.5" aria-hidden="true" />}
                        {m.action.label} <span aria-hidden>→</span>
                      </a>
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white md:h-8 md:w-8">
                      <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </div>
                  )}
                </div>
              ))}

            {isBlocked && (
              <div className="flex justify-start">
                <div
                  role="status"
                  className="w-full rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2 font-mono text-xs text-amber-300"
                >
                  {blockReason === "profanity"
                    ? "Take a breather, that language paused the chat."
                    : "Lots of interest right now, chat is taking a short break."}{" "}
                  Back in {formatBlockedLeft(blockedLeft)}.{" "}
                  <a href="/" className="underline underline-offset-2 hover:text-amber-200">
                    Back to home
                  </a>
                </div>
              </div>
            )}

            {loading && !isBlocked && (
              <div className="flex gap-2.5 md:gap-3">
                <div className="inline-flex items-center gap-2.5 rounded-2xl border border-zinc-800 bg-[#1c1917] px-3 py-2.5 text-xs md:gap-3 md:px-4 md:py-3 md:text-sm">
                  <span className="t-matrix shrink-0" data-variant="scan" aria-hidden="true">
                    {MATRIX_DOTS.map((d, i) => (
                      <i key={i} style={{ "--d": d } as CSSProperties} />
                    ))}
                  </span>
                  <span className="t-think text-xs font-medium tracking-wide md:text-[13px]" role="status">
                    <span className="t-think-sizer" aria-hidden="true">
                      {THINK_SIZER}
                    </span>
                    {thinkLeaving !== null && (
                      <span
                        className="t-think-text is-exit"
                        data-text={THINKING_STEPS[thinkLeaving]}
                        aria-hidden="true"
                      >
                        {THINKING_STEPS[thinkLeaving]}
                      </span>
                    )}
                    {thinkEntering !== null ? (
                      <span
                        className={`t-think-text${thinkEnterStart ? " is-enter-start" : ""}`}
                        data-text={THINKING_STEPS[thinkEntering]}
                      >
                        {THINKING_STEPS[thinkEntering]}
                      </span>
                    ) : (
                      <span className="t-think-text" data-text={THINKING_STEPS[thinkShown]}>
                        {THINKING_STEPS[thinkShown]}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2 font-mono text-xs text-amber-300">
              {error}
            </div>
          )}

          <ChatComposerBox
            ref={inputRef}
            value={input}
            onChange={setInput}
            onSubmit={onSubmit}
            disabled={busy}
          />
        </div>
      </div>
    </>
  );
}
