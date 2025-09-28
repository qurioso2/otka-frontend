/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // OTKA Brand Colors - Consistent theme
        'otka': {
          'blue': {
            50: '#f0f7ff',
            100: '#e0efff', 
            200: '#b8dffe',
            300: '#7cc7fe',
            400: '#36acfc',
            500: '#0c91ed',
            600: '#0073cb',
            700: '#015ca4',
            800: '#064e87',
            900: '#0b4270',
          },
          'gray': {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0', 
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
          },
          'green': {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0', 
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          }
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}