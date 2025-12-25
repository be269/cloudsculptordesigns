import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Blues from logo - light cyan to deep navy
        primary: {
          50: '#E8F7FC',
          100: '#C5EBF7',
          200: '#8DD8F0',
          300: '#5BCEFA',
          400: '#3BB5E8',
          500: '#2A9DD6',
          600: '#1E7BB8',
          700: '#1A5F94',
          800: '#1E4A8D',
          900: '#162B5E',
        },
        // Dark grays for backgrounds (matching logo gradient)
        dark: {
          50: '#9CA3AF',
          100: '#6B7280',
          200: '#4B5563',
          300: '#3F4654',
          400: '#343A46',
          500: '#2A2F3A',
          600: '#22262F',
          700: '#1A1D24',
          800: '#14161B',
          900: '#0D0E12',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
