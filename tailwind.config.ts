import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: "#FAF4EC",
          100: "#F5E9D9",
          200: "#EBD3B3",
          300: "#E1BD8D",
          400: "#D7A767",
          500: "#D2AC6A",
          600: "#B8904F",
          700: "#9E7434",
          800: "#845819",
          900: "#6A3C00",
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to bottom, #FAF4EC, #D2AC6A)',
        'gradient-primary-reverse': 'linear-gradient(to top, #FAF4EC, #D2AC6A)',
      },
    },
  },
  plugins: [],
};
export default config;

