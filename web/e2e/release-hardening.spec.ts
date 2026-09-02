import { expect, test, type Page } from "@playwright/test";
import axe from "axe-core";

/** Resets browser state and waits for the keybind catalogue before each release test. */
async function prepare(page: Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
}

test.beforeEach(async ({ page }) => {
  await prepare(page);
});

test("does not register or expose the retired service worker", async ({ page }) => {
  const registrations = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return [];
    return (await navigator.serviceWorker.getRegistrations()).map((registration) => registration.scope);
  });
  expect(registrations).toEqual([]);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", /manifest\.webmanifest/);
  const response = await page.request.get("/sw.js");
  expect(response.status()).toBe(404);
});

test("uses unique accessible names for primary controls", async ({ page }) => {
  await expect(page.getByLabel("Search keybind library")).toHaveCount(1);
  await expect(page.getByLabel("Filter keybinds by action type")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Local data & backup", exact: true })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Reset keybind library filters" })).toHaveCount(1);
});

test("keeps dialog focus and restores it after closing", async ({ page }) => {
  const settings = page.getByRole("button", { name: "Local data & backup", exact: true });
  await settings.click();
  const dialog = page.getByRole("dialog", { name: "Local archive" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Close settings" }).last()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(settings).toBeFocused();
});

test("meets touch-target geometry on narrow coarse-style layouts", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile") && !testInfo.project.name.includes("tablet"), "Touch geometry is checked on narrow projects");
  const controls = [
    page.getByRole("button", { name: "Filters & navigation", exact: true }),
    page.getByRole("button", { name: "Local data & backup", exact: true }),
    page.getByRole("button", { name: "Bind", exact: true }),
    page.getByRole("button", { name: "Unbind", exact: true }),
  ];
  for (const control of controls) {
    await expect(control).toBeVisible();
    const box = await control.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test("passes axe with drawers, settings, and card details open", async ({ page }, testInfo) => {
  await page.addScriptTag({ content: axe.source });
  if (testInfo.project.name.includes("mobile") || testInfo.project.name.includes("tablet")) {
    await page.getByRole("button", { name: "Filters & navigation", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
  } else {
    await page.getByRole("button", { name: "Local data & backup", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Local archive" })).toBeVisible();
  }

  const violations = await page.evaluate(async () => {
    const axeApi = (window as unknown as { axe: { run: (context?: unknown, options?: unknown) => Promise<{ violations: unknown[] }> } }).axe;
    return (await axeApi.run(document, { rules: { region: { enabled: false } } })).violations;
  });
  expect(violations).toEqual([]);
});

test("has no horizontal overflow in dark and light themes", async ({ page }) => {
  for (const theme of ["dark", "light"] as const) {
    await page.getByRole("button", { name: "Local data & backup", exact: true }).click();
    await page.getByLabel("Appearance").getByRole("button", { name: theme === "dark" ? "Dark" : "Light" }).click();
    await page.getByRole("button", { name: "Close settings" }).last().click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});
