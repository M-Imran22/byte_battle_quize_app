/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fef9e7',
          100: '#fdf0c7',
          200: '#fbe69f',
          300: '#f8db77',
          400: '#f5d04f',
          500: '#eca42b',
          600: '#d18a1f',
          700: '#a66f19',
          800: '#7b5312',
          900: '#50370c',
          DEFAULT: '#eca42b',
        }
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(236, 164, 43, 0.39)',
        'gold-lg': '0 10px 25px -3px rgba(236, 164, 43, 0.3)',
      }
    },
  },
  plugins: [],
}