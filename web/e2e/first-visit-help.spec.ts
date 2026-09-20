import { expect, test, type Page } from "@playwright/test";

const FIRST_VISIT_KEY = "bindforge-nw:first-visit:v2";
const FIRST_VISIT_SESSION_KEY = "bindforge-nw:first-visit-presented:v2";
const FIRST_VISIT_TEST_RESET_KEY = "bindforge-test:first-visit-reset:v2";

async function openAsFirstVisit(page: Page) {
  await page.addInitScript(({ firstVisitKey, sessionKey, resetKey }) => {
    if (window.sessionStorage.getItem(resetKey) === "done") return;
    window.localStorage.removeItem(firstVisitKey);
    window.sessionStorage.removeItem(sessionKey);
    window.sessionStorage.setItem(resetKey, "done");
  }, { firstVisitKey: FIRST_VISIT_KEY, sessionKey: FIRST_VISIT_SESSION_KEY, resetKey: FIRST_VISIT_TEST_RESET_KEY });
  await page.goto("/");
}

async function markTourSeen(page: Page) {
  await page.addInitScript((firstVisitKey) => {
    window.localStorage.setItem(firstVisitKey, "seen");
  }, FIRST_VISIT_KEY);
}

test("first visit uses a focused three-step quick start and remembers completion", async ({ page }) => {
  await openAsFirstVisit(page);

  const guide = page.getByTestId("first-visit-orientation");
  await expect(guide).toBeVisible();
  await expect(guide).toHaveAttribute("role", "dialog");
  await expect(guide).toHaveAttribute("aria-modal", "true");
  await expect(guide.getByText("1 of 3", { exact: true })).toBeVisible();
  await expect(guide.getByRole("heading", { name: "Search for what you need" })).toBeVisible();

  await guide.getByRole("button", { name: "Next" }).click();
  await expect(guide.getByText("2 of 3", { exact: true })).toBeVisible();
  await expect(guide.getByRole("heading", { name: "Check the key and warning" })).toBeVisible();

  await guide.getByRole("button", { name: "Next" }).click();
  await expect(guide.getByText("3 of 3", { exact: true })).toBeVisible();
  await expect(guide.getByRole("heading", { name: "Copy, test, and keep rollback ready" })).toBeVisible();

  const closeButton = guide.getByRole("button", { name: "Close guided tour" });
  const closeBox = await closeButton.boundingBox();
  expect(closeBox).not.toBeNull();
  expect(closeBox!.height).toBeGreaterThanOrEqual(44);
  const introFontSize = await guide.locator("p").nth(2).evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(introFontSize).toBeGreaterThanOrEqual(13);

  await guide.getByRole("button", { name: "Start in Beginner View" }).click();
  await expect(guide).toHaveCount(0);
  await expect(page.getByTestId("experience-workspace-summary")).toContainText("Beginner View");

  await page.reload();
  await expect(page.getByTestId("first-visit-orientation")).toHaveCount(0);
});

test("quick-start overlay supports Back, Skip, and Escape", async ({ page }) => {
  await openAsFirstVisit(page);

  const guide = page.getByTestId("first-visit-orientation");
  await guide.getByRole("button", { name: "Next" }).click();
  await guide.getByRole("button", { name: "Back" }).click();
  await expect(guide.getByText("1 of 3", { exact: true })).toBeVisible();

  await guide.getByRole("button", { name: "Skip tour" }).focus();
  await page.keyboard.press("Escape");
  await expect(guide).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: /Keybinds/ })).toBeFocused();
});

test("help glossary can open the full seven-step guided tour", async ({ page }) => {
  await markTourSeen(page);
  await page.goto("/");

  const help = page.locator("#bindforge-help:visible").first();
  await help.locator("summary").click();
  await expect(help).toContainText("Bind");
  await expect(help).toContainText("Unbind / rollback");
  await expect(help).toContainText("Personal keymap");

  const replay = help.getByRole("button", { name: "Take the full tour" });
  await replay.click();
  const guide = page.getByTestId("first-visit-orientation");
  await expect(guide).toBeVisible();
  await expect(guide.getByText("1 of 7", { exact: true })).toBeVisible();
  await expect(guide.getByRole("heading", { name: "Know where you are" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(guide).toHaveCount(0);
  await expect(replay).toBeFocused();
});
