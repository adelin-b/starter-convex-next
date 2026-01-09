#!/usr/bin/env node
/**
 * Start Convex backend with pre-allocated or dynamic port.
 *
 * If E2E_CONVEX_PORT env var is set, uses that port.
 * Otherwise, finds available port in range [7200-7298] (even numbers).
 *
 * IMPORTANT: This script runs in background and should NOT exit.
 * It keeps Convex running during tests.
 *
 * Playwright health checks the port to know when Convex is ready.
 * No file-based synchronization needed.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ConvexBackend } from "../lib/convex-backend";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../..");

// Read pre-allocated port from env (set by playwright.config.ts)
const preAllocatedPort = process.env.E2E_CONVEX_PORT
  ? Number.parseInt(process.env.E2E_CONVEX_PORT, 10)
  : undefined;

// Read web URL from env (for CORS/redirects)
const webUrl = process.env.E2E_WEB_URL || "http://localhost:3001";

console.log(
  `[start-convex] Starting Convex backend ${preAllocatedPort ? `on port ${preAllocatedPort}` : "(dynamic port)"}...`,
);
const backend = new ConvexBackend(PROJECT_ROOT);

await backend.init({ siteUrl: webUrl, port: preAllocatedPort });

console.log(`[start-convex] Convex ready at ${backend.url}`);
console.log(`[start-convex] HTTP actions at ${backend.siteUrl}`);

// Graceful shutdown handler
const cleanup = async () => {
  console.log("[start-convex] Shutting down...");
  await backend.stop();
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Keep alive until killed
console.log("[start-convex] Convex backend running. Waiting for SIGINT/SIGTERM...");
await new Promise(() => {
  // Never resolves - keeps process alive until signal
});
