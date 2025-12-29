import baseConfig from "@starter-saas/eslint-config/base";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["repo-examples/**"],
  },
  ...baseConfig,
];
