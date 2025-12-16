import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./base.ts";

/**
 * Vitest browser mode config for component testing in real browsers.
 * This is NOT for E2E testing - use Playwright for that.
 *
 * Usage in consuming packages:
 * ```ts
 * import browserConfig from "@starter-saas/vitest-config/browser";
 * export default browserConfig;
 * ```
 */
export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [react()],
    test: {
      include: ["**/*.browser.{ts,tsx}", "**/*.browser.test.{ts,tsx}"],
      browser: {
        enabled: true,
        provider: playwright({
          launchOptions: {
            slowMo: 100,
          },
        }),
        instances: [{ browser: "chromium" }],
        // biome-ignore lint/style/noProcessEnv: Vitest config requires CI detection
        headless: !!process.env.CI,
      },
      testTimeout: 30_000,
    },
  }),
);
