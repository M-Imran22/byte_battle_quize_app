/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e7e9ed',
          100: '#c3c8d3',
          200: '#9ba4b6',
          300: '#738099',
          400: '#556483',
          500: '#37496d',
          600: '#314265',
          700: '#2a395a',
          800: '#233150',
          900: '#15253E',
          DEFAULT: '#15253E',
        },
        orange: {
          50: '#fef5e7',
          100: '#fde5c3',
          200: '#fbd49b',
          300: '#f9c373',
          400: '#f8b655',
          500: '#f7a937',
          600: '#f6a231',
          700: '#f4982a',
          800: '#f38f23',
          900: '#D98015',
          DEFAULT: '#D98015',
        },
        gold: {
          50: '#fef5e7',
          100: '#fde5c3',
          200: '#fbd49b',
          300: '#f9c373',
          400: '#f8b655',
          500: '#f7a937',
          600: '#f6a231',
          700: '#f4982a',
          800: '#f38f23',
          900: '#D98015',
          DEFAULT: '#D98015',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(217, 128, 21, 0.39)',
        'gold-lg': '0 10px 25px -3px rgba(217, 128, 21, 0.3)',
        'orange': '0 4px 14px 0 rgba(217, 128, 21, 0.39)',
        'orange-lg': '0 10px 25px -3px rgba(217, 128, 21, 0.3)',
        'navy': '0 4px 14px 0 rgba(21, 37, 62, 0.39)',
        'navy-lg': '0 10px 25px -3px rgba(21, 37, 62, 0.3)',
      }
    },
  },
  plugins: [],
}