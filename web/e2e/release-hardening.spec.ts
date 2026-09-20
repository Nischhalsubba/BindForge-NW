import { expect, test, type Page } from "@playwright/test";
import axe from "axe-core";

/** Resets browser state and waits for the keybind catalogue before each release test. */
async function prepare(page: Page) {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem("bindforge-nw:first-visit:v2", "seen");
  });
  await page.reload();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
  const experience = page.getByTestId("experience-workspace-summary");
  await experience.getByRole("button", { name: "Show more tools" }).click();
  await expect(page.getByTestId("secondary-controls")).toBeVisible();
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
  await expect(page.getByRole("button", { name: "Settings", exact: true })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Reset keybind library filters" })).toHaveCount(1);
});

test("keeps settings focus inside the dialog and restores it after closing", async ({ page }) => {
  const settings = page.getByRole("button", { name: "Settings", exact: true });
  await settings.click();
  const dialog = page.getByRole("dialog", { name: "Settings" });
  await expect(dialog).toBeVisible();
  const close = page.getByRole("button", { name: "Close settings" }).last();
  await expect(close).toBeFocused();
  await expect(page.getByRole("button", { name: "Dismiss settings" })).toHaveCount(0);

  await page.keyboard.press("Shift+Tab");
  const activeAfterShiftTab = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");
  expect(activeAfterShiftTab.length).toBeGreaterThan(0);
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(settings).toBeFocused();
});

test("preserves an explicit dark theme across appearance revision migration", async ({ page }) => {
  await page.evaluate(() => {
    const raw = window.localStorage.getItem("bindforge-nw:settings:v2");
    const stored = raw ? JSON.parse(raw) : { version: 3, preferences: {} };
    stored.version = 3;
    stored.preferences = { ...(stored.preferences ?? {}), theme: "dark" };
    window.localStorage.setItem("bindforge-nw:settings:v2", JSON.stringify(stored));
    window.localStorage.setItem("bindforge-nw:theme", "dark");
    window.localStorage.setItem("bindforge-nw:appearance-revision", "older-revision");
  });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme-choice", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("asks before deleting a profile", async ({ page }) => {
  await page.getByRole("link", { name: /My Setup/ }).click();
  await page.getByRole("button", { name: "Add profile" }).click();
  const deleteProfile = page.getByRole("button", { name: "Delete profile" });
  await expect(deleteProfile).toBeEnabled();

  const message = new Promise<string>((resolve) => {
    page.once("dialog", async (dialog) => {
      resolve(dialog.message());
      await dialog.dismiss();
    });
  });
  await deleteProfile.click();
  await expect(message).resolves.toContain("Delete profile");
});

test("asks before deleting a saved collection", async ({ page }) => {
  const firstCard = page.locator(".bind-card:visible").first();
  await firstCard.getByText("Select", { exact: true }).click();
  await page.getByRole("button", { name: /Collections & command packs/i }).click();
  await page.getByLabel("New collection name").fill("QA collection");
  await page.getByRole("button", { name: "Save selected" }).click();
  const deleteCollection = page.getByRole("button", { name: "Delete collection" });
  await expect(deleteCollection).toBeEnabled();

  const message = new Promise<string>((resolve) => {
    page.once("dialog", async (dialog) => {
      resolve(dialog.message());
      await dialog.dismiss();
    });
  });
  await deleteCollection.click();
  await expect(message).resolves.toContain("Delete collection");
});

test("meets touch-target geometry on narrow coarse-style layouts", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile") && !testInfo.project.name.includes("tablet"), "Touch geometry is checked on narrow projects");
  const controls = [
    page.getByRole("button", { name: "Filters", exact: true }),
    page.getByRole("button", { name: "Settings", exact: true }),
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

test("keeps functional microcopy readable and keyboard focus strongly visible", async ({ page }) => {
  const searchLabel = page.locator('label[for="keybind-library-search"] > span:visible').first();
  await expect(searchLabel).toBeVisible();
  const labelSize = await searchLabel.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(labelSize).toBeGreaterThanOrEqual(13);

  const search = page.getByLabel("Search keybind library");
  await search.focus();
  await expect(search).toBeFocused();
  const focusStyle = await search.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      width: Number.parseFloat(style.outlineWidth),
      style: style.outlineStyle,
      offset: Number.parseFloat(style.outlineOffset),
    };
  });
  expect(focusStyle.width).toBeGreaterThanOrEqual(3);
  expect(focusStyle.style).not.toBe("none");
  expect(focusStyle.offset).toBeGreaterThanOrEqual(3);
});

test("keeps guidance text and controls on the shared accessibility floor", async ({ page }) => {
  const summary = page.getByTestId("experience-workspace-summary");
  const action = summary.getByRole("button", { name: "Use Beginner View" });
  const actionBox = await action.boundingBox();
  expect(actionBox).not.toBeNull();
  expect(actionBox!.height).toBeGreaterThanOrEqual(44);
  const summaryFontSize = await summary.locator("p").evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(summaryFontSize).toBeGreaterThanOrEqual(13);
});

test("passes axe with drawers, settings, and card details open", async ({ page }, testInfo) => {
  await page.addScriptTag({ content: axe.source });
  if (testInfo.project.name.includes("mobile") || testInfo.project.name.includes("tablet")) {
    await page.getByRole("button", { name: "Filters", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
  } else {
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
  }

  const violations = await page.evaluate(async () => {
    const axeApi = (window as unknown as { axe: { run: (context?: unknown, options?: unknown) => Promise<{ violations: unknown[] }> } }).axe;
    return (await axeApi.run(document, { rules: { region: { enabled: false } } })).violations;
  });
  expect(violations).toEqual([]);
});

test("has no horizontal overflow in dark and light themes", async ({ page }) => {
  for (const theme of ["dark", "light"] as const) {
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await page.getByLabel("Appearance").getByRole("button", { name: theme === "dark" ? "Dark" : "Light" }).click();
    await page.getByRole("button", { name: "Close settings" }).last().click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});
