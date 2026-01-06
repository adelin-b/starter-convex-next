import type { Page } from "@playwright/test";

/**
 * Hides the Next.js dev overlay (nextjs-portal) that intercepts pointer events.
 * This is a known Next.js issue where the overlay stays in the DOM and captures clicks
 * even when no errors are shown.
 *
 * @see https://github.com/vercel/next.js/discussions/76734
 */
export async function hideNextjsDevOverlay(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Hide the Next.js dev overlay that intercepts clicks
    const style = document.createElement("style");
    style.textContent = `
      nextjs-portal {
        display: none !important;
        pointer-events: none !important;
      }
    `;
    document.head.append(style);
  });
}
