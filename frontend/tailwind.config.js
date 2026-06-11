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
        brand: {
          dark: '#1a1d2d',
          blue: '#2563eb',
          light: '#f3f4f6'
        }
      }
    },
  },
  plugins: [],
}