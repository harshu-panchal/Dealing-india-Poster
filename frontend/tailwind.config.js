/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      'mobile': { 'max': '480px' },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
        },
        secondary: '#ec4899',
        accent: '#f59e0b',
        bg: '#f8fafc',
        card: '#ffffff',
        'text-primary': '#0f172a',
        'text-secondary': '#64748b',
        border: '#e2e8f0',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
      },
      borderRadius: {
        'sm': '0.375rem',
        'md': '0.75rem',
        'lg': '1.25rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        'gradient-surface': 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
        'shimmer': 'linear-gradient(90deg, #e2e8f0 0%, #f8fafc 25%, #e2e8f0 50%, #f8fafc 75%, #e2e8f0 100%)',
      }
    },
  },
  plugins: [],
}
