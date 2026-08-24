/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          50:  '#e8f4f6',
          100: '#c5e3e9',
          200: '#9ecfda',
          300: '#6eb8cb',
          400: '#3fa4bb',
          500: '#2a8ea3',
          600: '#1a6b7a',
          700: '#0e4a56',
          800: '#073340',
          900: '#031e27',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'sans-serif'],
      },
      transitionDuration: {
        250: '250ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out both',
        'slide-up': 'slideUp 0.6s ease-out both',
        reveal: 'reveal 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'scale-out': 'scaleOut 0.2s ease-in forwards',
        'lightbox-in': 'lightboxIn 0.3s ease-out forwards',
        'lightbox-out': 'lightboxOut 0.2s ease-in forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.97)' },
        },
        lightboxIn: {
          '0%': { opacity: '0', transform: 'scale(0.92) rotateX(6deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotateX(0deg)' },
        },
        lightboxOut: {
          '0%': { opacity: '1', transform: 'scale(1) rotateX(0deg)' },
          '100%': { opacity: '0', transform: 'scale(0.92) rotateX(6deg)' },
        },
      },
    },
  },
  plugins: [],
};
