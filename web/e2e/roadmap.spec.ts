import { expect, test } from "@playwright/test";

async function openFiltersWhenCollapsed(page: import("@playwright/test").Page) {
  const toggle = page.getByRole("button", { name: "Filters & navigation", exact: true });
  if (await toggle.isVisible()) {
    if (await toggle.getAttribute("aria-expanded") !== "true") await toggle.click();
  }
}

function libraryView(page: import("@playwright/test").Page) {
  return page.getByTestId("secondary-controls").getByLabel("Library view");
}

async function openPackTools(page: import("@playwright/test").Page) {
  const toggle = page.getByRole("button", { name: /Collections & command packs/i });
  if (await toggle.getAttribute("aria-expanded") !== "true") await toggle.click();
  const panel = page.getByTestId("pack-tools-panel");
  await expect(panel).toBeVisible();
  return panel;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");
});

test("advanced browsing changes view, sorting, provenance, and collapsed groups", async ({ page }) => {
  await expect(libraryView(page)).toHaveValue("cards");
  await libraryView(page).selectOption("compact");
  await expect(page.locator("#keybind-library")).toHaveClass(/library-compact/);

  const secondary = page.getByTestId("secondary-controls");
  await secondary.getByLabel("Sort keybinds").selectOption("title");
  await secondary.getByLabel("Filter by provenance").selectOption("community-tested");
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");

  const firstGroup = page.locator(".bind-group").first();
  const collapse = firstGroup.getByRole("button", { name: "Collapse", exact: true });
  await collapse.click();
  await expect(firstGroup.getByRole("button", { name: "Expand", exact: true })).toHaveAttribute("aria-expanded", "false");
});

test("selection builds packs, local collections, and portable links", async ({ page, context }) => {
  const firstSelect = page.locator(".bind-card").first().getByText("Select", { exact: true });
  await firstSelect.click();
  await expect(page.getByText("1 selected", { exact: true })).toBeVisible();

  const panel = await openPackTools(page);
  await expect(panel.getByRole("button", { name: "Copy bind pack" })).toBeEnabled();
  await expect(panel.getByRole("button", { name: "Copy unbind pack" })).toBeEnabled();
  await expect(panel.getByRole("button", { name: "Download bind .txt" })).toBeEnabled();

  await panel.getByLabel("New collection name").fill("My raid setup");
  await panel.getByRole("button", { name: "Save selected" }).click();
  await expect(panel.getByLabel("Browse collection")).toHaveValue("My raid setup");

  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await panel.getByRole("button", { name: "Copy share link" }).click();
  await expect(page).toHaveURL(/collection=My\+raid\+setup/);
  await expect(page).toHaveURL(/preset=/);
  await expect(page.getByRole("status").filter({ hasText: "Copied" })).toBeVisible();
});

test("favourites, search highlighting, and safer replacement remain available", async ({ page }) => {
  const firstCard = page.locator(".bind-card").first();
  const favourite = firstCard.locator("button.favourite-button");
  await favourite.click();
  await expect(favourite).toHaveAttribute("aria-pressed", "true");

  const panel = await openPackTools(page);
  await panel.getByLabel("Browse collection").selectOption("favourites");
  await expect(page.getByTestId("result-count").first()).toHaveText("1 keybinds");

  await panel.getByLabel("Browse collection").selectOption("all");
  await page.getByLabel("Search keybind library").fill("invoke");
  await expect(page.locator("mark").first()).toBeVisible();

  await openFiltersWhenCollapsed(page);
  const keyField = page.getByLabel(/Key combination for/).first();
  await keyField.fill("w");
  const replacement = page.getByRole("button", { name: "Use next safer key" }).first();
  await replacement.click();
  await expect(keyField).not.toHaveValue("w");
});
