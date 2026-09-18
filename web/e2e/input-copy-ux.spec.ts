import { expect, test } from "@playwright/test";

async function waitForLibrary(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.getByTestId("filter-toolbar").first()).toBeVisible();
  const experience = page.getByTestId("experience-workspace-summary");
  const showMore = experience.getByRole("button", { name: "Show more tools" });
  if (await showMore.isVisible()) await showMore.click();
  await expect(page.locator(".bind-card:visible").first()).toBeVisible();
}

test("captures numpad keys, plus-separated merged combos, and mouse buttons", async ({ page }) => {
  await waitForLibrary(page);
  const input = page.locator("input[data-key-capture='true']:visible").first();
  const builder = input.locator("..");
  await expect(builder).toHaveAttribute("data-key-combination-builder", "true");
  await input.focus();

  await input.evaluate((node) => node.dispatchEvent(new KeyboardEvent("keydown", {
    key: "9",
    code: "Numpad9",
    location: 3,
    bubbles: true,
  })));
  await expect(input).toHaveValue("numpad9");
  await expect(builder.locator("[data-key-token='numpad9']")).toHaveText("Numpad 9");

  await input.evaluate((node) => node.dispatchEvent(new KeyboardEvent("keydown", {
    key: "5",
    code: "Digit5",
    ctrlKey: true,
    bubbles: true,
  })));
  await expect(input).toHaveValue("ctrl+5");
  await expect(builder.locator("[data-key-token='ctrl']")).toHaveText("Ctrl");
  await expect(builder.locator("[data-key-token='5']")).toHaveText("5");

  await input.evaluate((node) => node.dispatchEvent(new KeyboardEvent("keydown", {
    key: "+",
    code: "Equal",
    shiftKey: true,
    bubbles: true,
  })));
  await expect(input).toHaveValue("ctrl+5+");
  await expect(builder).toHaveAttribute("data-waiting-for-key", "true");
  await expect(builder.locator(".key-combination-next")).toHaveText("Next key…");

  await input.evaluate((node) => node.dispatchEvent(new KeyboardEvent("keydown", {
    key: "r",
    code: "KeyR",
    bubbles: true,
  })));
  await expect(input).toHaveValue("ctrl+5+r");
  await expect(builder).toHaveAttribute("data-waiting-for-key", "false");
  await expect(builder.locator("[data-key-token='r']")).toHaveText("R");

  await input.evaluate((node) => node.dispatchEvent(new KeyboardEvent("keydown", {
    key: "+",
    code: "Equal",
    shiftKey: true,
    bubbles: true,
  })));
  await expect(input).toHaveValue("ctrl+5+r+");

  await input.evaluate((node) => node.dispatchEvent(new MouseEvent("mousedown", {
    button: 2,
    bubbles: true,
  })));
  await expect(input).toHaveValue("ctrl+5+r+rbutton");
  await expect(builder.locator("[data-key-token='rbutton']")).toHaveText("Right Click");

  await input.fill("+");
  await expect(input).toHaveValue("");
  await expect(builder.locator(".key-combination-placeholder")).toBeVisible();
  await input.fill("5+6");
  await expect(input).toHaveValue("5+6");

  // The physical numpad + must behave exactly like the regular + separator.
  await input.fill("5");
  await input.evaluate((node) => node.dispatchEvent(new KeyboardEvent("keydown", {
    key: "+",
    code: "NumpadAdd",
    location: 3,
    bubbles: true,
  })));
  await expect(input).toHaveValue("5+");
  await expect(builder).toHaveAttribute("data-waiting-for-key", "true");
  await input.evaluate((node) => node.dispatchEvent(new KeyboardEvent("keydown", {
    key: "6",
    code: "Digit6",
    bubbles: true,
  })));
  await expect(input).toHaveValue("5+6");

  await input.evaluate((node) => node.dispatchEvent(new KeyboardEvent("keydown", {
    key: "r",
    code: "KeyR",
    ctrlKey: true,
    shiftKey: true,
    bubbles: true,
  })));
  await expect(input).toHaveValue("ctrl+shift+r");

  await input.evaluate((node) => node.dispatchEvent(new MouseEvent("mousedown", {
    button: 0,
    bubbles: true,
  })));
  await expect(input).toHaveValue("lbutton");
  await expect(builder.locator("[data-key-token='lbutton']")).toHaveText("Left Click");

  await input.evaluate((node) => node.dispatchEvent(new MouseEvent("mousedown", {
    button: 2,
    ctrlKey: true,
    bubbles: true,
  })));
  await expect(input).toHaveValue("ctrl+rbutton");

  await input.evaluate((node) => node.dispatchEvent(new MouseEvent("mousedown", {
    button: 1,
    altKey: true,
    shiftKey: true,
    bubbles: true,
  })));
  await expect(input).toHaveValue("alt+shift+mbutton");
  await expect(builder.locator("[data-key-token='mbutton']")).toHaveText("Middle Click");
});

