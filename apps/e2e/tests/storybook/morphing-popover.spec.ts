import { expect, test } from "@playwright/test";
import { EXTENDED_TIMEOUT, QUICK_TIMEOUT } from "../../lib/constants";

const TOOLBAR_STORY_PATH =
  "iframe.html?id=composite-datatable-datatabletoolbar--default&viewMode=story";

test.describe("MorphingPopover in DataTable", () => {
  test("should keep filter popover open when clicking Add Filter button", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/${TOOLBAR_STORY_PATH}`, {
      waitUntil: "networkidle",
      timeout: EXTENDED_TIMEOUT,
    });

    const filterButton = page.getByRole("button", { name: /filter/i });
    const addFilterButton = page.getByRole("button", { name: /add filter/i });
    const filterEditor = page.locator('[role="dialog"]').first();

    // Wait for toolbar, click to open popover
    await filterButton.waitFor({ timeout: QUICK_TIMEOUT });
    await filterButton.click();

    // Verify popover is open
    await expect(addFilterButton).toBeVisible();

    // Click Add filter - popover should stay open
    await addFilterButton.click();
    await expect(addFilterButton).toBeVisible();
    await expect(filterEditor).toBeVisible();
  });

  test("should keep sort popover open when clicking column sort", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/${TOOLBAR_STORY_PATH}`, {
      waitUntil: "networkidle",
      timeout: EXTENDED_TIMEOUT,
    });

    const sortButton = page.getByRole("button", { name: /sort/i });
    const popoverContent = page.locator('[role="dialog"]').first();

    // Wait for toolbar, click to open popover
    await sortButton.waitFor({ timeout: QUICK_TIMEOUT });
    await sortButton.click();

    // Verify popover is open
    await expect(popoverContent).toBeVisible();

    // Click on a column to add a sort - should keep popover open
    const firstSortableColumn = page.getByRole("button", { name: /name|email|role|age/i }).first();
    await firstSortableColumn.click();

    // Popover should still be visible
    await expect(popoverContent).toBeVisible();
  });

  test("should close popover when clicking outside", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/${TOOLBAR_STORY_PATH}`, {
      waitUntil: "networkidle",
      timeout: EXTENDED_TIMEOUT,
    });

    const filterButton = page.getByRole("button", { name: /filter/i });
    const popoverContent = page.locator('[role="dialog"]').first();

    // Wait for toolbar, click to open popover
    await filterButton.waitFor({ timeout: QUICK_TIMEOUT });
    await filterButton.click();

    // Verify popover is open
    await expect(popoverContent).toBeVisible();

    // Click outside the popover
    await page.click("body", { position: { x: 10, y: 10 } });

    // Verify the popover is closed
    await expect(popoverContent).toBeHidden();
  });
});
