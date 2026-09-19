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


test("analytics summarizes import drop-off, errors, and popular catalogue dimensions without content", () => {
  const rows = [
    { name: "import_previewed", occurredAt: "a", context: { route: "my-setup", actionType: "import", outcome: "ready" } },
    { name: "import_previewed", occurredAt: "b", context: { route: "my-setup", actionType: "import", outcome: "ready" } },
    { name: "import_confirmed", occurredAt: "c", context: { route: "my-setup", actionType: "import", outcome: "confirmed" } },
    { name: "workflow_error", occurredAt: "d", context: { route: "my-setup", actionType: "import", outcome: "validation-blocked", importedKeymap: "/bind f1 private" } },
    { name: "preset_copied", occurredAt: "e", context: { route: "keybinds", className: "Ranger", presetType: "Animation Cancel" } },
  ];
  const summary = summarizeAnalyticsEvents(rows);
  assert.equal(summary.importPreviewReady, 2);
  assert.equal(summary.importConfirmed, 1);
  assert.equal(summary.importDropoff, 1);
  assert.equal(summary.byName.workflow_error, 1);
  assert.equal(summary.byClassName.Ranger, 1);
  assert.equal(summary.byPresetType["Animation Cancel"], 1);
  assert.equal(JSON.stringify(appendAnalyticsEvent([], rows[3])), JSON.stringify([{
    name: "workflow_error",
    context: { route: "my-setup", actionType: "import", outcome: "validation-blocked" },
    occurredAt: "d",
  }]));
});
