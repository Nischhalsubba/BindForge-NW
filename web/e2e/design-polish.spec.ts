import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function openWorkbench(page: Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("filter-toolbar").first()).toBeVisible();
  await expect(page.locator(".bind-card").first()).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await openWorkbench(page);
});

test("default workbench is visually quiet and toolbar controls share a baseline", async ({ page }) => {
  await expect(page.locator(".active-filter-row")).toHaveCount(0);

  const toolbar = page.getByTestId("filter-toolbar").first();
  const search = page.getByLabel("Search keybind library").first();
  const bind = toolbar.getByRole("button", { name: "Bind", exact: true });
  const reset = toolbar.getByRole("button", { name: "Reset keybind library filters" });

  const searchBox = await search.boundingBox();
  const bindBox = await bind.boundingBox();
  const resetBox = await reset.boundingBox();
  expect(searchBox).not.toBeNull();
  expect(bindBox).not.toBeNull();
  expect(resetBox).not.toBeNull();
  expect(Math.abs(searchBox!.height - bindBox!.height)).toBeLessThanOrEqual(2);
  expect(Math.abs(searchBox!.height - resetBox!.height)).toBeLessThanOrEqual(2);
});

test("desktop workbench intro uses the exact library column", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Persistent two-column workbench is desktop-only.");
  const intro = await page.locator(".workbench-intro-main").boundingBox();
  const library = await page.locator("#keybind-library").boundingBox();
  expect(intro).not.toBeNull();
  expect(library).not.toBeNull();
  expect(Math.abs(intro!.x - library!.x)).toBeLessThanOrEqual(2);
  expect(Math.abs(intro!.x + intro!.width - library!.x - library!.width)).toBeLessThanOrEqual(2);
});

test("expanding details never stretches the neighbouring desktop card", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Two-column cards are desktop-only.");
  const cards = page.locator(".bind-group").first().locator(".bind-card");
  await expect(cards).toHaveCount(5);
  const first = cards.nth(0);
  const second = cards.nth(1);
  const before = await second.boundingBox();
  expect(before).not.toBeNull();

  await first.getByRole("button", { name: "Details", exact: true }).click();
  await expect(first.getByTestId("command-preview-output")).toBeVisible();
  const expanded = await first.boundingBox();
  const after = await second.boundingBox();
  expect(expanded).not.toBeNull();
  expect(after).not.toBeNull();
  expect(expanded!.height).toBeGreaterThan(after!.height);
  expect(Math.abs(after!.height - before!.height)).toBeLessThanOrEqual(3);
});

for (const width of [360, 390, 768, 1024, 1280, 1440] as const) {
  test(`page stays inside the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.reload();
    await expect(page.getByTestId("filter-toolbar").first()).toBeVisible();
    const geometry = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
  });
}

test("compact view stays contained without changing title writing direction", async ({ page }) => {
  await page.getByLabel("Library view").selectOption("compact");
  const row = page.getByTestId("compact-bind-row").first();
  const title = page.getByTestId("compact-title").first();
  await expect(row).toBeVisible();
  await expect(title).toBeVisible();
  const geometry = await page.evaluate(() => {
    const titleNode = document.querySelector('[data-testid="compact-title"]');
    return {
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      writingMode: titleNode ? getComputedStyle(titleNode).writingMode : "missing",
    };
  });
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
  expect(geometry.writingMode).toBe("horizontal-tb");
});
