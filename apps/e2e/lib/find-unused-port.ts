import { createServer, type Server } from "node:net";
import { E2E_CONVEX_START_PORT } from "./constants";

/**
 * Check if a specific port is available.
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
 * @deprecated Use requirePort() for strict port enforcement.
 * This function finds the next available port starting from startPort.
 */
export async function findUnusedPort(startPort = E2E_CONVEX_START_PORT): Promise<number> {
  const MAX_PORT = 65_535;
  for (let port = startPort; port <= MAX_PORT; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
