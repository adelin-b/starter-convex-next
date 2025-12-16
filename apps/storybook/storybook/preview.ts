import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview, ReactRenderer } from "@storybook/react-vite";
import "@starter-saas/ui/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date$/i,
      },
    },
  },
  decorators: [
    withThemeByClassName<ReactRenderer>({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
      parentSelector: "html",
    }),
  ],
};

export default preview;
