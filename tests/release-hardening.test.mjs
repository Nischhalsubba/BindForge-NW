import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const responsive = readFileSync(new URL("../app/styles/responsive.css", import.meta.url), "utf8");

test("does not ship the retired offline service worker", () => {
  assert.equal(existsSync(new URL("../public/sw.js", import.meta.url)), false);
  assert.equal(existsSync(new URL("../app/components/ServiceWorkerRegistration.tsx", import.meta.url)), false);
  assert.doesNotMatch(layout, /ServiceWorkerRegistration/);
  assert.doesNotMatch(layout, /manifest\.webmanifest/);
  assert.doesNotMatch(layout, /Installable offline application shell/);
});

test("keeps coarse-pointer controls at an accessible touch size", () => {
  assert.match(responsive, /@media \(pointer: coarse\)/);
  assert.match(responsive, /min-height: 44px/);
  assert.match(responsive, /min-width: 44px/);
});

test("retains reduced-motion handling", () => {
  assert.match(responsive, /prefers-reduced-motion: reduce/);
  assert.match(responsive, /animation-duration: \.01ms/);
});
