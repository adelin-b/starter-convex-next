import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { ConvexHttpClient } from "convex/browser";
import { execa, type ResultPromise } from "execa";
import treeKill from "tree-kill";
import {
  E2E_ADMIN_KEY,
  E2E_BETTER_AUTH_SECRET,
  E2E_CONVEX_PORT_MAX,
  E2E_CONVEX_PORT_MIN,
} from "./constants";
import { createAdminClient } from "./convex-client";
import { downloadConvexBinary } from "./download-convex-binary";
import { findUnusedPort } from "./find-unused-port";

const STORAGE_DIR_PREFIX = ".convex-e2e-test";
const HEALTH_CHECK_TIMEOUT = 30_000;
const HEALTH_CHECK_INTERVAL = 500;

// Default Convex dev credentials (from convex-backend repo)
// These are the pre-generated dev keys that work together
const INSTANCE_NAME = "carnitas";
const INSTANCE_SECRET = "4361726e697461732c206c69746572616c6c79206d65616e696e6720226c6974";

export class ConvexBackend {
  private subprocess: ResultPromise | null = null;
  private port: number | null = null;
  private _client: ConvexHttpClient | null = null;
  private _siteUrl: string | null = null;
  private storageDir: string;
  private readonly projectDir: string;

  constructor(projectDir: string = process.cwd()) {
    this.projectDir = projectDir;
    // Storage dir is set in init() with port suffix for parallel run isolation
    this.storageDir = join(this.projectDir, STORAGE_DIR_PREFIX);
  }

  /** Main Convex URL for queries/mutations (e.g., http://127.0.0.1:3210) */
  get url(): string {
    if (!this.port) {
      throw new Error("Backend not initialized");
    }
    return `http://127.0.0.1:${this.port}`;
  }

  /** Site URL for HTTP actions including auth (port+1, e.g., http://127.0.0.1:3211) */
  get siteUrl(): string {
    if (!this.port) {
      throw new Error("Backend not initialized");
    }
    return `http://127.0.0.1:${this.port + 1}`;
  }

  get client(): ConvexHttpClient {
    if (!this._client) {
      throw new Error("Backend not initialized");
    }
    return this._client;
  }

  async init(options: { siteUrl?: string; port?: number } = {}): Promise<void> {
    const { siteUrl = "http://localhost:3000", port: preAllocatedPort } = options;
    console.log("Initializing Convex backend...");

    // Download binary first (can be slow on first run)
    const binaryPath = await downloadConvexBinary();

    // Use pre-allocated port or find available one in E2E range (step=2 for site URL port)
    this.port =
      preAllocatedPort ?? (await findUnusedPort(E2E_CONVEX_PORT_MIN, E2E_CONVEX_PORT_MAX, 2));
    this._siteUrl = siteUrl;
    console.log(`Using port ${this.port} for Convex backend`);

    // Create port-specific storage directory for parallel isolation
    this.storageDir = join(this.projectDir, `${STORAGE_DIR_PREFIX}-${this.port}`);

    // Clean up previous storage (if exists from crashed test)
    if (existsSync(this.storageDir)) {
      rmSync(this.storageDir, { recursive: true });
    }
    mkdirSync(this.storageDir, { recursive: true });

    // Start the backend process
    const sqlitePath = join(this.storageDir, "convex_local_backend.sqlite3");

    // Find Node path for Convex (requires v18/20/22) and set in env
    // The backend binary needs Node.js to run deployed "use node" actions
    // IMPORTANT: Add multiple fallback paths at the front of PATH to ensure
    // the Convex binary can find a compatible Node version
    const nodePath = this.findNodePath();
    const localBinPath = join(process.env.HOME || "", ".local", "bin");
    const pathParts = [localBinPath, nodePath, process.env.PATH].filter(Boolean);
    const envPath = pathParts.join(":");

    // Build args array
    const args = [
      "--port",
      String(this.port),
      "--site-proxy-port",
      String(this.port + 1),
      "--instance-name",
      INSTANCE_NAME,
      "--instance-secret",
      INSTANCE_SECRET,
      "--local-storage",
      this.storageDir,
      sqlitePath,
    ];

    // execa v9 returns a subprocess that is also a promise
    // Note: --site-proxy-port defaults to 3211, we set it to port+1 for consistency
    // Use a wrapper script to ensure NVM-managed Node.js is available
    // The Convex binary spawns its own shells that need Node in PATH
    const nvmDir = process.env.NVM_DIR || join(process.env.HOME || "", ".nvm");
    const nvmScript = join(nvmDir, "nvm.sh");
    const usesNvm = existsSync(nvmScript);

    if (usesNvm) {
      // Wrap with bash that sources NVM and uses Node 22
      const quotedBinaryPath = binaryPath.replace(/'/g, "'\\''");
      const quotedArgs = args.map((a) => `'${a.replace(/'/g, "'\\''")}'`).join(" ");
      const command = `source '${nvmScript}' && nvm use 22 --silent && '${quotedBinaryPath}' ${quotedArgs}`;

      this.subprocess = execa("bash", ["-c", command], {
        stdio: "pipe",
        detached: false,
        env: {
          ...process.env,
          PATH: envPath,
        },
      });
    } else {
      // Fallback: run directly with modified PATH
      this.subprocess = execa(binaryPath, args, {
        stdio: "pipe",
        detached: false,
        shell: true,
        env: {
          ...process.env,
          PATH: envPath,
        },
      });
    }

    // Track subprocess errors to provide better error messages
    let subprocessError: Error | null = null;
    this.subprocess.catch((error: Error) => {
      subprocessError = error;
    });

    // Forward logs in verbose mode
    if (process.env.DEBUG_CONVEX) {
      this.subprocess.stdout?.on("data", (data: Buffer) => {
        console.log(`[convex-backend] ${data.toString().trim()}`);
      });
      this.subprocess.stderr?.on("data", (data: Buffer) => {
        console.error(`[convex-backend] ${data.toString().trim()}`);
      });
    }

    // Wait for health check, include subprocess error if it crashed
    try {
      await this.waitForHealthy();
    } catch (healthError) {
      if (subprocessError) {
        throw new Error(
          `Convex backend process crashed: ${subprocessError.message}. Health check also failed: ${healthError}`,
        );
      }
      throw healthError;
    }

    // Deploy convex functions
    await this.deploy();

    // Wait for HTTP actions port to be ready (port+1)
    await this.waitForSiteUrlReady();

    // Set environment variables for testing
    await this.setEnv("IS_TEST", "true");

    // Set auth-related env vars required by Better Auth
    // Note: CONVEX_SITE_URL and CONVEX_CLOUD_URL are auto-provided by Convex
    await this.setEnv("BETTER_AUTH_SECRET", E2E_BETTER_AUTH_SECRET);
    await this.setEnv("SITE_URL", this._siteUrl ?? "http://localhost:3000");

    // Set Resend API key if available, otherwise enable SMTP mode for local testing
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      await this.setEnv("RESEND_API_KEY", resendApiKey);
    } else {
      // Enable SMTP mode for local testing with smtp4dev
      await this.setEnv("USE_SMTP", "true");
      await this.setEnv("SMTP_HOST", process.env.SMTP_HOST || "localhost");
      await this.setEnv("SMTP_PORT", process.env.SMTP_PORT || "2525");
    }

    // Initialize HTTP client with admin auth
    this._client = createAdminClient(this.url);

    console.log(`Convex backend ready at ${this.url}`);
  }

