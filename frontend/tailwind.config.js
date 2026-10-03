/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2fbf6',
          100: '#e1f7ec',
          200: '#c5eed9',
          300: '#97debE',
          400: '#61c69d',
          500: '#38aa7f',
          600: '#278b65',
          700: '#206e52',
          800: '#1c5742',
          900: '#174837',
          950: '#0c281f',
        },
        gabirwa: {
          navy: '#1a2744',
          navyDark: '#0f1929',
          navyLight: '#243050',
          gold: '#C9A84C',
          goldLight: '#e8c97a',
        }
      }
    },
  },
  plugins: [],
}
