import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        dark: {
          DEFAULT: '#09090B',
          secondary: '#18181B',
          tertiary: '#27272A',
        },
        light: {
          primary: '#FAFAFA',
          secondary: '#A1A1AA',
          muted: '#71717A',
        },
      },
      boxShadow: {
        'glow-subtle': '0 0 8px rgba(6, 182, 212, 0.15)', // cyan based glow
        'glow-medium': '0 0 16px rgba(6, 182, 212, 0.25)',
        'glow-large': '0 0 24px rgba(6, 182, 212, 0.35)',
        'glow-profit': '0 0 12px rgba(34, 197, 94, 0.30)',
        'glow-loss': '0 0 12px rgba(239, 68, 68, 0.30)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