  private async waitForHealthy(): Promise<void> {
    const startTime = Date.now();
    const versionUrl = `${this.url}/version`;
    let lastError: unknown = null;

    while (Date.now() - startTime < HEALTH_CHECK_TIMEOUT) {
      try {
        const response = await fetch(versionUrl);
        if (response.ok) {
          console.log("Convex backend is healthy");
          return;
        }
      } catch (error) {
        lastError = error;
        // Log non-network errors in debug mode for troubleshooting
        if (
          process.env.DEBUG_CONVEX &&
          !(error instanceof TypeError && String(error).includes("fetch"))
        ) {
          console.log(`[convex-backend] Health check error: ${error}`);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, HEALTH_CHECK_INTERVAL));
    }

    const errorDetails = lastError ? ` Last error: ${lastError}` : "";
    throw new Error(
      `Convex backend failed to start within ${HEALTH_CHECK_TIMEOUT}ms.${errorDetails}`,
    );
  }

  /**
   * Wait for HTTP actions endpoint (port+1) to be ready.
   * This endpoint handles auth and HTTP actions.
   */
  private async waitForSiteUrlReady(): Promise<void> {
    const startTime = Date.now();
    console.log(`Waiting for HTTP actions at ${this.siteUrl}...`);

    while (Date.now() - startTime < HEALTH_CHECK_TIMEOUT) {
      try {
        // Any response (even 404) means the server is listening
        const response = await fetch(this.siteUrl);
        console.log(`HTTP actions ready (status: ${response.status})`);
        return;
      } catch (error) {
        // Connection refused = not ready yet
        if (process.env.DEBUG_CONVEX) {
          console.log(`[convex-backend] Site URL check error: ${error}`);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, HEALTH_CHECK_INTERVAL));
    }

    throw new Error(
      `HTTP actions endpoint failed to start at ${this.siteUrl} within ${HEALTH_CHECK_TIMEOUT}ms`,
    );
  }

