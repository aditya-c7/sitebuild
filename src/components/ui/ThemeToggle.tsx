"use client";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

/**
 * Sun/moon theme switch. The active icon is driven by `data-theme` in CSS so
 * there is no hydration flash, and the swap runs inside the View Transitions
 * API to hand off to the dancing-Shigure mask in globals.css.
 */
export default function ThemeToggle() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";

    const apply = () => {
      root.setAttribute("data-theme", next);
      root.style.colorScheme = next;
      try {
        localStorage.setItem("theme", next);
      } catch {
        // Storage can be unavailable in private mode; the theme still applies.
      }
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const doc = document as ViewTransitionDocument;

    if (doc.startViewTransition && !reduceMotion) {
      const transition = doc.startViewTransition(() => {
        root.classList.add("theme-transitioning");
        apply();
      });
      transition.finished.finally(() => {
        root.classList.remove("theme-transitioning");
      });
    } else {
      apply();
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className="theme-toggle grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/[0.08] bg-white/[0.06] text-zinc-400 transition-all hover:border-white/[0.16] hover:text-zinc-100"
    >
      {/* Sun — shown in dark mode */}
      <svg
        className="sun-icon"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>

      {/* Moon — shown in light mode */}
      <svg
        className="moon-icon"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
