import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app/data/keybindPresetSections/classSpecificCombos.ts", import.meta.url), "utf8");

test("Ranger Hunter community macros preserve exact double-dollar chaining", () => {
  assert.match(source, /\+specialClassPower \$\$ \+specialClassPower \$\$ \+PowerSlotExec 0/);
  assert.match(source, /\+PowerSlotExec 0 \$\$ \+specialClassPower \$\$ \+specialClassPower/);
});
