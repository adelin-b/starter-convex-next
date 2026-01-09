import { execSync } from "node:child_process";
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { createServer, type Server } from "node:net";
import { join } from "node:path";

// eslint-disable-next-line sonarjs/publicly-writable-directories -- E2E test port locks, not a security concern
const LOCK_DIR = "/tmp/e2e-port-locks";

/** Ensure lock directory exists */
function ensureLockDir(): void {
  if (!existsSync(LOCK_DIR)) {
    mkdirSync(LOCK_DIR, { recursive: true });
  }
}

/** Get lock file path for a port */
function getLockPath(port: number): string {
  return join(LOCK_DIR, `port-${port}.lock`);
}

/**
 * Check if a lock file is stale (process that created it no longer exists).
 */
function isLockStale(lockPath: string): boolean {
  try {
    const pid = Number.parseInt(readFileSync(lockPath, "utf8").trim(), 10);
    if (Number.isNaN(pid)) {
      return true;
    }
    // Check if process exists by sending signal 0
    process.kill(pid, 0);
    return false; // Process exists, lock is valid
  } catch {
    return true; // Process doesn't exist or can't read file, lock is stale
  }
}

/**
 * Try to atomically create a lock file for a port.
 * Returns true if successful, false if already locked.
 */
function tryLockPort(port: number): boolean {
  ensureLockDir();
  const lockPath = getLockPath(port);

  // Check for existing lock
  if (existsSync(lockPath)) {
    if (isLockStale(lockPath)) {
      // Clean up stale lock
      try {
        unlinkSync(lockPath);
      } catch {
        // Another process may have cleaned it up
      }
    } else {
      return false; // Port is locked by another active process
    }
  }

  // Try to create lock atomically using O_EXCL
  try {
    const fd = openSync(lockPath, "wx"); // wx = write + exclusive (fail if exists)
    writeFileSync(fd, String(process.pid));
    closeSync(fd);
    return true;
  } catch {
    return false; // Another process created the lock first
  }
}

/**
 * Release a port lock.
 */
export function unlockPort(port: number): void {
  const lockPath = getLockPath(port);
  try {
    // Only delete if we own the lock
    const pid = Number.parseInt(readFileSync(lockPath, "utf8").trim(), 10);
    if (pid === process.pid) {
      unlinkSync(lockPath);
    }
  } catch {
    // Lock file doesn't exist or already cleaned up
  }
}

/**
 * Check if a specific port is available (SYNC version for config files).
 * Uses lsof to check if port is in use.
 */
export function isPortAvailableSync(port: number): boolean {
  try {
    const result = execSync(`lsof -i :${port} 2>/dev/null`, { encoding: "utf8" });
    return result.trim() === "";
  } catch {
    // lsof returns exit code 1 when no process found = port is available
    return true;
  }
}

/**
 * Find an unused port within a range (SYNC version for config files).
 * Can be called at module load time in playwright.config.ts.
 *
 * Uses file-based locking to prevent race conditions between parallel runs.
 * Each claimed port creates a lock file in /tmp/e2e-port-locks/.
 */
export function findUnusedPortSync(preferredPort: number, maxPort: number, step = 1): number {
  for (let port = preferredPort; port <= maxPort; port += step) {
    // Check both: port not in use AND not locked by another parallel run
    if (isPortAvailableSync(port) && tryLockPort(port)) {
      return port;
    }
  }
  throw new Error(
    `No available port found in range ${preferredPort}-${maxPort} (step=${step}).\n` +
      "Too many parallel E2E runs? Kill some processes or wait for them to finish.",
  );
}

/**
 * Check if a specific port is available (ASYNC version).
 * Returns true if available, false if in use.
 */
export function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server: Server = createServer();

    server.once("error", () => {
      resolve(false);
    });

    server.once("listening", () => {
      server.close();
      resolve(true);
    });

    server.listen(port, "127.0.0.1");
  });
}

/**
 * Require a specific port to be available.
 * Throws an error if the port is already in use.
 *
 * This enforces strict port usage - no fallback to other ports.
 */
export async function requirePort(port: number, serviceName: string): Promise<number> {
  const available = await isPortAvailable(port);
  if (!available) {
    throw new Error(
      `Port ${port} is already in use. Cannot start ${serviceName}.\n` +
        `Run: lsof -i :${port} to see what's using it, then kill that process.`,
    );
  }
  return port;
}

/**
 * Find an unused port within a range.
 * Starts at preferredPort and scans upward until maxPort.
 * For Convex, use step=2 to leave room for site URL port (port+1).
 *
 * @param preferredPort - Starting port to try
 * @param maxPort - Maximum port in range (inclusive)
 * @param step - Increment between attempts (default 1, use 2 for Convex)
 * @returns Available port number
 * @throws Error if no port available in range
 */
export async function findUnusedPort(
  preferredPort: number,
  maxPort: number,
  step = 1,
): Promise<number> {
  for (let port = preferredPort; port <= maxPort; port += step) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(
    `No available port found in range ${preferredPort}-${maxPort} (step=${step}).\n` +
      "Too many parallel E2E runs? Kill some processes or wait for them to finish.",
  );
}
