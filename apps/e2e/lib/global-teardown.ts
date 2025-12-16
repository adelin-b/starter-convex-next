/**
 * Global teardown for standard E2E tests (web, storybook).
 *
 * NOTE: Isolated tests use their own teardown in isolated-teardown.ts
 *
 * This file is a no-op for standard tests since they use
 * the shared dev servers managed by Playwright's webServer config.
 */
export default async function globalTeardown(): Promise<void> {
  // Standard tests use shared dev servers - Playwright handles cleanup
  console.log("✅ Test run complete");
}
