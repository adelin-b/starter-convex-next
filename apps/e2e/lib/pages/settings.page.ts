import type { Page } from "@playwright/test";
import { SubscriptionStatusComponent } from "../components/subscription-status.component";
import { BasePage } from "./base.page";

/**
 * Page Object for the settings page (/settings).
 * Contains subscription status and account settings.
 */
export class SettingsPage extends BasePage {
  readonly subscriptionStatus: SubscriptionStatusComponent;

  constructor(page: Page) {
    super(page);
    this.subscriptionStatus = new SubscriptionStatusComponent(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/settings");
    // Wait for page to load
    await this.page.waitForLoadState("domcontentloaded");
  }
}
