import { expect, test } from "@playwright/test";

const viewportWidths = [360, 390, 768, 1024, 1440] as const;

function libraryView(page: import("@playwright/test").Page) {
  return page.getByTestId("secondary-controls").getByLabel("Library view");
}

async function openCompactView(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(libraryView(page)).toBeVisible();
  await libraryView(page).selectOption("compact");
  await expect(page.getByTestId("compact-bind-row").first()).toBeVisible();
}

test("compact mode uses a dedicated readable row and preserves primary actions", async ({ page }) => {
  await openCompactView(page);

  const row = page.getByTestId("compact-bind-row").first();
  const title = row.getByTestId("compact-title");
  const keyInput = row.getByLabel(/Key combination for/i);

  await expect(row.locator(".bind-card")).toHaveCount(0);
  await expect(title).toBeVisible();
  await expect(keyInput).toBeEditable();
  await expect(row.getByRole("button", { name: /^Copy:/ })).toBeVisible();
  await expect(row.getByRole("button", { name: /favourites/i })).toBeVisible();
  await expect(row.getByText("Select", { exact: true })).toBeVisible();

  const titleBox = await title.boundingBox();
  expect(titleBox).not.toBeNull();
  expect(titleBox!.width).toBeGreaterThan(110);
  expect(titleBox!.height).toBeLessThan(100);

  await row.getByRole("button", { name: "Expand details" }).click();
  await expect(row.getByRole("button", { name: "Hide details" })).toBeVisible();
  await expect(row.getByText("Command preview", { exact: true })).toBeVisible();
  await expect(row.locator("code")).toContainText(/\/(bind|unbind)/);

  await keyInput.fill("Ctrl+Shift+R");
  await expect(row.locator("code")).toContainText("ctrl+shift+r");

  await libraryView(page).selectOption("cards");
  await expect(page.getByTestId("compact-bind-row")).toHaveCount(0);
  await expect(page.locator(".bind-card").first()).toBeVisible();
});

for (const width of viewportWidths) {
  test(`compact rows stay horizontal and inside the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openCompactView(page);

    const row = page.getByTestId("compact-bind-row").first();
    const title = row.getByTestId("compact-title");
    const rowBox = await row.boundingBox();
    const titleBox = await title.boundingBox();

    expect(rowBox).not.toBeNull();
    expect(titleBox).not.toBeNull();
    expect(rowBox!.x).toBeGreaterThanOrEqual(0);
    expect(rowBox!.x + rowBox!.width).toBeLessThanOrEqual(width + 1);
    expect(titleBox!.width).toBeGreaterThan(width <= 390 ? 120 : 160);
    expect(titleBox!.height).toBeLessThan(110);

    const overflow = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      writingMode: getComputedStyle(document.querySelector('[data-testid="compact-title"]')!).writingMode,
      wordBreak: getComputedStyle(document.querySelector('[data-testid="compact-title"]')!).wordBreak,
    }));

    expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewportWidth + 1);
    expect(overflow.writingMode).toBe("horizontal-tb");
    expect(overflow.wordBreak).not.toBe("break-all");
  });
}
