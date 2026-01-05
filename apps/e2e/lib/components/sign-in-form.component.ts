import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { fillFormField, fillPasswordField, submitFormButton } from "../form-utils";

export type SignInCredentials = {
  email: string;
  password: string;
};

/**
 * Component Object Model for the Sign In form.
 * Located at /login when unauthenticated.
 */
export class SignInFormComponent {
  readonly page: Page;
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly switchToSignUpButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1:has-text("Welcome Back")');
    this.emailInput = page.locator("input#email");
    this.passwordInput = page.locator("input#password");
    this.submitButton = page.locator('button[type="submit"]:has-text("Sign In")');
    this.switchToSignUpButton = page.getByRole("button", {
      name: /need an account\? sign up/i,
    });
  }

  /**
   * Check if this form is currently visible (sign-in has no name field).
   */
  async isVisible(): Promise<boolean> {
    const heading = await this.heading.isVisible();
    const nameField = this.page.locator("input#name");
    const hasNameField = await nameField.isVisible().catch(() => false);
    return heading && !hasNameField;
  }

  /**
   * Wait for the sign-in form to be ready.
   */
  async waitForReady(timeout = 10_000): Promise<void> {
    await this.heading.waitFor({ state: "visible", timeout });
    await this.emailInput.waitFor({ state: "visible", timeout });
  }

  /**
   * Assert that the sign-in form is visible.
   */
  async expectVisible(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    // Sign-in form should NOT have name field
    await expect(this.page.locator("input#name")).not.toBeVisible();
  }

  /**
   * Fill the sign-in form with credentials.
   * Uses type() with delay for React controlled inputs.
   */
  async fill(credentials: SignInCredentials): Promise<void> {
    // Fill email field
    await fillFormField(this.emailInput, credentials.email);

    // Fill password field with verification
    await fillPasswordField(this.passwordInput, credentials.password);
  }

  /**
   * Submit the form after filling it.
   */
  async submit(): Promise<void> {
    await submitFormButton(this.page, this.submitButton, this.passwordInput);
  }

  /**
   * Complete sign-in flow: fill form and submit.
   */
  async signIn(credentials: SignInCredentials): Promise<void> {
    await this.waitForReady();
    await this.fill(credentials);
    await this.submit();
  }

  /**
   * Switch to the sign-up form.
   */
  async switchToSignUp(): Promise<void> {
    await this.switchToSignUpButton.click();
  }
}
