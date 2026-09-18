import { expect, test, type Page } from "@playwright/test";

async function openMySetup(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
  const nav = page.getByRole("navigation", { name: "Primary navigation" });
  await nav.getByRole("link", { name: /My Setup/ }).click();
  await expect(page.getByTestId("personal-keymap-panel")).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await openMySetup(page);
});

test("uses a full-width vertical My Setup flow on desktop", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Desktop geometry is checked once.");

  const panel = page.getByTestId("personal-keymap-panel");
  const keyboard = page.getByTestId("visual-keyboard-map");
  const analyzer = page.getByTestId("keymap-analyzer");

  await expect(keyboard).toBeVisible();
  await expect(analyzer).toBeVisible();
  await expect(analyzer.getByText("Analyze this profile’s Neverwinter binds", { exact: true })).toBeVisible();
  await expect(analyzer.getByLabel("Paste personal Neverwinter binds")).toBeVisible();
  await expect(analyzer.getByRole("button", { name: "Analyze pasted binds" })).toBeVisible();

  const geometry = await Promise.all([
    panel.boundingBox(),
    keyboard.boundingBox(),
    analyzer.boundingBox(),
  ]);
  const [panelBox, keyboardBox, analyzerBox] = geometry;
  expect(panelBox).not.toBeNull();
  expect(keyboardBox).not.toBeNull();
  expect(analyzerBox).not.toBeNull();

  expect(keyboardBox!.width / panelBox!.width).toBeGreaterThanOrEqual(0.9);
  expect(analyzerBox!.width / panelBox!.width).toBeGreaterThanOrEqual(0.9);
  expect(Math.abs(keyboardBox!.x - analyzerBox!.x)).toBeLessThanOrEqual(2);
});

test("keeps the visual keyboard contained without document overflow", async ({ page }) => {
  const keyboard = page.getByTestId("visual-keyboard-map");
  const viewport = keyboard.getByRole("region", { name: /Visual keyboard/i });

  await expect(viewport).toBeVisible();
  const geometry = await page.evaluate(() => ({
    documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    viewportClientWidth: document.querySelector<HTMLElement>('[aria-label^="Visual keyboard"]')?.clientWidth ?? 0,
    viewportScrollWidth: document.querySelector<HTMLElement>('[aria-label^="Visual keyboard"]')?.scrollWidth ?? 0,
  }));

  expect(geometry.documentOverflow).toBeLessThanOrEqual(1);
  expect(geometry.viewportClientWidth).toBeGreaterThan(0);
  expect(geometry.viewportScrollWidth).toBeGreaterThanOrEqual(geometry.viewportClientWidth);
});
