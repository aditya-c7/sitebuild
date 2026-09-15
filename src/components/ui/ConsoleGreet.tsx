"use client";

import { useEffect } from "react";

// Console easter egg: subtle greeting in the console.
// Note: DevTools matrix-rain overlay intentionally removed —
// window outer/inner size-diff detection false-triggered on mobile
// when the keyboard opens (innerHeight shrinks), covering /chat input.

export default function ConsoleGreet() {
  useEffect(() => {
    console.log("%chey, looking under the hood?", "color: #60a5fa; font-size: 14px");
  }, []);

  return null;
}
