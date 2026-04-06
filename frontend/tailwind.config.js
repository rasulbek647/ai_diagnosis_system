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
        // Custom medical-grade color palette
        primary: {
          50:  '#eef9ff',
          100: '#d9f1ff',
          200: '#bbe5ff',
          300: '#8cd3ff',
          400: '#55b8ff',
          500: '#2d96f8',
          600: '#1476ed',
          700: '#0d5fd9',
          800: '#104eb0',
          900: '#13448a',
          950: '#0f2b56',
        },
        medical: {
          green:  '#10b981',
          yellow: '#f59e0b',
          red:    '#ef4444',
          blue:   '#3b82f6',
          purple: '#8b5cf6',
        },
        surface: {
          DEFAULT: '#0f172a',
          card:    '#1e293b',
          border:  '#334155',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bar-fill':   'barFill 1s ease-out forwards',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        barFill: { from: { width: '0%' }, to: { width: 'var(--bar-width)' } },
      }
    },
  },
  plugins: [],
}