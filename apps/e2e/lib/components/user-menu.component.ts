import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Component Object Model for the User Menu dropdown.
 * Located in the header when user is authenticated.
 */
export class UserMenuComponent {
  readonly page: Page;
  readonly trigger: Locator;
  readonly menu: Locator;
  readonly signOutButton: Locator;
  readonly settingsButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // User menu trigger is typically a button with the user's avatar or name
    this.trigger = page.locator('[data-testid="user-menu-trigger"]');
    this.menu = page.locator('[role="menu"]');
    this.signOutButton = page.getByRole("menuitem", { name: /sign out|logout/i });
    this.settingsButton = page.getByRole("menuitem", { name: /settings/i });
  }

  /**
   * Check if the user menu trigger is visible.
   */
  async isVisible(): Promise<boolean> {
    return this.trigger.isVisible();
  }

  /**
   * Wait for the user menu to be visible.
   */
  async waitForVisible(timeout = 10_000): Promise<void> {
    await this.trigger.waitFor({ state: "visible", timeout });
  }

  /**
   * Open the user menu dropdown.
   */
  async open(): Promise<void> {
    await this.trigger.click();
    // Wait for menu to be visible instead of arbitrary timeout
    await this.menu.waitFor({ state: "visible", timeout: 5000 });
  }

  /**
   * Sign out the current user.
   */
  async signOut(): Promise<void> {
    await this.open();
    await this.signOutButton.click();
  }

  /**
   * Navigate to settings.
   */
  async goToSettings(): Promise<void> {
    await this.open();
    await this.settingsButton.click();
  }

  /**
   * Assert that the user menu is visible (user is authenticated).
   */
  async expectVisible(): Promise<void> {
    await expect(this.trigger).toBeVisible();
  }

  /**
   * Assert that the user menu is not visible (user is not authenticated).
   */
  async expectNotVisible(): Promise<void> {
    await expect(this.trigger).not.toBeVisible();
  }
}
