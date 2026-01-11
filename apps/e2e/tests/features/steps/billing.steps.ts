import { expect } from "@playwright/test";
import { Given, Then, When, waitForConvexConnection } from "./fixtures";

// URL patterns
const PRICING_URL = /\/pricing/;
const SETTINGS_URL = /\/settings/;
const POLAR_CHECKOUT_URL = /polar\.sh|sandbox\.polar\.sh/;
const POLAR_PORTAL_URL = /polar\.sh.*portal|sandbox\.polar\.sh.*portal/;

// ─────────────────────────────────────────────────────────────────
// Pricing Page Steps
// ─────────────────────────────────────────────────────────────────

Given("I am on the pricing page", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  await activePage.goto("/pricing");
  await waitForConvexConnection(activePage);
  if (!ctx.page) ctx.page = page;
});

When("I navigate to the pricing page", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  await activePage.goto("/pricing");
  await waitForConvexConnection(activePage);
});

Then("I should see the pricing table", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  // Look for the billing toggle or pricing cards
  const pricingTable = activePage.locator('[id="billing-toggle"], [class*="pricing"]').first();
  await expect(pricingTable).toBeVisible({ timeout: 10_000 });
});

Then(
  "I should see {string}, {string} and {string} plans",
  async ({ page, ctx }, plan1: string, plan2: string, plan3: string) => {
    const activePage = ctx.page || page;
    for (const plan of [plan1, plan2, plan3]) {
      const planCard = activePage.getByText(plan, { exact: false });
      await expect(planCard.first()).toBeVisible({ timeout: 5000 });
    }
  },
);

Then("I should see my current plan highlighted", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  // Look for a card with "Current Plan" badge or highlighted state
  const currentPlanIndicator = activePage
    .locator('[data-current-plan="true"], :has-text("Current Plan")')
    .first();
  await expect(currentPlanIndicator).toBeVisible({ timeout: 5000 });
});

// ─────────────────────────────────────────────────────────────────
// Billing Toggle Steps
// ─────────────────────────────────────────────────────────────────

When("I toggle to yearly billing", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  const yearlyToggle = activePage.getByLabel(/yearly/i);
  await yearlyToggle.click();
});

When("I toggle to monthly billing", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  const monthlyToggle = activePage.getByLabel(/monthly/i);
  await monthlyToggle.click();
});

Then("I should see yearly prices displayed", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  // Look for yearly price indicators (e.g., /year or annual pricing)
  const yearlyPrice = activePage.getByText(/\/year|annually|yearly/i).first();
  await expect(yearlyPrice).toBeVisible({ timeout: 5000 });
});

Then("I should see monthly prices displayed", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  // Look for monthly price indicators
  const monthlyPrice = activePage.getByText(/\/month|monthly/i).first();
  await expect(monthlyPrice).toBeVisible({ timeout: 5000 });
});

// ─────────────────────────────────────────────────────────────────
// Subscription Status Steps (Settings Page)
// ─────────────────────────────────────────────────────────────────

When("I navigate to settings", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  await activePage.goto("/settings");
  await waitForConvexConnection(activePage);
});

Then("I should see {string} as my current plan", async ({ page, ctx }, planName: string) => {
  const activePage = ctx.page || page;
  // Look for the subscription card with plan name
  const subscriptionCard = activePage.locator('[class*="card"]').filter({ hasText: "Subscription" });
  await expect(subscriptionCard).toBeVisible({ timeout: 10_000 });

  const planBadge = subscriptionCard.getByText(planName, { exact: false });
  await expect(planBadge).toBeVisible({ timeout: 5000 });
});

// NOTE: "I should see {string} button" step is defined in homepage.steps.ts
// Reusing that step for billing scenarios

Then("I should see the next billing date", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  // Look for billing date text
  const billingDate = activePage.getByText(/next billing|billing date|will end/i);
  await expect(billingDate).toBeVisible({ timeout: 5000 });
});

// ─────────────────────────────────────────────────────────────────
// Checkout Flow Steps (Polar Sandbox)
// ─────────────────────────────────────────────────────────────────

When("I click on the {string} plan card", async ({ page, ctx }, planName: string) => {
  const activePage = ctx.page || page;
  // Find and click the pricing card for the specified plan
  const planCard = activePage.locator(`[class*="card"]:has-text("${planName}")`).first();
  await planCard.click();
});

