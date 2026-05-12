/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0faf1',
          100: '#dbf3dc',
          200: '#b8e7bc',
          300: '#7bc47f',
          400: '#5bb760',
          500: '#3a9e40',
          600: '#2d7f33',
          700: '#26652b',
          800: '#225126',
          900: '#1d4321',
        },
        sky: {
          50: '#f0f9fe',
          100: '#ddf2fc',
          200: '#c2e8fa',
          300: '#6ec1e4',
          400: '#4fa3d1',
          500: '#3086b8',
          600: '#226c9e',
          700: '#1d5780',
          800: '#1c496a',
          900: '#1c3e59',
        },
        warm: {
          50: '#fffdf7',
          100: '#fff9e6',
          200: '#fff0c2',
          300: '#ffd166',
          400: '#ffb067',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        cream: '#fffdf7',
        tropical: '#2f5d50',
        ocean: '#4fa3d1',
        dark: '#2c3e50',
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'leaf-fall': 'leafFall 10s linear infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { opacity: '0.4', filter: 'blur(10px)' },
          '100%': { opacity: '0.8', filter: 'blur(20px)' },
        },
        leafFall: {
          '0%': { transform: 'translateY(-10%) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(360deg)', opacity: '0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
