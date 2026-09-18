import test from "node:test";
import assert from "node:assert/strict";
import { getVisualKeyboardRowsForLayout } from "../app/lib/keyboard-layouts.mjs";

const baseRows = [
  [{ id: "escape", label: "Esc" }],
  [{ id: "1", label: "1" }],
  [
    { id: "tab", label: "Tab" },
    ..."qwertyuiop".split("").map((id) => ({ id, label: id.toUpperCase() })),
    { id: "leftbracket", label: "[" },
  ],
  [
    { id: "capslock", label: "Caps" },
    ..."asdfghjkl".split("").map((id) => ({ id, label: id.toUpperCase() })),
    { id: "semicolon", label: ";" },
  ],
  [
    { id: "shift", label: "Shift" },
    ..."zxcvbnm".split("").map((id) => ({ id, label: id.toUpperCase() })),
    { id: "comma", label: "," },
  ],
];

function letterIds(row) { return row.filter((key) => /^[a-z]$/.test(key.id)).map((key) => key.id); }

test("reorders QWERTZ and AZERTY letter positions without losing canonical key ids", () => {
  const qwertz = getVisualKeyboardRowsForLayout(baseRows, "qwertz");
  assert.deepEqual(letterIds(qwertz[2]), [..."qwertzuiop"]);
  assert.deepEqual(letterIds(qwertz[4]), [..."yxcvbnm"]);

  const azerty = getVisualKeyboardRowsForLayout(baseRows, "azerty");
  assert.deepEqual(letterIds(azerty[2]), [..."azertyuiop"]);
  assert.deepEqual(letterIds(azerty[3]), [..."qsdfghjklm"]);
  assert.deepEqual(letterIds(azerty[4]), [..."wxcvbn"]);

  const baseIds = new Set(baseRows.flat().map((key) => key.id));
  const azertyIds = new Set(azerty.flat().map((key) => key.id));
  assert.deepEqual([...azertyIds].sort(), [...baseIds].sort());
});
