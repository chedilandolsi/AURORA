/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        aurora: {
          dark: '#0e1015',
          darker: '#08090c',
          card: '#161922',
          cardHover: '#1c202c',
          border: '#2a2f3e',
          gold: '#cba358',
          goldLight: '#dfbf7b',
          terracotta: '#b85d38',
          sand: '#e8ded1',
          sandLight: '#f6f2ec',
          muted: '#8e96a8'
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "radial-gradient(ellipse at top, rgba(203, 163, 88, 0.15), transparent 70%), radial-gradient(ellipse at bottom, rgba(184, 93, 56, 0.1), transparent 70%)"
      }
    },
  },
  plugins: [],
}
