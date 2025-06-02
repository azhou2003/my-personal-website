/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#fefae0',
          dark: '#2e2a27',
        },
        foreground: {
          light: '#1a1a1a',
          dark: '#f5f5f5',
        },
        accent: {
          sage: '#b7c7a3',
          yellow: '#ffe066',
          orange: '#ffb385',
        },
        border: {
          light: '#e6e4d9',
          dark: '#3f3b36',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Arial', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Menlo', 'monospace'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};