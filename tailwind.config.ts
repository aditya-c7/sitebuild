import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        zinc: colors.stone,
        canvas: "#1c1917",
        surface: "#2E2A27",
        "surface-card": "#38332F",
        border: "#44403C",
        accent: {
          blue: "#2563eb",
          "blue-glow": "#3b82f6",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        editorial: ["PP Editorial New", "var(--font-editorial)", "Georgia", "serif"],
        display: ["var(--font-display)", "Space Grotesk", "sans-serif"],
      },
      animation: {
        "marquee-left": "marquee-left 35s linear infinite",
        "marquee-right": "marquee-right 35s linear infinite",
      },
      keyframes: {
        "marquee-left": {
          from: { transform: "translateX(0%)" },
          to: { transform: "translateX(-50%)" },
        },
        "marquee-right": {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0%)" },
        },
      },
    },
  },
  safelist: [
    {
      pattern: /^(from|via|to)-(blue|indigo|purple|emerald|teal|cyan)-(600|500)\/(20|30)$/,
    },
    {
      pattern: /^(bg)-(blue|indigo|purple|emerald|amber|rose|teal|violet)-500$/,
    },
  ],
  plugins: [],
};

export default config;
