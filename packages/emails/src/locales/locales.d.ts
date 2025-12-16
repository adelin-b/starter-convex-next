// Type declarations for compiled Lingui message catalogs
declare module "*.mjs" {
  import type { Messages } from "@lingui/core";
  export const messages: Messages;
}
