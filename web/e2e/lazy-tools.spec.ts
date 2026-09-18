import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
  await page.getByTestId("experience-workspace-summary").getByRole("button", { name: "Show more tools" }).click();
});

test("portable share tools stay unmounted until the drawer is opened", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Share the selected pack anywhere" })).toHaveCount(0);
  await page.getByText("Share, export & portable tools", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Share the selected pack anywhere" })).toBeVisible();
});

test("lazy primary tools still load on demand without losing workspace position", async ({ page }) => {
  const tabs = page.getByRole("tablist", { name: "Primary keybind tools" });
  await tabs.scrollIntoViewIfNeeded();
  const initialY = await page.evaluate(() => window.scrollY);

  await tabs.getByRole("tab", { name: "Compose your own keybind", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Compose your own keybind", exact: true })).toBeVisible();
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - initialY)).toBeLessThanOrEqual(1);

  await tabs.getByRole("tab", { name: "Build your own command", exact: true }).click();
  await expect(page.locator(".command-lab")).toBeVisible();
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - initialY)).toBeLessThanOrEqual(1);

  await tabs.getByRole("tab", { name: "Create your own say message", exact: true }).click();
  await expect(page.getByText("Create your own say message", { exact: true }).last()).toBeVisible();
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - initialY)).toBeLessThanOrEqual(1);
});
