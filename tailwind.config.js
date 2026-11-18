/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#FDFBF7',
          DEFAULT: '#F7F4EE',
          subtle: '#EFEAE1',
          muted: '#E2DBD0',
        },
        ink: {
          primary: '#141518',
          secondary: '#363940',
          muted: '#6A6F7C',
          faint: '#9EA4B2',
          subtle: '#D3D6DE',
        },
        accent: {
          terracotta: {
            DEFAULT: '#BA5D38',
            hover: '#A54F2E',
            light: '#F7ECE6',
          },
          brass: {
            DEFAULT: '#9E7D47',
            hover: '#8A6B3A',
            light: '#F8F4EC',
          },
        },
        status: {
          available: '#2E7D5A',
          availableBg: '#E9F5EF',
          held: '#B87B2E',
          heldBg: '#FCF4E8',
          sold: '#7C818E',
          soldBg: '#EFF0F3',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        full: '9999px',
      },
      boxShadow: {
        soft: '0 2px 10px rgba(20, 21, 24, 0.04), 0 1px 3px rgba(20, 21, 24, 0.03)',
        card: '0 8px 30px rgba(20, 21, 24, 0.06), 0 2px 8px rgba(20, 21, 24, 0.04)',
        elevation: '0 20px 48px rgba(20, 21, 24, 0.10), 0 6px 16px rgba(20, 21, 24, 0.06)',
      },
      letterSpacing: {
        tightest: '-0.03em',
        tighter: '-0.02em',
        tight: '-0.01em',
        normal: '0em',
        wide: '0.04em',
        wider: '0.08em',
        widest: '0.14em',
      },
    },
  },
  plugins: [],
};
