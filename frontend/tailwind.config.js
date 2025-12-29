/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0F2557",
        success: "#28A745",
        danger: "#DC3545",
        background: "#F8F9FA",
        surface: "#FFFFFF",
        textPrimary: "#212529",
        textSecondary: "#6C757D",
        border: "#DEE2E6",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
