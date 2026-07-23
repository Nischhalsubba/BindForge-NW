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
      const saved = JSON.parse(raw) as {
        filters?: { search?: string };
        customSay?: { message?: string };
      };
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

test("keeps the search and action toolbar visible and filters presets", async ({ page }) => {
  const toolbar = page.getByTestId("filter-toolbar").first();
  const resultCount = page.getByTestId("result-count").first();
  const originalText = await resultCount.textContent();

  await expect(toolbar).toBeVisible();
  await expect(page.getByLabel("Filter keybinds by action type").first()).toBeVisible();
  await page.getByLabel("Search keybind library").first().fill("invocation");
  await expect(resultCount).not.toHaveText(originalText ?? "");
  await expect(resultCount).not.toHaveText("0 keybinds");
  await expect(page.locator(".bind-card").first()).toBeVisible();

  await page.getByRole("button", { name: "Reset keybind library filters" }).click();
  await expect(page.getByLabel("Search keybind library").first()).toHaveValue("");
});

test("class, difficulty, and action filters share provider state", async ({ page }) => {
  await openFiltersWhenCollapsed(page);

  await page.getByRole("button", { name: "Bard", exact: true }).click();
  await expect(page.getByRole("button", { name: "Bard", exact: true })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Advanced", exact: true }).click();
  await expect(page.getByRole("button", { name: "Advanced", exact: true })).toHaveAttribute("aria-pressed", "true");

  await page.getByLabel("Filter keybinds by action type").first().selectOption({ label: "Bard Songs" });
  await expect(page.getByLabel("Filter keybinds by action type").first()).toHaveValue("Bard Songs");
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
});

test("generates bind and unbind output from shared state", async ({ page }) => {
  const firstCard = page.locator(".bind-card").first();
  const firstKey = firstCard.locator(".key-field input");
  const firstPreview = firstCard.locator(".command-preview code");

  await expect(firstKey).toBeVisible();
  await firstKey.fill("Left Ctrl + Shift + R");
  await expect(firstPreview).toContainText("/bind ctrl+shift+r");

  await page.getByRole("button", { name: "Unbind", exact: true }).click();
  await expect(firstPreview).toHaveText("/unbind ctrl+shift+r");

  await page.getByRole("button", { name: "Bind", exact: true }).click();
  await expect(firstPreview).toContainText("/bind ctrl+shift+r");
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
  const firstKey = page.locator(".bind-card .key-field input").first();
  await expect(firstKey).toBeVisible();
  await firstKey.fill("Ctrl+R");
  await page.getByLabel("Search keybind library").first().fill("bard");
  await openFiltersWhenCollapsed(page);
  await page.getByLabel("Appearance").getByRole("button", { name: "Light" }).click();
  await page.getByLabel("Custom say message").fill("Group on me");

  await waitForSavedSettings(page, { search: "bard", customMessage: "Group on me", theme: "light" });
  await expect(page.locator(".local-save-status").getByText("Saved automatically", { exact: true })).toBeVisible();

  await page.reload();
  await waitForHydration(page);
  await expect(page.getByLabel("Search keybind library").first()).toHaveValue("bard");
  await openFiltersWhenCollapsed(page);
  await expect(page.getByLabel("Appearance").getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Custom say message")).toHaveValue("Group on me");
  await expect(page.locator(".bind-card .key-field input").first()).toHaveValue("Ctrl+R");
});

test("clear saved data resets state without immediately recreating storage", async ({ page }) => {
  await page.getByLabel("Search keybind library").first().fill("bard");
  await openFiltersWhenCollapsed(page);
  await waitForSavedSettings(page, { search: "bard" });

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Clear saved data" }).click();
  await expect(page.getByLabel("Search keybind library").first()).toHaveValue("");
  await expect(page.locator(".local-save-status").getByText("Saved data cleared", { exact: true })).toBeVisible();

  const stored = await page.evaluate(() => window.localStorage.getItem("bindforge-nw:settings:v2"));
  expect(stored).toBeNull();
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

test("keeps the page canvas and essential controls inside the viewport", async ({ page }) => {
  const toolbarBox = await page.getByTestId("filter-toolbar").first().boundingBox();
  const shellBox = await page.locator(".app-shell").boundingBox();
  const headerBox = await page.locator(".app-header").boundingBox();
  const subNavBox = await page.locator(".sub-nav-frosted").boundingBox();
  const viewport = page.viewportSize();

  expect(toolbarBox).not.toBeNull();
  expect(shellBox).not.toBeNull();
  expect(headerBox).not.toBeNull();
  expect(subNavBox).not.toBeNull();
  expect(viewport).not.toBeNull();

  expect(shellBox!.x).toBeGreaterThanOrEqual(0);
  expect(shellBox!.width).toBeGreaterThanOrEqual(viewport!.width - 2);
  expect(headerBox!.width).toBeGreaterThanOrEqual(viewport!.width - 2);
  expect(subNavBox!.width).toBeGreaterThanOrEqual(viewport!.width - 2);
  expect(toolbarBox!.x).toBeGreaterThanOrEqual(0);
  expect(toolbarBox!.x + toolbarBox!.width).toBeLessThanOrEqual(viewport!.width + 1);

  const subNavTitle = page.locator(".sub-nav-title");
  await expect(subNavTitle).toBeVisible();
  const titleLines = await subNavTitle.evaluate((element) => Math.round(element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight)));
  expect(titleLines).toBeLessThanOrEqual(1);

  await expect(page.getByLabel("Search keybind library").first()).toBeVisible();
  await expect(page.getByLabel("Filter keybinds by action type").first()).toBeVisible();
});

test("meets the axe accessibility baseline in dark and light themes", async ({ page }) => {
  await page.addScriptTag({ content: axe.source });
  await openFiltersWhenCollapsed(page);

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
