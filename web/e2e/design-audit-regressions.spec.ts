import { expect, test, type Locator, type Page } from "@playwright/test";

async function ready(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("filter-toolbar")).toBeVisible();
  await expect(page.getByTestId("result-count")).not.toHaveText("0 keybinds");
}

async function setTheme(page: Page, theme: "Light" | "Dark") {
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Appearance").getByRole("button", { name: theme }).click();
  await page.getByRole("button", { name: "Close settings" }).click();
}

async function contrast(locator: Locator) {
  return locator.evaluate((node) => {
    const style = getComputedStyle(node);
    function luminance(color: string) {
      const channels = (color.match(/[0-9.]+/g) ?? []).slice(0, 3).map(Number);
      const values = channels.map((n) => {
        const c = n / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
    }
    const foreground = luminance(style.color);
    const background = luminance(style.backgroundColor);
    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  });
}

test("selected filter and copy buttons have AA contrast in both themes", async ({ page }) => {
  await ready(page);
  await page.getByTestId("experience-workspace-summary").getByRole("button", { name: "Show more tools" }).click();
  for (const selected of ["Dark", "Light"] as const) {
    await setTheme(page, selected);
    const openFilters = page.getByRole("button", { name: "Filters", exact: true });
    if (await openFilters.isVisible()) await openFilters.click();
    const easy = page.getByRole("button", { name: "Easy", exact: true });
    await easy.click();
    expect(await contrast(easy)).toBeGreaterThanOrEqual(4.5);
    if (await page.getByRole("dialog", { name: "Filters" }).isVisible()) {
      await page.getByRole("button", { name: "Show results" }).click();
    }
    await page.getByLabel("Library view").selectOption("compact");
    const copy = page.locator('[data-testid="compact-bind-row"] button[class*="copyButton"]:not([disabled])').first();
    await expect(copy).toBeVisible();
    expect(await contrast(copy)).toBeGreaterThanOrEqual(4.5);
    await page.getByRole("link", { name: /^Build/ }).click();
    await page.getByLabel("Key for combined Neverwinter bind").fill("f1");
    await page.locator('button[class*="actionRow"]').first().click();
    const builderCopy = page.locator('button[class*="copyButton"]:not([disabled])').last();
    await expect(builderCopy).toBeVisible();
    expect(await contrast(builderCopy)).toBeGreaterThanOrEqual(4.5);
    await page.getByRole("link", { name: /^Keybinds/ }).click();
  }
});

test("filter drawer loops focus and cannot remain invisibly open after resize", async ({ page }, info) => {
  test.skip(!/mobile|tablet/.test(info.project.name), "Mobile and tablet drawer only");
  await ready(page);
  const trigger = page.getByRole("button", { name: "Filters", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Filters" });
  await expect(dialog).toBeVisible();
  await expect(page.locator(".app-shell")).toHaveAttribute("inert", "");
  await expect(page.getByRole("button", { name: "Dismiss filters" })).toHaveAttribute("tabindex", "-1");
  const first = dialog.getByRole("button", { name: "Reset all" });
  const last = dialog.getByRole("button", { name: "Show results" });
  await first.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(last).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".app-shell")).not.toHaveAttribute("inert", "");
});

test("command palette contains keyboard focus and restores the trigger", async ({ page }) => {
  await ready(page);
  const trigger = page.getByRole("button", { name: "Commands", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();
  await expect(page.locator(".app-shell")).toHaveAttribute("inert", "");
  await expect(page.getByRole("button", { name: "Dismiss command palette" })).toHaveAttribute("tabindex", "-1");
  const close = dialog.getByRole("button", { name: "Close command palette" });
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button").last()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator(".app-shell")).not.toHaveAttribute("inert", "");
});

test("Extra large text increases action labels and preserves builder access", async ({ page }) => {
  await ready(page);
  await page.getByRole("link", { name: /^Build/ }).click();
  const label = page.locator('button[class*="actionRow"] strong').first();
  const before = await label.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("group", { name: "Text size" }).getByRole("button", { name: "Extra large" }).click();
  await page.getByRole("button", { name: "Close settings" }).click();
  const after = await label.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  expect(before).toBeGreaterThanOrEqual(13);
  expect(after).toBeGreaterThanOrEqual(before * 1.2);
});

test("mobile first screen prioritizes task entry over decorative content", async ({ page }, info) => {
  test.skip(!info.project.name.includes("mobile"), "Phone viewport only");
  await ready(page);
  await expect(page.locator(".hero-plate")).toBeHidden();
  await expect(page.getByRole("link", { name: /Browse keybinds/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Settings", exact: true })).toBeVisible();
});

test("keyboard map offers directional controls and a focusable scroll area", async ({ page }) => {
  await ready(page);
  await page.getByRole("link", { name: /My Setup/ }).click();
  const keyboard = page.getByTestId("visual-keyboard-map");
  await expect(keyboard.getByRole("button", { name: "Scroll keyboard right" })).toBeVisible();
  await expect(keyboard.getByRole("button", { name: "Scroll keyboard left" })).toBeVisible();
  await expect(keyboard.getByRole("region", { name: /Visual keyboard/ })).toHaveAttribute("tabindex", "0");
});

test("reduced and normal motion keep navigation usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await expect(page.getByRole("button", { name: "Commands", exact: true })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.getByRole("button", { name: "Commands", exact: true })).toBeVisible();
});
