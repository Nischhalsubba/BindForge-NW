import { expect, test } from "@playwright/test";

type Page = import("@playwright/test").Page;
type Locator = import("@playwright/test").Locator;

async function waitForLibrary(page: Page) {
  await page.goto("/advanced");
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
  await expect(page.getByRole("button", { name: /Selected keybinds/ })).toHaveCount(0);
  await expect(page.getByTestId("experience-workspace-summary")).toContainText("Beginner View");
  await page.screenshot({ fullPage: true, path: testInfo.outputPath("workspace-default.png") });
});

test("captures expanded pack tools and settings surfaces", async ({ page }, testInfo) => {
  await waitForLibrary(page);
  await showMoreTools(page);
  await page.getByRole("button", { name: /Selected keybinds/ }).click();
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
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Appearance").getByRole("button", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Close settings" }).click();

  await expectNoDocumentOverflow(page);
  await page.screenshot({ fullPage: true, path: testInfo.outputPath("workspace-light.png") });
});

test("shared workbench remains usable at wide and narrow widths", async ({page})=>{
 for(const width of [390,768,1440,2560]){
  await page.setViewportSize({width,height:900});await waitForLibrary(page);
  await expectNoDocumentOverflow(page);
  await expect(page.getByRole('heading',{level:1,name:'Characters & advanced setups'})).toBeVisible();
  const active=page.getByRole('tab',{name:'Search existing keybinds',exact:true});
  await expect(active).toBeVisible();
  const label=active.locator('strong');
  await expectTextContrast(label,active);
 }
});

test("catalogue headings do not duplicate the selected class context", async ({ page }) => {
  await waitForLibrary(page);
  const title = await page.locator(".group-heading h3").first().innerText();
  expect((title.match(/Any Class/g) ?? []).length).toBe(1);
});
