import { test, expect } from "@playwright/test";
test("redesigned home searches the catalogue, edits combinations and preserves drafts", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Find it. Copy it. Bind it." }),
  ).toBeVisible();
  await expect(page.locator("#resultCount")).toContainText("177");
  await page.getByLabel("Search keybind library").fill("VIP bank");
  await expect(page.locator("#presetList")).toContainText(
    "Summon VIP Bank Portal",
  );
  if (await page.locator("#toolSelect").isVisible())
    await page.locator("#toolSelect").selectOption("builder");
  else
    await page
      .getByRole("button", { name: "Combination builder", exact: true })
      .click();
  await expect(page.locator("#builderView")).toBeVisible();
  await page.locator("#actionSearch").fill("inventory");
  await page.locator("#actionList button").first().click();
  await expect(page.locator("#chainCount")).toHaveText("1 actions");
  await page.locator("#chain [data-duplicate]").click();
  await expect(page.locator("#chainCount")).toHaveText("2 actions");
  await page.locator("#undoChain").click();
  await expect(page.locator("#chainCount")).toHaveText("1 actions");
  await page.locator("#redoChain").click();
  await expect(page.locator("#chainCount")).toHaveText("2 actions");
  await page.locator("#combinationName").fill("Inventory shortcut");
  await page.locator("#saveCombination").click();
  await expect(page.locator("#savedCombinations")).toContainText(
    "Inventory shortcut",
  );
  await page.reload();
  await expect(page.locator("#chainCount")).toHaveText("2 actions");
  await expect(page.locator("#savedCombinations")).toContainText(
    "Inventory shortcut",
  );
});
test("account route has configured provider feedback and returns to the usable home", async ({
  page,
}) => {
  await page.goto("/account");
  await expect(
    page.getByRole("heading", { name: "Your account & cloud workspace" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to workbench" }).click();
  await expect(page.locator("#resultCount")).toContainText("177");
});
test("parameterized preset stays in preset mode after reload", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Search keybind library")
    .fill("Use Any Chosen Inventory Slot");
  await page
    .getByRole("button", { name: "Use Any Chosen Inventory Slot", exact: true })
    .click();
  const configure = page.getByRole("button", {
    name: "Configure parameters",
    exact: true,
  });
  if (await configure.isVisible()) await configure.click();
  await page
    .getByRole("textbox", { name: "Arguments", exact: true })
    .fill('"+InventoryExec inventory 0"');
  const line = await page.locator("#commandOutput").textContent();
  await page.reload();
  await expect(page.locator("#commandName")).toHaveText(
    "Use Any Chosen Inventory Slot",
  );
  await expect(page.locator("#commandOutput")).toHaveText(line!);
  await expect(page.locator("#commandOutput")).not.toContainText("netgraph");
});
