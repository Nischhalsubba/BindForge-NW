import { expect, test } from "@playwright/test";

type Page = import("@playwright/test").Page;
type Locator = import("@playwright/test").Locator;

async function waitForLibrary(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("filter-toolbar").first()).toBeVisible();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
}

function libraryView(page: Page) {
  return page.getByTestId("secondary-controls").getByLabel("Library view");
}

async function showMoreTools(page: Page) {
  const summary = page.getByTestId("experience-workspace-summary");
  const button = summary.getByRole("button", { name: "Show more tools" });
  if (await button.isVisible()) await button.click();
}

function parseCssRgb(value: string) {
  const channels = value.match(/[\d.]+/g)?.map(Number);
  if (!channels || channels.length < 3) throw new Error(`Unsupported CSS colour: ${value}`);
  return channels.slice(0, 3);
}

function relativeLuminance(value: string) {
  const [red, green, blue] = parseCssRgb(value).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

async function expectTextContrast(foreground: Locator, background: Locator, minimum = 4.5) {
  const colors = await Promise.all([
    foreground.evaluate((element) => getComputedStyle(element).color),
    background.evaluate((element) => getComputedStyle(element).backgroundColor),
  ]);
  expect(
    contrastRatio(colors[0], colors[1]),
    `Expected at least ${minimum}:1 contrast for ${colors[0]} on ${colors[1]}`,
  ).toBeGreaterThanOrEqual(minimum);
}

async function expectOwnContrast(locator: Locator, minimum = 4.5) {
  const colors = await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return { foreground: style.color, background: style.backgroundColor };
  });
  expect(
    contrastRatio(colors.foreground, colors.background),
    `Expected at least ${minimum}:1 contrast for ${colors.foreground} on ${colors.background}`,
  ).toBeGreaterThanOrEqual(minimum);
}

async function expectNoDocumentOverflow(page: Page) {
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
  await expect(page.getByTestId("secondary-controls")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Collections & command packs/ })).toHaveCount(0);
  await expect(page.getByTestId("experience-workspace-summary")).toContainText("Beginner View");
  await page.screenshot({ fullPage: true, path: testInfo.outputPath("workspace-default.png") });
});

test("captures expanded pack tools and settings surfaces", async ({ page }, testInfo) => {
  await waitForLibrary(page);
  await showMoreTools(page);
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
  await showMoreTools(page);
  await libraryView(page).selectOption("compact");
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
  await page.getByRole("button", { name: "Local data & backup", exact: true }).click();
  await page.getByLabel("Appearance").getByRole("button", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Close settings" }).click();

  const primaryAction = page.getByRole("link", { name: "Browse keybinds ↗", exact: true });
  await expectOwnContrast(primaryAction);
  await primaryAction.hover();
  await expectOwnContrast(primaryAction);

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

  const siteNav = page.locator(".site-nav");
  const navLink = page.locator(".site-nav-links a").first();
  const navMeta = page.locator(".brand-copy small");
  const primaryAction = page.getByRole("link", { name: "Browse keybinds ↗", exact: true });
  const pageSurface = page.locator("body");
  const heroLead = page.locator(".hero .lead");
  const plateMeta = heroPlate.locator(".plate-meta");
  const heroIndexMeta = heroPlate.locator(".hero-index small").first();

  // Lock the original warm-paper navigation as a brand anchor.
  await expect(siteNav).toHaveCSS("color", "rgb(21, 20, 15)");
  await expect(navLink).toHaveCSS("color", "rgb(21, 20, 15)");
  await expect(siteNav).toHaveCSS("background-color", "rgb(239, 231, 210)");
  await expectTextContrast(navMeta, siteNav);

  await expectOwnContrast(primaryAction);
  await primaryAction.hover();
  await expectOwnContrast(primaryAction);

  await expectTextContrast(heroLead, pageSurface);
  await expectTextContrast(plateMeta, heroPlate);
  await expectTextContrast(heroIndexMeta, heroPlate);

  // Preserve the established deep green-black field-manual palette rather than
  // forcing large luminance jumps between adjacent dark surfaces.
  const palette = await page.evaluate(() => ({
    page: getComputedStyle(document.body).backgroundColor,
    plate: getComputedStyle(document.querySelector<HTMLElement>(".hero-plate")!).backgroundColor,
    specimen: getComputedStyle(document.querySelector<HTMLElement>(".command-specimen")!).backgroundColor,
  }));
  expect(palette.page).toBe("rgb(17, 21, 19)");
  expect(palette.plate).toBe("rgb(23, 28, 25)");
  expect(palette.specimen).toBe("rgb(247, 241, 222)");

  const focusColors = await siteNav.evaluate((element) => {
    const probe = document.createElement("span");
    probe.style.color = "var(--nav-focus)";
    element.appendChild(probe);
    const outline = getComputedStyle(probe).color;
    probe.remove();
    return {
      outline,
      background: getComputedStyle(element).backgroundColor,
    };
  });
  expect(
    contrastRatio(focusColors.outline, focusColors.background),
    `Expected a visible navigation focus ring, got ${focusColors.outline} on ${focusColors.background}`,
  ).toBeGreaterThanOrEqual(3);

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
    const phraseRectCounts = Array.from(document.querySelectorAll<HTMLElement>(".display-phrase"))
      .map((phrase) => phrase.getClientRects().length);

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
      phraseRectCounts,
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
  expect(geometry.phraseRectCounts).toEqual([1, 1, 1]);
});
