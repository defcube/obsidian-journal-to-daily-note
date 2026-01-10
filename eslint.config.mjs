import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import obsidian from "eslint-plugin-obsidianmd";

export default tseslint.config(
  {
    ignores: ["**/main.js", "**/node_modules/**", "**/dist/**", "coverage/**"],
  },

  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
  },

  // TypeScript recommended configs, restricted to TS files
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),

  // Obsidian recommended rules, restricted to TS files
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      obsidianmd: obsidian,
    },
    rules: {
      ...obsidian.configs.recommended,
    },
  },

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
