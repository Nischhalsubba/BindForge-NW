import { expect, test } from "@playwright/test";
import type { Page, TestInfo } from "@playwright/test";
import axe from "axe-core";

const productionUrl = process.env.PRODUCTION_URL ?? "https://neverwinterkeybind.netlify.app";
const normalizeUrl = (value: string | null) => value?.replace(/\/$/, "") ?? "";

async function waitForLibrary(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: /BindForge NW/i })).toBeVisible();
  await expect(page.getByLabel("Search keybind library").first()).toBeEditable();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
  await expect(page.locator(".bind-card").first()).toBeVisible();
}

async function openFiltersWhenCollapsed(page: Page) {
  const toggle = page.getByRole("button", { name: "Filters", exact: true });
  if (await toggle.isVisible()) {
    const expanded = await toggle.getAttribute("aria-expanded");
    if (expanded !== "true") await toggle.click();
  }
}

async function openSettings(page: Page) {
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
}

async function capture(page: Page, testInfo: TestInfo, name: string) {
  await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
}

function attachRuntimeFailureGuards(page: Page) {
  const failures: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (url.startsWith(productionUrl) && !url.includes("favicon")) failures.push(`requestfailed: ${url}`);
  });
  return failures;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await waitForLibrary(page);
});

test("production primary journey covers cards, compact, details, filtering, and screenshots", async ({ page }, testInfo) => {
  const failures = attachRuntimeFailureGuards(page);
  const search = page.getByLabel("Search keybind library").first();
  await search.fill("song");
  await expect(page.locator(".bind-card").first()).toBeVisible();

  const card = page.locator(".bind-card").first();
  await card.getByRole("button", { name: "Details", exact: true }).click();
  await expect(card.locator(".command-preview")).toBeVisible();
  await capture(page, testInfo, `${testInfo.project.name}-cards-details`);

  await page.getByLabel("View").selectOption("compact");
  await expect(page.getByTestId("compact-bind-row").first()).toBeVisible();
  await capture(page, testInfo, `${testInfo.project.name}-compact`);

  await page.getByLabel("View").selectOption("cards");
  await page.getByRole("button", { name: "Reset keybind library filters" }).click();
  await expect(search).toHaveValue("");
  expect(failures).toEqual([]);
});

test("production filters, settings, themes, persistence, and keyboard recovery remain usable", async ({ page }, testInfo) => {
  await openFiltersWhenCollapsed(page);
  const bardFilter = page.getByRole("button", { name: "Bard", exact: true });
  await bardFilter.click();
  await expect(bardFilter).toHaveAttribute("aria-pressed", "true");

  await openSettings(page);
  const appearance = page.getByLabel("Appearance");
  await appearance.getByRole("button", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await capture(page, testInfo, `${testInfo.project.name}-settings-light`);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Settings", exact: true })).toBeFocused();

  await page.getByLabel("Search keybind library").first().fill("bard");
  await page.reload();
  await waitForLibrary(page);
  await expect(page.getByLabel("Search keybind library").first()).toHaveValue("bard");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.locator("body").click({ position: { x: 1, y: 1 } });
  await page.keyboard.press("Home");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to keybind library" });
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page.locator("#keybind-library")).toBeFocused();
});

test("production collections and command-pack controls remain reachable", async ({ page }, testInfo) => {
  const firstCard = page.locator(".bind-card").first();
  await firstCard.getByText("Select", { exact: true }).click();
  await expect(firstCard.locator('input[type="checkbox"]')).toBeChecked();

  const packTools = page.getByText("Collections & command packs", { exact: true });
  await packTools.click();
  await expect(page.getByRole("button", { name: /Copy bind pack/i })).toBeEnabled();
  await expect(page.getByRole("button", { name: /Download bind/i })).toBeEnabled();
  await capture(page, testInfo, `${testInfo.project.name}-command-pack`);
});

test("production accessibility, overflow, touch targets, and retired PWA state pass", async ({ page }, testInfo) => {
  await page.addScriptTag({ content: axe.source });
  const violations = await page.evaluate(async () => {
    const api = (window as unknown as { axe: { run: (context?: unknown, options?: unknown) => Promise<{ violations: unknown[] }> } }).axe;
    return (await api.run(document, { rules: { region: { enabled: false } } })).violations;
  });
  expect(violations).toEqual([]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  if (testInfo.project.name.includes("mobile") || testInfo.project.name.includes("tablet")) {
    for (const locator of [page.getByRole("button", { name: "Filters", exact: true }), page.getByRole("button", { name: "Settings", exact: true })]) {
      const box = await locator.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  }

  const registrations = await page.evaluate(async () => "serviceWorker" in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 0);
  expect(registrations).toBe(0);
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(0);
  const retiredWorker = await page.request.get("/sw.js");
  expect(retiredWorker.status()).toBe(404);
});

test("production metadata, crawler files, social image, and recovery route are valid", async ({ page, request }) => {
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  const openGraphUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
  const openGraphImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(normalizeUrl(canonical)).toBe(normalizeUrl(productionUrl));
  expect(normalizeUrl(openGraphUrl)).toBe(normalizeUrl(productionUrl));
  expect(openGraphImage).toMatch(/^https:\/\//);

  const image = await request.get(openGraphImage!);
  expect(image.ok()).toBeTruthy();
  expect(image.headers()["content-type"]).toContain("image/png");

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain(`Sitemap: ${normalizeUrl(productionUrl)}/sitemap.xml`);

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain(`<loc>${normalizeUrl(productionUrl)}/</loc>`);

  await page.goto("/missing-bindforge-route");
  await expect(page.getByRole("heading", { name: "That BindForge page does not exist" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to BindForge" })).toBeVisible();
});
