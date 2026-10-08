/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan: '#00F0FF',
          pink: '#FF0055',
          amber: '#FFB800',
          green: '#00FF66',
          purple: '#8B00FF',
          bg: '#050811',
          card: '#0A0F1D',
          darkBorder: '#1E293B',
          glowCyan: 'rgba(0, 240, 255, 0.25)',
          glowPink: 'rgba(255, 0, 85, 0.25)',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 25px rgba(0, 240, 255, 0.25)',
        'neon-pink': '0 0 25px rgba(255, 0, 85, 0.25)',
        'neon-amber': '0 0 25px rgba(255, 184, 0, 0.25)',
      },
    },
  },
  plugins: [],
}
