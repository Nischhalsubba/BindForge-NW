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

test("copying a bind leads into concise in-game apply guidance", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const card = page.locator(".bind-card:visible").first();
  await card.getByRole("button", { name: /^Copy command:/ }).click();

  const guide = page.getByTestId("in-game-guide");
  await expect(guide).toBeVisible();
  await expect(guide).toContainText("Use this in Neverwinter");
  await expect(guide).toContainText("Open Neverwinter chat");
  await expect(guide).toContainText("Test the key somewhere safe");
  await expect(guide).toContainText("cannot inspect your live game state");
});

test("the in-game guide exposes an explicit failure-recovery path", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const card = page.locator(".bind-card:visible").first();
  await card.getByRole("button", { name: /^Copy command:/ }).click();

  const guide = page.getByTestId("in-game-guide");
  await guide.getByRole("button", { name: "It didn’t work" }).click();
  const troubleshooting = page.getByTestId("in-game-troubleshooting");
  await expect(troubleshooting).toBeVisible();
  await expect(troubleshooting).toContainText("The key does nothing");
  await expect(troubleshooting).toContainText("The wrong action happens");
  await expect(troubleshooting).toContainText("Neverwinter rejects or ignores the command");
  await expect(troubleshooting).toContainText("rollback/unbind output");

  await guide.getByRole("button", { name: "It worked" }).click();
  await expect(page.getByTestId("in-game-guide")).toHaveCount(0);
});
