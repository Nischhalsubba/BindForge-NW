import { expect, test, type Page } from "@playwright/test";

const FIRST_VISIT_KEY = "bindforge-nw:first-visit:v1";
const FIRST_VISIT_SESSION_KEY = "bindforge-nw:first-visit-presented:v1";
const FIRST_VISIT_TEST_RESET_KEY = "bindforge-test:first-visit-reset:v1";

async function openAsFirstVisit(page: Page) {
  await page.addInitScript(({ firstVisitKey, sessionKey, resetKey }) => {
    if (window.sessionStorage.getItem(resetKey) === "done") return;
    window.localStorage.removeItem(firstVisitKey);
    window.sessionStorage.removeItem(sessionKey);
    window.sessionStorage.setItem(resetKey, "done");
  }, { firstVisitKey: FIRST_VISIT_KEY, sessionKey: FIRST_VISIT_SESSION_KEY, resetKey: FIRST_VISIT_TEST_RESET_KEY });
  await page.goto("/");
}

test("first visit offers task-oriented paths and remembers dismissal", async ({ page }) => {
  await openAsFirstVisit(page);

  const guide = page.getByTestId("first-visit-orientation");
  await expect(guide).toBeVisible();
  await expect(guide.getByText("Find a keybind", { exact: true })).toBeVisible();
  await expect(guide.getByText("Build a keybind", { exact: true })).toBeVisible();
  await expect(guide.getByText("Advanced tools", { exact: true })).toBeVisible();

  await guide.getByRole("button", { name: "Dismiss first visit guide" }).click();
  await expect(guide).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId("first-visit-orientation")).toHaveCount(0);
});

test("first-visit task choice opens the matching existing workflow", async ({ page }) => {
  await openAsFirstVisit(page);

  const guide = page.getByTestId("first-visit-orientation");
  await guide.getByText("Build a keybind", { exact: true }).click();
  await expect(page).toHaveURL(/#compose-keybind$/);
  await expect(page.getByRole("tab", { name: "Compose your own keybind", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("first-visit-orientation")).toHaveCount(0);
});

test("help glossary remains available after onboarding is dismissed", async ({ page }) => {
  await page.addInitScript((firstVisitKey) => {
    window.localStorage.setItem(firstVisitKey, "seen");
  }, FIRST_VISIT_KEY);
  await page.goto("/");

  const help = page.locator("#bindforge-help:visible").first();
  await help.locator("summary").click();
  await expect(help).toContainText("Bind");
  await expect(help).toContainText("Unbind / rollback");
  await expect(help).toContainText("Community tested");
  await expect(help).toContainText("Experimental");
  await expect(help).toContainText("Personal keymap");
});
