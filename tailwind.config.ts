import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme colors (ERwin-inspired)
        dark: {
          bg: '#0C0C0C',
          card: '#161616',
          border: '#2a2a2a',
          hover: '#1f1f1f',
        },
        // Accent colors
        accent: {
          primary: '#5E6AD2',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        },
        // Entity colors
        entity: {
          standard: '#5E6AD2',
          lookup: '#10B981',
          junction: '#F59E0B',
          view: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
