/**
 * Pre-flight checks for E2E tests.
 * Runs before tests start to catch common issues early with clear error messages.
 */

import { DEV_STORYBOOK_PORT, DEV_WEB_PORT } from "./constants";

const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds max to check each server

type ServerCheck = {
  name: string;
  url: string;
  required: boolean;
};

/**
 * Check if a server is responding at the given URL.
 * Returns true if server responds with 2xx/3xx, false otherwise.
 */
async function isServerHealthy(url: string, timeoutMs = HEALTH_CHECK_TIMEOUT): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });
    return response.ok || response.status < 400;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Check if a port is in use (has something listening).
 */
async function isPortInUse(port: number): Promise<boolean> {
  return isServerHealthy(`http://localhost:${port}`, 2000);
}

/**
 * Pre-flight check for non-isolated mode.
 * Verifies that dev servers are running before tests start.
 */
export async function checkDevServersRunning(): Promise<void> {
  const servers: ServerCheck[] = [
    { name: "Web Dev Server", url: `http://localhost:${DEV_WEB_PORT}`, required: true },
    { name: "Storybook", url: `http://localhost:${DEV_STORYBOOK_PORT}`, required: false },
  ];

  console.log("\n🔍 Pre-flight check: Verifying dev servers...\n");

  const results = await Promise.all(
    servers.map(async (server) => ({
      ...server,
      healthy: await isServerHealthy(server.url),
    })),
  );

  const unhealthyRequired = results.filter((r) => r.required && !r.healthy);
  const unhealthyOptional = results.filter((r) => !(r.required || r.healthy));

  // Show status for all servers
  for (const result of results) {
    const status = result.healthy ? "✓" : "✗";
    const suffix = result.required ? "" : " (optional)";
    console.log(`   ${status} ${result.name}: ${result.url}${suffix}`);
  }
  console.log("");

  // Fail if required servers are not running
  if (unhealthyRequired.length > 0) {
    const missing = unhealthyRequired.map((r) => r.name).join(", ");
    console.error("❌ Required dev servers are not running!\n");
    console.error(`   Missing: ${missing}`);
    console.error("\n   To fix, run in another terminal:");
    console.error("   cd better-starter-saas && bun dev\n");
    console.error("   Or use isolated mode (starts its own servers):");
    console.error("   bun test:e2e  (without ISOLATED=false)\n");
    throw new Error(`Dev servers not running: ${missing}`);
  }

  // Warn about optional servers
  if (unhealthyOptional.length > 0) {
    const missing = unhealthyOptional.map((r) => r.name).join(", ");
    console.log(`⚠️  Optional servers not running: ${missing}`);
    console.log("   Storybook tests will be skipped.\n");
  }

  console.log("✅ Pre-flight check passed!\n");
}

/**
 * Wait for a server to become healthy with progress indication.
 * Used during isolated mode to show what's happening.
 */
export async function waitForServerWithProgress(
  name: string,
  url: string,
  timeoutMs: number,
  intervalMs = 1000,
): Promise<void> {
  const startTime = Date.now();
  let dots = 0;

  process.stdout.write(`   Waiting for ${name}`);

  while (Date.now() - startTime < timeoutMs) {
    if (await isServerHealthy(url, 2000)) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      process.stdout.write(` ✓ (${elapsed}s)\n`);
      return;
    }

    dots++;
    process.stdout.write(".");

    // Show elapsed time every 10 seconds
    if (dots % 10 === 0) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      process.stdout.write(` (${elapsed}s)`);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  process.stdout.write(" ✗ TIMEOUT\n");
  throw new Error(`${name} failed to start within ${timeoutMs / 1000}s at ${url}`);
}

/**
 * Quick check if common issues exist.
 * Returns diagnostic info for error messages.
 */
export async function diagnoseStartupIssues(): Promise<string[]> {
  const issues: string[] = [];

  // Check if ports 7xxx are blocked (maybe leftover from previous run)
  const e2ePorts = [7001, 7006, 7210, 7211];
  for (const port of e2ePorts) {
    if (await isPortInUse(port)) {
      issues.push(`Port ${port} is in use (leftover from previous E2E run?)`);
    }
  }

  if (issues.length > 0) {
    issues.push("To clean up: lsof -ti :7001,:7006,:7210,:7211 | xargs kill -9");
  }

  return issues;
}
