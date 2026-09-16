import { expect, test, type Page } from "@playwright/test";

async function openSettings(page: Page) {
  await page.getByRole("button", { name: "Local data & backup", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Local archive" })).toBeVisible();
}

async function chooseExperience(page: Page, label: "Simple" | "Standard" | "Advanced") {
  await openSettings(page);
  const group = page.getByRole("group", { name: "Experience level" });
  await group.getByRole("button", { name: new RegExp(label) }).click();
  await page.getByRole("button", { name: "Close settings" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-experience", label.toLowerCase());
}

async function waitForStableWorkspace(page: Page) {
  const workspace = page.locator("#primary-workspace");
  const tabs = page.getByRole("tablist", { name: "Primary keybind tools" });
  // Tablet Chromium can briefly observe both the prerendered and hydrated tree while the
  // reload settles. Wait for the final single workspace instead of masking a real duplicate.
  await expect(workspace).toHaveCount(1);
  await expect(tabs).toHaveCount(1);
  return { workspace, tabs };
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
  await waitForStableWorkspace(page);
});

test("Simple experience emphasizes Search and Compose without removing technical tools", async ({ page }) => {
  const { workspace, tabs } = await waitForStableWorkspace(page);

  await expect(workspace).toHaveAttribute("data-experience-level", "simple");
  await expect(tabs).toHaveAttribute("data-experience", "simple");
  await expect(page.getByTestId("experience-workspace-summary")).toContainText("Simple experience");
  await expect(page.getByTestId("experience-workspace-summary")).toContainText("Search and Compose are emphasized");
  await expect(tabs.getByRole("tab", { name: "Search existing keybinds", exact: true })).toBeVisible();
  await expect(tabs.getByRole("tab", { name: "Compose your own keybind", exact: true })).toBeVisible();
  await expect(tabs.getByRole("tab", { name: "Build your own command", exact: true })).toHaveAttribute("data-secondary-in-simple", "true");
  await expect(tabs.getByRole("tab", { name: "Create your own say message", exact: true })).toHaveAttribute("data-secondary-in-simple", "true");
  await expect(page.getByTestId("advanced-portable-tools")).toHaveCount(0);
});

test("Standard experience restores equal everyday tool priority", async ({ page }) => {
  await chooseExperience(page, "Standard");
  const { tabs } = await waitForStableWorkspace(page);
  await expect(tabs).toHaveAttribute("data-experience", "standard");
  await expect(page.getByTestId("experience-workspace-summary")).toContainText("Standard experience");
  await expect(tabs.locator('[data-secondary-in-simple="true"]')).toHaveCount(0);
  await expect(page.getByText("Share, export & portable tools", { exact: true })).toBeVisible();
  await expect(page.getByTestId("advanced-portable-tools")).toHaveCount(0);
});

test("Advanced experience surfaces portable technical tools without an extra disclosure", async ({ page }) => {
  await chooseExperience(page, "Advanced");
  const { tabs } = await waitForStableWorkspace(page);
  await expect(tabs).toHaveAttribute("data-experience", "advanced");
  await expect(page.getByTestId("experience-workspace-summary")).toContainText("Advanced experience");
  const advancedTools = page.getByTestId("advanced-portable-tools");
  await expect(advancedTools).toBeVisible();
  await expect(advancedTools).toContainText("Portable & technical tools");
  await expect(advancedTools.getByRole("heading", { name: "Share the selected pack anywhere" })).toBeVisible();
  await expect(page.getByText("Share, export & portable tools", { exact: true })).toHaveCount(0);
});

test("technical deep links remain available in Simple experience", async ({ page }) => {
  await page.goto("/#build-command");
  await waitForStableWorkspace(page);
  await expect(page.locator("html")).toHaveAttribute("data-experience", "simple");
  await expect(page.getByRole("tab", { name: "Build your own command", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".command-lab")).toBeVisible();
});
