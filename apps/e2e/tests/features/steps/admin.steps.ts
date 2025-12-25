import type { DataTable } from "@cucumber/cucumber";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { api, Given, Then, When } from "../steps/fixtures";

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Helper to switch from sign-in form to sign-up form on the login page.
 * The login page shows sign-in by default.
 */
async function switchToSignUpForm(page: Page): Promise<void> {
  // Check if we're on sign-in form (no name field visible)
  const nameField = page.locator('input[name="name"]');
  const isSignUpForm = await nameField.isVisible().catch(() => false);

  if (!isSignUpForm) {
    // Click "Need an account? Sign Up" to switch to sign-up form
    const switchButton = page.getByRole("button", { name: /need an account/i });
    await switchButton.click();
    // Wait for sign-up form fields to appear
    await nameField.waitFor({ state: "visible", timeout: 5000 });
    // Also wait for email field to ensure form is fully rendered
    await page.locator('input[name="email"]').waitFor({ state: "visible", timeout: 5000 });
  }
}

/**
 * Helper to authenticate and set up user with specific role
 */
async function authenticateWithRole(
  context: { page: Page; convex: unknown; accountEmail?: string },
  role: string,
): Promise<void> {
  const timestamp = Date.now();
  const email = `${role}-${timestamp}@test.com`;

  await context.page.goto("/dashboard");
  await context.page.waitForSelector('input[name="email"]', { timeout: 10_000 });
  await switchToSignUpForm(context.page);

  // Sign up
  await context.page.locator('input[name="name"]').click();
  await context.page.locator('input[name="name"]').type(`Test ${role}`, { delay: 10 });
  await context.page.locator('input[name="email"]').click();
  await context.page.locator('input[name="email"]').type(email, { delay: 10 });
  await context.page.locator('input[name="password"]').click();
  await context.page.locator('input[name="password"]').type("TestPassword123!", { delay: 10 });

  const submitButton = context.page.getByRole("button", { name: /sign up/i }).first();
  await submitButton.scrollIntoViewIfNeeded();
  await submitButton.click({ force: true });

  await context.page.waitForSelector('[data-testid="user-menu"]', { timeout: 15_000 });
  context.accountEmail = email;

  // For admin role, seed admin access
  if (role === "admin") {
    const userId = await context.page.evaluate(async () => {
      const response = await fetch("/api/auth/get-session");
      const session = await response.json();
      return session?.user?.id as string | undefined;
    });

    if (userId) {
      const convexClient = context.convex as {
        mutation: (function_: unknown, args: unknown) => Promise<unknown>;
      };
      await convexClient.mutation(api.organizations.seedTestAdmin, { userId });
      await context.page.reload();
      await context.page.waitForSelector('[data-testid="user-menu"]', { timeout: 10_000 });
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// UNIFIED AUTH STEPS (new simplified patterns)
// ═══════════════════════════════════════════════════════════════════

Given("I am authenticated with role {string}", async ({ ctx }, role: string) => {
  await authenticateWithRole(ctx, role);
});

// ═══════════════════════════════════════════════════════════════════
// DATA SETUP STEPS
// ═══════════════════════════════════════════════════════════════════

Given("the following organizations exist:", async ({ ctx }, dataTable: DataTable) => {
  const organizations = dataTable.hashes();

  const userId = await ctx.page.evaluate(async () => {
    const response = await fetch("/api/auth/get-session");
    const session = await response.json();
    return session?.user?.id as string | undefined;
  });

  if (!userId) {
    throw new Error("Failed to get userId from session");
  }

  for (const organization of organizations) {
    await ctx.convex.mutation(api.organizations.seedTestOrganization, {
      userId,
      organizationName: organization.name,
      email: organization.email || undefined,
      phone: organization.phone || undefined,
      description: organization.description || undefined,
    });
  }

  await ctx.page.reload();
  await ctx.page.waitForLoadState("networkidle");
});

Given("no organizations exist", async ({ ctx }) => {
  // Organizations are isolated per test - just reload to ensure fresh state
  await ctx.page.reload();
  await ctx.page.waitForLoadState("networkidle");
});

Given("an organization {string} exists", async ({ ctx }, name: string) => {
  const userId = await ctx.page.evaluate(async () => {
    const response = await fetch("/api/auth/get-session");
    const session = await response.json();
    return session?.user?.id as string | undefined;
  });

  if (!userId) {
    throw new Error("Failed to get userId from session");
  }

  await ctx.convex.mutation(api.organizations.seedTestOrganization, {
    userId,
    organizationName: name,
  });

  await ctx.page.reload();
  await ctx.page.waitForLoadState("networkidle");
});

Given(
  "{string} has the following members:",
  async ({ ctx }, organizationName: string, dataTable: DataTable) => {
    const members = dataTable.hashes();

    for (const member of members) {
      // Parse roles - support both "role" and "roles" columns, comma-separated
      const rolesString = member.roles || member.role || "member";
      const roles = rolesString.split(",").map((r: string) => r.trim());

      await ctx.convex.mutation(api.organizations.seedTestOrganizationMember, {
        organizationName,
        memberEmail: member.email,
        roles,
      });
    }

    await ctx.page.reload();
    await ctx.page.waitForLoadState("networkidle");
  },
);

Given("{string} has no members", async ({ ctx }, organizationName: string) => {
  // Default state - no action needed
  console.log(`[E2E] ${organizationName} has no members (default)`);
});

Given(
  "{string} has member {string} with role {string}",
  async ({ ctx }, organizationName: string, email: string, role: string) => {
    await ctx.convex.mutation(api.organizations.seedTestOrganizationMember, {
      organizationName,
      memberEmail: email,
      roles: [role],
    });

    await ctx.page.reload();
    await ctx.page.waitForLoadState("networkidle");
  },
);

Given(
  "{string} has member {string} with roles {string}",
  async ({ ctx }, organizationName: string, email: string, rolesString: string) => {
    const roles = rolesString.split(",").map((r: string) => r.trim());

    await ctx.convex.mutation(api.organizations.seedTestOrganizationMember, {
      organizationName,
      memberEmail: email,
      roles,
    });

    await ctx.page.reload();
    await ctx.page.waitForLoadState("networkidle");
  },
);

Given("I have searched for {string}", async ({ ctx }, searchText: string) => {
  const searchInput = ctx.page.locator('input[placeholder*="Search"], input[type="search"]');
  await searchInput.fill(searchText);
  await ctx.page.waitForTimeout(300); // debounce
});

// ═══════════════════════════════════════════════════════════════════
// NAVIGATION STEPS
// ═══════════════════════════════════════════════════════════════════

When("I navigate to {string}", async ({ ctx }, path: string) => {
  await ctx.page.goto(path);
  await ctx.page.waitForLoadState("networkidle");
});

Given("I am on {string}", async ({ ctx }, path: string) => {
  await ctx.page.goto(path);
  await ctx.page.waitForLoadState("networkidle");
});

When("I navigate to the members page for {string}", async ({ ctx }, organizationName: string) => {
  // Navigate via organizations page
  await ctx.page.goto("/admin/organizations");
  await ctx.page.waitForLoadState("networkidle");
  const membersButton = ctx.page.locator(
    `tr:has-text("${organizationName}") button:has-text("Members"), [data-testid*="organization"]:has-text("${organizationName}") button:has-text("Members")`,
  );
  await membersButton.click();
  await ctx.page.waitForLoadState("networkidle");
});

// ═══════════════════════════════════════════════════════════════════
// SEARCH & FILTER STEPS
// ═══════════════════════════════════════════════════════════════════

When("I search for {string}", async ({ ctx }, searchText: string) => {
  const searchInput = ctx.page.locator('input[placeholder*="Search"], input[type="search"]');
  await searchInput.fill(searchText);
  await ctx.page.waitForTimeout(300); // debounce
});

When("I clear the search", async ({ ctx }) => {
  const searchInput = ctx.page.locator('input[placeholder*="Search"], input[type="search"]');
  await searchInput.clear();
  await ctx.page.waitForTimeout(300);
});

// ═══════════════════════════════════════════════════════════════════
// FORM INTERACTION STEPS
// ═══════════════════════════════════════════════════════════════════

When("I fill in {string} with {string}", async ({ ctx }, field: string, value: string) => {
  const input = ctx.page.locator(`input[name="${field}"], textarea[name="${field}"], #${field}`);
  await input.fill(value);
});

When("I fill in the form:", async ({ ctx }, dataTable: DataTable) => {
  const rows = dataTable.rows();
  for (const [field, value] of rows) {
    const input = ctx.page.locator(`input[name="${field}"], textarea[name="${field}"], #${field}`);
    await input.fill(value);
  }
});

When("I submit the form", async ({ ctx }) => {
  const submitButton = ctx.page
    .locator(
      'button[type="submit"], button:has-text("Create"), button:has-text("Add"), button:has-text("Save")',
    )
    .first();
  await submitButton.click();
  await ctx.page.waitForTimeout(500);
});

When("I submit the form without filling required fields", async ({ ctx }) => {
  const submitButton = ctx.page.locator('button[type="submit"]').first();
  await submitButton.click();
});

When("I select role {string}", async ({ ctx }, role: string) => {
  const checkbox = ctx.page.locator(
    `label:has-text("${role}") input[type="checkbox"], input[value="${role.toLowerCase()}"]`,
  );
  await checkbox.check();
});

// ═══════════════════════════════════════════════════════════════════
// ACTION STEPS
// ═══════════════════════════════════════════════════════════════════

When("I delete {string}", async ({ ctx }, name: string) => {
  const deleteButton = ctx.page
    .locator(
      `tr:has-text("${name}") button[aria-label*="Delete"], [data-testid*="delete"]:near(:text("${name}"))`,
    )
    .first();
  await deleteButton.click();
});

When("I remove {string}", async ({ ctx }, identifier: string) => {
  const removeButton = ctx.page
    .locator(
      `tr:has-text("${identifier}") button[aria-label*="Remove"], button:has-text("Remove"):near(:text("${identifier}"))`,
    )
    .first();
  await removeButton.click();
});

When("I confirm the deletion", async ({ ctx }) => {
  const confirmButton = ctx.page.locator(
    'button:has-text("Delete"), button:has-text("Confirm"), [role="alertdialog"] button:has-text("Delete")',
  );
  await confirmButton.click();
  await ctx.page.waitForTimeout(500);
});

When("I cancel the dialog", async ({ ctx }) => {
  const cancelButton = ctx.page.locator('button:has-text("Cancel")');
  await cancelButton.click();
});

When("I toggle role {string} for {string}", async ({ ctx }, role: string, email: string) => {
  const row = ctx.page.locator(`tr:has-text("${email}")`);
  const toggle = row.locator(`button:has-text("${role}")`);
  await toggle.click();
});

When("I click {string} for {string}", async ({ ctx }, buttonText: string, itemName: string) => {
  const button = ctx.page
    .locator(
      `tr:has-text("${itemName}") button:has-text("${buttonText}"), [data-testid*="organization"]:has-text("${itemName}") button:has-text("${buttonText}")`,
    )
    .first();
  await button.click();
});

When("I click {string} in sidebar", async ({ ctx }, linkText: string) => {
  const sidebarLink = ctx.page.locator(
    `[data-sidebar] a:has-text("${linkText}"), nav a:has-text("${linkText}")`,
  );
  await sidebarLink.click();
  await ctx.page.waitForLoadState("networkidle");
});

When("I click breadcrumb {string}", async ({ ctx }, text: string) => {
  const breadcrumb = ctx.page.locator(`nav[aria-label*="breadcrumb"] a:has-text("${text}")`);
  await breadcrumb.click();
  await ctx.page.waitForLoadState("networkidle");
});

// ═══════════════════════════════════════════════════════════════════
// LIST & TABLE ASSERTIONS
// ═══════════════════════════════════════════════════════════════════

Then("I should see {int} items in the list", async ({ ctx }, count: number) => {
  const rows = ctx.page.locator('tbody tr, [data-testid*="card"], [role="listitem"]');
  await expect(rows).toHaveCount(count, { timeout: 10_000 });
});

Then("I should see {int} item in the list", async ({ ctx }, count: number) => {
  const rows = ctx.page.locator('tbody tr, [data-testid*="card"], [role="listitem"]');
  await expect(rows).toHaveCount(count, { timeout: 10_000 });
});

Then("I should see {string} in the list", async ({ ctx }, text: string) => {
  const element = ctx.page.locator(
    `tbody tr:has-text("${text}"), [data-testid*="card"]:has-text("${text}")`,
  );
  await expect(element).toBeVisible({ timeout: 10_000 });
});

Then("I should not see {string} in the list", async ({ ctx }, text: string) => {
  const element = ctx.page.locator(
    `tbody tr:has-text("${text}"), [data-testid*="card"]:has-text("${text}")`,
  );
  await expect(element).not.toBeVisible();
});

Then("I should not see {string}", async ({ ctx }, text: string) => {
  const element = ctx.page.locator(`text="${text}"`);
  await expect(element).not.toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════
// PAGE ASSERTIONS
// ═══════════════════════════════════════════════════════════════════

Then("I should see the organizations page", async ({ ctx }) => {
  const title = ctx.page.locator('h1:has-text("Organizations")');
  await expect(title).toBeVisible({ timeout: 10_000 });
});

Then("I should see the members page", async ({ ctx }) => {
  const title = ctx.page.locator('h1:has-text("Members")');
  await expect(title).toBeVisible({ timeout: 10_000 });
});

Then("I should see the vehicles page", async ({ ctx }) => {
  const title = ctx.page.locator('h1:has-text("Vehicles")');
  await expect(title).toBeVisible({ timeout: 10_000 });
});

Then("I should see the no permission page", async ({ ctx }) => {
  const noPermission = ctx.page.locator("text=/no permission|access denied|unauthorized/i");
  await expect(noPermission).toBeVisible({ timeout: 10_000 });
});

Then("I should be on {string}", async ({ ctx }, path: string) => {
  await expect(ctx.page).toHaveURL(new RegExp(path.replaceAll("/", String.raw`\/`)));
});

Then("I should be redirected to {string}", async ({ ctx }, path: string) => {
  await ctx.page.waitForURL(new RegExp(path.replaceAll("/", String.raw`\/`)), { timeout: 10_000 });
});

// NOTE: "the URL should contain {string}" is defined in navigation.steps.ts

// ═══════════════════════════════════════════════════════════════════
// UI ELEMENT ASSERTIONS
// ═══════════════════════════════════════════════════════════════════

Then("I should see {string} button", async ({ ctx }, buttonText: string) => {
  const button = ctx.page.getByRole("button", { name: buttonText });
  await expect(button.first()).toBeVisible({ timeout: 10_000 });
});

Then("I should see a success message", async ({ ctx }) => {
  const toast = ctx.page.locator('[data-sonner-toast][data-type="success"]');
  await expect(toast).toBeVisible({ timeout: 10_000 });
});

Then("I should see an error message", async ({ ctx }) => {
  const toast = ctx.page.locator('[data-sonner-toast][data-type="error"]');
  await expect(toast).toBeVisible({ timeout: 10_000 });
});

Then("I should see a confirmation dialog", async ({ ctx }) => {
  const dialog = ctx.page.locator('[role="alertdialog"]');
  await expect(dialog).toBeVisible({ timeout: 10_000 });
});

Then("I should see {string}", async ({ ctx }, text: string) => {
  const element = ctx.page.locator(`text="${text}"`);
  await expect(element).toBeVisible({ timeout: 10_000 });
});

Then("I should not see {string} button", async ({ ctx }, buttonText: string) => {
  const button = ctx.page.getByRole("button", { name: buttonText });
  await expect(button).not.toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════
// FORM ASSERTIONS
// ═══════════════════════════════════════════════════════════════════

Then("I should see a validation error for {string}", async ({ ctx }, field: string) => {
  const errorContainer = ctx.page.locator(
    `[data-testid="${field}-error"], .error:near(input[name="${field}"])`,
  );
  await expect(errorContainer).toBeVisible({ timeout: 10_000 });
});

Then("{string} should have the value {string}", async ({ ctx }, field: string, value: string) => {
  const input = ctx.page.locator(`input[name="${field}"], textarea[name="${field}"]`);
  await expect(input).toHaveValue(value, { timeout: 10_000 });
});
