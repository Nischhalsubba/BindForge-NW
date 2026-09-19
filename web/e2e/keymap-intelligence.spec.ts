import { expect, test, type Page } from "@playwright/test";

async function openMySetup(page: Page) {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("bindforge-nw:first-visit:v2", "seen");
  });
  await page.reload();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
  const nav = page.getByRole("navigation", { name: "Primary navigation" });
  await nav.getByRole("link", { name: /My Setup/, exact: true }).click();
  await expect(page.getByTestId("personal-keymap-panel")).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await openMySetup(page);
});

test("previews and cleans raw keymap imports before mutating the active profile", async ({ page }) => {
  const input = page.getByLabel("Paste personal Neverwinter binds");
  await input.fill("/bind f1 one\n/bind f1 two\n/unbind f2\nnot valid\n/bind f3 three");
  await page.getByRole("button", { name: "Preview import" }).click();

  const preview = page.getByTestId("keymap-import-preview");
  await expect(preview).toBeVisible();
  await expect(preview).toContainText("2 active");
  await expect(preview).toContainText("1 overwrites");
  await expect(preview).toContainText("1 orphan unbind");
  await expect(preview).toContainText("1 ignored");
  await expect(page.getByRole("button", { name: "Clear personal keymap" })).toBeDisabled();

  await preview.getByRole("button", { name: "Confirm import" }).click();
  await expect(page.getByText(/2 active binds analyzed locally/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Clear personal keymap" })).toBeEnabled();
});

test("shows evidence-backed unused keys and an accessible reassignment confirmation after import", async ({ page }) => {
  await page.getByLabel("Paste personal Neverwinter binds").fill("/bind f1 old\n/bind q attack");
  await page.getByRole("button", { name: "Preview import" }).click();
  await page.getByTestId("keymap-import-preview").getByRole("button", { name: "Confirm import" }).click();

  const intelligence = page.getByTestId("keymap-intelligence-panel");
  await expect(intelligence.getByRole("heading", { name: "Keys not found in this import" })).toBeVisible();
  await expect(intelligence).not.toContainText("Import this profile’s current binds first");

  const card = page.locator(".bind-card:visible").first();
  await card.getByRole("button", { name: "Details" }).click();
  const move = card.getByRole("button", { name: "Move binding to…" });
  await expect(move).toBeVisible();
  await move.click();
  const panel = card.getByTestId("reassignment-panel");
  await expect(panel).toContainText("Current → Proposed");
  await expect(panel.getByRole("button", { name: "Apply reassignment" })).toBeEnabled();
});

test("records recent profile history and restores a prior key assignment", async ({ page }) => {
  const card = page.locator(".bind-card:visible").first();
  const key = card.locator("input[data-key-capture='true']");
  const original = await key.inputValue();
  await key.fill("ctrl+7");

  const intelligence = page.getByTestId("keymap-intelligence-panel");
  await expect(intelligence).toContainText("Before key edit");
  await intelligence.getByRole("button", { name: "Restore" }).first().click();
  await expect(key).toHaveValue(original);
});

test("compares cloned profiles without mixing character data", async ({ page }) => {
  await page.getByRole("button", { name: "Add profile" }).click();
  await page.getByLabel("Profile name").fill("AoE");
  const card = page.locator(".bind-card:visible").first();
  await card.locator("input[data-key-capture='true']").fill("alt+8");

  const intelligence = page.getByTestId("keymap-intelligence-panel");
  await expect(intelligence.getByLabel("Profile to compare")).toBeVisible();
  await expect(intelligence).toContainText(/differences/);
});

test("preserves corrupted profile storage in the recovery archive before safe fallback", async ({ page }) => {
  await page.evaluate(() => window.localStorage.setItem("bindforge-nw:profiles:v1", "{not-json"));
  await page.reload();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");

  await page.getByRole("button", { name: "Local data & backup", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Recovery archive" })).toBeVisible();
  await expect(page.getByText("bindforge-nw:profiles:v1", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export recovery data" })).toBeVisible();
});
