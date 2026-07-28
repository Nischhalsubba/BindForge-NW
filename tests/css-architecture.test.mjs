import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appCss = await readFile(new URL("../app/app.css", import.meta.url), "utf8");
const tokensCss = await readFile(new URL("../app/styles/tokens.css", import.meta.url), "utf8");
const responsiveCss = await readFile(new URL("../app/styles/responsive.css", import.meta.url), "utf8");

const historicalEntrypoints = [
  "sidebar-spacing.css",
  "filter-dock.css",
  "sticky-filter-dock.css",
  "split-filter-layout.css",
  "alignment-polish.css",
  "sidebar-stabilization.css",
  "open-design.css",
];

test("global CSS uses the documented layered entrypoint", () => {
  assert.match(appCss, /@layer tokens, base, theme, layout, components, responsive;/);
  const imports = [...appCss.matchAll(/@import\s+"([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(imports, [
    "./styles/tokens.css",
    "./globals.css",
    "./theme.css",
    "./apple-theme.css",
    "./styles/layout.css",
    "./styles/components.css",
    "./styles/responsive.css",
  ]);
});

test("removed historical overrides are not imported", () => {
  for (const filename of historicalEntrypoints) {
    assert.equal(appCss.includes(filename), false, `${filename} must not return to app.css`);
  }
});

test("design tokens define shared controls, spacing, radii, and semantic colors", () => {
  for (const token of [
    "--color-bg",
    "--color-surface",
    "--color-text",
    "--color-border",
    "--color-primary",
    "--space-4",
    "--radius-md",
    "--control-height",
    "--shadow-focus",
  ]) {
    assert.match(tokensCss, new RegExp(token.replace("--", "\\-\\-")));
  }
});

test("responsive layer documents only the shared tablet and mobile breakpoints", () => {
  const breakpoints = [...responsiveCss.matchAll(/@media \(max-width: (\d+)px\)/g)].map((match) => Number(match[1]));
  assert.deepEqual(breakpoints, [1050, 680]);
});
