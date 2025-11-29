/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444'
      }
    }
  },
  plugins: []
};
