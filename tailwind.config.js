/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B00', // Example primary color, adjust as needed based on original
      },
      fontFamily: {
        kids: ['System'], // Placeholder for custom font if needed
      }
    },
  },
  plugins: [],
}
