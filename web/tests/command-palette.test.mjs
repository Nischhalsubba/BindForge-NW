import test from "node:test";
import assert from "node:assert/strict";
import { filterCommandActions } from "../app/lib/command-palette.mjs";

test("command palette finds navigation and settings actions by intent words", () => {
  assert.equal(filterCommandActions(undefined, "profile")[0].id, "setup");
  assert.equal(filterCommandActions(undefined, "accessibility")[0].id, "settings");
  assert.equal(filterCommandActions(undefined, "compose")[0].id, "build");
});
