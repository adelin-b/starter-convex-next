import { expect } from "@playwright/test";
import { PricingPage, SettingsPage } from "../../../lib/pages";
import { Given, Then, When, waitForConvexConnection } from "./fixtures";

// URL patterns for external redirects
const POLAR_CHECKOUT_URL = /polar\.sh|sandbox\.polar\.sh/;
const POLAR_PORTAL_URL = /polar\.sh.*portal|sandbox\.polar\.sh.*portal/;

// ─────────────────────────────────────────────────────────────────
// Pricing Page Steps
// ─────────────────────────────────────────────────────────────────

Given("I am on the pricing page", async ({ ctx }) => {
  const pricingPage = new PricingPage(ctx.page);
  await pricingPage.navigate();
  await waitForConvexConnection(ctx.page);
});

When("I navigate to the pricing page", async ({ ctx }) => {
  const pricingPage = new PricingPage(ctx.page);
  await pricingPage.navigate();
  await waitForConvexConnection(ctx.page);
});

Then("I should see the pricing table", async ({ ctx }) => {
  const pricingPage = new PricingPage(ctx.page);
  await pricingPage.expectPricingTableVisible();
});

Then(
  "I should see {string}, {string} and {string} plans",
  async ({ ctx }, plan1: string, plan2: string, plan3: string) => {
    const pricingPage = new PricingPage(ctx.page);
    await pricingPage.expectPlansVisible([plan1, plan2, plan3]);
  },
);

Then("I should see my current plan highlighted", async ({ ctx }) => {
  const pricingPage = new PricingPage(ctx.page);
  await pricingPage.expectCurrentPlanHighlighted();
});

// ─────────────────────────────────────────────────────────────────
// Billing Toggle Steps
// ─────────────────────────────────────────────────────────────────

When("I toggle to yearly billing", async ({ ctx }) => {
  const pricingPage = new PricingPage(ctx.page);
  await pricingPage.billingToggle.selectYearly();
});

When("I toggle to monthly billing", async ({ ctx }) => {
  const pricingPage = new PricingPage(ctx.page);
  await pricingPage.billingToggle.selectMonthly();
});

Then("I should see yearly prices displayed", async ({ ctx }) => {
  const pricingPage = new PricingPage(ctx.page);
  await pricingPage.expectYearlyPricesDisplayed();
});

Then("I should see monthly prices displayed", async ({ ctx }) => {
  const pricingPage = new PricingPage(ctx.page);
  await pricingPage.expectMonthlyPricesDisplayed();
});

// ─────────────────────────────────────────────────────────────────
// Subscription Status Steps (Settings Page)
// ─────────────────────────────────────────────────────────────────

When("I navigate to settings", async ({ ctx }) => {
  const settingsPage = new SettingsPage(ctx.page);
  await settingsPage.navigate();
  await waitForConvexConnection(ctx.page);
});

Then("I should see {string} as my current plan", async ({ ctx }, planName: string) => {
  const settingsPage = new SettingsPage(ctx.page);
  await settingsPage.subscriptionStatus.expectVisible();
  await settingsPage.subscriptionStatus.expectPlan(planName);
});

// NOTE: "I should see {string} button" step is defined in homepage.steps.ts
// Reusing that step for billing scenarios

Then("I should see the next billing date", async ({ ctx }) => {
  const settingsPage = new SettingsPage(ctx.page);
  await settingsPage.subscriptionStatus.expectBillingDateVisible();
});

// ─────────────────────────────────────────────────────────────────
// Checkout Flow Steps (Polar Sandbox)
// ─────────────────────────────────────────────────────────────────

When("I click on the {string} plan card", async ({ ctx }, planName: string) => {
  const pricingPage = new PricingPage(ctx.page);
  await pricingPage.clickPlanCard(planName);
});

Then("I should be redirected to Polar checkout", async ({ ctx }) => {
  await ctx.page.waitForURL(POLAR_CHECKOUT_URL, { timeout: 15_000 });
});

Then("the checkout should show {string} plan details", async ({ ctx }, planName: string) => {
  const planText = ctx.page.getByText(planName, { exact: false });
  await expect(planText.first()).toBeVisible({ timeout: 10_000 });
});

/**
 * Complete checkout with a test card number.
 * Uses Stripe's test card numbers via Polar's checkout.
 *
 * Common test cards:
 * - 4242424242424242: Success
 * - 4000000000000002: Declined
 * - 4000002500003155: Requires authentication
 */
