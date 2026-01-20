import baseConfig from "@starter-saas/eslint-config/base";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["repo-examples/**"],
  },
  ...baseConfig,
  // Agent packages - not part of standard feature boundaries
  {
    files: ["packages/agent/**/*", "packages/agent-livekit/**/*"],
    rules: {
      "boundaries/no-unknown-files": "off",
      "unicorn/no-nested-ternary": "off",
      "sonarjs/no-redundant-assignments": "off",
    },
  },
  // Next.js generated files
  {
    files: ["**/next-env.d.ts"],
    rules: {
      "boundaries/no-unknown-files": "off",
    },
  },
  // Root setup file - complex by nature
  {
    files: ["setup.ts"],
    rules: {
      "sonarjs/cognitive-complexity": "off",
    },
  },
];
