/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bloom: {
          cream: '#fff9ef',
          teal: '#1e8f92',
          aqua: '#71d6cf',
          gold: '#ffd166',
          coral: '#ff8b7b',
          lilac: '#9d8cf4',
          plum: '#5f4bb6',
          ink: '#17324d',
        },
      },
      boxShadow: {
        bloom: '0 20px 60px rgba(95, 75, 182, 0.16)',
        soft: '0 10px 30px rgba(23, 50, 77, 0.08)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        floaty: 'floaty 5s ease-in-out infinite',
      },
      backgroundImage: {
        'hero-radial': 'radial-gradient(circle at top left, rgba(157, 140, 244, 0.25), transparent 30%), radial-gradient(circle at top right, rgba(113, 214, 207, 0.25), transparent 30%), linear-gradient(180deg, #fff9ef 0%, #f5fbff 100%)',
      },
    },
  },
  plugins: [],
};