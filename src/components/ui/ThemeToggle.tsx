"use client";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

/**
 * Bare moon theme switch. The button has no chrome/border on purpose, and the
 * swap runs inside the View Transitions API to hand off to the dancing-Shigure
 * mask in globals.css.
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
      className="theme-toggle grid h-8 w-8 shrink-0 place-items-center text-zinc-400 transition-colors hover:text-white"
    >
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
