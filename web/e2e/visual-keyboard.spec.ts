import { expect, test, type Page } from "@playwright/test";

async function prepare(page: Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
  const primaryNav = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(primaryNav.locator(".site-nav-links > a")).toHaveCount(3);
  await primaryNav.getByRole("link", { name: /My Setup/ }).click();
  await expect(page.getByTestId("personal-keymap-panel")).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await prepare(page);
});

test("visualizes active-profile keyboard evidence without claiming unknown keys are free", async ({ page }) => {
  const keyboard = page.getByTestId("visual-keyboard-map");
  await expect(keyboard).toBeVisible();
  await expect(keyboard.getByLabel("Keyboard state summary").getByText("Unknown", { exact: true })).toBeVisible();
  await expect(keyboard.getByTestId("keyboard-key-7")).toHaveAttribute("data-state", "unknown");
});

test("shows customized and imported collisions as accessible conflicts with assignment details", async ({ page }) => {
  const firstCard = page.locator(".bind-card:visible").first();
  await firstCard.locator("input[data-key-capture='true']").fill("ctrl+7");

  await page.getByLabel("Paste personal Neverwinter binds").fill("/bind ctrl+7 Existing_Player_Command activate");
  await page.getByRole("button", { name: "Analyze pasted binds" }).click();

  const seven = page.getByTestId("keyboard-key-7");
  await expect(seven).toHaveAttribute("data-state", "conflict");
  await expect(seven).toHaveAccessibleName(/7.*Conflict/i);

  await seven.focus();
  await page.keyboard.press("Enter");
  const details = page.getByTestId("visual-keyboard-details");
  await expect(details).toContainText("ctrl+7");
  await expect(details).toContainText("BindForge");
  await expect(details).toContainText("Imported");
});

test("refreshes keyboard state when switching profiles and remains contained on narrow layouts", async ({ page }) => {
  const firstCard = page.locator(".bind-card:visible").first();
  await firstCard.locator("input[data-key-capture='true']").fill("ctrl+7");
  await page.getByLabel("Paste personal Neverwinter binds").fill("/bind ctrl+7 Existing_Player_Command activate");
  await page.getByRole("button", { name: "Analyze pasted binds" }).click();
  await expect(page.getByTestId("keyboard-key-7")).toHaveAttribute("data-state", "conflict");

  await page.getByRole("button", { name: "Add profile" }).click();
  await page.getByLabel("Profile name").fill("Clean profile");
  await page.getByRole("button", { name: "Clear personal keymap" }).click();
  await expect(page.getByTestId("keyboard-key-7")).toHaveAttribute("data-state", "customized");

  await page.getByLabel("Active profile").selectOption("profile-default");
  await expect(page.getByTestId("keyboard-key-7")).toHaveAttribute("data-state", "conflict");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});


test("uses roving keyboard focus and arrow navigation instead of one Tab stop per key", async ({ page }) => {
  const keyboard = page.getByTestId("visual-keyboard-map");
  const tabbableKeys = keyboard.locator("button[data-keyboard-key][tabindex='0']");
  await expect(tabbableKeys).toHaveCount(1);
  await expect(tabbableKeys).toHaveAttribute("data-testid", "keyboard-key-escape");

  await tabbableKeys.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(":focus")).toHaveAttribute("data-testid", "keyboard-key-f1");

  await page.keyboard.press("ArrowDown");
  await expect(page.locator(":focus")).toHaveAttribute("data-keyboard-key");
});
