import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          50: "#FDF8F3",
          100: "#FAF0E6",
          200: "#F5E1D2",
          300: "#E8C9A8",
          400: "#D4A574",
          500: "#C9A961",
          600: "#B8944F",
          700: "#9A7A3F",
          800: "#7C5F2F",
          900: "#5D4520",
          950: "#3D2E15",
        },
        // Secondary Colors
        secondary: {
          50: "#F5F5F0",
          100: "#E8E8DD",
          200: "#D1D1BB",
          300: "#BABA99",
          400: "#A3A377",
          500: "#8C8C55",
          600: "#6F6F44",
          700: "#525233",
          800: "#353522",
          900: "#181811",
        },
        // Neutral Colors
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0A0A0A",
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
          light: "#FFFFFF",
          dark: "#000000",
          surface: "#FAFAFA",
          surfaceDark: "#0A0A0A",
        },
      },
      fontFamily: {
        display: ["'Press Start 2P'", "cursive"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        "pixel": "4px 4px 0px 0px rgba(212,165,116,0.3)",
        "pixel-hover": "6px 6px 0px 0px rgba(212,165,116,0.4)",
        "pixel-active": "2px 2px 0px 0px rgba(212,165,116,0.3)",
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

