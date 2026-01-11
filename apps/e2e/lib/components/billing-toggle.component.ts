import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Component Object for the billing period toggle on the pricing page.
 * Controls switching between monthly and yearly billing displays.
 */
export class BillingToggleComponent {
  readonly page: Page;
  readonly container: Locator;
  readonly toggle: Locator;
  readonly monthlyLabel: Locator;
  readonly yearlyLabel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('[data-testid="billing-toggle"]');
    this.toggle = page.locator("#billing-toggle");
    this.monthlyLabel = page.getByText(/^Monthly$/i);
    this.yearlyLabel = page.getByText(/^Yearly$/i);
  }

  async selectMonthly(): Promise<void> {
    await this.monthlyLabel.click();
  }

  async selectYearly(): Promise<void> {
    await this.yearlyLabel.click();
  }

  async expectMonthlySelected(): Promise<void> {
    await expect(this.monthlyLabel).toHaveClass(/font-semibold/);
  }

  async expectYearlySelected(): Promise<void> {
    await expect(this.yearlyLabel).toHaveClass(/font-semibold/);
  }

  async expectVisible(): Promise<void> {
    await expect(this.toggle).toBeVisible({ timeout: 10_000 });
  }
}
