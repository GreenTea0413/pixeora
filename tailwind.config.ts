import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ["var(--font-pixel)"],
      },
      fontSize: {
        'pixel-xs': '0.625rem',   // 10px
        'pixel-sm': '0.75rem',    // 12px
        'pixel-base': '0.875rem', // 14px
        'pixel-lg': '1rem',       // 16px
        'pixel-xl': '1.25rem',    // 20px
        'pixel-2xl': '1.5rem',    // 24px
      },
    },
  },
};

export default config;
