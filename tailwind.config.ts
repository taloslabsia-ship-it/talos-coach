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
        primary: {
          DEFAULT: '#0df2f2',
          50:  '#ecfffe',
          100: '#cffffe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#0df2f2',
          600: '#09b3b3',
          700: '#0e7490',
          800: '#155e75',
          900: '#0c2a2a',
        },
        // Keep brand as alias for primary
        brand: {
          50:  '#ecfffe',
          100: '#cffffe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#0df2f2',
          600: '#09b3b3',
          700: '#0e7490',
          800: '#155e75',
          900: '#0c2a2a',
        },
        secondary: '#a855f7',
        'bg-dark':   '#0a1414',
        'card-dark': '#0f1e1e',
        'charcoal':  '#061010',
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'neon':    '0 0 15px rgba(13, 242, 242, 0.35)',
        'neon-sm': '0 0 8px rgba(13, 242, 242, 0.25)',
        'neon-lg': '0 0 30px rgba(13, 242, 242, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
