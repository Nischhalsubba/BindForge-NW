import test from "node:test";
import assert from "node:assert/strict";
import {
  BACKUP_VERSION,
  MAX_BACKUP_BYTES,
  createDefaultBackup,
  parseBackupJson,
  parseBackupValue,
} from "../app/lib/backup-schema.mjs";

const NOW = "2026-07-22T09:00:00.000Z";

test("creates a version 2 backup with custom say defaults", () => {
  const backup = createDefaultBackup(NOW);
  assert.equal(backup.version, BACKUP_VERSION);
  assert.equal(backup.savedAt, NOW);
  assert.deepEqual(backup.customSay, { key: "f1", message: "ARTIFACTS NOW" });
});

test("accepts and normalizes a valid version 2 backup", () => {
  const input = {
    ...createDefaultBackup(NOW),
    keys: { invoke: "numpad9" },
    customSay: { key: "f2", message: "Group on me" },
    ignoredField: "removed",
  };

  const result = parseBackupValue(input, { now: NOW });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.migratedFrom, null);
  assert.deepEqual(result.value.keys, { invoke: "numpad9" });
  assert.deepEqual(result.value.customSay, { key: "f2", message: "Group on me" });
  assert.equal("ignoredField" in result.value, false);
});

test("migrates a version 1 backup to version 2", () => {
  const result = parseBackupValue(
    {
      version: 1,
      savedAt: NOW,
      keys: { mailbox: "f3" },
      filters: { className: "Bard", mode: "unbind" },
      commandLab: { key: "ctrl+b", showRisky: true },
    },
    { now: NOW },
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.migratedFrom, 1);
  assert.equal(result.value.version, 2);
  assert.equal(result.value.filters.className, "Bard");
  assert.equal(result.value.filters.mode, "unbind");
  assert.equal(result.value.commandLab.key, "ctrl+b");
  assert.equal(result.value.commandLab.showRisky, true);
  assert.deepEqual(result.value.customSay, { key: "f1", message: "ARTIFACTS NOW" });
});

test("rejects unsupported backup versions", () => {
  const result = parseBackupValue({ version: 99 }, { now: NOW });
  assert.deepEqual(result, { ok: false, error: "Unsupported BindForge backup version." });
});

test("rejects invalid saved keys", () => {
  const result = parseBackupValue({ version: 2, keys: ["f1"] }, { now: NOW });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, "Saved keys must be an object.");
});

test("rejects invalid output mode", () => {
  const result = parseBackupValue(
    { version: 2, filters: { mode: "delete-everything" } },
    { now: NOW },
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, "Output mode must be bind or unbind.");
});

test("rejects invalid dates", () => {
  const result = parseBackupValue({ version: 2, savedAt: "not-a-date" }, { now: NOW });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, "Saved date is invalid.");
});

test("rejects custom say messages over 240 characters", () => {
  const result = parseBackupValue(
    { version: 2, customSay: { key: "f1", message: "x".repeat(241) } },
    { now: NOW },
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, "Custom say message is too long.");
});

test("rejects malformed JSON", () => {
  const result = parseBackupJson("{broken", { now: NOW });
  assert.deepEqual(result, { ok: false, error: "Backup is not valid JSON." });
});

test("rejects backup text larger than the configured limit", () => {
  const result = parseBackupJson("x".repeat(MAX_BACKUP_BYTES + 1), { now: NOW });
  assert.deepEqual(result, { ok: false, error: "Backup file is larger than 256 KB." });
});
