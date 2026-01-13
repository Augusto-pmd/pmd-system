import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Force light mode only
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pmd: {
          blue: "#162F7F",
          darkBlue: "#0f1f3d",
          mediumBlue: "#1f3a68",
          gold: "#d4af37",
          white: "#ffffff",
        },
        apple: {
          silver: {
            light: "#F5F5F7",
            medium: "#EBEBF0",
            dark: "#DADADA",
          },
          text: {
            primary: "#1C1C1E",
            secondary: "#3A3A3C",
            tertiary: "#636366",
            placeholder: "#AEAEB2",
          },
          blue: {
            pmd: "#162F7F",
            system: "#0A84FF",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        pmd: "4px",
      },
      boxShadow: {
        pmd: "0 2px 8px rgba(0, 0, 0, 0.1)",
        "glass": "0 4px 20px rgba(0, 0, 0, 0.06)",
        "pmd-glow": "0 4px 20px rgba(22, 47, 127, 0.25)",
        "depth-2": "0 8px 30px rgba(0, 0, 0, 0.06)",
        "depth-3": "0 10px 40px rgba(0, 0, 0, 0.12)",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      transitionDuration: {
        'apple': '300ms',
      },
    },
  },
  plugins: [],
};

export default config;
