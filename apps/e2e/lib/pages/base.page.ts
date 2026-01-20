import type { Page } from "@playwright/test";
import { ToastComponent, UserMenuComponent } from "../components";

/**
 * Base Page Object with common functionality shared across pages.
 * All page objects should extend this class.
 */
export abstract class BasePage {
  readonly page: Page;
  readonly toast: ToastComponent;
  readonly userMenu: UserMenuComponent;

  constructor(page: Page) {
    this.page = page;
    this.toast = new ToastComponent(page);
    this.userMenu = new UserMenuComponent(page);
  }

  /**
   * Navigate to a specific path.
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Wait for navigation to complete.
   * Note: Don't use networkidle as Convex WebSocket prevents it from settling.
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Get the current URL path.
   */
  getPath(): string {
    const url = new URL(this.page.url());
    return url.pathname;
  }

  /**
   * Check if user is authenticated by looking for user menu.
   */
  async isAuthenticated(): Promise<boolean> {
    return this.userMenu.isVisible();
  }

  /**
   * Wait for authenticated state.
   * Waits for the page to redirect away from login and for the user data to load.
   * The user menu component only renders when Convex user query completes.
   */
  async waitForAuthenticated(timeout = 15_000): Promise<void> {
    // Wait for redirect to an authenticated route (not /login)
    await this.page.waitForURL((url) => !url.pathname.includes("/login"), { timeout });

    // Wait for user menu to be visible - this is the reliable indicator
    // that Convex has loaded user data and React has rendered
    await this.userMenu.waitForVisible(10_000);
  }
}
