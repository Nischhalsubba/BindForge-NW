import { expect, test } from "@playwright/test";

function secondaryControls(page: import("@playwright/test").Page) {
  return page.locator('[data-testid="secondary-controls"]:visible').first();
}

function libraryView(page: import("@playwright/test").Page) {
  return secondaryControls(page).getByLabel("Library view");
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
  const experience = page.getByTestId("experience-workspace-summary");
  await experience.getByRole("button", { name: "Show more tools" }).click();
  await expect(secondaryControls(page)).toBeVisible();
});

test("advanced browsing changes view, sorting, provenance, and collapsed groups", async ({ page }) => {
  await expect(libraryView(page)).toHaveValue("cards");
  await libraryView(page).selectOption("compact");
  await expect(page.locator("#keybind-library:visible")).toHaveClass(/library-compact/);

  const secondary = secondaryControls(page);
  await secondary.getByLabel("Sort keybinds").selectOption("title");
  await secondary.getByLabel("Filter by provenance").selectOption("community-tested");
  await expect(page.getByTestId("result-count").first()).not.toHaveText("0 keybinds");

  const firstGroup = page.locator(".bind-group:visible").first();
  const collapse = firstGroup.getByRole("button", { name: "Collapse", exact: true });
  await collapse.click();
  await expect(firstGroup.getByRole("button", { name: "Expand", exact: true })).toHaveAttribute("aria-expanded", "false");
});

test("selection builds packs, local collections, and portable links", async ({ page, context }) => {
  const firstSelect = page.locator(".bind-card:visible").first().getByText("Select", { exact: true });
  await firstSelect.click();
  await expect(page.getByRole("button", { name: /Collections & command packs/i })).toContainText("1 selected");
  await expect(page.getByTestId("selection-tray")).toContainText("1 selected");

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
  const firstCard = page.locator(".bind-card:visible").first();
  const favourite = firstCard.locator("button.favourite-button");
  await favourite.click();
  await expect(favourite).toHaveAttribute("aria-pressed", "true");

  const panel = await openPackTools(page);
  await panel.getByLabel("Browse collection").selectOption("favourites");
  await expect(page.getByTestId("result-count").first()).toHaveText("1 keybinds");

  await panel.getByLabel("Browse collection").selectOption("all");
  await page.getByLabel("Search keybind library").first().fill("invoke");
  await expect(page.locator("mark").first()).toBeVisible();

  await libraryView(page).selectOption("compact");
  await expect(page.locator("#keybind-library:visible")).toHaveClass(/library-compact/);
  const visibleRow = page.getByTestId("compact-bind-row").first();

  await visibleRow.getByRole("button", { name: "Expand details", exact: true }).click();
  await expect(visibleRow.getByRole("button", { name: "Hide details", exact: true })).toBeVisible();

  const keyField = visibleRow.getByLabel(/Key combination for/);
  await keyField.fill("w");
  await expect(keyField).toHaveValue("w");
  await expect(visibleRow.getByTestId("compact-command-preview-output")).toContainText("/bind w ");

  const replacement = visibleRow.getByRole("button", { name: "Use next safer key" });
  await expect(replacement).toBeVisible();
  await replacement.click();
  await expect(keyField).not.toHaveValue("w");
});

test("personal keymap import drives real conflict detection and final pack review", async ({ page }) => {
  const firstCard = page.locator(".bind-card:visible").first();
  const keyField = firstCard.getByLabel(/Key combination for/);
  const keyValue = await keyField.inputValue();

  const personalToggle = page.getByRole("button", { name: /^My Setup/i });
  await personalToggle.click();
  const personalPanel = page.getByTestId("personal-keymap-panel");
  await expect(personalPanel).toBeVisible();
  await personalPanel.getByLabel("Paste personal Neverwinter binds").fill(`/bind ${keyValue} Existing_Player_Command activate`);
  await personalPanel.getByRole("button", { name: "Analyze pasted binds" }).click();
  await expect(personalPanel.getByRole("status").filter({ hasText: "1 active bind analyzed" })).toBeVisible();
  await expect(firstCard.locator(".key-status")).toContainText("Your imported keymap uses this key");

  await firstCard.getByText("Select", { exact: true }).click();
  const tray = page.getByTestId("selection-tray");
  await expect(tray).toBeVisible();
  await expect(tray).toContainText("1 item needs review");
  await tray.getByRole("button", { name: "Review pack", exact: true }).click();

  const review = page.getByTestId("pack-review");
  await expect(review).toBeVisible();
  await expect(review).toContainText("Existing_Player_Command");
  await expect(review.getByRole("button", { name: "Copy final bind pack" })).toBeEnabled();
  await expect(review.getByRole("button", { name: "Copy rollback pack" })).toBeEnabled();

  await review.getByRole("button", { name: /^Remove .+ from selected pack$/ }).click();
  await expect(page.getByTestId("selection-tray")).toHaveCount(0);
});
