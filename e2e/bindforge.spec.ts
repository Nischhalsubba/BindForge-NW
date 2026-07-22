import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("loads the keybind builder and filters presets", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "BindForge NW" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /keybinds found/i })).toBeVisible();
  await page.getByLabel("Search").fill("invoke");
  await expect(page.getByRole("heading", { name: /invoke/i }).first()).toBeVisible();
});

test("generates bind and unbind output from shared state", async ({ page }) => {
  await page.goto("/");
  const firstKey = page.locator(".bind-card .key-field input").first();
  await firstKey.fill("Ctrl+R");
  await expect(page.locator(".bind-card .command-preview code").first()).toContainText("/bind ctrl+r");
  await page.getByRole("button", { name: "Unbind", exact: true }).click();
  await expect(page.locator(".bind-card .command-preview code").first()).toHaveText("/unbind ctrl+r");
});

test("persists filters and custom say values across reload", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search").fill("bard");
  await page.getByLabel("Appearance").getByRole("button", { name: "Light" }).click();
  await page.getByRole("textbox", { name: "Message" }).fill("Group on me");
  await page.waitForTimeout(350);
  await page.reload();
  await expect(page.getByLabel("Search")).toHaveValue("bard");
  await expect(page.getByLabel("Appearance").getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("textbox", { name: "Message" })).toHaveValue("Group on me");
});

test("renders the route not-found recovery page", async ({ page }) => {
  await page.goto("/missing-bindforge-route");
  await expect(page.getByRole("heading", { name: "That BindForge page does not exist" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to BindForge" })).toBeVisible();
});

test("meets the axe accessibility baseline", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
