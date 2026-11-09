import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const css = await readFile(new URL("../app/app.css", import.meta.url), "utf8");
const route = await readFile(
  new URL("../app/route.ts", import.meta.url),
  "utf8",
);
test("all React routes share the new workbench design and exclude legacy global layers", () => {
  for (const source of [
    "foundation.css",
    "tokens.css",
    "style.css",
    "components.css",
  ])
    assert(css.includes(source));
  for (const old of [
    "atelier-zero",
    "pixel-polish",
    "ui-fixes",
    "branding.css",
    "preferences.css",
  ])
    assert(!css.includes(old));
  assert(/--control-min:\s*44px/.test(css));
  assert(css.includes("prefers-reduced-motion"));
});
test("guest home is a complete static document without a hydration or account gate", () => {
  assert(route.includes("<!doctype html>"));
  assert(route.includes("${workbenchMarkup}"));
  assert(route.includes("app.bundle.js"));
  assert(!route.includes("CloudWorkspaceGuard"));
  assert(!route.includes("gsap.min.js"));
  assert(route.includes("force-static"));
});
test("new design keeps visible focus and readable responsive controls", async () => {
  const foundation = await readFile(
    new URL("../public/workbench/foundation.css", import.meta.url),
    "utf8",
  );
  assert(/min-height:\s*44px/.test(foundation));
  assert(foundation.includes(":focus-visible"));
  assert(/outline:\s*3px/.test(foundation));
  assert(/grid-template-columns:\s*1fr/.test(css));
});
