import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 10_000,
    hookTimeout: 10_000,
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/storybook-static/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "**/*.d.ts",
        "**/*.stories.{ts,tsx}",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/node_modules/**",
        "**/_generated/**",
        "**/convex/_generated/**",
      ],
    },
  },
});
