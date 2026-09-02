import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function waitForLibrary(page: Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
  await expect(page.locator(".bind-card").first()).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await waitForLibrary(page);
});

test("keeps primary card information visible and secondary information collapsed", async ({ page }) => {
  const card = page.locator(".bind-card").first();
  await expect(card.locator("h4")).toBeVisible();
  await expect(card.getByText("Key combination", { exact: true })).toBeVisible();
  await expect(card.getByRole("button", { name: /Copy command:/ })).toBeVisible();
  await expect(card.getByRole("button", { name: "Details", exact: true })).toBeVisible();
  await expect(card.locator(".command-preview")).toHaveCount(0);
  await expect(card.locator(".provenance-row")).toHaveCount(0);
});

test("mounts details only after the user requests them", async ({ page }) => {
  const card = page.locator(".bind-card").first();
  await card.getByRole("button", { name: "Details", exact: true }).click();
  await expect(card.locator(".command-preview")).toBeVisible();
  await expect(card.locator(".provenance-row")).toBeVisible();
  await expect(card.getByRole("button", { name: "Hide details", exact: true })).toBeVisible();

  await card.getByRole("button", { name: "Hide details", exact: true }).click();
  await expect(card.locator(".command-preview")).toHaveCount(0);
});

test("keeps the full filtered group index available for direct navigation", async ({ page }) => {
  const count = await page.locator(".bind-group").count();
  expect(count).toBeGreaterThan(2);
  await expect(page.getByRole("button", { name: "Show more groups" })).toHaveCount(0);
});

test("rebuilds the visible group index immediately when a filter changes", async ({ page }) => {
  const before = await page.locator(".bind-group").count();
  await page.getByLabel("Search keybind library").fill("bard");
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
  const after = await page.locator(".bind-group").count();
  expect(after).toBeGreaterThan(0);
  expect(after).toBeLessThan(before);
});

test("does not introduce horizontal overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator(".bind-card").first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
