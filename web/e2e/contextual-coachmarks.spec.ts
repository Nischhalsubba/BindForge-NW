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
  const [spotlightBox, targetBox] = await Promise.all([spotlight.boundingBox(), target.boundingBox()]);
  expect(spotlightBox).not.toBeNull();
  expect(targetBox).not.toBeNull();
  const overlapX = Math.min(spotlightBox!.x + spotlightBox!.width, targetBox!.x + targetBox!.width)
    - Math.max(spotlightBox!.x, targetBox!.x);
  const overlapY = Math.min(spotlightBox!.y + spotlightBox!.height, targetBox!.y + targetBox!.height)
    - Math.max(spotlightBox!.y, targetBox!.y);
  expect(overlapX).toBeGreaterThan(0);
  expect(overlapY).toBeGreaterThan(0);
}

test("first-run walkthrough uses anchored coachmarks on real UI instead of a centered popup", async ({ page }) => {
  await openAsFirstVisit(page);

  const guide = page.getByTestId("first-visit-orientation");
  const spotlight = page.getByTestId("tour-spotlight");
  await expect(guide).toBeVisible();
  await expect(guide).toHaveAttribute("role", "dialog");
  await expect(guide).toHaveAttribute("aria-modal", "true");
  await expect(guide).toHaveAttribute("data-tour-layout", "coachmark");
  await expect(guide).not.toHaveAttribute("data-placement", "center");
  await expect(guide.getByText("1 of 7", { exact: true })).toBeVisible();

  const navTarget = page.locator('[data-tour="primary-nav"]');
  await expect(navTarget).toBeVisible();
  await expectSpotlightOverlaps(spotlight, navTarget);

  await guide.getByRole("button", { name: "Next" }).click();
  await expect(guide.getByText("2 of 7", { exact: true })).toBeVisible();
  await expectSpotlightOverlaps(spotlight, page.locator('[data-tour="beginner-view"]'));

  await guide.getByRole("button", { name: "Next" }).click();
  await expect(guide.getByRole("heading", { name: "Search without learning commands" })).toBeVisible();
  await expectSpotlightOverlaps(spotlight, page.locator('[data-tour="keybind-search"]'));

  await guide.getByRole("button", { name: "Next" }).click();
  await expect(guide.getByRole("heading", { name: "Read a keybind card" })).toBeVisible();
  await expectSpotlightOverlaps(spotlight, page.locator('[data-tour="keybind-card"]').first());

  const beforeSetupScroll = await page.evaluate(() => window.scrollY);
  await guide.getByRole("button", { name: "Next" }).click();
  await expect(guide.getByRole("heading", { name: "Keep characters and profiles separate" })).toBeVisible();
  await expectSpotlightOverlaps(spotlight, page.locator('[data-tour="my-setup"]'));
  expect(await page.evaluate(() => window.scrollY)).not.toBe(beforeSetupScroll);

  await guide.getByRole("button", { name: "Next" }).click();
  await expect(guide.getByRole("heading", { name: "Build when a preset is not enough" })).toBeVisible();
  await expectSpotlightOverlaps(spotlight, page.locator('[data-tour="build"]'));

  await guide.getByRole("button", { name: "Next" }).click();
  await expect(guide.getByText("7 of 7", { exact: true })).toBeVisible();
  await expect(guide.getByRole("heading", { name: "Help stays available after the tour" })).toBeVisible();
  await expectSpotlightOverlaps(spotlight, page.locator('[data-tour="help"]'));

  await guide.getByRole("button", { name: "Start in Beginner View" }).click();
  await expect(guide).toHaveCount(0);
});

test("coachmark placement remains inside the viewport on each responsive project", async ({ page }) => {
  await openAsFirstVisit(page);
  const guide = page.getByTestId("first-visit-orientation");

  for (let step = 0; step < 7; step += 1) {
    const box = await guide.boundingBox();
    expect(box).not.toBeNull();
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width + 1);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height + 1);
    if (step < 6) await guide.getByRole("button", { name: "Next" }).click();
  }
});

test("coachmark keeps keyboard controls contained and restores focus on replay", async ({ page }) => {
  await page.addInitScript((key) => window.localStorage.setItem(key, "seen"), FIRST_VISIT_KEY);
  await page.goto("/");
  const help = page.locator("#bindforge-help:visible").first();
  await help.locator("summary").click();
  const replay = help.getByRole("button", { name: "Replay guided tour" });
  await replay.focus();
  await replay.click();

  const guide = page.getByTestId("first-visit-orientation");
  await expect(guide).toBeVisible();
  await expect(guide.getByRole("heading", { name: "Know where you are" })).toBeFocused();

  const close = guide.getByRole("button", { name: "Close guided tour" });
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(guide.getByRole("button", { name: "Next" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(guide).toHaveCount(0);
  await expect(replay).toBeFocused();
});
