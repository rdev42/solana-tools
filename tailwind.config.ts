/* eslint-disable @typescript-eslint/no-require-imports */
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hoc/**/*.{js,ts,jsx,tsx,mdx}',
    './src/helpers/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter, sans-serif', { fontFeatureSettings: '"cv11"' }],
      },
    },
  },
  plugins: [],
};
export default config;
