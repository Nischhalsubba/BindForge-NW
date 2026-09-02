import { expect, test } from "@playwright/test";

async function waitForWorkspace(page: import("@playwright/test").Page) {
  await page.goto("/");
  const tabs = page.getByRole("tablist", { name: "Primary keybind tools" });
  await expect(tabs).toBeVisible();
  await expect(tabs.getByRole("tab", { name: "Search existing keybinds", exact: true })).toHaveAttribute("aria-selected", "true");
  return tabs;
}

test("switching primary tools does not move the page", async ({ page }) => {
  const tabs = await waitForWorkspace(page);
  await tabs.scrollIntoViewIfNeeded();
  const initialScroll = await page.evaluate(() => window.scrollY);

  for (const name of ["Compose your own keybind", "Build your own command", "Create your own say message", "Search existing keybinds"] as const) {
    const tab = tabs.getByRole("tab", { name, exact: true });
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    const currentScroll = await page.evaluate(() => window.scrollY);
    expect(Math.abs(currentScroll - initialScroll)).toBeLessThanOrEqual(1);
  }
});

test("command and say views keep the footer at a stable desktop position", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile") || testInfo.project.name.includes("tablet"), "Desktop workspace uses the stable minimum-height stage.");
  const tabs = await waitForWorkspace(page);

  await tabs.getByRole("tab", { name: "Build your own command", exact: true }).click();
  const commandFooterTop = await page.locator("footer.app-footer").evaluate((element) => element.getBoundingClientRect().top + window.scrollY);

  await tabs.getByRole("tab", { name: "Create your own say message", exact: true }).click();
  const sayFooterTop = await page.locator("footer.app-footer").evaluate((element) => element.getBoundingClientRect().top + window.scrollY);

  expect(Math.abs(commandFooterTop - sayFooterTop)).toBeLessThanOrEqual(2);
});

test("primary tabs support arrow-key navigation without scrolling", async ({ page }) => {
  const tabs = await waitForWorkspace(page);
  await tabs.scrollIntoViewIfNeeded();
  const search = tabs.getByRole("tab", { name: "Search existing keybinds", exact: true });
  const compose = tabs.getByRole("tab", { name: "Compose your own keybind", exact: true });
  await search.focus();
  const initialScroll = await page.evaluate(() => window.scrollY);

  await page.keyboard.press("ArrowRight");
  await expect(compose).toBeFocused();
  await expect(compose).toHaveAttribute("aria-selected", "true");
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - initialScroll)).toBeLessThanOrEqual(1);

  await page.keyboard.press("End");
  await expect(tabs.getByRole("tab", { name: "Create your own say message", exact: true })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(search).toBeFocused();
});
