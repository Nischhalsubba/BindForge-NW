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

test("provides an optional keyboard command palette and restores focus", async ({ page }) => {
  await page.keyboard.press("Control+K");
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("Search command palette")).toBeFocused();
  await page.getByLabel("Search command palette").fill("profile");
  await dialog.getByRole("button", { name: /Open My Setup/ }).click();
  await expect(page).toHaveURL(/#my-setup$/);
});

test("shows context-sensitive My Setup empty actions and faster profile switching", async ({ page }) => {
  const nav = page.getByRole("navigation", { name: "Primary navigation" });
  await nav.getByRole("link", { name: /My Setup/, exact: true }).click();
  const panel = page.getByTestId("personal-keymap-panel");
  await expect(panel.getByTestId("keymap-empty-actions")).toBeVisible();
  await panel.getByRole("button", { name: "Import current binds" }).click();
  await expect(panel.getByLabel("Paste personal Neverwinter binds")).toBeFocused();

  await panel.getByRole("button", { name: "Add profile" }).click();
  await expect(panel.getByRole("button", { name: "← Previous profile" })).toBeEnabled();
  await panel.getByRole("button", { name: "← Previous profile" }).click();
  await expect(page.getByLabel("Active profile")).toHaveValue("profile-default");
});

test("records only coarse local analytics and recent activity after user actions", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const firstCard = page.locator(".bind-card:visible").first();
  await firstCard.getByRole("button", { name: /Copy command:/ }).click();
  await expect(page.getByTestId("recent-activity")).toBeVisible();

  await page.getByLabel("Search keybind library").fill("definitely-no-match-xyz");
  await expect(page.getByTestId("search-empty-state")).toBeVisible();
  await page.waitForTimeout(650);

  const analytics = await page.evaluate(() => JSON.parse(window.localStorage.getItem("bindforge-nw:analytics:v1") || "[]"));
  expect(analytics.some((event: { name: string }) => event.name === "preset_copied")).toBe(true);
  expect(analytics.some((event: { name: string }) => event.name === "zero_result_search")).toBe(true);
  expect(JSON.stringify(analytics)).not.toContain("definitely-no-match-xyz");

  await page.getByRole("button", { name: "Local data & backup", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Privacy-conscious usage insights" })).toBeVisible();
});


test("records blocked import validation as a coarse workflow error without pasted content", async ({ page }) => {
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: /My Setup/, exact: true }).click();
  const panel = page.getByTestId("personal-keymap-panel");
  await panel.getByLabel("Paste personal Neverwinter binds").fill("not a valid bind with secret text");
  await panel.getByRole("button", { name: "Preview import" }).click();
  await expect(panel.getByRole("status")).toContainText("No valid bind operations");

  const analytics = await page.evaluate(() => JSON.parse(window.localStorage.getItem("bindforge-nw:analytics:v1") || "[]"));
  const error = analytics.find((event: { name: string }) => event.name === "workflow_error");
  expect(error).toEqual(expect.objectContaining({
    name: "workflow_error",
    context: { route: "my-setup", actionType: "import", outcome: "validation-blocked" },
  }));
  expect(JSON.stringify(analytics)).not.toContain("secret text");
});
