/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Zen Kaku Gothic New"', '"Noto Sans TC"', 'sans-serif'],
      },
      colors: {
        'jp-bg': '#F7F7F5', // 日式米色背景
        'jp-black': '#333333',
        'jp-accent': '#D65A5A', // 點綴紅
      }
    },
  },
  plugins: [],
}
