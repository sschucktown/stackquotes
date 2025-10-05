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
        }
      }
    }
  },
  plugins: []
};
