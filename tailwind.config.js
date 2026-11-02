/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mmsu: {
          green: '#0c4a26',
          gold: '#f5b800',
        }
      }
    },
  },
  plugins: [],
}
