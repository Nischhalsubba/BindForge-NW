import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
});

test("class and role packs are catalogue-backed and open deterministic result sets", async ({ page }) => {
  const packs = page.getByTestId("catalog-quick-packs");
  await packs.locator("summary").click();
  await expect(packs).toContainText("not automatic build recommendations");

  const fighter = packs.locator('article[data-pack-id="fighter-dps"]');
  await expect(fighter).toContainText("Fighter DPS");
  await expect(fighter).toContainText(/experimental/i);
  await fighter.getByRole("button", { name: /Open .*preset pack/ }).click();

  await expect(page.getByLabel("Search keybind library").first()).toHaveValue("fighter dps");
  await expect(page.getByRole("heading", { name: "Fighter DPS Animation Cancel: Left Click" })).toBeVisible();
  await expect(fighter.getByRole("button")).toHaveText("Pack open");
});

test("an opened quick pack can flow into the existing selection and pack review", async ({ page }) => {
  const packs = page.getByTestId("catalog-quick-packs");
  await packs.locator("summary").click();
  const barbarian = packs.locator('article[data-pack-id="barbarian-dps"]');
  await barbarian.getByRole("button", { name: /Open .*preset pack/ }).click();

  const packToggle = page.getByRole("button", { name: /Collections & command packs/i });
  await packToggle.click();
  const panel = page.getByTestId("pack-tools-panel");
  await panel.getByRole("button", { name: "Select visible" }).click();
  await expect(packToggle).toContainText(/1 selected/);
  await expect(page.getByTestId("selection-tray")).toBeVisible();
  await expect(page.getByTestId("selection-tray")).toContainText(/needs review/i);
});
