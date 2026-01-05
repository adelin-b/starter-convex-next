/**
 * Global teardown for isolated E2E tests.
 *
 * NOTE: Convex backend is stopped by Playwright (webServer graceful shutdown).
 * This teardown just cleans up temporary files.
 */
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const APPS_E2E_SUFFIX_REGEX = /\/apps\/e2e$/;

export default async function isolatedTeardown(): Promise<void> {
  console.log("\n🧹 Cleaning up E2E environment...\n");

  const projectRoot = process.cwd().replace(APPS_E2E_SUFFIX_REGEX, "");
  const envPath = join(projectRoot, "apps", "web", ".env.e2e");
  const convexReadyFlag = join(projectRoot, "apps", "e2e", ".convex-ready");

  // Delete temporary files
  for (const filePath of [envPath, convexReadyFlag]) {
    if (existsSync(filePath)) {
      try {
        rmSync(filePath);
        console.log(`🗑️ Deleted ${filePath.replace(projectRoot, "")}`);
      } catch (error) {
        console.error(`⚠️ Failed to delete ${filePath}:`, error);
      }
    }
  }

  console.log("\n✅ Cleanup complete\n");
}
