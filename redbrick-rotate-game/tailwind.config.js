/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  safelist: [
    {
      pattern: /^animate-spin-\d+$/,
    },
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'spin-full': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'spin-72': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(72deg)' },
        },
        'spin-144': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(144deg)' },
        },
        'spin-216': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(216deg)' },
        },
        'spin-288': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(288deg)' },
        },
        'spin-360': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'spin-start': 'spin-full 0.5s ease-in',
        'spin-continuous': 'spin-full 0.25s linear infinite',
        'spin-1': 'spin-72 0.5s ease-out',
        'spin-2': 'spin-144 1s ease-out',
        'spin-3': 'spin-216 1.5s ease-out',
        'spin-4': 'spin-288 2s ease-out',
        'spin-5': 'spin-360 2.5s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
