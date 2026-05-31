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
        cormorant: ["var(--font-cormorant)", "serif"],
        "inter-tight": ["var(--font-inter-tight)", "sans-serif"],
      },
      colors: {
        primary: "#181b25",
        secondary: "#666052",
        tertiary: "#525866",
        muted: "#aea899",
        surface: "#f1ede7",
        "surface-dark": "#111110",
        "surface-inverse": "#0e121b",
      },
      letterSpacing: {
        widest2: "6px",
        widest3: "2px",
        widest4: "1.2px",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
