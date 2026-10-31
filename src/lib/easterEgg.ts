// Easter-egg plumbing for the visitor phone-name reveal.
// The resolved phone name is hidden by default; it only appears after the
// visitor double-taps one of the two trigger rows ("surfing on <browser>" or
// "You're visiting from <location>"). A tiny window event links the trigger
// rows to VisitorDevice without prop-drilling through the server Footer.

export const DEVICE_REVEAL_EVENT = "adityahq:reveal-device";

/** Hidden → shimmering skeleton → revealed. PC/tablet never leave "hidden". */
export type DeviceRevealState = "hidden" | "revealing" | "revealed";

/**
 * Two consecutive clicks/taps on the same element within `thresholdMs`.
 * Touch taps arrive as click events, so one gate covers mouse and touch.
 */
export function createDoubleTapGate(thresholdMs = 450): () => boolean {
  let lastTapAt = 0;
  return () => {
    const now = Date.now();
    const unlocked = now - lastTapAt < thresholdMs;
    lastTapAt = now;
    return unlocked;
  };
}

/** Fire the reveal event; listeners decide whether/what to show. */
export function dispatchDeviceReveal(): void {
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(DEVICE_REVEAL_EVENT));
    }
  } catch {
    // revealing is optional by definition — never let it throw
  }
}

/** Subscribe to reveal events; returns an unsubscribe function. */
export function onDeviceReveal(handler: () => void): () => void {
  try {
    if (typeof window === "undefined") return () => {};
    window.addEventListener(DEVICE_REVEAL_EVENT, handler);
    return () => window.removeEventListener(DEVICE_REVEAL_EVENT, handler);
  } catch {
    return () => {};
  }
}
