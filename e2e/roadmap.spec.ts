import { expect, test } from "@playwright/test";

async function openFiltersWhenCollapsed(page: import("@playwright/test").Page) {
  const toggle = page.getByRole("button", { name: "Filters", exact: true });
  if (await toggle.isVisible()) {
    if (await toggle.getAttribute("aria-expanded") !== "true") await toggle.click();
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("advanced browsing changes view, sorting, provenance, and collapsed groups", async ({ page }) => {
  await expect(page.getByLabel("Library view")).toHaveValue("cards");
  await page.getByLabel("Library view").selectOption("compact");
  await expect(page.locator("#keybind-library")).toHaveClass(/library-compact/);

  await page.getByLabel("Sort keybinds").selectOption("title");
  await page.getByLabel("Filter by provenance").selectOption("community-tested");
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");

  const collapse = page.getByRole("button", { name: "Collapse" }).first();
  await collapse.click();
  await expect(collapse).toHaveText("Expand");
});

test("selection builds packs, local collections, and portable links", async ({ page, context }) => {
  const firstSelect = page.getByText("Select", { exact: true }).first();
  await firstSelect.click();
  await expect(page.getByText("1 selected", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy bind pack" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Copy unbind pack" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Download bind .txt" })).toBeEnabled();

  await page.getByLabel("New collection name").fill("My raid setup");
  await page.getByRole("button", { name: "Save selected to collection" }).click();
  await expect(page.getByLabel("Browse collection")).toHaveValue("My raid setup");

  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Copy portable link" }).click();
  await expect(page).toHaveURL(/collection=My\+raid\+setup/);
  await expect(page).toHaveURL(/ids=/);
  await expect(page.getByRole("status").filter({ hasText: "Copied" })).toBeVisible();
});

test("favourites, search highlighting, and safer replacement remain available", async ({ page }) => {
  const favourite = page.getByRole("button", { name: /Add .* to favourites/ }).first();
  await favourite.click();
  await expect(favourite).toHaveAttribute("aria-pressed", "true");

  await page.getByLabel("Browse collection").selectOption("favourites");
  await expect(page.getByTestId("result-count").first()).toHaveText("1 keybinds");

  await page.getByLabel("Browse collection").selectOption("all");
  await page.getByLabel("Search keybind library").fill("invoke");
  await expect(page.locator("mark").first()).toBeVisible();

  await openFiltersWhenCollapsed(page);
  const keyField = page.getByLabel(/Suggested key combination/).first();
  await keyField.fill("w");
  const replacement = page.getByRole("button", { name: "Use next safer key" }).first();
  await replacement.click();
  await expect(keyField).not.toHaveValue("w");
});