  private async deploy(retries = 3): Promise<void> {
    console.log("Deploying Convex functions...");

    const backendDir = join(this.projectDir, "packages", "backend");

    // Find Node path dynamically (Convex requires v18/20/22, not v25+)
    const nodePath = this.findNodePath();
    const envPath = nodePath ? `${nodePath}:${process.env.PATH}` : process.env.PATH;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await execa(
          "bunx",
          ["convex", "deploy", "--admin-key", E2E_ADMIN_KEY, "--url", this.url],
          {
            cwd: backendDir,
            env: {
              ...process.env,
              PATH: envPath,
              // Don't validate env vars during deploy
              SKIP_ENV_VALIDATION: "true",
            },
          },
        );

        if (result.exitCode !== 0) {
          throw new Error(result.stderr);
        }

        console.log("Convex functions deployed");
        return;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);

        // Retry on env var race condition
        if (errorMsg.includes("Environment variables have changed") && attempt < retries) {
          console.log(`Deploy attempt ${attempt} failed (env race), retrying...`);
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }

        console.error("Deploy failed:", errorMsg);
        throw new Error(`Failed to deploy Convex functions: ${errorMsg}`);
      }
    }
  }

  /**
   * Find a compatible Node.js path for Convex deploy.
   * Convex requires Node 18/20/22 - use fallback chain:
   * 1. NVM installed versions (v22.x, v20.x, v18.x)
   * 2. Homebrew Node 22
   * 3. `which node` fallback
   *
   * Returns the bin directory containing node, or undefined to use system PATH.
   */
  private findNodePath(): string | undefined {
    // Convex-compatible Node versions (as const for type safety)
    const CONVEX_NODE_VERSIONS = [22, 20, 18] as const;
    type ConvexNodeVersion = (typeof CONVEX_NODE_VERSIONS)[number];
    const isConvexCompatible = (major: number): major is ConvexNodeVersion =>
      (CONVEX_NODE_VERSIONS as readonly number[]).includes(major);

    // 1. Check NVM versions directory
    const nvmDir = process.env.NVM_DIR || join(process.env.HOME || "", ".nvm");
    const nvmVersionsDir = join(nvmDir, "versions", "node");

    if (existsSync(nvmVersionsDir)) {
      try {
        const versionPrefixes = CONVEX_NODE_VERSIONS.map((v) => `v${v}.`);
        const versions = readdirSync(nvmVersionsDir)
          .filter((v) => versionPrefixes.some((prefix) => v.startsWith(prefix)))
          .sort()
          .toReversed(); // Newest first

        for (const version of versions) {
          const binPath = join(nvmVersionsDir, version, "bin");
          if (existsSync(join(binPath, "node"))) {
            console.log(`[ConvexBackend] Using NVM Node: ${version}`);
            return binPath;
          }
        }
      } catch {
        // Continue to next fallback
      }
    }

    // 2. Check Homebrew Node 22
    const homebrewPath = "/opt/homebrew/opt/node@22/bin";
    if (existsSync(join(homebrewPath, "node"))) {
      console.log("[ConvexBackend] Using Homebrew Node 22");
      return homebrewPath;
    }

    // 3. Try `which node` and check version
    try {
      const nodePath = execSync("which node", { encoding: "utf8" }).trim();
      if (nodePath) {
        const version = execSync(`${nodePath} --version`, { encoding: "utf8" }).trim();
        const major = Number.parseInt(version.slice(1).split(".")[0], 10);
        if (isConvexCompatible(major)) {
          console.log(`[ConvexBackend] Using system Node: ${version}`);
          return; // Use system PATH
        }
        console.warn(
          `[ConvexBackend] System Node ${version} not compatible (need v${CONVEX_NODE_VERSIONS.join("/")}), using PATH as-is`,
        );
      }
    } catch {
      // No node in PATH
    }
  }

  async setEnv(name: string, value: string): Promise<void> {
    const response = await fetch(`${this.url}/api/v1/update_environment_variables`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Convex ${E2E_ADMIN_KEY}`,
      },
      body: JSON.stringify({
        changes: [{ name, value }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set env var ${name}: ${await response.text()}`);
    }
  }

  async stop(): Promise<void> {
    const subprocess = this.subprocess;
    const pid = subprocess?.pid;
    if (pid && subprocess) {
      console.log("Stopping Convex backend...");

      // Kill the process tree - catch errors to ensure cleanup always runs
      try {
        await new Promise<void>((resolve, reject) => {
          treeKill(pid, "SIGTERM", (err) => {
            if (err) {
              console.warn("Error killing process:", err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      } catch (error) {
        // Process may already be dead - log and continue with cleanup
        console.warn(`[ConvexBackend] Warning during process kill: ${error}`);
      }

      // Wait for subprocess to exit (it will throw due to SIGTERM, which is expected)
      try {
        await subprocess;
      } catch (error) {
        // Expected: subprocess was terminated with SIGTERM
        if (process.env.DEBUG_CONVEX) {
          console.log(`[ConvexBackend] Subprocess exited (expected): ${error}`);
        }
      }

      this.subprocess = null;
      console.log("Convex backend stopped");
    }

    // Clean up storage - always runs even if treeKill failed
    if (existsSync(this.storageDir)) {
      rmSync(this.storageDir, { recursive: true });
    }
  }
}
