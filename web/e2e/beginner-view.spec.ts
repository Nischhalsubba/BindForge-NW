import { expect, test, type Page } from "@playwright/test";

const FIRST_VISIT_KEY = "bindforge-nw:first-visit:v2";

async function openWithoutTour(page: Page) {
  await page.addInitScript((firstVisitKey) => {
    window.localStorage.setItem(firstVisitKey, "seen");
  }, FIRST_VISIT_KEY);
  await page.goto("/");
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
}

test.beforeEach(async ({ page }) => {
  await openWithoutTour(page);
});

test("Beginner View hides technical and secondary surfaces until requested", async ({ page }) => {
  const tabs = page.getByRole("tablist", { name: "Primary keybind tools" });
  await expect(tabs.getByRole("tab")).toHaveCount(2);
  await expect(tabs.getByRole("tab", { name: "Search existing keybinds" })).toBeVisible();
  await expect(tabs.getByRole("tab", { name: "Compose your own keybind" })).toBeVisible();
  await expect(tabs.getByRole("tab", { name: "Build your own command" })).toHaveCount(0);
  await expect(tabs.getByRole("tab", { name: "Create your own say message" })).toHaveCount(0);

  await expect(page.getByTestId("secondary-controls")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Collections & command packs/i })).toHaveCount(0);
  await expect(page.getByText("Share, export & portable tools", { exact: true })).toHaveCount(0);
  await expect(page.locator(".active-filter-row")).toHaveCount(0);

  const summary = page.getByTestId("experience-workspace-summary");
  await expect(summary).toContainText("Beginner View");
  await expect(summary.getByRole("button", { name: "Show more tools" })).toBeVisible();
});

test("Show more tools switches to Standard, reveals hidden controls, and persists", async ({ page }) => {
  const summary = page.getByTestId("experience-workspace-summary");
  await summary.getByRole("button", { name: "Show more tools" }).click();

  const tabs = page.getByRole("tablist", { name: "Primary keybind tools" });
  await expect(tabs.getByRole("tab")).toHaveCount(4);
  await expect(page.getByTestId("secondary-controls")).toBeVisible();
  await expect(page.getByRole("button", { name: /Collections & command packs/i })).toBeVisible();
  await expect(page.getByText("Share, export & portable tools", { exact: true })).toBeVisible();

  await page.waitForTimeout(350);
  await page.reload();
  await expect(page.getByTestId("experience-workspace-summary")).toContainText("Standard experience");
  await expect(page.getByRole("tablist", { name: "Primary keybind tools" }).getByRole("tab")).toHaveCount(4);
});

test("Beginner View keeps class filtering but hides action type and difficulty filters", async ({ page }, testInfo) => {
  const filterButton = page.getByRole("button", { name: "Filters", exact: true });
  if (await filterButton.isVisible()) {
    await filterButton.click();
    const drawer = page.getByRole("dialog", { name: "Filters" });
    await expect(drawer.getByRole("group", { name: "Class" })).toBeVisible();
    await expect(drawer.getByLabel("Filter keybinds by action type")).toHaveCount(0);
    await expect(drawer.getByRole("group", { name: "Difficulty" })).toHaveCount(0);
    return;
  }

  const panel = page.locator("#filter-panel:visible");
  await expect(panel.getByRole("group", { name: "Class" })).toBeVisible();
  await expect(panel.getByLabel("Filter keybinds by action type")).toHaveCount(0);
  await expect(panel.getByRole("group", { name: "Difficulty" })).toHaveCount(0);
});
