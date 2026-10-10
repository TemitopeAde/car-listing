import { test, expect, type Page } from "@playwright/test";
import {
  filterSettings,
  primaryFilterCount,
} from "../../storefront/filter-visibility";

const selectLabels = new Set([
  "Category",
  "Make",
  "Min. year",
  "Body",
  "Fuel",
  "Sort",
  "Max. year",
  "Condition",
  "Transmission",
]);
function field(page: Page, label: string) {
  return selectLabels.has(label)
    ? page.getByRole("combobox", { name: label, exact: true })
    : page.getByLabel(label, { exact: true });
}

test("every filter can be hidden independently and restored", async ({
  page,
}) => {
  for (const [, label, attribute] of filterSettings) {
    await page.goto(`/preview/editor?${attribute}=false`);
    await page.getByText("More filters", { exact: true }).click();
    await expect(field(page, label)).toHaveCount(0);
    for (const [, otherLabel, otherAttribute] of filterSettings) {
      if (otherAttribute !== attribute)
        await expect(field(page, otherLabel)).toHaveCount(1);
    }
    await page.reload();
    await page.getByText("More filters", { exact: true }).click();
    await expect(field(page, label)).toHaveCount(0);
  }
  await page.goto("/preview/editor");
  await page.getByText("More filters", { exact: true }).click();
  for (const [, label] of filterSettings)
    await expect(field(page, label)).toBeVisible();
});

test("empty filter groups disappear while inventory stays visible", async ({
  page,
}) => {
  const extraHidden = new URLSearchParams(
    filterSettings
      .slice(primaryFilterCount)
      .map(([, , attribute]) => [attribute, "false"]),
  );
  await page.goto(`/preview/editor?${extraHidden}`);
  await expect(page.getByText("More filters", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Search", { exact: true })).toBeVisible();

  const allHidden = new URLSearchParams(
    filterSettings.map(([, , attribute]) => [attribute, "false"]),
  );
  await page.goto(`/preview/editor?${allHidden}`);
  await expect(page.getByText("More filters", { exact: true })).toHaveCount(0);
  await expect(
    page.locator('.autohaus input:not([type="checkbox"]), .autohaus select'),
  ).toHaveCount(0);
  await expect(page.locator('[data-sf="card"]').first()).toBeVisible();
});
