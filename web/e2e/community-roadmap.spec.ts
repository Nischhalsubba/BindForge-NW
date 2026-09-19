import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem("bindforge-nw:first-visit:v2", "seen");
  });
  await page.reload();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
  await page.getByTestId("experience-workspace-summary").getByRole("button", { name: "Show more tools" }).click();
});

test("exports contextual community evidence without upgrading trust", async ({ page }) => {
  const card = page.locator(".bind-card:visible").first();
  await card.getByRole("button", { name: "Details" }).click();
  await expect(card.getByLabel("Neverwinter Academy references")).toBeVisible();
  await card.getByText("Report current game behavior").click();
  await card.getByLabel(/Game version for/).fill("2026-09-17 patch");
  const downloadPromise = page.waitForEvent("download");
  await card.getByRole("button", { name: "Download unreviewed report" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^bindforge-report-/);
  await expect(card.getByRole("status")).toContainText("does not change");
});

test("exports selected presets as a versioned community pack", async ({ page }) => {
  await page.locator(".bind-card:visible").first().getByText("Select", { exact: true }).click();
  await page.getByRole("button", { name: /Collections & command packs/ }).click();
  const panel = page.getByTestId("pack-tools-panel");
  await panel.getByLabel("Community pack game version").fill("2026-09-17 patch");
  const downloadPromise = page.waitForEvent("download");
  await panel.getByRole("button", { name: "Download community pack" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^bindforge-community-pack-/);
});

test("zero-result search can be exported as an unverified research candidate", async ({ page }) => {
  await page.getByLabel("Search keybind library").fill("brand-new-command-candidate");
  const empty = page.getByTestId("search-empty-state");
  await expect(empty).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await empty.getByRole("button", { name: "Download research candidate" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^bindforge-research-candidate-/);
});

test("active profile sharing stays a local file export", async ({ page }) => {
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: /My Setup/, exact: true }).click();
  const panel = page.getByTestId("personal-keymap-panel");
  await panel.getByRole("button", { name: "Manage character & profile" }).click();
  const downloadPromise = page.waitForEvent("download");
  await panel.getByRole("button", { name: "Export active profile" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^bindforge-profile-/);
  await expect(panel.getByRole("status").filter({ hasText: "Nothing was uploaded" })).toBeVisible();
});
