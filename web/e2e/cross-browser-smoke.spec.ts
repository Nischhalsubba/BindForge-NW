import { expect, test } from "@playwright/test";

test("critical browse, My Setup, and settings flow works outside Chromium", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: /Find it\./i })).toBeVisible();

  const search = page.getByLabel("Search keybind library").first();
  await expect(search).toBeEditable();
  await search.fill("bank");
  await expect(page.locator(".bind-card").first()).toBeVisible();

  const primaryNav = page.getByRole("navigation", { name: "Primary navigation" });
  await primaryNav.getByRole("link", { name: /My Setup/, exact: true }).click();
  await expect(page.getByTestId("personal-keymap-panel")).toBeVisible();

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByTestId("settings-layer")).toBeVisible();
  await page.getByRole("button", { name: "Close settings" }).click();
  await expect(page.getByRole("button", { name: "Settings", exact: true })).toBeFocused();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
