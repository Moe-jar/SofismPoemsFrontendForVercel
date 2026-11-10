/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./login.html",
    "./pages/**/*.{html,js}",
    "./js/**/*.js"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#0a5750",
        "primary-light": "#158c82",
        "primary-hover": "#0e7066",
        "primary-dark": "#052e2a",
        accent: "#d4b068",
        "background-dark": "#121616",
        "surface-dark": "#1c2626",
      },
      fontFamily: {
        display: ["Cairo", "Manrope", "sans-serif"],
        serif: ["Amiri", "serif"],
        poem: ["Scheherazade New", "Amiri", "Noto Naskh Arabic", "serif"],
        "arabic-ui": ["Noto Sans Arabic", "Cairo", "sans-serif"],
      },
      backgroundImage: {
        "subtle-glow": "radial-gradient(circle at center, rgba(10,87,80,0.25) 0%, rgba(18,22,22,0) 60%)",
        vignette: "radial-gradient(circle, transparent 20%, #121616 120%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
        glow: "0 0 20px rgba(33, 131, 98, 0.3)",
      },
      animation: {
        float: "float-orb 10s ease-in-out infinite",
        "float-delay": "float-orb 12s ease-in-out infinite 2s",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};
