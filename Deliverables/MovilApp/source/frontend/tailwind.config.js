module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")], // 👈 esto es obligatorio
  theme: {
    extend: {
      colors: {
        primary: "#0F1B2D",
        secondary: "#F4B400",
      },
    },
  },
  plugins: [],
};