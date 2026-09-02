import { expect, test, type Page } from "@playwright/test";

async function waitForHydration(page: Page) {
  await expect(page.getByLabel("Search keybind library").first()).toBeEditable();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
}

async function openSettings(page: Page) {
  await page.getByRole("button", { name: "Local data & backup", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Local archive" })).toBeVisible();
}

async function waitForPreferences(page: Page, expected: Record<string, unknown>) {
  await page.waitForFunction((values) => {
    const raw = window.localStorage.getItem("bindforge-nw:settings:v2");
    if (!raw) return false;
    try {
      const stored = JSON.parse(raw) as { version?: number; preferences?: Record<string, unknown> };
      if (stored.version !== 3 || !stored.preferences) return false;
      return Object.entries(values).every(([key, value]) => stored.preferences?.[key] === value);
    } catch {
      return false;
    }
  }, expected);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await waitForHydration(page);
});

test("starts new users with accessible Simple-mode preferences", async ({ page }) => {
  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-experience", "simple");
  await expect(root).toHaveAttribute("data-text-size", "default");
  await expect(root).toHaveAttribute("data-density", "standard");
  await expect(root).toHaveAttribute("data-contrast", "standard");
  await expect(root).toHaveAttribute("data-large-controls", "false");
  await expect(root).toHaveAttribute("data-motion", "system");
  await expect(root).toHaveAttribute("data-explain-terms", "true");
  await expect(root).toHaveAttribute("data-confirm-risky", "true");
  await expect(root).toHaveAttribute("data-show-raw-commands", "false");
});

test("persists accessibility, experience, and appearance preferences", async ({ page }) => {
  await openSettings(page);
  await page.getByLabel("Appearance").getByRole("button", { name: "Dark" }).click();
  const experience = page.getByRole("group", { name: "Experience level" });
  await experience.getByRole("button", { name: /Advanced/ }).click();
  const textSize = page.getByRole("group", { name: "Text size" });
  await textSize.getByRole("button", { name: /Large/ }).click();
  const density = page.getByRole("group", { name: "Interface density" });
  await density.getByRole("button", { name: /Comfortable/ }).click();
  const contrast = page.getByRole("group", { name: "Contrast" });
  await contrast.getByRole("button", { name: /High contrast/ }).click();
  await page.getByRole("checkbox", { name: /Larger controls/ }).check();
  await page.getByRole("checkbox", { name: /Reduce motion/ }).check();
  await page.getByRole("checkbox", { name: /Show raw commands/ }).check();
  await page.getByRole("button", { name: "Close settings" }).click();

  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(root).toHaveAttribute("data-experience", "advanced");
  await expect(root).toHaveAttribute("data-text-size", "large");
  await expect(root).toHaveAttribute("data-density", "comfortable");
  await expect(root).toHaveAttribute("data-contrast", "high");
  await expect(root).toHaveAttribute("data-large-controls", "true");
  await expect(root).toHaveAttribute("data-motion", "reduced");
  await expect(root).toHaveAttribute("data-show-raw-commands", "true");
  await waitForPreferences(page, {
    experience: "advanced",
    theme: "dark",
    textSize: "large",
    density: "comfortable",
    contrast: "high",
    largeControls: true,
    reducedMotion: true,
    showRawCommands: true,
  });

  await page.reload();
  await waitForHydration(page);
  await expect(page.locator("html")).toHaveAttribute("data-experience", "advanced");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await openSettings(page);
  await expect(page.getByRole("group", { name: "Experience level" }).getByRole("button", { name: /Advanced/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("checkbox", { name: /Reduce motion/ })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: /Larger controls/ })).toBeChecked();
});

test("migrates existing v2 settings without surprising experienced users", async ({ page }) => {
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem("bindforge-nw:theme", "dark");
    window.localStorage.setItem("bindforge-nw:settings:v2", JSON.stringify({
      version: 2,
      savedAt: "2026-08-01T00:00:00.000Z",
      keys: { "vip-bank": "ctrl+r" },
      filters: { className: "All", actionType: "All", difficulty: "All", search: "bard", mode: "bind" },
      commandLab: { key: "ctrl+b", extraText: "Vipaction_Bankvendor activate", keySearch: "", keyCategory: "All", commandSearch: "", commandCategory: "All", showRisky: false },
      customSay: { key: "f2", message: "Group on me" },
    }));
  });
  await page.reload();
  await waitForHydration(page);

  await expect(page.getByLabel("Search keybind library").first()).toHaveValue("bard");
  await expect(page.locator("html")).toHaveAttribute("data-experience", "standard");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await openSettings(page);
  await expect(page.getByRole("group", { name: "Experience level" }).getByRole("button", { name: /Standard/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("checkbox", { name: /Explain technical terms/ })).not.toBeChecked();
  await expect(page.getByRole("checkbox", { name: /Show raw commands/ })).toBeChecked();

  const normalized = await page.evaluate(() => JSON.parse(window.localStorage.getItem("bindforge-nw:settings:v2") ?? "{}"));
  expect(normalized.version).toBe(3);
  expect(normalized.preferences.experience).toBe("standard");
  expect(normalized.preferences.theme).toBe("dark");
  expect(normalized.customSay.message).toBe("Group on me");
});

test("large-control preference keeps primary controls comfortably tappable", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile") && !testInfo.project.name.includes("tablet"), "Touch geometry is verified on narrow projects");
  await openSettings(page);
  await page.getByRole("checkbox", { name: /Larger controls/ }).check();
  await page.getByRole("button", { name: "Close settings" }).click();
  const copy = page.locator(".bind-card:visible").first().getByRole("button", { name: /^Copy/ }).first();
  const box = await copy.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(52);
});
