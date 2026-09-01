import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import axe from "axe-core";

async function openFiltersWhenCollapsed(page: Page) {
  const toggle = page.getByRole("button", { name: "Filters", exact: true });
  if (await toggle.isVisible()) {
    const expanded = await toggle.getAttribute("aria-expanded");
    if (expanded !== "true") await toggle.click();
  }
}

async function visibleFilterPanel(page: Page) {
  await openFiltersWhenCollapsed(page);
  return page.locator("#filter-panel:visible, #mobile-filter-drawer:visible");
}

async function openSettings(page: Page) {
  const trigger = page.getByRole("button", { name: "Settings", exact: true });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
}

async function waitForHydration(page: Page) {
  const toolbar = page.getByTestId("filter-toolbar").first();
  await expect(toolbar).toBeVisible();
  await expect(page.getByLabel("Search keybind library").first()).toBeEditable();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
  await expect(page.locator(".bind-card").first()).toBeVisible();
}

async function waitForSavedSettings(page: Page, expected: { search?: string; customMessage?: string; theme?: string }) {
  await page.waitForFunction((values) => {
    const raw = window.localStorage.getItem("bindforge-nw:settings:v2");
    if (!raw) return false;
    try {
      const saved = JSON.parse(raw) as { filters?: { search?: string }; customSay?: { message?: string } };
      const searchMatches = values.search === undefined || saved.filters?.search === values.search;
      const messageMatches = values.customMessage === undefined || saved.customSay?.message === values.customMessage;
      const themeMatches = values.theme === undefined || window.localStorage.getItem("bindforge-nw:theme") === values.theme;
      return searchMatches && messageMatches && themeMatches;
    } catch {
      return false;
    }
  }, expected);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "BindForge NW" })).toBeVisible();
  await waitForHydration(page);
});

test("keeps search and output controls visible while filters live together", async ({ page }) => {
  const toolbar = page.getByTestId("filter-toolbar").first();
  const resultCount = page.getByTestId("result-count").first();
  const originalText = await resultCount.textContent();
  await expect(toolbar).toBeVisible();
  await expect(toolbar.getByText("Command output", { exact: true })).toBeVisible();
  await expect(toolbar.getByText("Full bind first", { exact: true })).toBeVisible();
  await page.getByLabel("Search keybind library").first().fill("invocation");
  await expect(resultCount).not.toHaveText(originalText ?? "");
  await expect(resultCount).not.toHaveText("0 keybinds");
  await expect(page.locator(".bind-card").first()).toBeVisible();
  await page.getByRole("button", { name: "Reset keybind library filters" }).click();
  await expect(page.getByLabel("Search keybind library").first()).toHaveValue("");
});

test("keeps class, action type, and difficulty in one filter panel", async ({ page }) => {
  const panel = await visibleFilterPanel(page);
  await panel.getByRole("button", { name: "Bard", exact: true }).click();
  await expect(panel.getByRole("button", { name: "Bard", exact: true })).toHaveAttribute("aria-pressed", "true");
  await panel.getByRole("button", { name: "Advanced", exact: true }).click();
  await expect(panel.getByRole("button", { name: "Advanced", exact: true })).toHaveAttribute("aria-pressed", "true");
  await panel.getByLabel("Filter keybinds by action type").selectOption({ label: "Bard Songs" });
  await expect(panel.getByLabel("Filter keybinds by action type")).toHaveValue("Bard Songs");
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
});

test("keeps the full bind primary and exposes unbind separately", async ({ page }) => {
  const firstCard = page.locator(".bind-card").first();
  const firstKey = firstCard.locator(".key-field input");
  await expect(firstKey).toBeVisible();
  await firstKey.fill("Left Ctrl + Shift + R");
  await expect(firstCard.getByRole("button", { name: /Copy full command:/ })).toBeVisible();
  await expect(firstCard.getByRole("button", { name: /Copy unbind key:/ })).toBeVisible();
  await firstCard.getByRole("button", { name: "Details", exact: true }).click();
  await expect(firstCard.getByTestId("command-preview-output")).toContainText("/bind ctrl+shift+r");
  await expect(firstCard.getByTestId("unbind-command-output")).toHaveText("/unbind ctrl+shift+r");
});

