// Shimmer skeleton bar — neutral placeholder shaped like its final content
// (fixed widths keep the swap layout-shift-free). Pure CSS, no dependencies.

export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`relative block h-3 overflow-hidden rounded bg-zinc-800 ${className}`}
    >
      <span className="skeleton-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent" />
    </span>
  );
}
