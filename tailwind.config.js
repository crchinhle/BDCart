/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          900: '#0A0A1A',
          800: '#1A103C',
          700: '#2A1B54',
        },
        vintage: {
          50: '#FDFBF7',
          100: '#FEF3C7',
          200: '#FDE68A',
        },
        gold: {
          400: '#FBBF24',
          500: '#D4AF37',
          600: '#B5952B',
        },
      },
      fontFamily: {
        script: ['"Dancing Script"', 'cursive'],
        sans: ['Montserrat', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
