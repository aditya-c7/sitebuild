"use client";

import { forwardRef } from "react";
import { Send } from "lucide-react";

interface ChatComposerBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
}

// Themed composer card: input on top, blue send button bottom-right.
// Dumb shell — the parent owns value, send flow, and busy state.
const ChatComposerBox = forwardRef<HTMLInputElement, ChatComposerBoxProps>(
  function ChatComposerBox({ value, onChange, onSubmit, disabled }, ref) {
    const canSend = value.trim().length > 0;

    return (
      <form onSubmit={onSubmit} className="mt-4 md:mt-6">
        <div
          role="presentation"
          onClick={() => {
            if (typeof ref === "object" && ref?.current) ref.current.focus();
          }}
          className="cursor-text rounded-xl border border-zinc-800 bg-[#1c1917] px-4 py-3 transition-colors focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/30"
        >
          <input
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask anything about Aditya..."
            aria-label="Ask anything about Aditya"
            maxLength={500}
            disabled={disabled}
            enterKeyHint="send"
            autoComplete="off"
            className="w-full bg-transparent text-base text-zinc-100 placeholder:text-zinc-600 focus:outline-none disabled:opacity-50 md:text-[15px]"
          />
          <div className="mt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={disabled || !canSend}
              aria-label="Send message"
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>
    );
  }
);

export default ChatComposerBox;
