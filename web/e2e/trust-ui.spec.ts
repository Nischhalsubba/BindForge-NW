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

test("cards expose verification confidence before details are opened", async ({ page }) => {
  const firstCard = page.locator(".bind-card:visible").first();
  const trustBadge = firstCard.locator(".trust-pill");
  await expect(trustBadge).toBeVisible();
  await expect(trustBadge).toHaveAttribute("data-trust", /verified|community-tested|experimental/);
  await expect(trustBadge).toHaveAttribute("aria-label", /Verification:/);
});

test("experimental Fighter bind stays visibly experimental and explains its evidence", async ({ page }) => {
  const search = page.getByLabel("Search keybind library").first();
  await search.fill("fighter cancel");

  const card = page.locator(".bind-card:visible").filter({ hasText: "Fighter DPS Animation Cancel: Left Click" }).first();
  await expect(card.locator(".trust-pill")).toHaveText(/Experimental/);
  await expect(card.locator(".trust-pill")).toHaveAttribute("data-trust", "experimental");

  await card.getByRole("button", { name: "Details", exact: true }).click();
  const trustSummary = card.getByTestId("preset-trust-summary");
  await expect(trustSummary).toBeVisible();
  await expect(trustSummary).toContainText("Experimental");
  await expect(trustSummary).toContainText(/Test carefully/i);
  await expect(card.getByLabel("Preset evidence and verification")).toContainText(/User submitted/i);
});


test("catalogue trust settings reconcile live cmdlist output without auto-verifying it", async ({ page }) => {
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Catalogue trust" })).toBeVisible();

  const input = page.getByLabel("Paste Neverwinter cmdlist output");
  await input.fill("/bind Bind a key to a command\n/new_live_command Newly observed");
  await page.getByRole("button", { name: "Compare with BindForge" }).click();

  await expect(page.getByText(/research candidates/i).last()).toBeVisible();
  await page.getByText(/Research candidates/).last().click();
  await expect(page.getByText("/new_live_command", { exact: true })).toBeVisible();
});
