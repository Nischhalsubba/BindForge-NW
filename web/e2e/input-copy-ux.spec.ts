import { expect, test } from "@playwright/test";

async function waitForLibrary(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.getByTestId("filter-toolbar").first()).toBeVisible();
  await expect(page.locator(".bind-card").first()).toBeVisible();
}

test("captures physical numpad keys and modifier combinations", async ({ page }) => {
  await waitForLibrary(page);
  const input = page.locator("input[data-key-capture='true']").first();
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

test("bind and unbind use the same card action while only the command output changes", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await waitForLibrary(page);

  const card = page.locator(".bind-card").first();
  const keyInput = card.locator("input[data-key-capture='true']");
  await keyInput.fill("ctrl+shift+n");

  const copyButton = card.getByRole("button", { name: /Copy command:/ });
  await expect(copyButton).toBeVisible();
  await expect(card.getByRole("button", { name: /Copy unbind key:/ })).toHaveCount(0);
  await expect(card.getByRole("button", { name: /Copy original bind:/ })).toHaveCount(0);

  await copyButton.click();
  const bind = await page.evaluate(() => navigator.clipboard.readText());
  expect(bind).toMatch(/^\/bind ctrl\+shift\+n /);
  expect(bind.length).toBeGreaterThan("/bind ctrl+shift+n ".length);

  await page.getByRole("button", { name: "Unbind", exact: true }).click();
  await expect(page.getByRole("button", { name: "Unbind", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(card.getByRole("button", { name: /Copy command:/ })).toBeVisible();
  await expect(card.getByRole("button", { name: /Copy unbind key:/ })).toHaveCount(0);
  await expect(card.getByRole("button", { name: /Copy original bind:/ })).toHaveCount(0);

  await card.getByRole("button", { name: /Copy command:/ }).click();
  const unbind = await page.evaluate(() => navigator.clipboard.readText());
  expect(unbind).toBe("/unbind ctrl+shift+n");
});

test("workspace navigation links point to the primary work areas", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile") || testInfo.project.name.includes("tablet"), "Desktop sidebar navigation is hidden on narrow layouts.");
  await waitForLibrary(page);
  await expect(page.getByRole("link", { name: "Browse keybinds" })).toHaveAttribute("href", "#keybind-library");
  await expect(page.getByRole("link", { name: "Collections" })).toHaveAttribute("href", "#collections");
  await expect(page.getByRole("link", { name: "Command Lab" })).toHaveAttribute("href", "#command-lab");
  await expect(page.getByRole("link", { name: "Say builder" })).toHaveAttribute("href", "#custom-say");
});
