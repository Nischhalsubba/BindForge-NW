import test from "node:test";
import assert from "node:assert/strict";
import {
  baseKey,
  buildCustomLine,
  buildPresetLine,
  buildSayLine,
  normalizeCombo,
  normalizeMessage,
} from "../app/lib/keybind-core.mjs";

test("normalizes modifier aliases and order", () => {
  assert.equal(normalizeCombo(" Shift + Left Control + R "), "ctrl+shift+r");
  assert.equal(normalizeCombo("alt+ctrl+F4"), "ctrl+alt+f4");
});

test("removes duplicate modifiers and keys", () => {
  assert.equal(normalizeCombo("ctrl+control+r+r"), "ctrl+r");
});

test("returns the normalized base key", () => {
  assert.equal(baseKey("ctrl+shift+Numpad7"), "numpad7");
});

test("builds preset bind and unbind lines", () => {
  const preset = { defaultKey: "F3", command: "invoke" };
  assert.equal(buildPresetLine(preset, " Ctrl + R ", "bind"), "/bind ctrl+r invoke");
  assert.equal(buildPresetLine(preset, "", "unbind"), "/unbind f3");
});

test("builds custom commands with optional arguments", () => {
  assert.equal(
    buildCustomLine("Numpad9", "gensendmessage", "Vipaction_Bankvendor activate", "bind"),
    "/bind numpad9 gensendmessage Vipaction_Bankvendor activate",
  );
  assert.equal(buildCustomLine("F2", "invoke", "", "bind"), "/bind f2 invoke");
  assert.equal(buildCustomLine("F2", "invoke", "ignored", "unbind"), "/unbind f2");
});

test("normalizes multiline say messages and embedded quotes", () => {
  assert.equal(normalizeMessage('  Group\n on "me"  '), "Group on 'me'");
  assert.equal(buildSayLine(" F1 ", 'ARTIFACTS\n"NOW"'), '/bind f1 "say ARTIFACTS \'NOW\'"');
});

test("uses visible placeholders for incomplete custom input", () => {
  assert.equal(buildCustomLine("", "invoke", "", "bind"), "/bind <key> invoke");
  assert.equal(buildSayLine("", ""), '/bind <key> "say <message>"');
});