Then("I should be redirected to Polar checkout", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  // Wait for navigation to Polar checkout
  await activePage.waitForURL(POLAR_CHECKOUT_URL, { timeout: 15_000 });
});

Then("the checkout should show {string} plan details", async ({ page, ctx }, planName: string) => {
  const activePage = ctx.page || page;
  // Verify plan name is visible on checkout page
  const planText = activePage.getByText(planName, { exact: false });
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
When(
  "I complete checkout with test card {string}",
  async ({ page, ctx }, cardNumber: string) => {
    const activePage = ctx.page || page;

    // Wait for Stripe iframe to load (Polar uses Stripe for payments)
    const stripeFrame = activePage.frameLocator('iframe[name*="stripe"]').first();

    // Fill card number
    await stripeFrame.locator('[placeholder*="card number"], [name="cardnumber"]').fill(cardNumber);

    // Fill expiry (any future date)
    await stripeFrame.locator('[placeholder*="MM / YY"], [name="exp-date"]').fill("12/30");

    // Fill CVC
    await stripeFrame.locator('[placeholder*="CVC"], [name="cvc"]').fill("123");

    // Submit payment
    const submitButton = activePage.getByRole("button", { name: /pay|subscribe|confirm/i });
    await submitButton.click();
  },
);

Then("I should be redirected back to the app", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  // Wait for redirect back to our app (not on Polar anymore)
  await activePage.waitForURL((url) => !POLAR_CHECKOUT_URL.test(url.href), { timeout: 30_000 });
});

Then("I should see a payment declined error", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  const errorMessage = activePage.getByText(/declined|failed|error|unsuccessful/i);
  await expect(errorMessage.first()).toBeVisible({ timeout: 10_000 });
});

// ─────────────────────────────────────────────────────────────────
// Subscription Management Steps
// ─────────────────────────────────────────────────────────────────

When("I click {string}", async ({ page, ctx }, buttonText: string) => {
  const activePage = ctx.page || page;
  const button = activePage.getByRole("button", { name: new RegExp(buttonText, "i") });
  await button.click();
});

Then("I should be redirected to Polar customer portal", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  await activePage.waitForURL(POLAR_PORTAL_URL, { timeout: 15_000 });
});

When("I cancel my subscription in the portal", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  // Find and click cancel button in Polar portal
  const cancelButton = activePage.getByRole("button", { name: /cancel/i });
  await cancelButton.click();

  // Confirm cancellation if there's a confirmation dialog
  const confirmButton = activePage.getByRole("button", { name: /confirm|yes/i });
  if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmButton.click();
  }
});

Then("I should see {string} message", async ({ page, ctx }, messageText: string) => {
  const activePage = ctx.page || page;
  const message = activePage.getByText(new RegExp(messageText, "i"));
  await expect(message.first()).toBeVisible({ timeout: 10_000 });
});

When("I confirm the plan change", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  const confirmButton = activePage.getByRole("button", { name: /confirm|upgrade|change/i });
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
Given("I am logged in with a {string} subscription", async ({ page, ctx }, planName: string) => {
  const activePage = ctx.page || page;

  // For now, this is a placeholder that logs in a regular user.
  // In a real implementation, you would:
  // 1. Use Polar API to create a subscription for the test user
  // 2. Or use database seeding to add subscription data

  const uniqueEmail = `billing-test+${planName.toLowerCase()}+${Date.now()}@example.com`;

  await activePage.goto("/login");
  await waitForConvexConnection(activePage);

  await activePage.waitForSelector('input[name="email"]', { state: "visible", timeout: 10_000 });

  // Switch to sign-up if needed
  const nameField = activePage.locator('input[name="name"]');
  if (!(await nameField.isVisible().catch(() => false))) {
    await activePage.getByRole("button", { name: /sign up/i }).click();
    await nameField.waitFor({ state: "visible", timeout: 5000 });
  }

  await activePage.locator('input[name="name"]').fill("Billing Test User");
  await activePage.locator('input[name="email"]').fill(uniqueEmail);
  await activePage.locator('input[name="password"]').fill("TestPassword123");

  await activePage.getByRole("button", { name: /sign up/i }).first().click();
  await activePage.waitForURL(/\/todos/, { timeout: 15_000 });

  // TODO: Add subscription via Polar API here
  // await createTestSubscription(uniqueEmail, planName);

  if (!ctx.page) ctx.page = page;
});
