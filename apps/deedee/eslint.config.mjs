import { nextJsConfig } from "@v1/eslint-config/next";

/** @type {import("eslint").Linter.Config} */
export default [
  {
    ignores: ["**/.next/**", "**/convex/_generated/**"],
  },
  ...nextJsConfig,
  {
    rules: {
      // Add any deedee-specific rules here
    },
  },
];
