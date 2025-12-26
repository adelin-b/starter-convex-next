import baseConfig from "@v1/ui/tailwind.config";
import type { Config } from "tailwindcss";

export default {
  ...baseConfig,
  content: ["./src/**/*.{ts,tsx}", "@v1/ui/src/**/*.{ts,tsx}"],
} satisfies Config;
