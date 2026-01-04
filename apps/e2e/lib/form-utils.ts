import type { Locator, Page } from "@playwright/test";
import { FORM_VALIDATION_DELAY } from "./constants";

/**
 * Fill a form field with controlled input.
 * Uses type() with delay for React controlled inputs.
 *
 * @param locator - The input element to fill
 * @param value - The value to type
 * @param options - Optional delay between keystrokes (default: 10ms)
 */
export async function fillFormField(
  locator: Locator,
  value: string,
  options?: { delay?: number },
): Promise<void> {
  const delay = options?.delay ?? 10;

  await locator.scrollIntoViewIfNeeded();
  await locator.click();
  await locator.fill("");
  await locator.type(value, { delay });
}

/**
 * Fill a password field with verification and fallback.
 * After typing, verifies the value was entered. If not, retries with direct fill.
 *
 * @param locator - The password input element
 * @param password - The password to enter
 * @throws Error if password cannot be filled after retry
 */
export async function fillPasswordField(locator: Locator, password: string): Promise<void> {
  await locator.scrollIntoViewIfNeeded();
  await locator.waitFor({ state: "visible", timeout: 5000 });
  await locator.click();
  await locator.fill("");
  await locator.type(password, { delay: 10 });

  // Verify password was filled
  const passwordValue = await locator.inputValue();
  if (!passwordValue) {
    // Retry with direct fill
    await locator.fill(password);

    // Verify retry succeeded
    const retryValue = await locator.inputValue();
    if (!retryValue) {
      throw new Error("Failed to fill password field after retry");
    }
  }
}

/**
 * Submit a form button after waiting for validation.
 * Blurs the last input to trigger validation, waits for submit button to be enabled,
 * then clicks with force to bypass any overlays.
 *
 * @param page - The page instance
 * @param button - The submit button locator
 * @param lastInput - The last input field to blur (triggers validation)
 */
export async function submitFormButton(
  page: Page,
  button: Locator,
  lastInput: Locator,
): Promise<void> {
  // Blur to trigger validation
  await lastInput.blur();

  // Wait for form validation to complete - submit button becomes enabled
  await page.waitForFunction(() => !document.querySelector('button[type="submit"]:disabled'), {
    timeout: FORM_VALIDATION_DELAY * 10,
  });

  await button.scrollIntoViewIfNeeded();
  await button.click({ force: true });
}

/**
 * Select an option from a dropdown/combobox.
 * Clicks the trigger, waits for animation, then clicks the matching option.
 *
 * @param page - The page instance
 * @param trigger - The dropdown trigger element (combobox button)
 * @param optionText - Text to match in the option (case insensitive)
 */
export async function selectDropdownOption(
  page: Page,
  trigger: Locator,
  optionText: string,
): Promise<void> {
  await trigger.click();

  // Wait for dropdown listbox to be visible instead of arbitrary timeout
  const listbox = page.getByRole("listbox");
  await listbox.waitFor({ state: "visible", timeout: 5000 });

  const option = page.getByRole("option", { name: new RegExp(optionText, "i") });
  await option.click();
}
