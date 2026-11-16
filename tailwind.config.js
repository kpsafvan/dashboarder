/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        strava: {
          orange: '#FC4C02',
          dark: '#E34402',
          light: '#FF6422',
        },
        slate: {
          850: '#151F32',
          900: '#0F172A',
          950: '#0B0F19',
        }
      },
    },
  },
  plugins: [],
}
