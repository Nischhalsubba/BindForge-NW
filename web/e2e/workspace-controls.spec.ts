import { expect, test } from "@playwright/test";

async function waitForWorkspace(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.getByTestId("filter-toolbar").first()).toBeVisible();
  await expect(page.getByTestId("secondary-controls")).toBeVisible();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
}

async function visibleFilterPanel(page: import("@playwright/test").Page) {
  const trigger = page.getByRole("button", { name: "Filters & navigation", exact: true });
  if (await trigger.isVisible()) {
    if (await trigger.getAttribute("aria-expanded") !== "true") await trigger.click();
  }
  return page.locator("#filter-panel:visible, #mobile-filter-drawer:visible");
}

test.beforeEach(async ({ page }) => {
  await waitForWorkspace(page);
});

test("keeps primary actions visible and secondary controls distinct", async ({ page }) => {
  await expect(page.getByLabel("Search keybind library").first()).toBeVisible();
  const filters = await visibleFilterPanel(page);
  await expect(filters.getByLabel("Filter keybinds by action type")).toBeVisible();
  await expect(page.getByRole("button", { name: "Bind", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Unbind", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset keybind library filters" })).toBeVisible();

  const secondary = page.getByTestId("secondary-controls");
  await expect(secondary.getByLabel("Library view")).toBeVisible();
  await expect(secondary.getByLabel("Sort keybinds")).toBeVisible();
  await expect(secondary.getByLabel("Filter by provenance")).toBeVisible();
  await expect(secondary.getByText("Safe or intentional only", { exact: true })).toBeVisible();
});

test("keeps collection and command pack tools collapsed until requested", async ({ page }) => {
  const toggle = page.getByRole("button", { name: /Collections & command packs/i });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByTestId("pack-tools-panel")).toHaveCount(0);

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  const panel = page.getByTestId("pack-tools-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByLabel("Browse collection")).toBeVisible();
  await expect(panel.getByLabel("New collection name")).toBeVisible();
  await expect(panel.getByRole("button", { name: "Copy share link" })).toBeVisible();
  await expect(panel.getByRole("button", { name: "Select visible" })).toBeVisible();
  await expect(panel.getByRole("button", { name: "Copy bind pack" })).toBeVisible();
  await expect(panel.getByRole("button", { name: "Download bind .txt" })).toBeVisible();

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByTestId("pack-tools-panel")).toHaveCount(0);
});

test("keeps workspace controls within the viewport", async ({ page }) => {
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  for (const locator of [page.getByTestId("filter-toolbar").first(), page.getByTestId("secondary-controls"), page.getByRole("button", { name: /Collections & command packs/i })]) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width + 1);
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("preserves selection and pack actions inside the collapsed panel", async ({ page }) => {
  await page.getByRole("button", { name: /Collections & command packs/i }).click();
  const panel = page.getByTestId("pack-tools-panel");
  await panel.getByRole("button", { name: "Select visible" }).click();
  await expect(page.getByRole("button", { name: /Collections & command packs/i })).toContainText(/selected/);
  await expect(panel.getByRole("button", { name: "Copy bind pack" })).toBeEnabled();
  await expect(panel.getByRole("button", { name: "Clear selection" })).toBeEnabled();
  await panel.getByRole("button", { name: "Clear selection" }).click();
  await expect(panel.getByRole("button", { name: "Copy bind pack" })).toBeDisabled();
});
