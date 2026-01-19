import type { Page } from "@playwright/test";

/**
 * Block Google One Tap at the network level.
 * Should be called once per page/context to prevent Google One Tap from loading.
 */
export async function blockGoogleOneTap(page: Page): Promise<void> {
  await page.route("**/accounts.google.com/gsi/**", (route) => route.abort());
  await page.route("**/www.gstatic.com/accounts/**", (route) => route.abort());
}

/**
 * Hide Next.js dev overlay to prevent click interception in E2E tests.
 * The nextjs-portal element can intercept clicks even when no errors are shown.
 * Uses addInitScript to inject CSS on every page load.
 * @see https://github.com/vercel/next.js/discussions/76734
 */
export async function hideNextjsDevOverlay(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent = `
      nextjs-portal { display: none !important; pointer-events: none !important; }
    `;
    // Append when DOM is ready
    if (document.head) {
      document.head.append(style);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        document.head.append(style);
      });
    }
  });
}

/**
 * Dismiss Google One Tap sign-in prompt if visible.
 * Uses JavaScript to forcefully hide/remove the iframe and presses Escape.
 *
 * This is needed because Google One Tap can intercept clicks on form elements,
 * especially on mobile viewports where the prompt overlays the form.
 */
export async function dismissGoogleOneTap(page: Page, options?: { wait?: number }): Promise<void> {
  const wait = options?.wait ?? 50;

  // Press Escape to dismiss any overlay - ignore errors if page is not focused
  await page.keyboard.press("Escape").catch(() => {
    // Intentionally ignoring keyboard errors - page may not be focused
  });

  // Remove all Google One Tap iframes and overlays that might intercept clicks
  await page.evaluate(() => {
    // Remove all Google-related iframes
    const iframes = document.querySelectorAll(
      '#credential_picker_iframe, iframe[src*="accounts.google.com/gsi"], iframe[src*="accounts.google.com"]',
    );
    for (const iframe of iframes) {
      iframe.remove();
    }

    // Remove the container divs
    const containers = document.querySelectorAll(
      '[id*="credential_picker"], .G-YPBe, #google-one-tap-container',
    );
    for (const container of containers) {
      container.remove();
    }

    // Also remove react-scan overlay if present (dev tool)
    const reactScan = document.querySelector("#react-scan-root");
    if (reactScan) {
      (reactScan as HTMLElement).style.pointerEvents = "none";
    }
  });

  // Small delay to ensure UI updates
  if (wait > 0) {
    await page.waitForTimeout(wait);
  }
}
