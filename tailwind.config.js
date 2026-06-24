/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B2020',
        cream: '#F5EDD8',
        accent: '#C0392B',
        'dark-text': '#3D1515',
      },
      fontFamily: {
        cursive: ['"Dancing Script"', 'cursive'],
        handwriting: ['"Caveat"', 'cursive'],
        body: ['"Lato"', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        glow: {
          '0%, 100%': { filter: 'brightness(1) drop-shadow(0 0 8px rgba(139,32,32,0.3))' },
          '50%': { filter: 'brightness(1.15) drop-shadow(0 0 20px rgba(139,32,32,0.6))' },
        },
        'heart-float': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-120px) scale(0.3)', opacity: '0' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        'idle-bar': {
          '0%, 100%': { height: '8px' },
          '50%': { height: '20px' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        glow: 'glow 2.5s ease-in-out infinite',
        'heart-float': 'heart-float 3s ease-out forwards',
        'confetti-fall': 'confetti-fall 4s linear forwards',
        'idle-bar': 'idle-bar 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
