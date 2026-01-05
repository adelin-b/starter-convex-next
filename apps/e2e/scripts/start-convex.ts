#!/usr/bin/env node
/**
 * Pre-test script to start Convex backend before Playwright starts.
 *
 * This runs BEFORE playwright to ensure Convex is ready when webServer starts.
 * Writes .convex-ready flag file when Convex is up.
 *
 * IMPORTANT: This script runs in background and should NOT exit.
 * It keeps Convex running during tests.
 */
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { E2E_WEB_PORT } from "../lib/constants";
import { ConvexBackend } from "../lib/convex-backend";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../..");
const E2E_DIR = join(__dirname, "..");
const CONVEX_READY_FLAG = join(E2E_DIR, ".convex-ready");
const WEB_URL = `http://localhost:${E2E_WEB_PORT}`;

// Clean up any stale flag file
if (existsSync(CONVEX_READY_FLAG)) {
  rmSync(CONVEX_READY_FLAG);
}

console.log("[start-convex] Starting Convex backend...");
const backend = new ConvexBackend(PROJECT_ROOT);
await backend.init(WEB_URL);

// ConvexBackend.init() now waits for both main port and HTTP actions port
console.log(`[start-convex] Convex ready at ${backend.url}`);
console.log(`[start-convex] HTTP actions at ${backend.siteUrl}`);
writeFileSync(CONVEX_READY_FLAG, backend.url);
console.log(`[start-convex] Wrote ${CONVEX_READY_FLAG}`);

// Keep process alive until killed (Playwright will kill it during teardown)
// Also handle graceful shutdown
const cleanup = async () => {
  console.log("[start-convex] Shutting down...");
  if (existsSync(CONVEX_READY_FLAG)) {
    rmSync(CONVEX_READY_FLAG);
  }
  await backend.stop();
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Keep alive
console.log("[start-convex] Convex backend running. Waiting for SIGINT/SIGTERM...");
await new Promise(() => {
  // Never resolves - intentionally keeps process alive until SIGINT/SIGTERM
});
