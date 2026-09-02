export default function CurvedSeparator() {
  return (
    <div className="relative w-full overflow-hidden leading-none">
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="block h-[36px] w-full md:h-[56px]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a21caf" stopOpacity="0.9" />
            <stop offset="18%" stopColor="#ec4899" stopOpacity="1" />
            <stop offset="45%" stopColor="#ef4444" stopOpacity="1" />
            <stop offset="75%" stopColor="#f43f5e" stopOpacity="1" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="curveFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#020618" />
            <stop offset="100%" stopColor="#050a1f" />
          </linearGradient>
        </defs>
        {/* Dark fill below upward-bulged curve */}
        <path d="M0,36 Q720,12 1440,36 L1440,60 L0,60 Z" fill="url(#curveFill)" />
        {/* Gradient curve line bulged upwards */}
        <path
          d="M0,36 Q720,12 1440,36"
          stroke="url(#curveGradient)"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
