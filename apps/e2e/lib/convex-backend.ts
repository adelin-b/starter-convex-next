import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { ConvexHttpClient } from "convex/browser";
import { execa, type ResultPromise } from "execa";
import treeKill from "tree-kill";
import { E2E_CONVEX_START_PORT } from "./constants";
import { downloadConvexBinary } from "./download-convex-binary";
import { requirePort } from "./find-unused-port";

const STORAGE_DIR = ".convex-e2e-test";
const HEALTH_CHECK_TIMEOUT = 30_000;
const HEALTH_CHECK_INTERVAL = 500;

// Default Convex dev credentials (from convex-backend repo)
// These are the pre-generated dev keys that work together
const INSTANCE_NAME = "carnitas";
const INSTANCE_SECRET = "4361726e697461732c206c69746572616c6c79206d65616e696e6720226c6974";
const ADMIN_KEY =
  "0135d8598650f8f5cb0f30c34ec2e2bb62793bc28717c8eb6fb577996d50be5f4281b59181095065c5d0f86a2c31ddbe9b597ec62b47ded69782cd";

// Test secret for Better Auth (32 bytes base64)
const TEST_BETTER_AUTH_SECRET = "dGVzdC1zZWNyZXQtZm9yLWUyZS10ZXN0aW5nLW9ubHkh";

export class ConvexBackend {
  private subprocess: ResultPromise | null = null;
  private port: number | null = null;
  private _client: ConvexHttpClient | null = null;
  private _siteUrl: string | null = null;
  private readonly storageDir: string;
  private readonly projectDir: string;

  constructor(projectDir: string = process.cwd()) {
    this.projectDir = projectDir;
    this.storageDir = join(this.projectDir, STORAGE_DIR);
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

  async init(siteUrl = "http://localhost:3001"): Promise<void> {
    console.log("Initializing Convex backend...");

    // Clean up previous storage
    if (existsSync(this.storageDir)) {
      rmSync(this.storageDir, { recursive: true });
    }
    mkdirSync(this.storageDir, { recursive: true });

    // Download binary
    const binaryPath = await downloadConvexBinary();

    // Require the specific E2E Convex port (strict - no fallback)
    this.port = await requirePort(E2E_CONVEX_START_PORT, "Convex backend");
    this._siteUrl = siteUrl;
    console.log(`Using port ${this.port} for Convex backend`);

    // Start the backend process
    const sqlitePath = join(this.storageDir, "convex_local_backend.sqlite3");

    // execa v9 returns a subprocess that is also a promise
    // Note: --site-proxy-port defaults to 3211, we set it to port+1 for consistency
    this.subprocess = execa(
      binaryPath,
      [
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
      ],
      {
        stdio: "pipe",
        detached: false,
      },
    );

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
    await this.setEnv("BETTER_AUTH_SECRET", TEST_BETTER_AUTH_SECRET);
    await this.setEnv("SITE_URL", this._siteUrl ?? "http://localhost:3001");

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

    // Initialize HTTP client
    this._client = new ConvexHttpClient(this.url);
    // setAdminAuth exists at runtime but isn't in the public types
    (this._client as unknown as { setAdminAuth: (key: string) => void }).setAdminAuth(ADMIN_KEY);

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

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await execa(
          "bunx",
          ["convex", "deploy", "--admin-key", ADMIN_KEY, "--url", this.url],
          {
            cwd: backendDir,
            env: {
              ...process.env,
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

  async setEnv(name: string, value: string): Promise<void> {
    const response = await fetch(`${this.url}/api/v1/update_environment_variables`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Convex ${ADMIN_KEY}`,
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
