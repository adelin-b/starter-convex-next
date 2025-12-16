import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { EXTENDED_TIMEOUT, QUICK_TIMEOUT } from "../../lib/constants";

// Storybook runtime errors that are not real component bugs
// See: https://github.com/storybookjs/storybook/issues/21827
const STORYBOOK_RUNTIME_ERRORS = ["cannot render when not prepared"];

type ComponentInfo = {
  id: string;
  name: string;
};

type TestResult = {
  component: string;
  storyCount: number;
  errors: string[];
};

function isStorybookRuntimeError(error: string): boolean {
  return STORYBOOK_RUNTIME_ERRORS.some((runtimeErr) =>
    error.toLowerCase().includes(runtimeErr.toLowerCase()),
  );
}

async function checkForPageErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];

  const errorLocator = page.locator("h1#error-message");
  const errorCount = await errorLocator.count();
  if (errorCount > 0) {
    const errorMessage = await errorLocator.first().textContent();
    // Filter out Storybook runtime errors (not real component bugs)
    if (errorMessage && !isStorybookRuntimeError(errorMessage)) {
      errors.push(`Page Error: ${errorMessage}`);
    }
  }

  const iframe = page.frameLocator("#storybook-preview-iframe");
  const iframeErrorLocator = iframe.locator("h1#error-message");
  try {
    const iframeError = await iframeErrorLocator.first().textContent({ timeout: QUICK_TIMEOUT });
    // Filter out Storybook runtime errors (not real component bugs)
    if (iframeError && !isStorybookRuntimeError(iframeError)) {
      errors.push(`Story Error: ${iframeError}`);
    }
  } catch {
    // Element doesn't exist, which is fine
  }

  return errors;
}

function setupConsoleErrorMonitoring(page: Page, componentName: string): string[] {
  const consoleErrors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const errorText = msg.text();
      // Filter out Storybook runtime errors (not real component bugs)
      if (!isStorybookRuntimeError(errorText)) {
        consoleErrors.push(`[${componentName}] Console Error: ${errorText}`);
      }
    }
  });

  page.on("pageerror", (error) => {
    const errorMessage = error.message;
    // Filter out Storybook runtime errors (not real component bugs)
    if (!isStorybookRuntimeError(errorMessage)) {
      consoleErrors.push(`[${componentName}] Page Error: ${errorMessage}`);
    }
  });

  return consoleErrors;
}

async function discoverComponents(page: Page): Promise<ComponentInfo[]> {
  const consoleErrors = setupConsoleErrorMonitoring(page, "Discovery");

  await page.goto("/", {
    waitUntil: "networkidle",
    timeout: EXTENDED_TIMEOUT,
  });

  await page.locator("nav").waitFor();

  const pageErrors = await checkForPageErrors(page);
  if (pageErrors.length > 0 || consoleErrors.length > 0) {
    throw new Error(
      `Errors during component discovery:\n${[...pageErrors, ...consoleErrors].join("\n")}`,
    );
  }

  const componentButtons = await page.locator('button[id^="domain-"][aria-expanded]').all();

  const components: ComponentInfo[] = [];
  for (const button of componentButtons) {
    const componentId = await button.getAttribute("id");
    if (componentId) {
      const componentName = componentId.replace("domain-", "");
      components.push({ id: componentId, name: componentName });
    }
  }

  return components;
}

