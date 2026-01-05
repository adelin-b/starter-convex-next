import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Component Object Model for Toast notifications (sonner).
 */
export class ToastComponent {
  readonly page: Page;
  readonly container: Locator;

  constructor(page: Page) {
    this.page = page;
    // Sonner toasts use data-sonner-toaster
    this.container = page.locator("[data-sonner-toaster]");
  }

  /**
   * Get a specific toast by text content.
   */
  getToast(text: string | RegExp): Locator {
    return this.container.locator("[data-sonner-toast]").filter({ hasText: text });
  }

  /**
   * Wait for a toast with specific text to appear.
   */
  async waitForToast(text: string | RegExp, timeout = 10_000): Promise<void> {
    await this.getToast(text).waitFor({ state: "visible", timeout });
  }

  /**
   * Assert that a toast with specific text is visible.
   */
  async expectToast(text: string | RegExp): Promise<void> {
    await expect(this.getToast(text)).toBeVisible();
  }

  /**
   * Assert that a success toast is visible.
   */
  async expectSuccessToast(text: string | RegExp): Promise<void> {
    const toast = this.getToast(text);
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
  }

  /**
   * Assert that an error toast is visible.
   */
  async expectErrorToast(text: string | RegExp): Promise<void> {
    const toast = this.getToast(text);
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "error");
  }

  /**
   * Dismiss all visible toasts by clicking them.
   */
  async dismissAll(): Promise<void> {
    const toasts = this.container.locator("[data-sonner-toast]");
    const count = await toasts.count();
    for (let i = 0; i < count; i++) {
      await toasts.nth(i).click();
    }
  }
}
