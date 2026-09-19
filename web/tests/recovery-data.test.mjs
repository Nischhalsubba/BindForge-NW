import test from "node:test";
import assert from "node:assert/strict";
import { appendRecoveryRecord, makeRecoveryRecord, parseRecoveryRecords } from "../app/lib/recovery-data.mjs";

test("recovery records preserve raw input and source key", () => {
  const record = makeRecoveryRecord("profiles", "{bad", "Invalid profile JSON", "2026-09-18T00:00:00Z");
  assert.equal(record.storageKey, "profiles");
  assert.equal(record.raw, "{bad");
});

test("recovery history is newest-first capped and dedupes identical raw source", () => {
  let history = [];
  history = appendRecoveryRecord(history, makeRecoveryRecord("x", "bad", "one", "2026-09-18T00:00:00Z"), 2);
  history = appendRecoveryRecord(history, makeRecoveryRecord("x", "bad", "two", "2026-09-18T00:01:00Z"), 2);
  assert.equal(history.length, 1);
  assert.equal(history[0].reason, "two");
  history = appendRecoveryRecord(history, makeRecoveryRecord("y", "worse", "three", "2026-09-18T00:02:00Z"), 2);
  assert.deepEqual(history.map((item) => item.storageKey), ["y", "x"]);
});

test("parsing invalid recovery storage fails closed to empty", () => {
  assert.deepEqual(parseRecoveryRecords("{oops"), []);
  assert.equal(parseRecoveryRecords(JSON.stringify([{ id: "1", storageKey: "x", raw: "bad", reason: "r", createdAt: "2026-09-18T00:00:00Z" }])).length, 1);
});
