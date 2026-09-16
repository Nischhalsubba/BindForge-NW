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

test("keeps the ultra-wide hero and workspace readable at reduced effective zoom", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Ultra-wide geometry is checked once in the desktop project.");
  await page.setViewportSize({ width: 2560, height: 1440 });
  await waitForLibrary(page);

  const heroPlate = page.locator(".hero-plate");
  const settingsTrigger = heroPlate.getByRole("button", { name: "Local data & backup", exact: true });
  await expect(settingsTrigger).toBeVisible();

  await settingsTrigger.click();
  await page.getByLabel("Appearance").getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Close settings" }).click();

  await expect(page.locator(".site-nav")).toHaveCSS("color", "rgb(21, 20, 15)");
  await expect(page.locator(".site-nav-links a").first()).toHaveCSS("color", "rgb(21, 20, 15)");
  await expectNoDocumentOverflow(page);

  const geometry = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const header = document.querySelector<HTMLElement>(".app-header")?.getBoundingClientRect();
    const hero = document.querySelector<HTMLElement>(".hero")?.getBoundingClientRect();
    const plate = document.querySelector<HTMLElement>(".hero-plate")?.getBoundingClientRect();
    const sectionRule = document.querySelector<HTMLElement>("#primary-workspace .section-rule")?.getBoundingClientRect();
    const display = document.querySelector<HTMLElement>(".hero .display");
    const indexSmall = document.querySelector<HTMLElement>(".hero-index small");
    const specimenSmall = document.querySelector<HTMLElement>(".command-specimen small");
    const firstTabSmall = document.querySelector<HTMLElement>("#primary-workspace [role='tab'] small");
    const sideRail = document.querySelector<HTMLElement>(".side-rail");

    return {
      viewportWidth,
      headerWidth: header?.width ?? 0,
      heroWidth: hero?.width ?? 0,
      plateHeight: plate?.height ?? 0,
      workspaceGap: hero && sectionRule ? sectionRule.top - hero.bottom : Number.POSITIVE_INFINITY,
      displayFontSize: display ? Number.parseFloat(getComputedStyle(display).fontSize) : 0,
      indexFontSize: indexSmall ? Number.parseFloat(getComputedStyle(indexSmall).fontSize) : 0,
      specimenFontSize: specimenSmall ? Number.parseFloat(getComputedStyle(specimenSmall).fontSize) : 0,
      tabDescriptionFontSize: firstTabSmall ? Number.parseFloat(getComputedStyle(firstTabSmall).fontSize) : 0,
      sideRailDisplay: sideRail ? getComputedStyle(sideRail).display : "missing",
    };
  });

  expect(geometry.headerWidth / geometry.viewportWidth).toBeGreaterThanOrEqual(0.9);
  expect(geometry.heroWidth / geometry.viewportWidth).toBeGreaterThanOrEqual(0.9);
  expect(geometry.plateHeight).toBeLessThanOrEqual(760);
  expect(geometry.workspaceGap).toBeLessThanOrEqual(36);
  expect(geometry.displayFontSize).toBeGreaterThanOrEqual(120);
  expect(geometry.indexFontSize).toBeGreaterThanOrEqual(15);
  expect(geometry.specimenFontSize).toBeGreaterThanOrEqual(16);
  expect(geometry.tabDescriptionFontSize).toBeGreaterThanOrEqual(13);
  expect(geometry.sideRailDisplay).toBe("none");
});
