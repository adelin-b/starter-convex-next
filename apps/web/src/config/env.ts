import { createEnv } from "@t3-oss/env-nextjs";
import { config } from "dotenv";
import { z } from "zod";

// In E2E mode, load .env.e2e which overrides .env.local values
// This allows isolated E2E tests to use their own Convex backend
if (process.env.E2E_MODE === "true") {
  // process.cwd() is apps/web when running `next dev` from that directory
  const result = config({ path: `${process.cwd()}/.env.e2e`, override: true });
  if (result.error) {
    console.error("[E2E] Failed to load .env.e2e:", result.error.message);
  } else {
    console.log("[E2E] Loaded .env.e2e with URLs:", {
      NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
      NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    });
  }
}

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  client: {
    NEXT_PUBLIC_CONVEX_URL: z.url(),
    NEXT_PUBLIC_CONVEX_SITE_URL: z.url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
