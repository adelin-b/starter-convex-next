/**
 * Global teardown for isolated E2E tests.
 *
 * Kills all E2E servers and cleans up temporary files.
 */
import { execSync } from "node:child_process";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import {
  E2E_CONVEX_PORT_MAX,
  E2E_CONVEX_PORT_MIN,
  E2E_STORYBOOK_PORT_MAX,
  E2E_STORYBOOK_PORT_MIN,
  E2E_WEB_PORT_MAX,
  E2E_WEB_PORT_MIN,
} from "./constants";
import { unlockPort } from "./find-unused-port";

const APPS_E2E_SUFFIX_REGEX = /\/apps\/e2e$/;

/**
 * Kill any process running on ports in the specified range.
 */
function killPortRange(minPort: number, maxPort: number): number {
  let killed = 0;
  try {
    // Build port list for lsof
    const ports: number[] = [];
    for (let port = minPort; port <= maxPort; port += 1) {
      ports.push(port);
    }
    const portList = ports.join(",:");
    const pids = execSync(`lsof -ti :${portList} 2>/dev/null || true`, {
      encoding: "utf8",
    }).trim();
    if (pids) {
      execSync(`kill -9 ${pids.split("\n").join(" ")} 2>/dev/null || true`);
      killed = pids.split("\n").length;
    }
  } catch {
    // Ignore errors
  }
  return killed;
}

export default async function isolatedTeardown(): Promise<void> {
  console.log("\n🧹 Cleaning up E2E environment...\n");

  // Kill E2E servers in all port ranges
  const ranges = [
    { name: "Web", min: E2E_WEB_PORT_MIN, max: E2E_WEB_PORT_MAX },
    { name: "Convex", min: E2E_CONVEX_PORT_MIN, max: E2E_CONVEX_PORT_MAX + 1 }, // +1 for site URL
    { name: "Storybook", min: E2E_STORYBOOK_PORT_MIN, max: E2E_STORYBOOK_PORT_MAX },
  ];

  for (const range of ranges) {
    const killed = killPortRange(range.min, range.max);
    if (killed > 0) {
      console.log(
        `🔪 Killed ${killed} process(es) in ${range.name} range [${range.min}-${range.max}]`,
      );
    }
  }

  // Also kill by process name for thorough cleanup
  try {
    execSync('pkill -9 -f "convex-local-backend" 2>/dev/null || true');
  } catch {
    // Ignore
  }

  const projectRoot = process.cwd().replace(APPS_E2E_SUFFIX_REGEX, "");

  // Delete port-specific Next.js build directories (.next-e2e-*)
  const webDir = join(projectRoot, "apps", "web");
  try {
    const nextDirectories = readdirSync(webDir).filter((f) => f.startsWith(".next-e2e-"));
    for (const dir of nextDirectories) {
      const dirPath = join(webDir, dir);
      rmSync(dirPath, { recursive: true });
      console.log(`🗑️ Deleted /apps/web/${dir}`);
    }
  } catch {
    // Ignore errors
  }

  // Delete port-specific Convex storage directories (.convex-e2e-test-*)
  try {
    const convexDirectories = readdirSync(projectRoot).filter((f) =>
      f.startsWith(".convex-e2e-test"),
    );
    for (const dir of convexDirectories) {
      const dirPath = join(projectRoot, dir);
      rmSync(dirPath, { recursive: true });
      console.log(`🗑️ Deleted /${dir}`);
    }
  } catch {
    // Ignore errors
  }

  // Clean up port lock files owned by this process
  // eslint-disable-next-line sonarjs/publicly-writable-directories -- E2E test port locks, not a security concern
  const lockDir = "/tmp/e2e-port-locks";
  if (existsSync(lockDir)) {
    try {
      const lockFiles = readdirSync(lockDir).filter((f) => f.endsWith(".lock"));
      for (const lockFile of lockFiles) {
        const port = Number.parseInt(lockFile.replace("port-", "").replace(".lock", ""), 10);
        if (!Number.isNaN(port)) {
          unlockPort(port);
        }
      }
      if (lockFiles.length > 0) {
        console.log("🔓 Cleaned up port lock files");
      }
    } catch {
      // Ignore errors
    }
  }

  console.log("\n✅ Cleanup complete\n");
}
