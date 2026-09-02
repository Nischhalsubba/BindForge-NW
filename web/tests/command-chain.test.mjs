import assert from "node:assert/strict";
import test from "node:test";
import { buildCommandChain, sanitizeBindFragment, validateCustomFragment } from "../app/lib/command-chain.mjs";

test("builds a single-command bind in the same quoted command form", () => {
  assert.equal(buildCommandChain("lbutton", ["+EvaluateLeftClick"]), '/bind lbutton "+EvaluateLeftClick"');
});

test("joins combined commands with $$ inside one quoted command chain", () => {
  assert.equal(
    buildCommandChain("lbutton", ["+evaluateleftclick", "+tacticalspecial", "+actionleft", "+actionright", "++actionleft", "++actionright"]),
    '/bind lbutton "+evaluateleftclick$$+tacticalspecial$$+actionleft$$+actionright$$++actionleft$$++actionright"',
  );
});

test("preserves command case and arguments", () => {
  assert.equal(
    buildCommandChain("q", ["+PowerTrayExec 2", "+PowerMusicOctaveExec -1"]),
    '/bind q "+PowerTrayExec 2$$+PowerMusicOctaveExec -1"',
  );
});

test("accepts a pasted manual command by removing only its leading slash", () => {
  assert.equal(sanitizeBindFragment("/+Actionforward"), "+Actionforward");
});

test("rejects separators and quotes in custom fragments", () => {
  assert.equal(validateCustomFragment("+Actionleft$$+Actionright").ok, false);
  assert.equal(validateCustomFragment('+Actionleft "x"').ok, false);
  assert.equal(validateCustomFragment("+Actionleft").ok, true);
});
