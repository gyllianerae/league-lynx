import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        forest: {
          DEFAULT: "#0A1F2F",
          light: "#132B41",
        },
        mint: {
          DEFAULT: "#64FFDA",
          light: "#A5FFE9",
        },
        divine: {
          DEFAULT: "#FFD700",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        sans: ["Inter var", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        xl: '20px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;