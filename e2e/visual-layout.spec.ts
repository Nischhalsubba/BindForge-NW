import { expect, test } from "@playwright/test";

async function waitForLibrary(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.getByTestId("filter-toolbar").first()).toBeVisible();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
}

async function expectNoDocumentOverflow(page: import("@playwright/test").Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

test("captures the consolidated default workspace without geometry regressions", async ({ page }, testInfo) => {
  await waitForLibrary(page);
  await expectNoDocumentOverflow(page);
  await expect(page.getByTestId("secondary-controls")).toBeVisible();
  await expect(page.getByRole("button", { name: /Collections & command packs/ })).toBeVisible();
  await page.screenshot({ fullPage: true, path: testInfo.outputPath("workspace-default.png") });
});

test("captures expanded pack tools and settings surfaces", async ({ page }, testInfo) => {
  await waitForLibrary(page);
  await page.getByRole("button", { name: /Collections & command packs/ }).click();
  await expect(page.getByTestId("pack-tools-panel")).toBeVisible();
  await expectNoDocumentOverflow(page);
  await page.screenshot({ fullPage: true, path: testInfo.outputPath("workspace-pack-tools.png") });

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
  await expectNoDocumentOverflow(page);
  await page.screenshot({ fullPage: true, path: testInfo.outputPath("workspace-settings.png") });
});

test("captures compact mode and the mobile filter drawer", async ({ page }, testInfo) => {
  await waitForLibrary(page);
  await page.getByLabel("Library view").selectOption("compact");
  await expect(page.getByTestId("compact-bind-row").first()).toBeVisible();
  await expectNoDocumentOverflow(page);
  await page.screenshot({ fullPage: true, path: testInfo.outputPath("workspace-compact.png") });

  const filters = page.getByRole("button", { name: "Filters", exact: true });
  if (await filters.isVisible()) {
    await filters.click();
    await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
    await expectNoDocumentOverflow(page);
    await page.screenshot({ fullPage: true, path: testInfo.outputPath("workspace-filter-drawer.png") });
  }
});

test("captures the light-theme workspace", async ({ page }, testInfo) => {
  await waitForLibrary(page);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Appearance").getByRole("button", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Close settings" }).click();
  await expectNoDocumentOverflow(page);
  await page.screenshot({ fullPage: true, path: testInfo.outputPath("workspace-light.png") });
});
