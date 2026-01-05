import reactConfig from "@starter-saas/vitest-config/react";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  reactConfig,
  defineConfig({
    test: {
      include: [
        "apps/**/src/**/*.{test,spec}.{ts,tsx}",
        "packages/**/src/**/*.{test,spec}.{ts,tsx}",
      ],
    },
  }),
);
