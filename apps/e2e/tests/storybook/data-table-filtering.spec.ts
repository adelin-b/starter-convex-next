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

  test("should display initial data with all 50 vehicles", async ({ page }) => {
    const resultsCount = page.locator('[data-testid="results-count"]');
    await expect(resultsCount).toContainText("50 vehicles");
  });

  test("should filter by make using search input", async ({ page }) => {
    const searchInput = page.locator('[data-testid="vehicle-search-input"]');
    const resultsCount = page.locator('[data-testid="results-count"]');
    const activeFilters = page.locator('[data-testid="active-filters"]');

    // Search for Toyota - Playwright assertions auto-wait for debounce
    await searchInput.fill("Toyota");

    // Assertions auto-retry until passing (handles debounce naturally)
    await expect(resultsCount).not.toHaveText("50 vehicles");
    await expect(activeFilters).toContainText("make contains");
    await expect(activeFilters).toContainText("Toyota");
  });

  test("should filter by status dropdown", async ({ page }) => {
    const statusTrigger = page.locator('[data-testid="status-trigger"]');
    const activeFilters = page.locator('[data-testid="active-filters"]');

    await statusTrigger.click();
    await page.getByRole("option", { name: "Available" }).click();

    // Assertions auto-retry until filter applies
    await expect(activeFilters).toContainText("status eq");
    await expect(activeFilters).toContainText("available");
  });

  test("should filter by fuel type dropdown", async ({ page }) => {
    const fuelTrigger = page.locator('[data-testid="fuel-trigger"]');
    const activeFilters = page.locator('[data-testid="active-filters"]');

    await fuelTrigger.click();
    await page.getByRole("option", { name: "Electric" }).click();

    // Assertions auto-retry until filter applies
    await expect(activeFilters).toContainText("fuelType eq");
    await expect(activeFilters).toContainText("electric");
  });

  test("should combine multiple filters", async ({ page }) => {
    const searchInput = page.locator('[data-testid="vehicle-search-input"]');
    const statusTrigger = page.locator('[data-testid="status-trigger"]');
    const activeFilters = page.locator('[data-testid="active-filters"]');

    // Apply search filter
    await searchInput.fill("BMW");
    await expect(activeFilters).toContainText("make contains");

    // Apply status filter
    await statusTrigger.click();
    await page.getByRole("option", { name: "Available" }).click();

    // Both filters should be active
    await expect(activeFilters).toContainText("status eq");
  });

  test("should clear all filters", async ({ page }) => {
    const searchInput = page.locator('[data-testid="vehicle-search-input"]');
    const clearButton = page.locator('[data-testid="clear-filters-btn"]');
    const activeFilters = page.locator('[data-testid="active-filters"]');
    const resultsCount = page.locator('[data-testid="results-count"]');

    // Apply a filter first
    await searchInput.fill("Honda");
    await expect(activeFilters).toContainText("make contains");

    // Click clear button
    await clearButton.click();

    // Filters should be cleared and results back to 50
    await expect(activeFilters).toContainText("None");
    await expect(resultsCount).toContainText("50 vehicles");
  });

  test("should sort by clicking column headers", async ({ page }) => {
    const priceHeader = page.getByRole("button", { name: "Price" });
    const activeSort = page.locator('[data-testid="active-sort"]');

    await priceHeader.click();

    // Assert sort state changes
    await expect(activeSort).toHaveText(/price (ASC|DESC)/);
  });

  test("should toggle sort direction on double click", async ({ page }) => {
    const yearHeader = page.getByRole("button", { name: "Year" });
    const activeSort = page.locator('[data-testid="active-sort"]');

    // First click - ascending
    await yearHeader.click();
    await expect(activeSort).toHaveText(/year asc/i);

    // Second click - descending
    await yearHeader.click();
    await expect(activeSort).toHaveText(/year desc/i);
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
