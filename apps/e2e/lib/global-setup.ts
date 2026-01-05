/**
 * Global setup for standard E2E tests (non-isolated mode).
 *
 * In non-isolated mode (ISOLATED=false), tests use the existing dev servers
 * running on ports 3001 (web) and 6006 (storybook).
 *
 * This setup verifies that the dev servers are actually running before
 * tests start, preventing the common issue of tests hanging forever
 * waiting for a server that's not there.
 */

import { checkDevServersRunning } from "./preflight-check";

export default async function globalSetup(): Promise<void> {
  console.log("📦 Using shared dev servers for tests");

  // Verify dev servers are running before proceeding
  await checkDevServersRunning();
}
