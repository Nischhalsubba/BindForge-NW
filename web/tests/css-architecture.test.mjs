// Guards the maintained stylesheet entrypoint and shared responsive/token contracts.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appCss = await readFile(new URL("../app/app.css", import.meta.url), "utf8");
const atelierCss = await readFile(new URL("../app/atelier-zero.css", import.meta.url), "utf8");
const precisionCss = await readFile(new URL("../app/pixel-polish.css", import.meta.url), "utf8");
const uiFixesCss = await readFile(new URL("../app/ui-fixes.css", import.meta.url), "utf8");
const brandingCss = await readFile(new URL("../app/branding.css", import.meta.url), "utf8");
const preferencesCss = await readFile(new URL("../app/preferences.css", import.meta.url), "utf8");
const workspaceControlsCss = await readFile(new URL("../app/components/WorkspaceControls.module.css", import.meta.url), "utf8");
const profileWorkspaceCss = await readFile(new URL("../app/components/ProfileWorkspaceManager.module.css", import.meta.url), "utf8");
const firstVisitCss = await readFile(new URL("../app/components/FirstVisitHelp.module.css", import.meta.url), "utf8");
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

test("global CSS keeps Atelier Zero canonical with governed precision and preference layers", () => {
  const imports = [...appCss.matchAll(/@import\s+"([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(imports, [
    "./atelier-zero.css",
    "./ui-fixes.css",
    "./branding.css",
    "./group-visibility.css",
    "./pixel-polish.css",
    "./preferences.css",
  ]);
  assert.match(appCss, /Atelier Zero as the canonical visual source/);
  assert.match(atelierCss, /--color-bg:/);
  assert.match(atelierCss, /--control-height:/);
  assert.match(precisionCss, /--control-height:\s*46px/);
  assert.match(precisionCss, /--z-sticky:/);
  assert.match(precisionCss, /prefers-reduced-motion:\s*reduce/);
});

test("content width and font roles have one canonical owner", () => {
  const activeGlobals = [appCss, atelierCss, uiFixesCss, brandingCss, precisionCss, preferencesCss];
  const contentDefinitions = activeGlobals.flatMap((css) => css.match(/--content\s*:/g) ?? []);
  assert.equal(contentDefinitions.length, 1, "Only app.css may define --content");
  assert.match(appCss, /--content:\s*3000px/);
  assert.equal(atelierCss.includes("Inter Tight"), false);
  assert.match(atelierCss, /family=Inter:wght@300;400;500;600;700;800;900/);
  assert.match(atelierCss, /family=JetBrains\+Mono:wght@400;500;600/);
  assert.match(atelierCss, /family=Playfair\+Display/);
});

test("advanced and onboarding modules reuse the accessibility floor", () => {
  for (const css of [workspaceControlsCss, profileWorkspaceCss, firstVisitCss]) {
    assert.equal(/min-height:\s*(40|42)px/.test(css), false, "shared modules must not reintroduce 40/42px controls");
  }
  assert.match(workspaceControlsCss, /min-height:\s*var\(--control-min\)/);
  assert.match(profileWorkspaceCss, /min-height:\s*var\(--control-min\)/);
  assert.match(firstVisitCss, /min-height:\s*var\(--control-min\)/);
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

test("final accessibility foundation governs readable type, targets, focus, and motion", () => {
  for (const token of [
    "--type-meta: 0.8125rem",
    "--type-label: 0.875rem",
    "--type-body: 1rem",
    "--control-min: 44px",
    "--control-primary: 48px",
    "--touch-gap: 8px",
    "--focus-ring-width: 3px",
    "--focus-ring-offset: 3px",
  ]) {
    assert.match(appCss, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(appCss, /\.icon-text-button,\s*\n\.select-preset\s*\{\s*\n\s*min-height:\s*var\(--control-min\)/);
  assert.match(appCss, /:focus-visible\s*\{[\s\S]*outline:\s*var\(--focus-ring-width\)/);
  assert.match(appCss, /@media \(forced-colors: active\)/);
  assert.match(appCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(appCss, /animation-duration:\s*0\.01ms !important/);
  assert.match(appCss, /text-size-adjust:\s*100%/);
});

test("preference layer supports theme, readable text scaling, large controls, contrast, and explicit reduced motion", () => {
  assert.match(preferencesCss, /html\[data-theme='dark'\]/);
  assert.match(preferencesCss, /html\[data-text-size='large'\]\s*\{\s*font-size:\s*112\.5%/);
  assert.match(preferencesCss, /html\[data-text-size='extra-large'\]\s*\{\s*font-size:\s*125%/);
  assert.match(preferencesCss, /html\[data-large-controls='true'\][\s\S]*--control-primary:\s*52px/);
  assert.match(preferencesCss, /html\[data-contrast='high'\][\s\S]*--focus-ring-width:\s*4px/);
  assert.match(preferencesCss, /html\[data-motion='reduced'\]/);
});

test("functional microcopy is promoted to the accessible type scale", () => {
  for (const selector of [
    ".brand-copy small",
    ".filter-top-output small",
    ".group-heading p",
    ".card-meta",
    ".key-capture-hint",
  ]) {
    assert.match(appCss, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(appCss, /font-size:\s*var\(--type-meta\)/);
  assert.match(appCss, /\.card-copy p\s*\{\s*\n\s*font-size:\s*var\(--type-body\)/);
});

test("responsive layer documents only the shared tablet and mobile breakpoints", () => {
  const breakpoints = [...responsiveCss.matchAll(/@media \(max-width: (\d+)px\)/g)].map((match) => Number(match[1]));
  assert.deepEqual(breakpoints, [1050, 680]);
});
