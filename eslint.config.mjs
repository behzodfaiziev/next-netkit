import globals from "globals";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config} */
export default {
  files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  languageOptions: {
    globals: globals.browser,
    parser: tsParser,
  },
  plugins: {
    "@typescript-eslint": ts,
    react,
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
