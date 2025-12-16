import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./base.ts";

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [react(), tsconfigPaths({ ignoreConfigErrors: true })],
    test: {
      environment: "jsdom",
      setupFiles: ["@starter-saas/vitest-config/setup"],
    },
  }),
);
