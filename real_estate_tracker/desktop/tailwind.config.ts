import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom colors for Real Estate Tracker brand
      colors: {
        // Primary brand colors
        'brand': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        // Status colors for budget tracking
        'budget': {
          'under': '#22c55e',      // Green - under budget
          'warning': '#f59e0b',    // Amber - approaching limit
          'over': '#ef4444',       // Red - over budget
        },
        // Expense category colors
        'expense': {
          'material': '#8b5cf6',   // Purple - materials
          'labor': '#f97316',      // Orange - labor costs
        }
      },
      // Typography for professional appearance
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      // Custom spacing for desktop layout
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // Animation for smooth interactions
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      // Custom shadows for depth
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [
    // Form styling plugin for better form controls
    require('@tailwindcss/forms'),
    // Typography plugin for content areas
    require('@tailwindcss/typography'),
  ],
  // Dark mode support
  darkMode: 'class',
} satisfies Config 