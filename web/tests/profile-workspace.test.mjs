import assert from "node:assert/strict";
import test from "node:test";
import {
  PROFILE_WORKSPACE_VERSION,
  cloneProfile,
  createDefaultProfileWorkspace,
  getActiveCharacter,
  getActiveProfile,
  parseProfileWorkspaceJson,
  parseProfileWorkspaceValue,
} from "../app/lib/profile-workspace.mjs";

const personalBind = {
  mode: "bind",
  key: "ctrl+5",
  command: "invoke",
  raw: "/bind ctrl+5 invoke",
  lineNumber: 1,
};

test("migrates existing edited keys and personal binds into deterministic default containers", () => {
  const workspace = createDefaultProfileWorkspace({
    keyValues: { fighter: "ctrl+7", bard: "f9" },
    personalBinds: [personalBind],
    personalSourceName: "Neverwinter binds.txt",
    personalImportedAt: "2026-09-17T10:00:00.000Z",
  });

  assert.equal(workspace.version, PROFILE_WORKSPACE_VERSION);
  assert.equal(workspace.activeCharacterId, "character-default");
  assert.equal(workspace.activeProfileId, "profile-default");
  assert.equal(workspace.characters.length, 1);
  assert.equal(workspace.characters[0].name, "My Character");
  assert.equal(workspace.characters[0].profiles.length, 1);
  assert.deepEqual(workspace.characters[0].profiles[0].keyValues, { fighter: "ctrl+7", bard: "f9" });
  assert.deepEqual(workspace.characters[0].profiles[0].personalBinds, [personalBind]);
  assert.equal(workspace.characters[0].profiles[0].personalSourceName, "Neverwinter binds.txt");
});

test("validates a round-trippable workspace and resolves the active character and profile", () => {
  const workspace = createDefaultProfileWorkspace({ keyValues: { fighter: "ctrl+7" } });
  const parsed = parseProfileWorkspaceJson(JSON.stringify(workspace));
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(getActiveCharacter(parsed.value)?.id, "character-default");
  assert.equal(getActiveProfile(parsed.value)?.id, "profile-default");
});

test("rejects unsupported versions and unresolved active ids", () => {
  const workspace = createDefaultProfileWorkspace({ keyValues: {} });
  assert.deepEqual(parseProfileWorkspaceValue({ ...workspace, version: 99 }), { ok: false, error: "Unsupported My Setup backup version." });
  const invalidActive = parseProfileWorkspaceValue({ ...workspace, activeProfileId: "missing-profile" });
  assert.equal(invalidActive.ok, false);
});

test("clones profiles without sharing mutable key or personal-bind objects", () => {
  const workspace = createDefaultProfileWorkspace({ keyValues: { fighter: "ctrl+7" }, personalBinds: [personalBind] });
  const original = getActiveProfile(workspace);
  assert.ok(original);
  const copy = cloneProfile(original, { id: "profile-aoe", name: "AoE" });
  assert.equal(copy.id, "profile-aoe");
  assert.equal(copy.name, "AoE");
  assert.deepEqual(copy.keyValues, original.keyValues);
  assert.deepEqual(copy.personalBinds, original.personalBinds);
  assert.notEqual(copy.keyValues, original.keyValues);
  assert.notEqual(copy.personalBinds, original.personalBinds);
  assert.notEqual(copy.personalBinds[0], original.personalBinds[0]);
});

test("rejects malformed JSON without throwing", () => {
  const parsed = parseProfileWorkspaceJson("{not-json");
  assert.equal(parsed.ok, false);
});
