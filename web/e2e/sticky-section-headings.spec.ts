import { expect, test } from "@playwright/test";

const FIRST_VISIT_KEY = "bindforge-nw:first-visit:v2";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => window.localStorage.setItem(key, "seen"), FIRST_VISIT_KEY);
  await page.goto("/");
  await expect(page.getByLabel("Search keybind library").first()).toBeEditable();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
});

test("catalogue group title stays sticky while its section is active", async ({ page }) => {
  const targeting = page.locator(".bind-group").filter({ has: page.getByRole("heading", { name: /Targeting/ }) }).first();
  const heading = targeting.locator(".group-heading");

  await expect(targeting).toBeVisible();
  await expect(heading).toContainText("Targeting");
  await expect(heading).toContainText("Any Class");
  await expect(heading).toHaveCSS("position", "sticky");

  await targeting.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    window.scrollBy({ top: rect.top + Math.min(240, Math.max(100, rect.height / 3)), behavior: "instant" });
  });

  await expect.poll(async () => {
    const box = await heading.boundingBox();
    return box ? Math.round(box.y) : -999;
  }).toBeGreaterThanOrEqual(0);

  const box = await heading.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeLessThanOrEqual(4);
});

test("sticky group title stays compact and does not create page overflow", async ({ page }) => {
  const heading = page.locator(".group-heading").first();
  await expect(heading).toBeVisible();

  const metrics = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));

  expect(metrics.overflow).toBeLessThanOrEqual(1);
  const box = await heading.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  await expect(heading.getByRole("button", { name: /Collapse|Expand/ })).toBeVisible();
});
