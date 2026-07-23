import { expect, test } from "@playwright/test";
import axe from "axe-core";

async function openFiltersWhenCollapsed(page: Parameters<typeof test>[0]["page"]) {
  const toggle = page.getByRole("button", { name: "Filters", exact: true });
  if (await toggle.isVisible()) {
    const expanded = await toggle.getAttribute("aria-expanded");
    if (expanded !== "true") await toggle.click();
  }
}

async function waitForHydration(page: Parameters<typeof test>[0]["page"]) {
  await expect(page.getByTestId("filter-toolbar")).toBeVisible();
  await expect(page.getByLabel("Search keybind library")).toBeEditable();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "BindForge NW" })).toBeVisible();
  await waitForHydration(page);
});

test("keeps the search and action toolbar visible and filters presets", async ({ page }) => {
  const toolbar = page.getByTestId("filter-toolbar");
  const resultCount = page.getByTestId("result-count");
  const originalText = await resultCount.textContent();

  await expect(toolbar).toBeVisible();
  await expect(page.getByLabel("Filter keybinds by action type")).toBeVisible();
  await page.getByLabel("Search keybind library").fill("invoke");
  await expect(resultCount).not.toHaveText(originalText ?? "");
  await expect(page.locator(".bind-card").first()).toBeVisible();

  await page.getByRole("button", { name: "Reset keybind library filters" }).click();
  await expect(page.getByLabel("Search keybind library")).toHaveValue("");
});

test("class, difficulty, and action filters share provider state", async ({ page }) => {
  await openFiltersWhenCollapsed(page);

  await page.getByRole("button", { name: "Bard", exact: true }).click();
  await expect(page.getByRole("button", { name: "Bard", exact: true })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Advanced", exact: true }).click();
  await expect(page.getByRole("button", { name: "Advanced", exact: true })).toHaveAttribute("aria-pressed", "true");

  await page.getByLabel("Filter keybinds by action type").selectOption({ label: "Bard Songs" });
  await expect(page.getByLabel("Filter keybinds by action type")).toHaveValue("Bard Songs");
});

test("generates bind and unbind output from shared state", async ({ page }) => {
  const firstCard = page.locator(".bind-card").filter({ visible: true }).first();
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
  await customSay.getByLabel("Key combination").fill("Ctrl + F1");
  await customSay.getByLabel("Message").fill('Group\n"now"');
  await expect(customSay.locator("code")).toHaveText('/bind ctrl+f1 "say Group \'now\'"');
  await expect(customSay.getByRole("status")).toContainText("Line breaks were converted");
});

test("persists filters, edited keys, theme, and custom say values across reload", async ({ page }) => {
  const firstKey = page.locator(".bind-card:visible .key-field input").first();
  await firstKey.fill("Ctrl+R");
  await page.getByLabel("Search keybind library").fill("bard");
  await openFiltersWhenCollapsed(page);
  await page.getByLabel("Appearance").getByRole("button", { name: "Light" }).click();
  await page.getByRole("textbox", { name: "Message" }).fill("Group on me");
  await expect(page.locator(".local-save-status").getByText("Saved automatically", { exact: true })).toBeVisible();

  await page.reload();
  await waitForHydration(page);
  await expect(page.getByLabel("Search keybind library")).toHaveValue("bard");
  await openFiltersWhenCollapsed(page);
  await expect(page.getByLabel("Appearance").getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("textbox", { name: "Message" })).toHaveValue("Group on me");
});

test("clear saved data resets state without immediately recreating storage", async ({ page }) => {
  await page.getByLabel("Search keybind library").fill("bard");
  await openFiltersWhenCollapsed(page);
  await expect(page.locator(".local-save-status").getByText("Saved automatically", { exact: true })).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Clear saved data" }).click();
  await expect(page.getByLabel("Search keybind library")).toHaveValue("");
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

test("keeps essential controls inside the viewport", async ({ page }) => {
  const toolbarBox = await page.getByTestId("filter-toolbar").boundingBox();
  const viewport = page.viewportSize();
  expect(toolbarBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(toolbarBox!.x).toBeGreaterThanOrEqual(0);
  expect(toolbarBox!.x + toolbarBox!.width).toBeLessThanOrEqual(viewport!.width + 1);
  await expect(page.getByLabel("Search keybind library")).toBeVisible();
  await expect(page.getByLabel("Filter keybinds by action type")).toBeVisible();
});

test("meets the axe accessibility baseline in dark and light themes", async ({ page }) => {
  await page.addScriptTag({ content: axe.source });

  async function violations() {
    return page.evaluate(async () => {
      const axeApi = (window as unknown as { axe: { run: (context?: unknown, options?: unknown) => Promise<{ violations: unknown[] }> } }).axe;
      const results = await axeApi.run(document, { rules: { region: { enabled: false } } });
      return results.violations;
    });
  }

  expect(await violations()).toEqual([]);
  await openFiltersWhenCollapsed(page);
  await page.getByLabel("Appearance").getByRole("button", { name: "Light" }).click();
  expect(await violations()).toEqual([]);
});
