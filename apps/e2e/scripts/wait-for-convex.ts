#!/usr/bin/env node
/**
 * Wait for Convex backend to be ready before proceeding.
 * Used by webServer command to ensure Convex is ready before Next.js starts.
 *
 * Waits for .convex-ready flag file created by globalSetup.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const E2E_DIR = join(__dirname, "..");
const CONVEX_READY_FLAG = join(E2E_DIR, ".convex-ready");
const TIMEOUT_MS = 90_000;
const POLL_INTERVAL_MS = 200;

async function waitForConvex(): Promise<void> {
  const startTime = Date.now();
  console.log(`[wait-for-convex] Waiting for ${CONVEX_READY_FLAG}...`);

  while (Date.now() - startTime < TIMEOUT_MS) {
    if (existsSync(CONVEX_READY_FLAG)) {
      const url = readFileSync(CONVEX_READY_FLAG, "utf8").trim();
      console.log(`[wait-for-convex] Convex ready at ${url} (after ${Date.now() - startTime}ms)`);
      return;
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  console.error(`[wait-for-convex] Timeout after ${TIMEOUT_MS}ms waiting for Convex`);
  process.exit(1);
}

waitForConvex();
