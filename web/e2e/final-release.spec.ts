import { expect, test, type Page } from "@playwright/test";

async function prepare(page: Page) {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem("bindforge-nw:first-visit:v1", "seen");
  });
  await page.reload();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");

  // A viewport change can briefly expose both the prerendered and hydrated search tree.
  // Require it to settle back to exactly one live search input before making layout claims;
  // unlike `.first()`, this fails if a duplicate survives hydration.
  const search = page.getByLabel("Search keybind library");
  await expect(search).toHaveCount(1, { timeout: 10_000 });
}

async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function openSettings(page: Page) {
  await page.getByRole("button", { name: "Local data & backup", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Local archive" })).toBeVisible();
}

test("200%-zoom-equivalent layout keeps the primary journey usable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Equivalent zoom geometry is checked once on desktop.");
  await page.setViewportSize({ width: 640, height: 900 });
  await prepare(page);

  await expect(page.getByRole("tablist", { name: "Primary keybind tools" })).toBeVisible();
  await expect(page.getByLabel("Search keybind library")).toBeVisible();
  await expect(page.getByRole("button", { name: "Filters", exact: true })).toBeVisible();
  await expectNoOverflow(page);
});

test("extra-large text, high contrast, and larger controls remain usable together", async ({ page }) => {
  await prepare(page);
  await openSettings(page);

  await page.getByRole("group", { name: "Text size" }).getByRole("button", { name: /Extra large/ }).click();
  await page.getByRole("group", { name: "Contrast" }).getByRole("button", { name: /High contrast/ }).click();
  await page.getByRole("checkbox", { name: /Larger controls/ }).check();
  await page.getByRole("button", { name: "Close settings" }).click();

  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-text-size", "extra-large");
  await expect(root).toHaveAttribute("data-contrast", "high");
  await expect(root).toHaveAttribute("data-large-controls", "true");
  await expectNoOverflow(page);

  const search = page.getByLabel("Search keybind library");
  await expect(search).toBeVisible();
  const height = await search.evaluate((element) => element.getBoundingClientRect().height);
  expect(height).toBeGreaterThanOrEqual(44);
});

test("reduced motion removes decorative transitions without hiding feedback", async ({ page }) => {
  await prepare(page);
  await openSettings(page);
  await page.getByRole("checkbox", { name: /Reduce motion/ }).check();
  await page.getByRole("button", { name: "Close settings" }).click();

  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  const motion = await page.getByRole("tab", { name: "Search existing keybinds", exact: true }).evaluate((element) => {
    function durationSeconds(value: string) {
      const first = value.split(",")[0]?.trim() ?? "0s";
      const amount = Number.parseFloat(first) || 0;
      return first.endsWith("ms") ? amount / 1000 : amount;
    }
    const style = getComputedStyle(element);
    return {
      transitionSeconds: durationSeconds(style.transitionDuration),
      animationSeconds: durationSeconds(style.animationDuration),
    };
  });
  expect(motion.transitionSeconds).toBeLessThanOrEqual(0.001);
  expect(motion.animationSeconds).toBeLessThanOrEqual(0.001);
  await expect(page.locator('[role="status"]').last()).toBeAttached();
});

test("landmarks and workflow controls keep a logical accessible structure", async ({ page }) => {
  await prepare(page);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("tablist", { name: "Primary keybind tools" })).toHaveCount(1);
  await expect(page.getByLabel("Search keybind library")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Choose a workflow." })).toBeVisible();
  await expect(page.getByTestId("result-count").first()).toBeVisible();
});

test("keyboard-only entry reaches the workspace and switches workflows", async ({ page }) => {
  await prepare(page);
  await page.locator("body").focus();
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to primary tools" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#primary-workspace$/);

  const tabs = page.getByRole("tablist", { name: "Primary keybind tools" });
  const search = tabs.getByRole("tab", { name: "Search existing keybinds", exact: true });
  await search.focus();
  await page.keyboard.press("ArrowRight");
  const compose = tabs.getByRole("tab", { name: "Compose your own keybind", exact: true });
  await expect(compose).toBeFocused();
  await expect(compose).toHaveAttribute("aria-selected", "true");
});

test("tablet landscape keeps the workbench inside the viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "tablet-chromium", "Landscape is checked in the tablet project.");
  await page.setViewportSize({ width: 1024, height: 768 });
  await prepare(page);
  await expect(page.getByRole("tablist", { name: "Primary keybind tools" })).toBeVisible();
  await expect(page.getByLabel("Search keybind library")).toBeVisible();
  await expectNoOverflow(page);
});
