import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors - Gold accent
        primary: {
          50: "#FAF4EC",
          100: "#F5EDE0",
          200: "#E8D9C0",
          300: "#DBC5A0",
          400: "#D2AC6A",
          500: "#D2AC6A",
          600: "#B8944F",
          700: "#9A7A3F",
          800: "#7C5F2F",
          900: "#5D4520",
        },
        // Base background - soft beige
        base: {
          DEFAULT: "#FAF4EC",
          light: "#FFFFFF",
          soft: "#F5EDE0",
        },
        // Neutral Colors - warm tones
        neutral: {
          50: "#FAF4EC",
          100: "#F5EDE0",
          200: "#E8D9C0",
          300: "#D4C4A8",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#2A2A2A",
          900: "#1A1A1A",
        },
        // Semantic Colors
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        error: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        info: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        background: {
          DEFAULT: "#FAF4EC",
          light: "#FFFFFF",
          surface: "#FAF4EC",
        },
        // Electric Brown for borders
        "electric-brown": {
          DEFAULT: "#8B4513",
          50: "#F5E6D3",
          100: "#E8D0B0",
          200: "#D4A574",
          300: "#C0854F",
          400: "#A66B3A",
          500: "#8B4513",
          600: "#6B3410",
          700: "#4A240B",
          800: "#2A1506",
          900: "#0A0502",
        },
      },
      fontFamily: {
        display: ["'Press Start 2P'", "cursive"],
        body: ["'Poppins'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        "soft": "0 2px 8px rgba(210, 172, 106, 0.1)",
        "soft-lg": "0 4px 16px rgba(210, 172, 106, 0.15)",
        "card": "0 2px 12px rgba(0, 0, 0, 0.08)",
        "electric-glow": "0 0 10px rgba(139, 69, 19, 0.5), 0 0 20px rgba(139, 69, 19, 0.3), 0 0 30px rgba(139, 69, 19, 0.2)",
        "electric-glow-lg": "0 0 15px rgba(139, 69, 19, 0.6), 0 0 30px rgba(139, 69, 19, 0.4), 0 0 45px rgba(139, 69, 19, 0.3)",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slide-in 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;

