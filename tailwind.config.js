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
        sage: {
          50: '#F4F7F5',
          100: '#E4ECE6',
          200: '#C7D9CD',
          300: '#A3C1AD',
          400: '#7BA48B',
          500: '#54876B',
          600: '#3B694F', // Primary Warm Sage
          700: '#2F533E',
          800: '#254031',
          900: '#1C3025',
        },
        pond: {
          50: '#F0F5F7',
          100: '#DDE9EE',
          200: '#B8D2DC',
          300: '#8FB7C6',
          400: '#6496AB',
          500: '#4A7C91',
          600: '#3D6473', // Secondary Misty Pond
          700: '#324F5B',
          800: '#263B43',
        },
        ochre: {
          50: '#FBF7F2',
          100: '#F5ECE1',
          200: '#E9D6BF',
          300: '#DABC9A',
          400: '#C99E74',
          500: '#AF8359',
          600: '#96724E', // Tertiary Warm Ochre
          700: '#785A3D',
        },
        paper: {
          50: '#FDFCF7', // Warm paper
          100: '#F6F3EB',
          200: '#EAE5D9',
          300: '#D7D1C2',
          card: '#FFFFFF',
          dark: '#141816', // Deep forest night
          darkCard: '#1C231F',
          darkBorder: '#2B352F',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
