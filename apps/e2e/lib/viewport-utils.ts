import type { Page } from "@playwright/test";
import { MOBILE_BREAKPOINT } from "./constants";

/**
 * Check if the current page viewport is mobile-sized.
 * Uses MOBILE_BREAKPOINT (768px) which matches Tailwind's md breakpoint.
 *
 * @param page - Playwright Page object
 * @returns true if viewport width is less than MOBILE_BREAKPOINT
 */
export function isMobileViewport(page: Page): boolean {
  const viewportSize = page.viewportSize();
  return viewportSize ? viewportSize.width < MOBILE_BREAKPOINT : false;
}
