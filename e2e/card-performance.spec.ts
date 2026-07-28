import { expect, test } from "@playwright/test";

async function waitForLibrary(page: Parameters<typeof test>[0]["page"]) {
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
  await expect(card.getByText("Suggested key combination", { exact: true })).toBeVisible();
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

test("progressively renders groups and can reveal more", async ({ page }) => {
  const initialGroups = page.locator(".bind-group");
  await expect(initialGroups).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Show more groups" })).toBeVisible();

  await page.getByRole("button", { name: "Show more groups" }).click();
  await expect(page.locator(".bind-group")).toHaveCount(5);

  await page.getByRole("button", { name: "Expand all groups" }).click();
  await expect(page.getByRole("button", { name: "Show more groups" })).toHaveCount(0);
});

test("resets progressive rendering when a filter changes", async ({ page }) => {
  await page.getByRole("button", { name: "Show more groups" }).click();
  await expect(page.locator(".bind-group")).toHaveCount(5);

  await page.getByLabel("Search keybind library").fill("bard");
  await expect(page.locator(".bind-group").count()).resolves.toBeLessThanOrEqual(2);
});

test("does not introduce horizontal overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator(".bind-card").first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
