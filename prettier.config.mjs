/** @type {import("prettier").Config} */
const config = {
  semi: false,
  singleQuote: true,
  tabWidth: 4,
  printWidth: 120,
  trailingComma: 'es5',
  tailwindFunctions: ['clsx', 'tw'],
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],
};

export default config;
