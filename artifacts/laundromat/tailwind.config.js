export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(210 33% 99%)",
        foreground: "hsl(222 47% 11%)",
        primary: "hsl(199 89% 48%)",
        card: "#ffffff",
        border: "hsl(214.3 31.8% 91.4%)",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
    },
  },
  plugins: [],
};