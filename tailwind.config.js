/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream:             '#FDFBF7',
        warmGray:          '#F4F1EA',
        terracotta:        '#E07A5F',
        'terracotta-dark': '#C85A3F',
        sage:              '#81B29A',
        'sage-light':      '#B5D8C5',
        olive:             '#606C38',
        orange:            '#F2CC8F',
        charcoal:          '#3D405B',
      },
      fontFamily: {
        display: ['"Fredoka"', 'sans-serif'],
        body:    ['"Nunito"', 'sans-serif'],
      },
      boxShadow: {
        'chunky':    '4px 4px 0px rgba(61, 64, 91, 0.25)',
        'chunky-sm': '2px 2px 0px rgba(61, 64, 91, 0.20)',
        'chunky-lg': '6px 6px 0px rgba(61, 64, 91, 0.20)',
      },
      borderOpacity: { 8: '0.08' },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
      },
      backgroundImage: {
        'warm-gradient':  'linear-gradient(135deg, #FDFBF7 0%, #F2CC8F33 50%, #B5D8C540 100%)',
        'hero-gradient':  'linear-gradient(135deg, #FDFBF7 0%, #F2CC8F44 40%, #81B29A33 100%)',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
