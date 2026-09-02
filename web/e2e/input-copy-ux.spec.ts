import { expect, test } from "@playwright/test";

async function waitForLibrary(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.getByTestId("filter-toolbar").first()).toBeVisible();
  await expect(page.locator(".bind-card:visible").first()).toBeVisible();
}

test("captures physical numpad keys and modifier combinations", async ({ page }) => {
  await waitForLibrary(page);
  const input = page.locator("input[data-key-capture='true']:visible").first();
  await input.focus();

  await input.evaluate((node) => node.dispatchEvent(new KeyboardEvent("keydown", {
    key: "9",
    code: "Numpad9",
    location: 3,
    bubbles: true,
  })));
  await expect(input).toHaveValue("numpad9");

  await input.evaluate((node) => node.dispatchEvent(new KeyboardEvent("keydown", {
    key: "r",
    code: "KeyR",
    ctrlKey: true,
    shiftKey: true,
    bubbles: true,
  })));
  await expect(input).toHaveValue("ctrl+shift+r");
});

test("bind and unbind keep the same full command while only the verb changes", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await waitForLibrary(page);

  const card = page.locator(".bind-card:visible").first();
  const keyInput = card.locator("input[data-key-capture='true']");
  const assignedKey = (await keyInput.inputValue()).trim().toLowerCase().replace(/\s+/g, "");
  expect(assignedKey).toBeTruthy();

  const copyButton = card.getByRole("button", { name: /Copy command:/ });
  await expect(copyButton).toBeVisible();
  await expect(copyButton).toBeEnabled();
  await expect(card.getByRole("button", { name: /Copy unbind key:/ })).toHaveCount(0);
  await expect(card.getByRole("button", { name: /Copy original bind:/ })).toHaveCount(0);

  await copyButton.click();
  const bind = await page.evaluate(() => navigator.clipboard.readText());
  expect(bind.startsWith(`/bind ${assignedKey} `)).toBe(true);
  expect(bind.length).toBeGreaterThan(`/bind ${assignedKey} `.length);

  await page.getByRole("button", { name: "Unbind", exact: true }).click();
  await expect(page.getByRole("button", { name: "Unbind", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(card.getByRole("button", { name: /Copy command:/ })).toBeVisible();
  await expect(card.getByRole("button", { name: /Copy unbind key:/ })).toHaveCount(0);
  await expect(card.getByRole("button", { name: /Copy original bind:/ })).toHaveCount(0);

  await card.getByRole("button", { name: /Copy command:/ }).click();
  const unbind = await page.evaluate(() => navigator.clipboard.readText());
  expect(unbind).toBe(bind.replace(/^\/bind /, "/unbind "));
});

test("workspace navigation links point to the four primary tools", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile") || testInfo.project.name.includes("tablet"), "Desktop sidebar navigation is hidden on narrow layouts.");
  await waitForLibrary(page);
  const sidebar = page.locator("#filter-panel");
  await expect(sidebar.getByRole("link", { name: "Search keybinds", exact: true })).toHaveAttribute("href", "#search-keybinds");
  await expect(sidebar.getByRole("link", { name: "Compose keybind", exact: true })).toHaveAttribute("href", "#compose-keybind");
  await expect(sidebar.getByRole("link", { name: "Build command", exact: true })).toHaveAttribute("href", "#build-command");
  await expect(sidebar.getByRole("link", { name: "Say message", exact: true })).toHaveAttribute("href", "#say-message");
});
