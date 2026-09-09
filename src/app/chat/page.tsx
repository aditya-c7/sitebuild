"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, User, ArrowLeft, ArrowRight } from "lucide-react";
import { Spotlight } from "@/components/ui/Spotlight";

type ChatRole = "user" | "assistant";
type Msg = {
  role: ChatRole;
  content: string;
  followups?: [string, string];
  action?: { label: string; url: string } | null;
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

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [thinkingIdx, setThinkingIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, typing, typingText]);

  // Rotate thinking text while loading
  useEffect(() => {
    if (!loading || typing) return;
    const id = setInterval(() => setThinkingIdx((i) => (i + 1) % THINKING_STEPS.length), 700);
    return () => clearInterval(id);
  }, [loading, typing]);

  // Reset thinking index when loading starts
  useEffect(() => {
    if (loading) setThinkingIdx(0);
  }, [loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || typing) return;
    setError(null);
    const userMsg: Msg = { role: "user", content: trimmed };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setTyping(false);
    setTypingText("");

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
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setError(data.error || "Rate limit exceeded. Try again in a few minutes.");
          setLoading(false);
          return;
        }
        throw new Error(data.error || "Failed to get reply");
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

      // Switch from thinking to typing
      setLoading(false);
      setTyping(true);
      setTypingText("");

      let idx = 0;
      const step = () => {
        idx += 1;
        setTypingText(reply.slice(0, idx));
        if (idx >= reply.length) {
          setTyping(false);
          setMessages((prev) => [...prev, { role: "assistant", content: reply, followups, action }]);
          setTypingText("");
        } else {
          // Smooth variable delay: faster on spaces/punctuation
          const ch = reply[idx - 1];
          const delay = ch === " " ? 8 : ch === "," || ch === "." ? 40 : 14;
          setTimeout(step, delay);
        }
      };
      // Kick off smooth typing with rAF for jank-free start
      requestAnimationFrame(() => setTimeout(step, 80));
    } catch {
      setLoading(false);
      setTyping(false);
      const fallback: Msg = {
        role: "assistant",
        content: "I had trouble processing that, please try again. You can also reach Aditya via LinkedIn or email.",
        followups: ["How to contact Aditya?", "What is Precedent?"],
        action: { label: "Contact on LinkedIn", url: "https://linkedin.com/in/adityachitragar" },
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      if (!typing) {
        // keep loading false already handled
      }
      inputRef.current?.focus();
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const isEmpty = messages.length === 0 && !loading && !typing;
  const busy = loading || typing;

  return (
    <Spotlight>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}} .shimmer-text{background:linear-gradient(90deg,#52525b 0%,#e4e4e7 45%,#52525b 55%,#52525b 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shimmer 1.2s ease-in-out infinite} @keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}} .typing-cursor{display:inline-block;width:2px;height:1em;background:#e4e4e7;margin-left:2px;vertical-align:-2px;animation:blink 1s step-end infinite} .chat-scroll{scroll-behavior:smooth;will-change:scroll-position}`}</style>
      <div className="mx-auto max-w-4xl px-5 pb-10 pt-24 md:max-w-[960px] md:px-6 md:pt-28 md:pb-16">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 transition-colors hover:text-blue-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </a>

        <div className="relative mt-6 rounded-[20px] border border-zinc-800 bg-[#0A0A0A] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] md:p-8">
          <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-4 md:gap-3.5 md:pb-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-[13px] md:h-9 md:w-9 md:text-[15px]">✦</span>
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight text-zinc-100 md:text-[18px]">Ask my AI assistant</h1>
              <p className="text-xs text-zinc-500 md:text-[13px]">Trained on Aditya&apos;s projects &amp; background</p>
            </div>
          </div>

          <div
            ref={listRef}
            className="chat-scroll flex max-h-[52vh] min-h-[340px] flex-col gap-3 overflow-y-auto py-6 pr-1 scrollbar-thin md:max-h-[60vh] md:min-h-[480px] md:gap-4 md:py-8"
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
                    "What is he currently building?",
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
                <div key={i} className={`flex gap-2.5 md:gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-[#1c1917] text-zinc-400 md:h-8 md:w-8">
                      <Bot className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </div>
                  )}
                  <div className={`flex max-w-[86%] flex-col gap-2 md:max-w-[84%] md:gap-2.5 ${m.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed md:px-5 md:py-3 md:text-[15px] ${
                        m.role === "user"
                          ? "bg-blue-600 text-white"
                          : "border border-zinc-800 bg-[#1c1917] text-zinc-200"
                      }`}
                    >
                      {m.content}
                    </div>
                    {m.role === "assistant" && m.followups && m.followups.length === 2 && (
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {m.followups.map((q) => (
                          <button
                            key={q}
                            onClick={() => send(q)}
                            disabled={busy}
                            className="rounded-full border border-zinc-700 bg-[#38332F] px-3 py-1 font-mono text-[11px] text-zinc-300 transition-colors hover:border-blue-500/50 hover:text-blue-300 disabled:opacity-50 md:px-3.5 md:py-1.5 md:text-sm"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                    {m.role === "assistant" && m.action && (
                      <a
                        href={m.action.url}
                        target={m.action.url.startsWith("/") ? undefined : "_blank"}
                        rel={m.action.url.startsWith("/") ? undefined : "noopener noreferrer"}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-[#1c1917] px-3 py-1.5 text-xs font-medium text-blue-400 transition-colors hover:border-blue-500/50 hover:text-blue-300 md:px-3.5 md:py-2 md:text-sm"
                      >
                        {m.action.label} <span aria-hidden>→</span>
                      </a>
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white md:h-8 md:w-8">
                      <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </div>
                  )}
                </div>
              ))}

            {loading && (
              <div className="flex gap-2.5 md:gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-[#1c1917] text-zinc-400 md:h-8 md:w-8">
                  <Bot className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-[#1c1917] px-3 py-2.5 text-xs md:px-4 md:py-3 md:text-sm">
                  <span className="shimmer-text text-xs font-medium tracking-wide md:text-[13px]">{THINKING_STEPS[thinkingIdx]}</span>
                </div>
              </div>
            )}

            {typing && (
              <div className="flex gap-2.5 md:gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-[#1c1917] text-zinc-400 md:h-8 md:w-8">
                  <Bot className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </div>
                <div className="max-w-[86%] rounded-2xl border border-zinc-800 bg-[#1c1917] px-3.5 py-2.5 text-sm leading-relaxed text-zinc-200 will-change-contents md:max-w-[84%] md:px-5 md:py-3 md:text-[15px]">
                  {typingText}
                  <span className="typing-cursor" aria-hidden />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2 font-mono text-xs text-amber-300">
              {error}
            </div>
          )}

          <form
            onSubmit={onSubmit}
            className="sticky bottom-0 mt-4 rounded-2xl border border-[#222120] bg-[#0A0A0A]/80 p-1.5 backdrop-blur-md md:mt-6 md:p-2"
          >
            <div className="rounded-2xl border border-[#222120] bg-[#1E1D1C] p-2.5 md:p-4">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                maxLength={500}
                disabled={busy}
                className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none disabled:opacity-50 md:text-[15px]"
              />
              <div className="mt-3 flex justify-end md:mt-4">
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label="Send message"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-zinc-900 transition-colors hover:bg-zinc-100 disabled:opacity-30 md:h-9 md:w-9"
                >
                  <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Spotlight>
  );
}
