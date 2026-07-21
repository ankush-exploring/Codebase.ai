/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        clay: {
          50: '#faf8f6',
          100: '#f5f0eb',
          200: '#ede3d8',
          300: '#dcc9b4',
          400: '#c9aa8a',
          500: '#b8926a',
          600: '#a87b55',
          700: '#8c6547',
          800: '#73533e',
          900: '#5e4535',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'clay': '1rem',
        'clay-lg': '1.5rem',
        'clay-xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-sm': 'glowSm 2s ease-in-out infinite alternate',
        'clay-pulse': 'clayPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(249, 115, 22, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(249, 115, 22, 0.4)' },
        },
        glowSm: {
          '0%': { boxShadow: '0 0 3px rgba(249, 115, 22, 0.15)' },
          '100%': { boxShadow: '0 0 10px rgba(249, 115, 22, 0.3)' },
        },
        clayPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
      },
      boxShadow: {
        'clay': '6px 6px 12px rgba(0, 0, 0, 0.15), -6px -6px 12px rgba(255, 255, 255, 0.05)',
        'clay-sm': '3px 3px 6px rgba(0, 0, 0, 0.12), -3px -3px 6px rgba(255, 255, 255, 0.04)',
        'clay-lg': '10px 10px 20px rgba(0, 0, 0, 0.15), -10px -10px 20px rgba(255, 255, 255, 0.05)',
        'clay-inset': 'inset 3px 3px 6px rgba(0, 0, 0, 0.1), inset -3px -3px 6px rgba(255, 255, 255, 0.04)',
        'clay-light': '6px 6px 12px rgba(180, 146, 106, 0.15), -6px -6px 12px rgba(255, 255, 255, 0.5)',
        'clay-light-sm': '3px 3px 6px rgba(180, 146, 106, 0.12), -3px -3px 6px rgba(255, 255, 255, 0.4)',
        'clay-light-lg': '10px 10px 20px rgba(180, 146, 106, 0.15), -10px -10px 20px rgba(255, 255, 255, 0.5)',
        'clay-light-inset': 'inset 3px 3px 6px rgba(180, 146, 106, 0.1), inset -3px -3px 6px rgba(255, 255, 255, 0.3)',
        'glow': '0 0 15px rgba(249, 115, 22, 0.3)',
        'glow-lg': '0 0 30px rgba(249, 115, 22, 0.4)',
        'glow-purple': '0 0 15px rgba(217, 70, 239, 0.3)',
      },
    },
  },
  plugins: [],
};
