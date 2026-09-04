"use client";

import { useEffect } from "react";

// Console easter egg:
// - On load: blue "hey, looking under the hood?"
// - When DevTools is opened (docked): green Matrix rain for 3s, fade out,
//   console cleared, then green "hey, looking under the hood?"
// Detection = window size diff, so undocked (separate-window) DevTools won't trigger it.

const DEVTOOLS_THRESHOLD = 160;
const CHECK_INTERVAL_MS = 400;
const RAIN_DURATION_MS = 4000;

const MATRIX_CHARS =
  "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ";

type Timer = ReturnType<typeof setInterval> | ReturnType<typeof setTimeout>;

export default function ConsoleGreet() {
  useEffect(() => {
    console.log("%chey, looking under the hood?", "color: #60a5fa; font-size: 14px");

    let disposed = false;
    let triggered = false;
    const timers: Timer[] = [];

    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        if (!disposed) fn();
      }, ms);
      timers.push(t);
      return t;
    };

    function matrixRain(duration: number): Promise<void> {
      return new Promise((resolve) => {
        if (disposed) {
          resolve();
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.style.cssText =
          "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;" +
          "z-index: 99999; pointer-events: none; background: transparent;";
        document.body.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          canvas.remove();
          resolve();
          return;
        }
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const fontSize = 16;
        const columns = Math.max(1, Math.floor(canvas.width / fontSize));
        const drops: number[] = Array(columns).fill(1);

        const draw = () => {
          ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = "#0F0";
          ctx.font = `${fontSize}px monospace`;

          for (let i = 0; i < drops.length; i++) {
            const text = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
              drops[i] = 0;
            }
            drops[i]++;
          }
        };

        const interval = setInterval(() => {
          if (!disposed) draw();
        }, 33);
        timers.push(interval);

        later(() => {
          clearInterval(interval);
          // Fade out
          let opacity = 1;
          const fade = setInterval(() => {
            opacity -= 0.06;
            canvas.style.opacity = String(opacity);
            if (opacity <= 0) {
              clearInterval(fade);
              canvas.remove();
              resolve();
            }
          }, 30);
          timers.push(fade);
        }, duration);
      });
    }

    const checker = setInterval(() => {
      if (disposed) return;
      const widthDiff = window.outerWidth - window.innerWidth > DEVTOOLS_THRESHOLD;
      const heightDiff = window.outerHeight - window.innerHeight > DEVTOOLS_THRESHOLD;

      if ((widthDiff || heightDiff) && !triggered) {
        triggered = true;
        void matrixRain(RAIN_DURATION_MS).then(() => {
          if (disposed) return;
          console.clear();
          console.log(
            "%chey, looking under the hood?",
            "color: #0F0; font-size: 14px; font-family: monospace;"
          );
        });
      }

      // Reset when DevTools is closed so it can trigger again next time.
      if (!widthDiff && !heightDiff) {
        triggered = false;
      }
    }, CHECK_INTERVAL_MS);
    timers.push(checker);

    return () => {
      disposed = true;
      timers.forEach((t) => {
        clearInterval(t);
        clearTimeout(t);
      });
      document.querySelectorAll("canvas").forEach((c) => {
        if (c.style.zIndex === "99999") c.remove();
      });
    };
  }, []);

  return null;
}
