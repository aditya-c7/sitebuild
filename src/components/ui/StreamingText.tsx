"use client";

import * as React from "react";

export interface StreamingTextProps extends Omit<React.ComponentProps<"span">, "children"> {
  active?: boolean;
  text: string;
  wordGap?: number;
  fadeDuration?: number;
}

export function StreamingText({
  active = false,
  text,
  wordGap = 45,
  fadeDuration = 320,
  className,
  style,
  ...props
}: StreamingTextProps) {
  const words = React.useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const [revealed, setRevealed] = React.useState(() => (active ? 0 : words.length));
  const [resetting, setResetting] = React.useState(false);

  React.useEffect(() => {
    if (!active) {
      setResetting(false);
      setRevealed(words.length);
      return;
    }
    setResetting(true);
    setRevealed(0);
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let frameA = 0;
    let frameB = 0;
    frameA = requestAnimationFrame(() => {
      frameB = requestAnimationFrame(() => {
        setResetting(false);
        // Human cadence: jittered per-word timing, same average as wordGap.
        let t = 0;
        words.forEach((_, i) => {
          t += wordGap * 0.55 + Math.random() * wordGap * 0.9;
          timeouts.push(setTimeout(() => setRevealed(i + 1), t));
        });
      });
    });
    return () => {
      cancelAnimationFrame(frameA);
      cancelAnimationFrame(frameB);
      timeouts.forEach(clearTimeout);
    };
  }, [active, words, wordGap]);

  return (
    <span
      data-slot="streaming-text"
      data-active={active || undefined}
      data-resetting={resetting || undefined}
      className={["st-stream", className].filter(Boolean).join(" ")}
      style={
        {
          ...style,
          "--fade-duration": `${fadeDuration}ms`,
        } as React.CSSProperties
      }
      {...props}
    >
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <span className="st-word" data-in={i < revealed || undefined}>
            {word}
          </span>
          {i < words.length - 1 ? " " : ""}
        </React.Fragment>
      ))}
    </span>
  );
}
