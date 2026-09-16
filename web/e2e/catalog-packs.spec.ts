import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
});

function visiblePacks(page: import("@playwright/test").Page) {
  return page.locator('[data-testid="catalog-quick-packs"]:visible').first();
}

test("class and role packs are catalogue-backed and open deterministic result sets", async ({ page }) => {
  const packs = visiblePacks(page);
  await packs.locator("summary").click();
  await expect(packs).toContainText("not automatic build recommendations");

  const fighter = packs.locator('article[data-pack-id="fighter-dps"]');
  await expect(fighter).toContainText("Fighter DPS");
  await expect(fighter).toContainText(/experimental/i);
  await fighter.getByRole("button", { name: /Open .*preset pack/ }).click();

  await expect(page.getByLabel("Search keybind library").first()).toHaveValue("fighter dps");
  await expect(page.locator(".bind-card:visible").filter({ hasText: "Fighter DPS Animation Cancel: Left Click" }).first()).toBeVisible();
  await expect(fighter.getByRole("button")).toHaveText("Pack open");
});

test("an opened quick pack can flow into the existing selection and pack review", async ({ page }) => {
  const packs = visiblePacks(page);
  await packs.locator("summary").click();
  const barbarian = packs.locator('article[data-pack-id="barbarian-dps"]');
  await barbarian.getByRole("button", { name: /Open .*preset pack/ }).click();

  const packToggle = page.getByRole("button", { name: /Collections & command packs/i }).filter({ visible: true }).first();
  await packToggle.click();
  const panel = page.locator('[data-testid="pack-tools-panel"]:visible').first();
  await panel.getByRole("button", { name: "Select visible" }).click();
  await expect(packToggle).toContainText(/1 selected/);
  const tray = page.locator('[data-testid="selection-tray"]:visible').first();
  await expect(tray).toBeVisible();
  await expect(tray).toContainText(/needs review/i);
});
