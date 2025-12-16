import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, "package.json")));
}

const config: StorybookConfig = {
  stories: ["../../../packages/ui/src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-themes"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },

  viteFinal: async (viteConfig) => {
    const { default: tailwindcss } = await import("@tailwindcss/vite");

    // Suppress warnings about module level directives "use client"
    viteConfig.build = {
      ...viteConfig.build,
      chunkSizeWarningLimit: 100,
      rollupOptions: {
        onwarn(warning) {
          if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
            return;
          }
        },
      },
    };

    if (!viteConfig.plugins) {
      viteConfig.plugins = [];
    }
    viteConfig.plugins.push(tailwindcss());

    if (viteConfig.resolve) {
      viteConfig.resolve.alias = {
        ...viteConfig.resolve.alias,
        "@starter-saas/ui": join(__dirname, "../../../packages/ui/src"),
        "@": join(__dirname, "../../../packages/ui/src"),
        "@story-helpers": join(
          __dirname,
          "../../../packages/ui/src/components/.storybook/story-helpers",
        ),
      };
    }

    // Exclude Next.js internals from Vite optimization
    if (viteConfig.optimizeDeps) {
      viteConfig.optimizeDeps.exclude = [
        ...(viteConfig.optimizeDeps.exclude || []),
        "next/dist/shared/lib/app-router-context.shared-runtime",
        "next/dist/shared/lib/head-manager-context.shared-runtime",
        "next/dist/shared/lib/hooks-client-context.shared-runtime",
        "next/dist/shared/lib/router-context.shared-runtime",
        "next/dist/client/components/redirect-boundary",
        "next/dist/client/head-manager",
        "next/dist/client/components/is-next-router-error",
        "next/config",
        "next/dist/shared/lib/segment",
        "next/dist/compiled/react",
        "next/image",
        "next/legacy/image",
      ];
    }

    return viteConfig;
  },
};

export default config;
