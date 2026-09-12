/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1f0ff',
          100: '#e4e2ff',
          200: '#cbc7ff',
          300: '#a8a0ff',
          400: '#8478ff',
          500: '#6c63ff',
          600: '#5847e8',
          700: '#4636c4',
          800: '#392da0',
          900: '#2b2277',
          950: '#181350',
        },
        cyan: {
          400: '#3ce0ff',
          500: '#00d4ff',
          600: '#00a8cc',
        },
        coral: {
          400: '#ff8f8f',
          500: '#ff6b6b',
          600: '#ea4c4c',
        },
        hero: {
          DEFAULT: '#0a0a0f',
          light: '#12121c',
        },
        surface: {
          DEFAULT: '#0f1420',
          light: '#f7f8fb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,29,84,0.06), 0 1px 3px rgba(16,29,84,0.08)',
        glow: '0 0 40px -8px rgba(108,99,255,0.45)',
      },
      backgroundImage: {
        'aurora-1': 'radial-gradient(circle at 20% 20%, rgba(108,99,255,0.35), transparent 55%)',
        'aurora-2': 'radial-gradient(circle at 80% 30%, rgba(0,212,255,0.28), transparent 55%)',
        'aurora-3': 'radial-gradient(circle at 50% 85%, rgba(255,107,107,0.22), transparent 55%)',
      },
      keyframes: {
        drift1: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(30px, -20px) scale(1.08)' },
        },
        drift2: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(-25px, 25px) scale(1.05)' },
        },
        drift3: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(15px, -15px) scale(1.1)' },
        },
      },
      animation: {
        drift1: 'drift1 14s ease-in-out infinite',
        drift2: 'drift2 18s ease-in-out infinite',
        drift3: 'drift3 16s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
