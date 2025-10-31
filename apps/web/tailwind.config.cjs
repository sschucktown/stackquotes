/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts,tsx,js,jsx}",
    "../../packages/ui/src/**/*.{vue,ts}"
  ],
  theme: {
    extend: {
      colors: {
        'sq-primary': {
          DEFAULT: '#2d6ee4',
          dark: '#1b4db3',
          light: '#e6efff'
        },
        brand: {
          DEFAULT: '#3A7D99',
          50: '#ECF3F6',
          100: '#D9E7ED',
          200: '#B3CFDB',
          300: '#8CB7C9',
          400: '#669FB7',
          500: '#4F8FAA',
          600: '#3A7D99',
          700: '#2F6478',
          800: '#234A59',
          900: '#17323C'
        },
        accent: {
          DEFAULT: '#F4A261'
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"]
      }
    }
  },
  plugins: []
};
