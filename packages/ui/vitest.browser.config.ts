import browserConfig from "@starter-saas/vitest-config/browser";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  browserConfig,
  defineConfig({
    test: {
      include: ["src/**/*.browser.{ts,tsx}", "src/**/*.browser.test.{ts,tsx}"],
      passWithNoTests: true,
    },
  }),
);
