/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#020617",
        panel: "rgba(15,23,42,0.7)",
        neon: "#38bdf8",
        neon2: "#a78bfa",
        textdim: "#94a3b8",
      },
      boxShadow: {
        glow: "0 0 20px rgba(56,189,248,0.25)",
      },
    },
  },
  plugins: [],
};
