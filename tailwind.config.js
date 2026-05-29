/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body:    ["'DM Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        ink:     "#0a0a0a",
        "ink-2": "#3a3a3a",
        "ink-3": "#888",
        "ink-4": "#bbb",
        surface: "#f7f6f3",
        card:    "#ffffff",
        border:  "#e5e4df",
      },
    },
  },
  plugins: [],
};
