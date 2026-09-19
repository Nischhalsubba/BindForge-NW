import test from "node:test";
import assert from "node:assert/strict";
import { analyzeRawKeymap, buildChangePreview, compareProfiles, recommendUnusedKeys } from "../app/lib/keymap-intelligence.mjs";

test("unused-key recommendations require imported-profile evidence", () => {
  assert.deepEqual(recommendUnusedKeys({ hasImportedEvidence: false, personalBinds: [], currentAssignments: [], candidates: ["f1", "f2"] }), []);
  assert.deepEqual(recommendUnusedKeys({
    hasImportedEvidence: true,
    personalBinds: [{ key: "f1", command: "old" }],
    currentAssignments: [{ key: "ctrl+f2" }],
    candidates: ["f1", "f2", "f3", "ctrl+f2"],
    limit: 3,
  }), ["f2", "f3"]);
});

test("change preview exposes imported overwrite and rollback evidence", () => {
  const preview = buildChangePreview({
    presetId: "p1",
    title: "Bank",
    currentKey: "ctrl+1",
    proposedKey: "f2",
    proposedCommand: "invoke Bank",
    personalBinds: [{ key: "ctrl+1", command: "old-current" }, { key: "f2", command: "old-f2" }],
    currentAssignments: [{ presetId: "p2", key: "f3", command: "other" }],
  });
  assert.equal(preview.currentKey, "ctrl+1");
  assert.equal(preview.proposedKey, "f2");
  assert.equal(preview.overwrittenImportedCommand, "old-f2");
  assert.equal(preview.rollback.command, "old-f2");
  assert.equal(preview.conflicts.length, 0);
});

test("profile compare reports key and imported differences deterministically", () => {
  const result = compareProfiles(
    { id: "a", name: "ST", keyValues: { p1: "f1", p2: "f2" }, personalBinds: [{ key: "q", command: "one" }] },
    { id: "b", name: "AoE", keyValues: { p1: "f3", p2: "f2" }, personalBinds: [{ key: "q", command: "two" }, { key: "e", command: "three" }] },
  );
  assert.deepEqual(result.keyChanges, [{ presetId: "p1", left: "f1", right: "f3" }]);
  assert.equal(result.importedChanges.length, 2);
});

test("raw keymap analysis reports overwrites, orphan unbinds, active binds and ignored lines", () => {
  const result = analyzeRawKeymap("/bind f1 one\n/bind f1 two\n/unbind f2\nnot valid\n/bind f3 three");
  assert.equal(result.activeBinds.length, 2);
  assert.equal(result.overwrites.length, 1);
  assert.equal(result.orphanUnbinds.length, 1);
  assert.equal(result.ignored.length, 1);
  assert.equal(result.hasBlockingErrors, false);
});
