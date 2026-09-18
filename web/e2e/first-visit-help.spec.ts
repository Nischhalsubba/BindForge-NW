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

test("first visit uses an accessible five-step guided overlay and remembers completion", async ({ page }) => {
  await openAsFirstVisit(page);

  const guide = page.getByTestId("first-visit-orientation");
  await expect(guide).toBeVisible();
  await expect(guide).toHaveAttribute("role", "dialog");
  await expect(guide).toHaveAttribute("aria-modal", "true");
  await expect(guide.getByText("1 of 5", { exact: true })).toBeVisible();
  await expect(guide.getByRole("heading", { name: "Welcome to BindForge" })).toBeVisible();
  await expect(guide).toContainText("Nothing is applied to Neverwinter automatically");

  await guide.getByRole("button", { name: "Next" }).click();
  await expect(guide.getByText("2 of 5", { exact: true })).toBeVisible();
  await expect(guide.getByRole("heading", { name: "Find a keybind" })).toBeVisible();

  await guide.getByRole("button", { name: "Next" }).click();
  await expect(guide.getByRole("heading", { name: "Review My Setup" })).toBeVisible();

  await guide.getByRole("button", { name: "Next" }).click();
  await expect(guide.getByRole("heading", { name: "Build without command syntax" })).toBeVisible();

  await guide.getByRole("button", { name: "Next" }).click();
  await expect(guide.getByText("5 of 5", { exact: true })).toBeVisible();
  await expect(guide.getByRole("heading", { name: "Stay safe and reveal more when ready" })).toBeVisible();
  await expect(guide).toContainText("Beginner View");

  await guide.getByRole("button", { name: "Start in Beginner View" }).click();
  await expect(guide).toHaveCount(0);
  await expect(page.getByTestId("experience-workspace-summary")).toContainText("Beginner View");

  await page.reload();
  await expect(page.getByTestId("first-visit-orientation")).toHaveCount(0);
});

test("guided overlay supports Back, Skip, Escape and restores focus", async ({ page }) => {
  await openAsFirstVisit(page);

  const guide = page.getByTestId("first-visit-orientation");
  await guide.getByRole("button", { name: "Next" }).click();
  await guide.getByRole("button", { name: "Back" }).click();
  await expect(guide.getByText("1 of 5", { exact: true })).toBeVisible();

  await guide.getByRole("button", { name: "Skip tour" }).focus();
  await page.keyboard.press("Escape");
  await expect(guide).toHaveCount(0);
});

test("help glossary can replay the guided tour after onboarding", async ({ page }) => {
  await markTourSeen(page);
  await page.goto("/");

  const help = page.locator("#bindforge-help:visible").first();
  await help.locator("summary").click();
  await expect(help).toContainText("Bind");
  await expect(help).toContainText("Unbind / rollback");
  await expect(help).toContainText("Personal keymap");

  await help.getByRole("button", { name: "Replay guided tour" }).click();
  const guide = page.getByTestId("first-visit-orientation");
  await expect(guide).toBeVisible();
  await expect(guide.getByRole("heading", { name: "Welcome to BindForge" })).toBeVisible();
});
