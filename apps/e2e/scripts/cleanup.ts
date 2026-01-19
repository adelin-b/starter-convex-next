#!/usr/bin/env node
/**
 * Manual cleanup script for E2E test environment.
 *
 * Use this when:
 * - Tests crashed and left servers running
 * - You need to reset the E2E environment
 * - Port conflicts are blocking test startup
 *
 * Usage:
 *   bun e2e:cleanup
 *   cd apps/e2e && bun scripts/cleanup.ts
 */
import isolatedTeardown from "../lib/isolated-teardown";

console.log("🧹 Manual E2E cleanup triggered\n");

isolatedTeardown()
  .then(() => {
    console.log("Done! E2E environment is clean.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Cleanup failed:", error);
    process.exit(1);
  });
