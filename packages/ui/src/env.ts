import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const isBrowser = globalThis.window !== undefined;

// In browser (Storybook/Vite), use import.meta.env; in Node, use process.env
const runtimeEnv: Record<string, string | undefined> = isBrowser
  ? ((import.meta as any).env ?? {})
  : process.env;

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  runtimeEnv,
  emptyStringAsUndefined: true,
  skipValidation: isBrowser || !!runtimeEnv.CI || !!runtimeEnv.SKIP_ENV_VALIDATION,
});
