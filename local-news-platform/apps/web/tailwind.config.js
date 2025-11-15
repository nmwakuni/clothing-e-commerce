/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#d6e1fd',
          300: '#b3c7fb',
          400: '#8aa8f8',
          500: '#667eea',
          600: '#5568d3',
          700: '#4651b5',
          800: '#3a4293',
          900: '#323975',
        },
      },
    },
  },
  plugins: [],
};
