import assert from "node:assert/strict";
import test from "node:test";
import {
  buildVisualKeyboardState,
  VISUAL_KEYBOARD_KEYS,
} from "../app/lib/visual-keyboard.mjs";

const presets = [
  { id: "fighter", title: "Fighter cancel", defaultKey: "f8", command: "specialClassPower 1" },
  { id: "mount", title: "Mount", defaultKey: "f7", command: "MountSlotExec 0" },
];

test("exposes a stable physical keyboard model with common Neverwinter keys", () => {
  const ids = new Set(VISUAL_KEYBOARD_KEYS.map((key) => key.id));
  for (const id of ["escape", "1", "7", "q", "w", "a", "space", "left", "up", "right", "down"]) {
    assert.equal(ids.has(id), true, `expected keyboard key ${id}`);
  }
});

test("uses unknown rather than claiming keys are free before a personal keymap is imported", () => {
  const model = buildVisualKeyboardState({
    presets,
    keyValues: { fighter: "f8", mount: "f7" },
    personalBinds: [],
  });

  assert.equal(model.hasPersonalKeymap, false);
  assert.equal(model.byKey.get("7")?.state, "unknown");
  assert.ok(model.summary.unknown > 0);
  assert.equal(model.summary.available, 0);
});

test("marks imported-only keys as imported and untouched keys as available when personal evidence exists", () => {
  const model = buildVisualKeyboardState({
    presets,
    keyValues: { fighter: "f8", mount: "f7" },
    personalBinds: [{ mode: "bind", key: "ctrl+5", command: "invoke", raw: "/bind ctrl+5 invoke", lineNumber: 1 }],
  });

  assert.equal(model.hasPersonalKeymap, true);
  assert.equal(model.byKey.get("5")?.state, "imported");
  assert.equal(model.byKey.get("6")?.state, "available");
});

test("marks changed BindForge assignments as customized without treating catalogue defaults as active edits", () => {
  const model = buildVisualKeyboardState({
    presets,
    keyValues: { fighter: "ctrl+7", mount: "f7" },
    personalBinds: [],
  });

  const seven = model.byKey.get("7");
  assert.equal(seven?.state, "customized");
  assert.equal(seven?.customAssignments.length, 1);
  assert.equal(seven?.customAssignments[0].combo, "ctrl+7");
  assert.equal(model.byKey.get("f8")?.state, "unknown");
});

test("marks conflicting imported and customized commands on the same combo", () => {
  const model = buildVisualKeyboardState({
    presets,
    keyValues: { fighter: "ctrl+7", mount: "f7" },
    personalBinds: [{ mode: "bind", key: "ctrl+7", command: "Existing_Player_Command activate", raw: "/bind ctrl+7 Existing_Player_Command activate", lineNumber: 1 }],
  });

  const seven = model.byKey.get("7");
  assert.equal(seven?.state, "conflict");
  assert.equal(seven?.conflicts.length, 1);
  assert.match(seven?.accessibleLabel ?? "", /7.*Conflict/i);
});

test("marks duplicate customized BindForge assignments on one combo as a conflict", () => {
  const model = buildVisualKeyboardState({
    presets,
    keyValues: { fighter: "alt+9", mount: "alt+9" },
    personalBinds: [],
  });

  assert.equal(model.byKey.get("9")?.state, "conflict");
  assert.equal(model.byKey.get("9")?.customAssignments.length, 2);
});
