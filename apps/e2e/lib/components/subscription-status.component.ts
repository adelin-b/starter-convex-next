import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Component Object for the subscription status card on the settings page.
 * Displays current plan, billing info, and subscription management buttons.
 */
export class SubscriptionStatusComponent {
  readonly page: Page;
  readonly card: Locator;
  readonly planBadge: Locator;
  readonly viewPlansButton: Locator;
  readonly manageButton: Locator;
  readonly changePlanButton: Locator;
  readonly billingDate: Locator;

  constructor(page: Page) {
    this.page = page;
    this.card = page.locator('[data-testid="subscription-status"]');
    this.planBadge = this.card.locator('[data-testid="current-plan-badge"]');
    this.viewPlansButton = this.card.getByRole("link", { name: /view plans/i });
    this.manageButton = this.card.getByRole("button", { name: /manage subscription/i });
    this.changePlanButton = this.card.getByRole("link", { name: /change plan/i });
    this.billingDate = this.card.getByText(/next billing|will end/i);
  }

  async expectPlan(planName: string): Promise<void> {
    await expect(this.planBadge).toContainText(planName, { ignoreCase: true });
  }

  async expectVisible(): Promise<void> {
    await expect(this.card).toBeVisible({ timeout: 10_000 });
  }

  async expectBillingDateVisible(): Promise<void> {
    await expect(this.billingDate).toBeVisible();
  }

  async expectViewPlansButtonVisible(): Promise<void> {
    await expect(this.viewPlansButton).toBeVisible();
  }

  async expectManageButtonVisible(): Promise<void> {
    await expect(this.manageButton).toBeVisible();
  }

  async clickViewPlans(): Promise<void> {
    await this.viewPlansButton.click();
  }

  async clickManageSubscription(): Promise<void> {
    await this.manageButton.click();
  }
}
