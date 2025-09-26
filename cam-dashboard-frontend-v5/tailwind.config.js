// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // This line tells Tailwind to scan your index.html file
    "./index.html",
    // THIS LINE IS CRITICAL: It tells Tailwind to scan ALL
    // JavaScript, TypeScript, JSX, and TSX files
    // within your 'src' directory and its subdirectories.
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