test("includes the submitted Warlock and Barbarian animation-cancel presets", async ({ page }) => {
  const panel = await visibleFilterPanel(page);
  await panel.getByLabel("Filter keybinds by action type").selectOption({ label: "Animation Cancel" });
  await panel.getByRole("button", { name: "Warlock", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Warlock At-Will Animation Cancel: Left Click", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Warlock At-Will Animation Cancel: Right Click", exact: true })).toBeVisible();
  await panel.getByRole("button", { name: "Barbarian", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Barbarian DPS Animation Cancel: Right Click", exact: true })).toBeVisible();
});

test("Command Lab and custom say builder generate normalized commands", async ({ page }) => {
  const commandLab = page.getByRole("region", { name: "Build your own command" });
  await commandLab.getByLabel("Command Lab key combination").fill("Alt + F2");
  await expect(commandLab.getByLabel("Generated custom command")).toContainText("/bind alt+f2");
  const customSay = page.getByRole("region", { name: "Create your own say message" });
  await customSay.getByLabel("Custom message key combination").fill("Ctrl + F1");
  await customSay.getByLabel("Custom say message").fill('Group\n"now"');
  await expect(customSay.locator("code")).toHaveText('/bind ctrl+f1 "say Group \'now\'"');
  await expect(customSay.getByRole("status")).toContainText("Line breaks were converted");
});

test("persists filters, edited keys, theme, and custom say values across reload", async ({ page }) => {
  const bardCard = page.locator(".bind-card").filter({ has: page.getByText("Bard", { exact: true }) }).first();
  await expect(bardCard).toBeVisible();
  const presetTitle = (await bardCard.locator("h4").textContent())?.trim();
  expect(presetTitle).toBeTruthy();
  await bardCard.locator(".key-field input").fill("Ctrl+R");
  await page.getByLabel("Search keybind library").first().fill("bard");
  await openSettings(page);
  await page.getByLabel("Appearance").getByRole("button", { name: "Light" }).click();
  await page.getByRole("button", { name: "Close settings" }).last().click();
  await page.getByLabel("Custom say message").fill("Group on me");
  await waitForSavedSettings(page, { search: "bard", customMessage: "Group on me", theme: "light" });
  await openSettings(page);
  await expect(page.locator(".local-save-status").getByText("Saved automatically", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close settings" }).last().click();
  await page.reload();
  await waitForHydration(page);
  await expect(page.getByLabel("Search keybind library").first()).toHaveValue("bard");
  await openSettings(page);
  await expect(page.getByLabel("Appearance").getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Close settings" }).last().click();
  await expect(page.getByLabel("Custom say message")).toHaveValue("Group on me");
  const restoredCard = page.locator(".bind-card").filter({ has: page.getByRole("heading", { name: presetTitle!, exact: true }) });
  await expect(restoredCard.locator(".key-field input")).toHaveValue("Ctrl+R");
});

test("clear saved data remains available from Settings", async ({ page }) => {
  await page.getByLabel("Search keybind library").first().fill("bard");
  await waitForSavedSettings(page, { search: "bard" });
  await openSettings(page);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Clear saved data" }).click();
  await expect(page.getByLabel("Search keybind library").first()).toHaveValue("");
  await expect(page.locator(".local-save-status").getByText("Saved data cleared", { exact: true })).toBeVisible();
  const stored = await page.evaluate(() => window.localStorage.getItem("bindforge-nw:settings:v2"));
  expect(stored).toBeNull();
});

test("mobile filter drawer closes with Show results and restores focus", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile") && !testInfo.project.name.includes("tablet"), "Drawer behavior is for narrow viewports");
  const trigger = page.getByRole("button", { name: "Filters", exact: true });
  await trigger.click();
  const drawer = page.getByRole("dialog", { name: "Filters" });
  await expect(drawer).toBeVisible();
  await expect(page.getByRole("button", { name: "Close filters" }).last()).toBeFocused();
  await drawer.getByRole("button", { name: "Bard", exact: true }).click();
  await drawer.getByRole("button", { name: "Show results" }).click();
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("mobile filter drawer closes with Escape", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile") && !testInfo.project.name.includes("tablet"), "Drawer behavior is for narrow viewports");
  const trigger = page.getByRole("button", { name: "Filters", exact: true });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Filters" })).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("Settings closes with Escape and restores focus", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Settings", exact: true });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Settings" })).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("renders the route not-found recovery page", async ({ page }) => {
  await page.goto("/missing-bindforge-route");
  await expect(page.getByRole("heading", { name: "That BindForge page does not exist" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to BindForge" })).toBeVisible();
});

test("supports keyboard navigation with visible focus", async ({ page }) => {
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to keybind library" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#keybind-library")).toBeInViewport();
});

test("keeps essential controls inside the viewport", async ({ page }) => {
  const toolbarBox = await page.getByTestId("filter-toolbar").first().boundingBox();
  const viewport = page.viewportSize();
  expect(toolbarBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(toolbarBox!.x).toBeGreaterThanOrEqual(0);
  expect(toolbarBox!.x + toolbarBox!.width).toBeLessThanOrEqual(viewport!.width + 1);
  await expect(page.getByLabel("Search keybind library").first()).toBeVisible();
  const panel = await visibleFilterPanel(page);
  await expect(panel.getByLabel("Filter keybinds by action type")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("meets the axe accessibility baseline in dark and light themes", async ({ page }) => {
  await page.addScriptTag({ content: axe.source });
  await openSettings(page);
  async function violations() {
    return page.evaluate(async () => {
      const axeApi = (window as unknown as { axe: { run: (context?: unknown, options?: unknown) => Promise<{ violations: unknown[] }> } }).axe;
      const results = await axeApi.run(document, { rules: { region: { enabled: false } } });
      return results.violations;
    });
  }
  await page.getByLabel("Appearance").getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await violations()).toEqual([]);
  await page.getByLabel("Appearance").getByRole("button", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await violations()).toEqual([]);
});
