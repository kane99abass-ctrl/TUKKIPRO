/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#0D0D12',
          deep: '#07070A',
          surface: '#15151E',
          card: '#12121A',
        },
        champagne: {
          DEFAULT: '#C9A84C',
          light: '#E3C878',
          hover: '#B89436',
          dim: 'rgba(201, 168, 76, 0.15)',
          glow: 'rgba(201, 168, 76, 0.35)',
        },
        ivory: {
          DEFAULT: '#FAF8F5',
          surface: '#F2EFEB',
          border: '#E6E1D8',
        },
        slateText: {
          DEFAULT: '#2A2A35',
          muted: '#8E8E9E',
        },
        tukki: {
          obsidian: '#0D0D12',
          champagne: '#C9A84C',
          ivory: '#FAF8F5',
          slate: '#2A2A35',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        title: ['"Inter"', 'sans-serif'],
        drama: ['"Playfair Display"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3rem',
      },
      boxShadow: {
        'luxury': '0 20px 50px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(201, 168, 76, 0.15)',
        'champagne-glow': '0 0 35px -5px rgba(201, 168, 76, 0.3)',
      }
    },
  },
  plugins: [],
}
