/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./sites/**/*.html",
    "./sites/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Open Sans'", 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

