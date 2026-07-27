import { expect, test } from "@playwright/test";

const productionUrl = "https://neverwinterkeybind.netlify.app";

async function openFiltersWhenCollapsed(page: import("@playwright/test").Page) {
  const toggle = page.getByRole("button", { name: "Filters", exact: true });
  if (await toggle.isVisible()) {
    const expanded = await toggle.getAttribute("aria-expanded");
    if (expanded !== "true") await toggle.click();
  }
}

test("production homepage supports the primary keybind journey", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveTitle(/BindForge NW/i);
  await expect(page.getByRole("heading", { level: 1, name: /BindForge NW/i })).toBeVisible();
  await expect(page.getByLabel("Search keybind library").first()).toBeEditable();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
  await expect(page.locator(".bind-card").first()).toBeVisible();

  await openFiltersWhenCollapsed(page);
  const bardFilter = page.getByRole("button", { name: "Bard", exact: true });
  await bardFilter.click();
  await expect(bardFilter).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");

  const search = page.getByLabel("Search keybind library").first();
  await search.fill("song");
  await expect(page.locator(".bind-card").first()).toBeVisible();
  await page.getByRole("button", { name: "Reset keybind library filters" }).click();
  await expect(search).toHaveValue("");
});

test("production metadata and crawl files use the Netlify canonical domain", async ({ page, request }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${productionUrl}/`);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `${productionUrl}/`);

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain(`Sitemap: ${productionUrl}/sitemap.xml`);

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain(`<loc>${productionUrl}/</loc>`);
});

test("production theme controls and keyboard skip link remain usable", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to keybind library" });
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page.locator("#keybind-library")).toBeInViewport();

  await openFiltersWhenCollapsed(page);
  const appearance = page.getByLabel("Appearance");
  await appearance.getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await appearance.getByRole("button", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
