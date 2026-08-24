/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['variant', ['&:is(.dark *)', '&:is([data-theme="dark"] *)']],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
