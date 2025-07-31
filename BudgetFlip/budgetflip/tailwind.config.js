/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Monday.com inspired palette
        primary: {
          50: '#f0f3ff',
          100: '#e4e9ff',
          200: '#c3ceff',
          300: '#8da2ff',
          400: '#5273ff',
          500: '#0073ea', // Monday's primary blue
          600: '#0060c7',
          700: '#004da3',
          800: '#003a7f',
          900: '#00275b',
        },
        // Status colors
        success: {
          500: '#00c875', // Monday's green
          600: '#00a062',
          700: '#00784a',
        },
        warning: {
          500: '#ffcb00', // Monday's yellow
          600: '#cca300',
          700: '#997a00',
        },
        danger: {
          500: '#e2445c', // Monday's red
          600: '#b53649',
          700: '#882837',
        },
        // Additional Monday colors
        purple: {
          500: '#a25ddc',
          600: '#8147b0',
          700: '#613584',
        },
        orange: {
          500: '#fdab3d',
          600: '#ca8931',
          700: '#976725',
        },
        // Background colors
        background: {
          primary: '#ffffff',
          secondary: '#f6f7fb',
          tertiary: '#f0f3f7',
        },
        // Text colors
        text: {
          primary: '#323338',
          secondary: '#676879',
          tertiary: '#b0b1c2',
        }
      },
      boxShadow: {
        'monday': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'monday-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}