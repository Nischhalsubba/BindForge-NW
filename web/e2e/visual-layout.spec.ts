import { expect, test } from "@playwright/test";

async function waitForLibrary(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.getByTestId("filter-toolbar").first()).toBeVisible();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
}

function libraryView(page: import("@playwright/test").Page) {
  return page.getByTestId("secondary-controls").getByLabel("Library view");
}

async function expectNoDocumentOverflow(page: import("@playwright/test").Page) {
  const geometry = await page.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const offenders = Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id,
          className: typeof element.className === "string" ? element.className : "",
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter((item) => item.width > 0 && (item.left < -1 || item.right > clientWidth + 1))
      .slice(0, 12);
    return { clientWidth, scrollWidth, offenders };
  });
  expect(geometry.scrollWidth, `Overflowing elements: ${JSON.stringify(geometry.offenders)}`).toBeLessThanOrEqual(geometry.clientWidth + 1);
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

  await page.getByRole("button", { name: "Local data & backup", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Local archive" })).toBeVisible();
  await expectNoDocumentOverflow(page);
  await page.screenshot({ fullPage: true, path: testInfo.outputPath("workspace-settings.png") });
});

test("captures compact mode and the mobile filter drawer", async ({ page }, testInfo) => {
  await waitForLibrary(page);
  await libraryView(page).selectOption("compact");
  await expect(page.getByTestId("compact-bind-row").first()).toBeVisible();
  await expectNoDocumentOverflow(page);
  await page.screenshot({ fullPage: true, path: testInfo.outputPath("workspace-compact.png") });

  const filters = page.getByRole("button", { name: "Filters & navigation", exact: true });
  if (await filters.isVisible()) {
    await filters.click();
    await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
    await expectNoDocumentOverflow(page);
    await page.screenshot({ fullPage: true, path: testInfo.outputPath("workspace-filter-drawer.png") });
  }
});

test("captures the light-theme workspace", async ({ page }, testInfo) => {
  await waitForLibrary(page);
  await page.getByRole("button", { name: "Local data & backup", exact: true }).click();
  await page.getByLabel("Appearance").getByRole("button", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Close settings" }).click();
  await expectNoDocumentOverflow(page);
  await page.screenshot({ fullPage: true, path: testInfo.outputPath("workspace-light.png") });
});
