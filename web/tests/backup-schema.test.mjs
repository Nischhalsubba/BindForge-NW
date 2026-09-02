import test from "node:test";
import assert from "node:assert/strict";
import {
  BACKUP_VERSION,
  MAX_BACKUP_BYTES,
  createDefaultBackup,
  createDefaultPreferences,
  parseBackupJson,
  parseBackupValue,
} from "../app/lib/backup-schema.mjs";

const NOW = "2026-09-02T09:00:00.000Z";

test("creates version 3 with accessible fresh-user defaults", () => {
  const backup = createDefaultBackup(NOW);
  assert.equal(backup.version, BACKUP_VERSION);
  assert.equal(backup.savedAt, NOW);
  assert.deepEqual(backup.preferences, createDefaultPreferences());
  assert.equal(backup.preferences.experience, "simple");
  assert.equal(backup.preferences.explainTerms, true);
  assert.equal(backup.preferences.showRawCommands, false);
  assert.deepEqual(backup.customSay, { key: "f1", message: "ARTIFACTS NOW" });
});

test("accepts and normalizes a valid version 3 backup", () => {
  const input = {
    ...createDefaultBackup(NOW),
    keys: { invoke: "numpad9" },
    customSay: { key: "f2", message: "Group on me" },
    preferences: {
      ...createDefaultPreferences(),
      experience: "advanced",
      theme: "dark",
      textSize: "large",
      contrast: "high",
      largeControls: true,
      reducedMotion: true,
      showRawCommands: true,
    },
    ignoredField: "removed",
  };

  const result = parseBackupValue(input, { now: NOW });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.migratedFrom, null);
  assert.deepEqual(result.value.keys, { invoke: "numpad9" });
  assert.deepEqual(result.value.customSay, { key: "f2", message: "Group on me" });
  assert.equal(result.value.preferences.experience, "advanced");
  assert.equal(result.value.preferences.contrast, "high");
  assert.equal("ignoredField" in result.value, false);
});

test("migrates version 2 without surprising experienced users", () => {
  const result = parseBackupValue(
    {
      version: 2,
      savedAt: NOW,
      keys: { mailbox: "f3" },
      filters: { className: "Bard", mode: "unbind" },
      commandLab: { key: "ctrl+b", showRisky: true },
      customSay: { key: "f2", message: "Group on me" },
    },
    { now: NOW },
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.migratedFrom, 2);
  assert.equal(result.value.version, 3);
  assert.equal(result.value.filters.className, "Bard");
  assert.equal(result.value.filters.mode, "unbind");
  assert.equal(result.value.commandLab.key, "ctrl+b");
  assert.equal(result.value.commandLab.showRisky, true);
  assert.equal(result.value.customSay.message, "Group on me");
  assert.equal(result.value.preferences.experience, "standard");
  assert.equal(result.value.preferences.explainTerms, false);
  assert.equal(result.value.preferences.showRawCommands, true);
});

test("migrates version 1 and supplies custom say plus legacy experience defaults", () => {
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
  assert.equal(result.value.version, 3);
  assert.deepEqual(result.value.customSay, { key: "f1", message: "ARTIFACTS NOW" });
  assert.equal(result.value.preferences.experience, "standard");
});

test("rejects invalid preference values", () => {
  let result = parseBackupValue({ version: 3, preferences: { experience: "wizard" } }, { now: NOW });
  assert.deepEqual(result, { ok: false, error: "Experience level is invalid." });
  result = parseBackupValue({ version: 3, preferences: { largeControls: "yes" } }, { now: NOW });
  assert.deepEqual(result, { ok: false, error: "Large controls must be true or false." });
});

test("rejects unsupported backup versions", () => {
  const result = parseBackupValue({ version: 99 }, { now: NOW });
  assert.deepEqual(result, { ok: false, error: "Unsupported BindForge backup version." });
});

test("rejects invalid saved keys", () => {
  const result = parseBackupValue({ version: 3, keys: ["f1"] }, { now: NOW });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, "Saved keys must be an object.");
});

test("rejects invalid output mode", () => {
  const result = parseBackupValue({ version: 3, filters: { mode: "delete-everything" } }, { now: NOW });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, "Output mode must be bind or unbind.");
});

test("rejects invalid dates", () => {
  const result = parseBackupValue({ version: 3, savedAt: "not-a-date" }, { now: NOW });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error, "Saved date is invalid.");
});

test("rejects custom say messages over 240 characters", () => {
  const result = parseBackupValue(
    { version: 3, customSay: { key: "f1", message: "x".repeat(241) } },
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
