"use client";

import { useEffect } from "react";

// Deterrent only: blocks common keyboard shortcuts that open devtools.
// Cannot truly prevent devtools (browser menu, JS disabled, curl, etc. all bypass it).
// Carefully avoids breaking the site's own Ctrl/Cmd+K command menu.

const BLOCKED_CODES = new Set(["KeyI", "KeyJ", "KeyC", "KeyK", "KeyM", "KeyE", "KeyU", "KeyS"]);

export default function DevToolsGuard() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // F12 (all platforms)
      if (e.key === "F12" || e.code === "F12") {
        e.preventDefault();
        return;
      }
      // Ctrl+Shift+<key> (Windows/Linux devtools + view-source-adjacent combos)
      if (e.ctrlKey && e.shiftKey && BLOCKED_CODES.has(e.code)) {
        e.preventDefault();
        return;
      }
      // Ctrl+U view source (no shift)
      if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.code === "KeyU") {
        e.preventDefault();
        return;
      }
      // Cmd+Opt+<key> (macOS devtools)
      if (e.metaKey && e.altKey && BLOCKED_CODES.has(e.code)) {
        e.preventDefault();
        return;
      }
      // Cmd+Shift+C (macOS inspect element)
      if (e.metaKey && e.shiftKey && !e.ctrlKey && !e.altKey && e.code === "KeyC") {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