test.describe("Storybook Stories Smoke Tests", () => {
  /* eslint-disable playwright/no-conditional-in-test, playwright/no-conditional-expect -- smoke test requires conditionals for discovery and error handling */
  test("all components in parallel with multiple tabs", async ({ context }) => {
    const discoveryPage = await context.newPage();
    const components = await discoverComponents(discoveryPage);
    await discoveryPage.close();

    console.log(`\n📋 Discovered ${components.length} components to test\n`);

    const results = await Promise.all(
      components.map(async (component, index): Promise<TestResult> => {
        const page = await context.newPage();
        const consoleErrors = setupConsoleErrorMonitoring(page, component.name);

        try {
          await page.goto("/", {
            waitUntil: "domcontentloaded",
            timeout: EXTENDED_TIMEOUT,
          });

          await page.locator("nav").waitFor();

          let pageErrors = await checkForPageErrors(page);

          const componentButton = page.locator(`button[id="${component.id}"]`);
          await componentButton.scrollIntoViewIfNeeded();

          const isExpanded = await componentButton.getAttribute("aria-expanded");
          if (isExpanded === "false") {
            await componentButton.click();
            // Wait for expansion animation
            await expect(componentButton).toHaveAttribute("aria-expanded", "true");
          }

          const storyButtons = await page
            .locator(`button[id^="domain-${component.name}--"][href]`)
            .all();

          console.log(
            `✓ [${index + 1}/${components.length}] Testing ${storyButtons.length} variants of ${component.name}`,
          );

          for (const storyButton of storyButtons) {
            const storyId = await storyButton.getAttribute("id");
            if (!storyId) {
              continue;
            }

            await storyButton.scrollIntoViewIfNeeded();
            await storyButton.click();

            // Wait for story iframe to be ready
            const iframe = page.frameLocator("#storybook-preview-iframe");
            await iframe
              .locator("body")
              .waitFor({ state: "attached", timeout: 5000 })
              .catch(() => {
                // Iframe might not load immediately for all stories
              });

            const storyErrors = await checkForPageErrors(page);
            if (storyErrors.length > 0) {
              console.error(`  ⚠️  Error in story ${storyId}:`, storyErrors);
              await page
                .screenshot({
                  path: `test-results/error-${component.name}-${storyId.replaceAll(/[^\da-z]/gi, "_")}.png`,
                })
                // biome-ignore lint/suspicious/noEmptyBlockStatements: ignore error
                .catch(() => {});
            }
            pageErrors = [...pageErrors, ...storyErrors];
          }

          const allErrors = [...pageErrors, ...consoleErrors];

          if (allErrors.length > 0) {
            console.error(
              `\n❌ [${component.name}] Found ${allErrors.length} error(s):\n${allErrors.map((e) => `  - ${e}`).join("\n")}\n`,
            );
          } else {
            console.log(`  ✅ [${component.name}] No errors detected`);
          }

          return {
            component: component.name,
            storyCount: storyButtons.length,
            errors: allErrors,
          };
        } catch (error) {
          console.error(`\n💥 [${component.name}] Exception during testing:`, error);
          return {
            component: component.name,
            storyCount: 0,
            errors: [`Exception: ${error}`],
          };
        } finally {
          await page.close();
        }
      }),
    );

    const totalStories = results.reduce((sum, result) => sum + result.storyCount, 0);
    const allErrors = results.flatMap((r) => r.errors);
    const componentsWithErrors = results.filter((r) => r.errors.length > 0);

    console.log(
      `\n📊 Test Summary:\n   Total stories tested: ${totalStories}\n   Total components: ${components.length}\n   Components with errors: ${componentsWithErrors.length}\n   Total errors found: ${allErrors.length}\n`,
    );

    if (allErrors.length > 0) {
      console.error(`\n${"=".repeat(80)}`);
      console.error("❌ ERROR REPORT - TEST FAILED");
      console.error(`${"=".repeat(80)}\n`);
      for (const result of componentsWithErrors) {
        console.error(`\n[${result.component}] - ${result.errors.length} error(s):`);
        for (const error of result.errors) {
          console.error(`  ${error}`);
        }
      }
      console.error(`\n${"=".repeat(80)}\n`);
    } else {
      console.log("✅ No errors found - all stories loaded successfully!\n");
    }

    expect(totalStories).toBeGreaterThan(10);
    expect(results.every((r) => r.storyCount > 0)).toBe(true);

    if (allErrors.length > 0) {
      const errorReport = componentsWithErrors
        .map((r) => `${r.component}:\n${r.errors.map((e) => `  - ${e}`).join("\n")}`)
        .join("\n\n");

      console.error("\n🚨 TEST FAILED - Errors detected in Storybook stories!\n");

      throw new Error(
        `Found ${allErrors.length} error(s) across ${componentsWithErrors.length} component(s):\n\n${errorReport}`,
      );
    }
  });
  /* eslint-enable playwright/no-conditional-in-test, playwright/no-conditional-expect */
});
