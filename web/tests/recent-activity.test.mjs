import test from "node:test";
import assert from "node:assert/strict";
import { appendRecentChange, appendRecentPreset } from "../app/lib/recent-activity.mjs";

test("recent presets are deduplicated and capped", () => {
  assert.deepEqual(appendRecentPreset(["a", "b", "c"], "b", 3), ["b", "a", "c"]);
  assert.deepEqual(appendRecentPreset(["a", "b", "c"], "d", 3), ["d", "a", "b"]);
});

test("recent assignment changes keep before and after evidence", () => {
  const result = appendRecentChange([], { presetId: "x", from: "f1", to: "ctrl+7", changedAt: "2026-09-19T00:00:00Z" });
  assert.deepEqual(result[0], { presetId: "x", from: "f1", to: "ctrl+7", changedAt: "2026-09-19T00:00:00Z" });
  assert.deepEqual(appendRecentChange(result, { presetId: "x", from: "ctrl+7", to: "ctrl+7" }), result);
});