test("backspace edits the captured combination instead of corrupting it", async ({ page }) => {
  await waitForLibrary(page);
  const input = page.locator("input[data-key-capture='true']:visible").first();
  const builder = input.locator("..");
  await input.fill("ctrl+5+rbutton");
  await input.focus();

  await input.evaluate((node) => node.dispatchEvent(new KeyboardEvent("keydown", {
    key: "Backspace",
    code: "Backspace",
    bubbles: true,
  })));
  await expect(input).toHaveValue("ctrl+5");
  await expect(builder.locator("[data-key-token='rbutton']")).toHaveCount(0);

  await input.evaluate((node) => node.dispatchEvent(new KeyboardEvent("keydown", {
    key: "+",
    code: "NumpadAdd",
    location: 3,
    bubbles: true,
  })));
  await expect(input).toHaveValue("ctrl+5+");
  await input.evaluate((node) => node.dispatchEvent(new KeyboardEvent("keydown", {
    key: "Backspace",
    code: "Backspace",
    bubbles: true,
  })));
  await expect(input).toHaveValue("ctrl+5");
  await expect(builder).toHaveAttribute("data-waiting-for-key", "false");
});

test("keeps copy disabled while plus is waiting for the next key", async ({ page }) => {
  await waitForLibrary(page);
  const card = page.locator(".bind-card:visible").first();
  const input = card.locator("input[data-key-capture='true']");
  const builder = input.locator("..");
  const copyButton = card.getByRole("button", { name: /Copy command:/ });
  await input.focus();

  await input.evaluate((node) => node.dispatchEvent(new KeyboardEvent("keydown", {
    key: "5",
    code: "Digit5",
    bubbles: true,
  })));
  await input.evaluate((node) => node.dispatchEvent(new KeyboardEvent("keydown", {
    key: "+",
    code: "Equal",
    shiftKey: true,
    bubbles: true,
  })));
  await expect(input).toHaveValue("5+");
  await expect(builder).toHaveAttribute("data-waiting-for-key", "true");
  await expect(copyButton).toBeDisabled();

  await input.evaluate((node) => node.dispatchEvent(new KeyboardEvent("keydown", {
    key: "6",
    code: "Digit6",
    bubbles: true,
  })));
  await expect(input).toHaveValue("5+6");
  await expect(builder).toHaveAttribute("data-waiting-for-key", "false");
  await expect(copyButton).toBeEnabled();
});

test("includes the exact user-supplied Fighter DPS animation-cancel bind", async ({ page }) => {
  await waitForLibrary(page);
  const search = page.getByLabel("Search keybind library").first();
  await search.fill("Fighter DPS Animation Cancel");
  const card = page.locator(".bind-card:visible").filter({ hasText: "Fighter DPS Animation Cancel: Left Click" }).first();
  await expect(card).toBeVisible();
  await expect(card.getByLabel("Key combination for Fighter DPS Animation Cancel: Left Click")).toHaveValue("lbutton");
  await expect(card.locator("[data-key-token='lbutton']")).toHaveText("Left Click");
  await card.getByRole("button", { name: "Details", exact: true }).click();
  await expect(card.getByTestId("command-preview-output")).toHaveText('/bind lbutton "+specialClassPower $$ +Evaluateleftclick $$ ++specialClassPower"');
});

test("bind and unbind keep the same full command while only the verb changes", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await waitForLibrary(page);

  const card = page.locator(".bind-card:visible").first();
  const copyButton = card.getByRole("button", { name: /Copy command:/ });
  await expect(copyButton).toBeVisible();
  await expect(copyButton).toBeEnabled();
  await expect(card.getByRole("button", { name: /Copy unbind key:/ })).toHaveCount(0);
  await expect(card.getByRole("button", { name: /Copy original bind:/ })).toHaveCount(0);

  await copyButton.click();
  const bind = await page.evaluate(() => navigator.clipboard.readText());
  expect(bind).toMatch(/^\/bind \S+ /);

  await page.getByRole("button", { name: "Unbind", exact: true }).click();
  await expect(page.getByRole("button", { name: "Unbind", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(card.getByRole("button", { name: /Copy command:/ })).toBeVisible();
  await expect(card.getByRole("button", { name: /Copy unbind key:/ })).toHaveCount(0);
  await expect(card.getByRole("button", { name: /Copy original bind:/ })).toHaveCount(0);

  await card.getByRole("button", { name: /Copy command:/ }).click();
  const unbind = await page.evaluate(() => navigator.clipboard.readText());
  expect(unbind).toBe(bind.replace(/^\/bind /, "/unbind "));
});

test("filter sidebar stays focused on filtering instead of duplicating primary navigation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile") || testInfo.project.name.includes("tablet"), "Desktop sidebar is hidden on narrow layouts.");
  await waitForLibrary(page);
  const sidebar = page.locator("#filter-panel");
  await expect(sidebar.getByRole("navigation")).toHaveCount(0);
  await expect(sidebar.getByRole("heading", { name: "Filters", exact: true })).toBeVisible();
});
