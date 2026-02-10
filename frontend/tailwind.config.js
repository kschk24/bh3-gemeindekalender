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
        primary: {
          50: '#f0f7ef',
          100: '#d9ebd7',
          200: '#b3d7af',
          300: '#8dc387',
          400: '#5fa757',
          500: '#3b7d34',  // Hauptfarbe Seevetal
          600: '#326a2c',
          700: '#295724',
          800: '#20441c',
          900: '#173114',
        },
      },
      // Barrierefreiheit: Fokus-Stile
      ringWidth: {
        DEFAULT: '3px',
      },
      // Green IT: Reduzierte Animationen
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
