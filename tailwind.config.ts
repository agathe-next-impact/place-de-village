import type { Config } from "tailwindcss";

// Tokens "sobre" — cf. CAHIER-DES-CHARGES.md / README.md du paquet design-handoff
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f4f1ec",
        surface: "#ffffff",
        "surface-alt": "#e9e4dc",
        ink: "#1c1a17",
        "ink-soft": "#4d4843",
        "ink-muted": "#7a746c",
        line: "#d2ccc1",
        "line-soft": "#e3ddd2",
        primary: {
          DEFAULT: "#1f6e7a",
          ink: "#ffffff",
          soft: "#cfe1e4",
        },
        accent: {
          DEFAULT: "#e8a838",
          soft: "#f7e4b8",
        },
        danger: "#a8332b",
        info: "#1f6e7a",
        success: "#7a8c3a",
      },
      borderRadius: {
        DEFAULT: "4px",
        lg: "6px",
        pill: "999px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Public Sans",
          "-apple-system",
          "system-ui",
          "sans-serif",
        ],
      },
      letterSpacing: {
        title: "-0.02em",
        eyebrow: "0.08em",
      },
      boxShadow: {
        fab: "0 2px 6px rgba(0,0,0,0.15)",
        "fab-lg": "0 4px 14px rgba(0,0,0,0.18)",
      },
      fontSize: {
        eyebrow: ["11px", { lineHeight: "1.2", letterSpacing: "0.08em" }],
      },
    },
  },
  plugins: [],
};

export default config;
