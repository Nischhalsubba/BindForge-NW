import test from "node:test";
import assert from "node:assert/strict";
import { appendAnalyticsEvent, sanitizeAnalyticsEvent, summarizeAnalyticsEvents } from "../app/lib/privacy-analytics.mjs";

test("analytics allowlist excludes personal or imported-keymap fields", () => {
  const event = sanitizeAnalyticsEvent({
    name: "zero_result_search",
    occurredAt: "2026-09-19T00:00:00Z",
    context: {
      route: "keybinds",
      className: "Barbarian",
      characterName: "Secret Character",
      importedKeymap: "/bind f1 secret",
      query: "private search",
    },
  });
  assert.deepEqual(event, {
    name: "zero_result_search",
    occurredAt: "2026-09-19T00:00:00Z",
    context: { route: "keybinds", className: "Barbarian" },
  });
  assert.equal(sanitizeAnalyticsEvent({ name: "unknown_event" }), null);
});

test("analytics log is bounded and can be summarized locally", () => {
  let rows = [];
  rows = appendAnalyticsEvent(rows, { name: "search_performed", context: { route: "keybinds" }, occurredAt: "a" }, 2);
  rows = appendAnalyticsEvent(rows, { name: "preset_copied", context: { route: "keybinds" }, occurredAt: "b" }, 2);
  rows = appendAnalyticsEvent(rows, { name: "profile_switched", context: { route: "my-setup" }, occurredAt: "c" }, 2);
  assert.equal(rows.length, 2);
  const summary = summarizeAnalyticsEvents(rows);
  assert.equal(summary.total, 2);
  assert.equal(summary.byName.preset_copied, 1);
  assert.equal(summary.byRoute["my-setup"], 1);
});
