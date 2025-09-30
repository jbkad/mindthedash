/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'bg': '#101826',
        'highlight': '#ffcc00',
        'lightblue': '#101826',
        'darkblue': '#0a0f1a',
      },

      keyframes: {
        loader: {
          to: {
            backgroundSize: '100% 2px',
          },
        },
      },

      animation: {
        loader: 'loader 2s linear infinite',
      }
    },
  },
  plugins: [],
}
