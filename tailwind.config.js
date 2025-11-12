/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1f2937',
        'secondary': '#374151',
        'accent': '#ffd54f',
        'background': '#0b0b0d',
        'text': '#ffffff',
      },
    },
  },
  plugins: [],
}