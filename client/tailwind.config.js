/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#007acc',
          600: '#1e88e5',
          700: '#1976d2',
          800: '#1565c0',
          900: '#0d47a1',
        },
        secondary: {
          50: '#e0f7fa',
          100: '#b2ebf2',
          200: '#80deea',
          300: '#4dd0e1',
          400: '#26c6da',
          500: '#4fc3f7',
          600: '#00acc1',
          700: '#0097a7',
          800: '#00838f',
          900: '#006064',
        },
        clay: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#333333',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'clay': '0.75rem',
        'clay-lg': '1rem',
        'clay-xl': '1.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-sm': 'glowSm 2s ease-in-out infinite alternate',
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
          '0%': { boxShadow: '0 0 5px rgba(0, 122, 204, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 122, 204, 0.4)' },
        },
        glowSm: {
          '0%': { boxShadow: '0 0 3px rgba(0, 122, 204, 0.15)' },
          '100%': { boxShadow: '0 0 10px rgba(0, 122, 204, 0.3)' },
        },
      },
      boxShadow: {
        'clay': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
        'clay-sm': '0 1px 2px rgba(0, 0, 0, 0.1)',
        'clay-lg': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'clay-inset': 'inset 0 1px 2px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 15px rgba(0, 122, 204, 0.3)',
        'glow-lg': '0 0 30px rgba(0, 122, 204, 0.4)',
      },
    },
  },
  plugins: [],
};
