import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Work Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#FF5F6D',
          secondary: '#FFC371',
          dark: '#1C1F24',
          light: '#F5F7FA',
        },
      },
      backgroundImage: {
        'orb-gradient':
          'radial-gradient(circle at top left, rgba(255,95,109,0.35), transparent 55%), radial-gradient(circle at bottom right, rgba(255,195,113,0.35), transparent 60%)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.6s ease-out both',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
