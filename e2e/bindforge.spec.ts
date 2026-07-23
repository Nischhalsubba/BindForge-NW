import { expect, test } from "@playwright/test";
import axe from "axe-core";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "BindForge NW" })).toBeVisible();
});

test("loads the keybind builder and filters presets", async ({ page }) => {
  const resultHeading = page.getByRole("heading", { name: /keybinds found/i });
  await expect(resultHeading).toBeVisible();
  const originalText = await resultHeading.textContent();

  await page.getByLabel("Search", { exact: true }).fill("invoke");
  await expect(resultHeading).not.toHaveText(originalText ?? "");
  await expect(page.locator(".bind-card")).toHaveCount(1);
  await expect(page.locator(".bind-card").first()).toContainText(/invoke/i);

  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByLabel("Search", { exact: true })).toHaveValue("");
});

test("class, difficulty, and action filters share provider state", async ({ page }) => {
  await page.getByRole("button", { name: "Bard", exact: true }).click();
  await expect(page.getByRole("button", { name: "Bard", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".active-filter-row")).toContainText("Bard");

  await page.getByRole("button", { name: "Advanced", exact: true }).click();
  await expect(page.getByRole("button", { name: "Advanced", exact: true })).toHaveAttribute("aria-pressed", "true");

  await page.getByLabel("Action type").selectOption({ label: "Bard Songs" });
  await expect(page.getByLabel("Action type")).toHaveValue("Bard Songs");
});

test("generates bind and unbind output from shared state", async ({ page }) => {
  const firstKey = page.locator(".bind-card .key-field input").first();
  const firstPreview = page.locator(".bind-card .command-preview code").first();

  await firstKey.fill("Left Ctrl + Shift + R");
  await expect(firstPreview).toContainText("/bind ctrl+shift+r");

  await page.getByRole("button", { name: "Unbind", exact: true }).click();
  await expect(firstPreview).toHaveText("/unbind ctrl+shift+r");

  await page.getByRole("button", { name: "Bind", exact: true }).click();
  await expect(firstPreview).toContainText("/bind ctrl+shift+r");
});

test("Command Lab and custom say builder generate normalized commands", async ({ page }) => {
  const commandLab = page.getByRole("region", { name: "Build your own command" });
  await commandLab.getByLabel("Key combination").fill("Alt + F2");
  await expect(commandLab.getByLabel("Generated custom command")).toContainText("/bind alt+f2");

  const customSay = page.getByRole("region", { name: "Create your own say message" });
  await customSay.getByLabel("Key combination").fill("Ctrl + F1");
  await customSay.getByLabel("Message").fill('Group\n"now"');
  await expect(customSay.locator("code")).toHaveText('/bind ctrl+f1 "say Group \'now\'"');
  await expect(customSay.getByRole("status")).toContainText("Line breaks were converted");
});

test("persists filters, edited keys, theme, and custom say values across reload", async ({ page }) => {
  await page.getByLabel("Search", { exact: true }).fill("bard");
  await page.getByLabel("Appearance").getByRole("button", { name: "Light" }).click();
  await page.locator(".bind-card .key-field input").first().fill("Ctrl+R");
  await page.getByRole("textbox", { name: "Message" }).fill("Group on me");
  await expect(page.getByText("Saved automatically")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Search", { exact: true })).toHaveValue("bard");
  await expect(page.getByLabel("Appearance").getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".bind-card .key-field input").first()).toHaveValue("Ctrl+R");
  await expect(page.getByRole("textbox", { name: "Message" })).toHaveValue("Group on me");
});

test("clear saved data resets state without immediately recreating storage", async ({ page }) => {
  await page.getByLabel("Search", { exact: true }).fill("bard");
  await expect(page.getByText("Saved automatically")).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Clear saved data" }).click();
  await expect(page.getByLabel("Search", { exact: true })).toHaveValue("");
  await expect(page.getByText("Saved data cleared")).toBeVisible();

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

test("meets the axe accessibility baseline", async ({ page }) => {
  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async () => {
    const axeApi = (window as unknown as { axe: { run: (context?: unknown, options?: unknown) => Promise<{ violations: unknown[] }> } }).axe;
    return axeApi.run(document, {
      rules: {
        region: { enabled: false },
      },
    });
  });
  expect(results.violations).toEqual([]);
});
