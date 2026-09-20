import { expect, test, type Page } from "@playwright/test";

async function prepare(page: Page) {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem("bindforge-nw:first-visit:v2", "seen");
  });
  await page.reload();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
}

async function openMySetup(page: Page) {
  const primaryNav = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(primaryNav.locator(".site-nav-links > a")).toHaveCount(3);
  await primaryNav.getByRole("link", { name: /My Setup/ }).click();
  await expect(page).toHaveURL(/#my-setup$/);
  await expect(page.getByTestId("personal-keymap-panel")).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await prepare(page);
});

test("creates, renames, switches, and persists characters and profiles inside My Setup", async ({ page }) => {
  await openMySetup(page);

  await expect(page.getByLabel("Active character")).toHaveValue("character-default");
  await expect(page.getByLabel("Active profile")).toHaveValue("profile-default");

  await page.getByRole("button", { name: "Add character" }).click();
  await page.getByLabel("Character name").fill("Riswynn");
  await page.getByLabel("Character class").selectOption("Fighter");
  await page.getByLabel("Character role").selectOption("Tank");
  await page.getByLabel("Character paragon").fill("Vanguard");
  await expect(page.getByLabel("Active character")).toContainText("Riswynn");

  await page.getByRole("button", { name: "Add profile" }).click();
  await page.getByLabel("Profile name").fill("Boss Tank");
  await expect(page.getByLabel("Active profile")).toContainText("Boss Tank");

  await page.reload();
  await openMySetup(page);
  await expect(page.getByLabel("Character name")).toHaveValue("Riswynn");
  await expect(page.getByLabel("Profile name")).toHaveValue("Boss Tank");
});

test("round-trips My Setup through export and validated import", async ({ page }) => {
  await openMySetup(page);
  await page.getByRole("button", { name: "Add character" }).click();
  await page.getByLabel("Character name").fill("Backup Hero");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export My Setup" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^bindforge-my-setup-v1-\d{4}-\d{2}-\d{2}\.json$/);

  const backup = await page.evaluate(() => window.localStorage.getItem("bindforge-nw:profiles:v1"));
  expect(backup).toBeTruthy();
  await page.getByLabel("Character name").fill("Changed locally");
  await page.locator("input[type='file'][accept='application/json,.json']").setInputFiles({
    name: "my-setup.json",
    mimeType: "application/json",
    buffer: Buffer.from(backup!),
  });

  await expect(page.getByLabel("Character name")).toHaveValue("Backup Hero");
  await expect(page.getByRole("status").filter({ hasText: "My Setup backup validated and restored" })).toBeVisible();
});

test("keeps restored global backup keys in the active profile after reload", async ({ page }) => {
  await openMySetup(page);
  const firstCard = page.locator(".bind-card:visible").first();
  const firstKeyInput = firstCard.locator("input[data-key-capture='true']");
  await firstKeyInput.fill("ctrl+7");

  await page.waitForFunction(() => {
    const raw = window.localStorage.getItem("bindforge-nw:settings:v2");
    if (!raw) return false;
    try {
      const saved = JSON.parse(raw) as { keys?: Record<string, string> };
      return Object.values(saved.keys ?? {}).some((value) => value === "ctrl+7");
    } catch {
      return false;
    }
  });

  const legacyBackup = await page.evaluate(() => {
    const raw = window.localStorage.getItem("bindforge-nw:settings:v2");
    if (!raw) throw new Error("Expected saved BindForge settings");
    const saved = JSON.parse(raw) as { savedAt: string; keys: Record<string, string> };
    saved.savedAt = new Date().toISOString();
    saved.keys = Object.fromEntries(Object.keys(saved.keys).map((id) => [id, "alt+9"]));
    return JSON.stringify(saved);
  });

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Import a Neverwinter Keybind backup file").setInputFiles({
    name: "legacy-bindforge-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(legacyBackup),
  });
  await expect(page.locator(".local-save-status")).toContainText("Backup validated and restored");
  await page.getByRole("button", { name: "Close settings" }).click();
  await expect(firstKeyInput).toHaveValue("alt+9");

  await page.reload();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
  await expect(page.locator(".bind-card:visible").first().locator("input[data-key-capture='true']")).toHaveValue("alt+9");
});

test("keeps edited keys and imported conflict data isolated by profile", async ({ page }) => {
  await openMySetup(page);
  const firstCard = page.locator(".bind-card:visible").first();
  const keyInput = firstCard.locator("input[data-key-capture='true']");
  const presetTitle = (await firstCard.locator("h4").textContent())?.trim();
  expect(presetTitle).toBeTruthy();

  await keyInput.fill("ctrl+7");
  await page.getByLabel("Paste personal Neverwinter binds").fill("/bind ctrl+7 invoke");
  await page.getByRole("button", { name: "Preview import" }).click();
  await page.getByTestId("keymap-import-preview").getByRole("button", { name: "Confirm import" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Personal conflict detection is active" })).toBeVisible();

  await page.getByRole("button", { name: "Add profile" }).click();
  await page.getByLabel("Profile name").fill("AoE");
  await keyInput.fill("alt+8");
  await page.getByRole("button", { name: "Clear personal keymap" }).click();

  await page.getByLabel("Active profile").selectOption("profile-default");
  const restoredCard = page.locator(".bind-card:visible").filter({ has: page.getByRole("heading", { name: presetTitle!, exact: true }) });
  await expect(restoredCard.locator("input[data-key-capture='true']")).toHaveValue("ctrl+7");
  await expect(page.getByText(/active binds analyzed locally/)).toBeVisible();
});

test("prevents deleting the final character and profile and stays inside the viewport", async ({ page }) => {
  await openMySetup(page);
  await page.getByText("Manage character & profile", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Delete character" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Delete profile" })).toBeDisabled();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
