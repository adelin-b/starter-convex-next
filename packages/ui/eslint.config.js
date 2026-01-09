import tsParser from "@typescript-eslint/parser";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

/**
 * ESLint config for @starter-saas/ui package.
 *
 * Tailwind CSS class validation only - other linting handled by Biome.
 */
export default [
  {
    ignores: ["node_modules/**", "dist/**"],
  },

  // Tailwind CSS class validation
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "better-tailwindcss": betterTailwindcss,
    },
    settings: {
      "better-tailwindcss": {
        // Tailwind 4 CSS-based config entry point
        entryPoint: "./src/globals.css",
      },
    },
    rules: {
      // Stylistic rules (auto-fixable)
      "better-tailwindcss/no-duplicate-classes": "warn",
      "better-tailwindcss/no-unnecessary-whitespace": "warn",
      // Note: class ordering handled by biome useSortedClasses (conflicts with this plugin)
      "better-tailwindcss/enforce-shorthand-classes": "warn",

      // Correctness rules
      "better-tailwindcss/no-conflicting-classes": "error",
    },
  },
];
