#!/usr/bin/env node
/**
 * Pre-test script to write .env.e2e before Playwright starts.
 *
 * This runs BEFORE playwright to ensure the .env.e2e file exists
 * when the webServer starts (webServer starts in parallel with globalSetup).
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { E2E_CONVEX_START_PORT, E2E_WEB_PORT } from "../lib/constants";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../../..");
const WEB_URL = `http://localhost:${E2E_WEB_PORT}`;
const CONVEX_URL = `http://127.0.0.1:${E2E_CONVEX_START_PORT}`;
const CONVEX_SITE_URL = `http://127.0.0.1:${E2E_CONVEX_START_PORT + 1}`;

const envPath = join(PROJECT_ROOT, "apps", "web", ".env.e2e");
// Test secret for Better Auth (must match convex-backend.ts)
const TEST_BETTER_AUTH_SECRET = "dGVzdC1zZWNyZXQtZm9yLWUyZS10ZXN0aW5nLW9ubHkh";

const envContent = `# Auto-generated for isolated E2E tests - DO NOT EDIT
NEXT_PUBLIC_CONVEX_URL=${CONVEX_URL}
NEXT_PUBLIC_CONVEX_SITE_URL=${CONVEX_SITE_URL}
SITE_URL=${WEB_URL}
BETTER_AUTH_SECRET=${TEST_BETTER_AUTH_SECRET}
`;

writeFileSync(envPath, envContent);
console.log(`[write-e2e-env] Wrote ${envPath}`);
console.log(`[write-e2e-env] CONVEX_URL=${CONVEX_URL}`);
console.log(`[write-e2e-env] CONVEX_SITE_URL=${CONVEX_SITE_URL}`);
