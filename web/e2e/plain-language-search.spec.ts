import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem("bindforge-nw:first-visit:v2", "seen");
  });
  await page.reload();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
});

test("plain-language search matches abbreviations and separate intent words", async ({ page }) => {
  const search = page.getByLabel("Search keybind library").first();
  await search.fill("barb cancel");
  await expect(page.getByRole("heading", { name: "Barbarian DPS Animation Cancel: Right Click" })).toBeVisible();

  await search.fill("left mouse fighter");
  await expect(page.getByRole("heading", { name: "Fighter DPS Animation Cancel: Left Click" })).toBeVisible();
});

test("plain-language search tolerates a small typo and ranks the intended result", async ({ page }) => {
  const search = page.getByLabel("Search keybind library").first();
  await search.fill("figther cancel");
  const visibleCards = page.locator(".bind-card:visible");
  await expect(visibleCards.first()).toContainText("Fighter DPS Animation Cancel: Left Click");
});

test("no-result search offers catalogue-backed recovery suggestions", async ({ page }) => {
  const search = page.getByLabel("Search keybind library").first();
  await search.fill("zzzzzz");
  const empty = page.getByTestId("search-empty-state");
  await expect(empty).toBeVisible();
  await expect(empty).toContainText("common abbreviations and small typos");
  const suggestion = empty.getByRole("button", { name: /^Try “.+”$/ }).first();
  await expect(suggestion).toBeVisible();
  await suggestion.click();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
});
