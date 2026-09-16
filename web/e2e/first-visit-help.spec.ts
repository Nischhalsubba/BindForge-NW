import { expect, test } from "@playwright/test";

test("first visit offers task-oriented paths and remembers dismissal", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.removeItem("bindforge-nw:first-visit:v1");
    window.sessionStorage.removeItem("bindforge-nw:first-visit-presented:v1");
  });
  await page.reload();

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
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.removeItem("bindforge-nw:first-visit:v1");
    window.sessionStorage.removeItem("bindforge-nw:first-visit-presented:v1");
  });
  await page.reload();

  const guide = page.getByTestId("first-visit-orientation");
  await guide.getByText("Build a keybind", { exact: true }).click();
  await expect(page).toHaveURL(/#compose-keybind$/);
  await expect(page.getByRole("tab", { name: "Compose your own keybind", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("first-visit-orientation")).toHaveCount(0);
});

test("help glossary remains available after onboarding is dismissed", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("bindforge-nw:first-visit:v1", "seen");
  });
  await page.reload();

  const help = page.locator("#bindforge-help:visible").first();
  await help.locator("summary").click();
  await expect(help).toContainText("Bind");
  await expect(help).toContainText("Unbind / rollback");
  await expect(help).toContainText("Community tested");
  await expect(help).toContainText("Experimental");
  await expect(help).toContainText("Personal keymap");
});
