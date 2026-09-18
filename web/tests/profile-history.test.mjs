import test from "node:test";
import assert from "node:assert/strict";
import { makeProfileSnapshot, pushProfileSnapshot, restoreSnapshotProfile } from "../app/lib/profile-history.mjs";

test("snapshots clone mutable profile data", () => {
  const profile = { id: "p1", name: "ST", keyValues: { a: "f1" }, personalBinds: [{ key: "q", command: "one" }], personalSourceName: "a.txt", personalImportedAt: "2026-09-18T00:00:00Z" };
  const snapshot = makeProfileSnapshot(profile, "Before edit", "2026-09-18T00:00:00Z");
  profile.keyValues.a = "f2";
  assert.equal(snapshot.keyValues.a, "f1");
  assert.equal(snapshot.reason, "Before edit");
});

test("history is newest first, capped, and coalesces rapid same-reason snapshots", () => {
  const profile = { keyValues: { a: "f1" }, personalBinds: [] };
  let history = [];
  history = pushProfileSnapshot(history, makeProfileSnapshot(profile, "Key edit", "2026-09-18T00:00:00Z"), 2);
  history = pushProfileSnapshot(history, makeProfileSnapshot(profile, "Key edit", "2026-09-18T00:00:03Z"), 2);
  assert.equal(history.length, 1);
  history = pushProfileSnapshot(history, makeProfileSnapshot(profile, "Import", "2026-09-18T00:01:00Z"), 2);
  history = pushProfileSnapshot(history, makeProfileSnapshot(profile, "Clear", "2026-09-18T00:02:00Z"), 2);
  assert.deepEqual(history.map((entry) => entry.reason), ["Clear", "Import"]);
});

test("restore uses snapshot data but preserves profile identity and name", () => {
  const original = { id: "p1", name: "ST", keyValues: { a: "f2" }, personalBinds: [{ key: "q", command: "one" }], personalSourceName: "a.txt", personalImportedAt: "2026-09-18T00:00:00Z" };
  const snapshot = makeProfileSnapshot(original, "Before import", "2026-09-18T00:00:00Z");
  const restored = restoreSnapshotProfile({ ...original, id: "same", name: "Custom", keyValues: {} }, snapshot);
  assert.equal(restored.id, "same");
  assert.equal(restored.name, "Custom");
  assert.equal(restored.keyValues.a, "f2");
  assert.equal(restored.personalSourceName, "a.txt");
});