When("I complete checkout with test card {string}", async ({ ctx }, cardNumber: string) => {
  // Wait for Stripe iframe to load (Polar uses Stripe for payments)
  const stripeFrame = ctx.page.frameLocator('iframe[name*="stripe"]').first();

  // Fill card number
  await stripeFrame.locator('[placeholder*="card number"], [name="cardnumber"]').fill(cardNumber);

  // Fill expiry (any future date)
  await stripeFrame.locator('[placeholder*="MM / YY"], [name="exp-date"]').fill("12/30");

  // Fill CVC
  await stripeFrame.locator('[placeholder*="CVC"], [name="cvc"]').fill("123");

  // Submit payment
  const submitButton = ctx.page.getByRole("button", { name: /pay|subscribe|confirm/i });
  await submitButton.click();
});

Then("I should be redirected back to the app", async ({ ctx }) => {
  await ctx.page.waitForURL((url) => !POLAR_CHECKOUT_URL.test(url.href), { timeout: 30_000 });
});

Then("I should see a payment declined error", async ({ ctx }) => {
  const errorMessage = ctx.page.getByText(/declined|failed|error|unsuccessful/i);
  await expect(errorMessage.first()).toBeVisible({ timeout: 10_000 });
});

// ─────────────────────────────────────────────────────────────────
// Subscription Management Steps
// ─────────────────────────────────────────────────────────────────

When("I click {string}", async ({ ctx }, buttonText: string) => {
  const button = ctx.page.getByRole("button", { name: new RegExp(buttonText, "i") });
  await button.click();
});

Then("I should be redirected to Polar customer portal", async ({ ctx }) => {
  await ctx.page.waitForURL(POLAR_PORTAL_URL, { timeout: 15_000 });
});

When("I cancel my subscription in the portal", async ({ ctx }) => {
  // Find and click cancel button in Polar portal
  const cancelButton = ctx.page.getByRole("button", { name: /cancel/i });
  await cancelButton.click();

  // Confirm cancellation if there's a confirmation dialog
  const confirmButton = ctx.page.getByRole("button", { name: /confirm|yes/i });
  if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmButton.click();
  }
});

Then("I should see {string} message", async ({ ctx }, messageText: string) => {
  const message = ctx.page.getByText(new RegExp(messageText, "i"));
  await expect(message.first()).toBeVisible({ timeout: 10_000 });
});

When("I confirm the plan change", async ({ ctx }) => {
  const confirmButton = ctx.page.getByRole("button", { name: /confirm|upgrade|change/i });
  await confirmButton.click();
});

// ─────────────────────────────────────────────────────────────────
// Authenticated User with Subscription (Fixture Setup)
// ─────────────────────────────────────────────────────────────────

/**
 * Given step for a user with an existing subscription.
 * NOTE: This requires Polar sandbox to be configured and a test subscription created.
 * For true E2E testing, you may need to:
 * 1. Use Polar's API to create a test subscription before the test
 * 2. Or use a pre-seeded test account with a subscription
 */
Given("I am logged in with a {string} subscription", async ({ ctx }, planName: string) => {
  // For now, this is a placeholder that logs in a regular user.
  // In a real implementation, you would:
  // 1. Use Polar API to create a subscription for the test user
  // 2. Or use database seeding to add subscription data

  const uniqueEmail = `billing-test+${planName.toLowerCase()}+${Date.now()}@example.com`;

  await ctx.page.goto("/login");
  await waitForConvexConnection(ctx.page);

  await ctx.page.waitForSelector('input[name="email"]', { state: "visible", timeout: 10_000 });

  // Switch to sign-up if needed
  const nameField = ctx.page.locator('input[name="name"]');
  if (!(await nameField.isVisible().catch(() => false))) {
    await ctx.page.getByRole("button", { name: /sign up/i }).click();
    await nameField.waitFor({ state: "visible", timeout: 5000 });
  }

  await ctx.page.locator('input[name="name"]').fill("Billing Test User");
  await ctx.page.locator('input[name="email"]').fill(uniqueEmail);
  await ctx.page.locator('input[name="password"]').fill("TestPassword123");

  await ctx.page
    .getByRole("button", { name: /sign up/i })
    .first()
    .click();
  await ctx.page.waitForURL(/\/todos/, { timeout: 15_000 });

  // TODO: Add subscription via Polar API here
  // await createTestSubscription(uniqueEmail, planName);
});
