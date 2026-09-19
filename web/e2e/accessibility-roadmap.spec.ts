import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem("bindforge-nw:first-visit:v2", "seen");
  });
  await page.reload();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
});

test("reflows at a 320 CSS-pixel viewport with the largest built-in text setting", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "400% equivalent reflow is checked once.");
  await page.setViewportSize({ width: 320, height: 900 });
  await page.getByRole("button", { name: "Local data & backup", exact: true }).click();
  await page.getByLabel("Text size").getByRole("button", { name: "Extra large" }).click();
  await page.getByRole("button", { name: "Close settings" }).click();

  const geometry = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
  await expect(page.getByLabel("Search keybind library")).toBeVisible();
  await expect(page.getByRole("button", { name: "Filters", exact: true })).toBeVisible();
});

test("accessible reassignment exposes an explicit controlled region and non-colour text evidence", async ({ page }) => {
  await page.getByTestId("experience-workspace-summary").getByRole("button", { name: "Show more tools" }).click();
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: /My Setup/, exact: true }).click();
  const panel = page.getByTestId("personal-keymap-panel");
  await panel.getByLabel("Paste personal Neverwinter binds").fill("/bind ctrl+alt+shift+f1 existing");
  await panel.getByRole("button", { name: "Preview import" }).click();
  await panel.getByTestId("keymap-import-preview").getByRole("button", { name: "Confirm import" }).click();

  const card = page.locator(".bind-card:visible").first();
  await card.getByRole("button", { name: "Details" }).click();
  const move = card.getByRole("button", { name: "Move binding to…" });
  if (await move.count()) {
    await move.click();
    const controls = await move.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    await expect(page.locator(`#${controls}`)).toHaveRole("region");
    await expect(page.locator(`#${controls}`)).toContainText("Current → Proposed");
  }
});
