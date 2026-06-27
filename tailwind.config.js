/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': 'var(--bg-color)',
        'surface': 'var(--bg-surface)',
        'surface-elevated': 'var(--bg-surface-elevated)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'primary': 'var(--color-primary)',
        'accent': 'var(--color-accent)',
        'border-color': 'var(--border-color)',
        'sidebar': 'var(--bg-sidebar)',
      },
    },
  },
  plugins: [],
}