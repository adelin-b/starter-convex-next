import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { BillingToggleComponent } from "../components/billing-toggle.component";

/**
 * Page Object for the pricing page (/pricing).
 * Displays pricing tiers with monthly/yearly toggle.
 */
export class PricingPage extends BasePage {
  readonly billingToggle: BillingToggleComponent;
  readonly pricingCards: Locator;

  constructor(page: Page) {
    super(page);
    this.billingToggle = new BillingToggleComponent(page);
    this.pricingCards = page.locator('[data-testid^="pricing-card-"]');
  }

  async navigate(): Promise<void> {
    await this.goto("/pricing");
    // Wait for page to load
    await this.page.waitForLoadState("domcontentloaded");
  }

  async expectPricingTableVisible(): Promise<void> {
    await this.billingToggle.expectVisible();
  }

  async expectPlansVisible(plans: string[]): Promise<void> {
    for (const plan of plans) {
      await expect(this.page.getByText(plan, { exact: false }).first()).toBeVisible({
        timeout: 5000,
      });
    }
  }

  async expectCurrentPlanHighlighted(): Promise<void> {
    const currentPlanIndicator = this.page.getByText("Current Plan").first();
    await expect(currentPlanIndicator).toBeVisible({ timeout: 5000 });
  }

  async expectYearlyPricesDisplayed(): Promise<void> {
    const yearlyPrice = this.page.getByText(/\/yr/i).first();
    await expect(yearlyPrice).toBeVisible({ timeout: 5000 });
  }

  async expectMonthlyPricesDisplayed(): Promise<void> {
    const monthlyPrice = this.page.getByText(/\/mo/i).first();
    await expect(monthlyPrice).toBeVisible({ timeout: 5000 });
  }

  async clickPlanCard(planName: string): Promise<void> {
    const planCard = this.page.locator(`[data-testid="pricing-card-${planName.toLowerCase()}"]`);
    await planCard.click();
  }
}
