import { expect, test, type Locator, type Page } from "@playwright/test";

const FIRST_VISIT_KEY = "bindforge-nw:first-visit:v2";
const FIRST_VISIT_SESSION_KEY = "bindforge-nw:first-visit-presented:v2";
const FIRST_VISIT_TEST_RESET_KEY = "bindforge-test:contextual-tour-reset:v1";

async function openAsFirstVisit(page: Page) {
  await page.addInitScript(({ firstVisitKey, sessionKey, resetKey }) => {
    if (window.sessionStorage.getItem(resetKey) === "done") return;
    window.localStorage.removeItem(firstVisitKey);
    window.sessionStorage.removeItem(sessionKey);
    window.sessionStorage.setItem(resetKey, "done");
  }, { firstVisitKey: FIRST_VISIT_KEY, sessionKey: FIRST_VISIT_SESSION_KEY, resetKey: FIRST_VISIT_TEST_RESET_KEY });
  await page.goto("/");
  await expect(page.getByLabel("Search keybind library").first()).toBeEditable();
}

async function expectSpotlightOverlaps(spotlight: Locator, target: Locator) {
  await expect.poll(async () => {
    const [spotlightBox, targetBox] = await Promise.all([spotlight.boundingBox(), target.boundingBox()]);
    if (!spotlightBox || !targetBox) return false;
    const overlapX = Math.min(spotlightBox.x + spotlightBox.width, targetBox.x + targetBox.width)
      - Math.max(spotlightBox.x, targetBox.x);
    const overlapY = Math.min(spotlightBox.y + spotlightBox.height, targetBox.y + targetBox.height)
      - Math.max(spotlightBox.y, targetBox.y);
    return overlapX > 0 && overlapY > 0;
  }, { timeout: 2000 }).toBe(true);
}

test("first-run quick start uses anchored coachmarks on the task UI", async ({ page }) => {
  await openAsFirstVisit(page);

  const guide = page.getByTestId("first-visit-orientation");
  const spotlight = page.getByTestId("tour-spotlight");
  await expect(guide).toBeVisible();
  await expect(guide).toHaveAttribute("role", "dialog");
  await expect(guide).toHaveAttribute("aria-modal", "true");
  await expect(guide).toHaveAttribute("data-tour-layout", "coachmark");
  await expect(guide).not.toHaveAttribute("data-placement", "center");
  await expect(guide.getByText("1 of 3", { exact: true })).toBeVisible();
  await expectSpotlightOverlaps(spotlight, page.locator('[data-tour="keybind-search"]'));

  await guide.getByRole("button", { name: "Next" }).click();
  await expect(guide.getByText("2 of 3", { exact: true })).toBeVisible();
  await expectSpotlightOverlaps(spotlight, page.locator('[data-tour="keybind-card"]').first());

  await guide.getByRole("button", { name: "Next" }).click();
  await expect(guide.getByText("3 of 3", { exact: true })).toBeVisible();
  await expectSpotlightOverlaps(spotlight, page.locator('[data-tour="keybind-card"]').first());

  await guide.getByRole("button", { name: "Start in Beginner View" }).click();
  await expect(guide).toHaveCount(0);
});

test("quick-start coachmark placement remains inside the viewport on each responsive project", async ({ page }) => {
  await openAsFirstVisit(page);
  const guide = page.getByTestId("first-visit-orientation");

  for (let step = 0; step < 3; step += 1) {
    const box = await guide.boundingBox();
    expect(box).not.toBeNull();
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width + 1);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height + 1);
    if (step < 2) await guide.getByRole("button", { name: "Next" }).click();
  }
});

test("full-tour replay keeps keyboard controls contained and restores focus", async ({ page }) => {
  await page.addInitScript((key) => window.localStorage.setItem(key, "seen"), FIRST_VISIT_KEY);
  await page.goto("/");
  const help = page.locator("#bindforge-help:visible").first();
  await help.locator("summary").click();
  const replay = help.getByRole("button", { name: "Take the full tour" });
  await replay.focus();
  await replay.click();

  const guide = page.getByTestId("first-visit-orientation");
  await expect(guide).toBeVisible();
  await expect(guide.getByText("1 of 7", { exact: true })).toBeVisible();
  await expect(guide.getByRole("heading", { name: "Know where you are" })).toBeFocused();

  const close = guide.getByRole("button", { name: "Close guided tour" });
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(guide.getByRole("button", { name: "Next" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(guide).toHaveCount(0);
  await expect(replay).toBeFocused();
});
