import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-syne)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
        display: ["var(--font-syne)", "sans-serif"],
      },
      colors: {
        void: "#030307",
        carbon: "#0a0a12",
        slate: {
          950: "#0d0d18",
          900: "#13131f",
          800: "#1a1a2e",
          700: "#252540",
        },
        cipher: {
          50: "#eef4ff",
          100: "#d9e8ff",
          200: "#bcd4ff",
          300: "#8eb6ff",
          400: "#598eff",
          500: "#3366ff",
          600: "#1a44f5",
          700: "#1332e1",
          800: "#1629b5",
          900: "#18278f",
          950: "#121a56",
        },
        neon: {
          blue: "#4f8eff",
          purple: "#8b5cf6",
          emerald: "#10d97c",
          cyan: "#06b6d4",
        },
      },
      backgroundImage: {
        "cipher-gradient": "linear-gradient(135deg, #030307 0%, #0d0d18 50%, #080814 100%)",
        "blue-glow": "radial-gradient(ellipse at center, rgba(79,142,255,0.15) 0%, transparent 70%)",
        "purple-glow": "radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 70%)",
        "card-glass": "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
      },
      boxShadow: {
        "cipher": "0 0 0 1px rgba(79,142,255,0.2), 0 4px 24px rgba(79,142,255,0.08)",
        "cipher-hover": "0 0 0 1px rgba(79,142,255,0.4), 0 8px 40px rgba(79,142,255,0.15)",
        "purple": "0 0 0 1px rgba(139,92,246,0.2), 0 4px 24px rgba(139,92,246,0.08)",
        "emerald": "0 0 0 1px rgba(16,217,124,0.2), 0 4px 24px rgba(16,217,124,0.08)",
        "glow-blue": "0 0 40px rgba(79,142,255,0.3)",
        "glow-purple": "0 0 40px rgba(139,92,246,0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "scan": "scan 3s linear infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "particle": "particle 8s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        glow: {
          "from": { opacity: "0.5", filter: "blur(8px)" },
          "to": { opacity: "1", filter: "blur(12px)" },
        },
        particle: {
          "0%": { transform: "translateY(100vh) translateX(0)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(-100px) translateX(100px)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
