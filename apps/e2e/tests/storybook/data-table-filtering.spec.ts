import { expect, test } from "@playwright/test";
import { EXTENDED_TIMEOUT, QUICK_TIMEOUT } from "../../lib/constants";

const STORY_PATH = "iframe.html?id=domain-datatable--server-side-filtering&viewMode=story";

test.describe("DataTable Server-Side Filtering", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/${STORY_PATH}`, {
      waitUntil: "networkidle",
      timeout: EXTENDED_TIMEOUT,
    });

    // Wait for the table to be visible
    await page.locator('[data-slot="data-table"]').waitFor({ timeout: QUICK_TIMEOUT });
  });

  test("should display initial data with all 50 items", async ({ page }) => {
    const resultsCount = page.locator('[data-testid="results-count"]');
    await expect(resultsCount).toContainText("50 items");
  });

  test("should filter by name using search input", async ({ page }) => {
    const searchInput = page.locator('[data-testid="item-search-input"]');
    const resultsCount = page.locator('[data-testid="results-count"]');
    const activeFilters = page.locator('[data-testid="active-filters"]');

    // Search for Acme - Playwright assertions auto-wait for debounce
    await searchInput.fill("Acme");

    // Assertions auto-retry until passing (handles debounce naturally)
    await expect(resultsCount).not.toHaveText("50 items");
    await expect(activeFilters).toContainText("name contains");
    await expect(activeFilters).toContainText("Acme");
  });

  test("should filter by status dropdown", async ({ page }) => {
    const statusTrigger = page.locator('[data-testid="status-trigger"]');
    const activeFilters = page.locator('[data-testid="active-filters"]');

    await statusTrigger.click();
    await page.getByRole("option", { name: "Active", exact: true }).click();

    // Assertions auto-retry until filter applies
    await expect(activeFilters).toContainText("status eq");
    await expect(activeFilters).toContainText("active");
  });

  test("should filter by category dropdown", async ({ page }) => {
    const categoryTrigger = page.locator('[data-testid="category-trigger"]');
    const activeFilters = page.locator('[data-testid="active-filters"]');

    await categoryTrigger.click();
    await page.getByRole("option", { name: "Premium" }).click();

    // Assertions auto-retry until filter applies
    await expect(activeFilters).toContainText("category eq");
    await expect(activeFilters).toContainText("premium");
  });

  test("should combine multiple filters", async ({ page }) => {
    const searchInput = page.locator('[data-testid="item-search-input"]');
    const statusTrigger = page.locator('[data-testid="status-trigger"]');
    const activeFilters = page.locator('[data-testid="active-filters"]');

    // Apply search filter
    await searchInput.fill("Widget");
    await expect(activeFilters).toContainText("name contains");

    // Apply status filter
    await statusTrigger.click();
    await page.getByRole("option", { name: "Active", exact: true }).click();

    // Both filters should be active
    await expect(activeFilters).toContainText("status eq");
  });

  test("should clear all filters", async ({ page }) => {
    const searchInput = page.locator('[data-testid="item-search-input"]');
    const clearButton = page.locator('[data-testid="clear-filters-btn"]');
    const activeFilters = page.locator('[data-testid="active-filters"]');
    const resultsCount = page.locator('[data-testid="results-count"]');

    // Apply a filter first
    await searchInput.fill("Gadget");
    await expect(activeFilters).toContainText("name contains");

    // Click clear button
    await clearButton.click();

    // Filters should be cleared and results back to 50
    await expect(activeFilters).toContainText("None");
    await expect(resultsCount).toContainText("50 items");
  });

  test("should sort by clicking column headers", async ({ page }) => {
    const priceHeader = page.getByRole("button", { name: "Price" });
    const activeSort = page.locator('[data-testid="active-sort"]');

    await priceHeader.click();

    // Assert sort state changes
    await expect(activeSort).toHaveText(/price (ASC|DESC)/);
  });

  test("should toggle sort direction on double click", async ({ page }) => {
    const dateHeader = page.getByRole("button", { name: "Date" });
    const activeSort = page.locator('[data-testid="active-sort"]');

    // First click - ascending
    await dateHeader.click();
    await expect(activeSort).toHaveText(/date asc/i);

    // Second click - descending
    await dateHeader.click();
    await expect(activeSort).toHaveText(/date desc/i);
  });

  test("should show loading state", async ({ page, baseURL }) => {
    // Navigate to loading state story
    await page.goto(
      `${baseURL}/iframe.html?id=domain-datatable--server-side-loading&viewMode=story`,
      {
        waitUntil: "networkidle",
        timeout: EXTENDED_TIMEOUT,
      },
    );

    // Check for loading indicator
    const loadingText = page.getByText("Loading...");
    await expect(loadingText).toBeVisible();
  });

  test("should show empty state", async ({ page, baseURL }) => {
    // Navigate to empty state story
    await page.goto(
      `${baseURL}/iframe.html?id=domain-datatable--server-side-empty&viewMode=story`,
      {
        waitUntil: "networkidle",
        timeout: EXTENDED_TIMEOUT,
      },
    );

    // Check for "No results" message
    const noResults = page.getByText("No results.");
    await expect(noResults).toBeVisible();
  });
});
