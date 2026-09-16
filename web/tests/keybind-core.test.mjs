import test from "node:test";
import assert from "node:assert/strict";
import {
  baseKey,
  buildCustomLine,
  buildPresetLine,
  buildSayLine,
  commandsEquivalent,
  isCompleteCombo,
  normalizeCombo,
  normalizeCommandText,
  normalizeMessage,
  parseBindText,
  resolveBindMap,
} from "../app/lib/keybind-core.mjs";

test("normalizes modifier aliases and order", () => {
  assert.equal(normalizeCombo(" Shift + Left Control + R "), "ctrl+shift+r");
  assert.equal(normalizeCombo("alt+ctrl+F4"), "ctrl+alt+f4");
});

test("removes duplicate modifiers and keys", () => {
  assert.equal(normalizeCombo("ctrl+control+r+r"), "ctrl+r");
});

test("recognizes complete combos while a trailing plus stays pending", () => {
  assert.equal(isCompleteCombo("ctrl+5"), true);
  assert.equal(isCompleteCombo("5+6"), true);
  assert.equal(isCompleteCombo("ctrl+rbutton"), true);
  assert.equal(isCompleteCombo("numpadadd"), true);
  assert.equal(isCompleteCombo(""), false);
  assert.equal(isCompleteCombo("+"), false);
  assert.equal(isCompleteCombo("5+"), false);
  assert.equal(isCompleteCombo("+5"), false);
  assert.equal(isCompleteCombo("5++6"), false);
  assert.equal(isCompleteCombo("ctrl"), false);
  assert.equal(isCompleteCombo("ctrl+shift"), false);
});

test("returns the normalized base key", () => {
  assert.equal(baseKey("ctrl+shift+Numpad7"), "numpad7");
});

test("changes only the verb between preset bind and unbind lines", () => {
  const preset = { defaultKey: "F3", command: "invoke" };
  assert.equal(buildPresetLine(preset, " Ctrl + R ", "bind"), "/bind ctrl+r invoke");
  assert.equal(buildPresetLine(preset, " Ctrl + R ", "unbind"), "/unbind ctrl+r invoke");
  assert.equal(buildPresetLine(preset, "", "unbind"), "/unbind f3 invoke");
});

test("builds custom commands with optional arguments while preserving them in unbind mode", () => {
  assert.equal(
    buildCustomLine("Numpad9", "gensendmessage", "Vipaction_Bankvendor activate", "bind"),
    "/bind numpad9 gensendmessage Vipaction_Bankvendor activate",
  );
  assert.equal(buildCustomLine("F2", "invoke", "", "bind"), "/bind f2 invoke");
  assert.equal(buildCustomLine("F2", "invoke", "ignored", "unbind"), "/unbind f2 invoke ignored");
});

test("normalizes multiline say messages and embedded quotes", () => {
  assert.equal(normalizeMessage('  Group\n on "me"  '), "Group on 'me'");
  assert.equal(buildSayLine(" F1 ", 'ARTIFACTS\n"NOW"'), '/bind f1 "say ARTIFACTS \'NOW\'"');
});

test("uses visible placeholders for incomplete custom input", () => {
  assert.equal(buildCustomLine("", "invoke", "", "bind"), "/bind <key> invoke");
  assert.equal(buildSayLine("", ""), '/bind <key> "say <message>"');
});

test("parses pasted Neverwinter bind text and reports unsupported lines", () => {
  const parsed = parseBindText(`
# saved keymap
/bind R gensendmessage Chat_Reply activate
bind Ctrl + 5 gensendmessage Vipaction_Bankvendor activate
/bind lbutton "+specialClassPower $$ +Evaluateleftclick $$ ++specialClassPower"
this is not a bind
/unbind r
`);

  assert.equal(parsed.entries.length, 4);
  assert.equal(parsed.ignored.length, 1);
  assert.equal(parsed.entries[0].key, "r");
  assert.equal(parsed.entries[1].key, "ctrl");
  assert.match(parsed.entries[2].command, /specialClassPower/);
});

test("resolves the final active personal keymap when later unbinds remove keys", () => {
  const parsed = parseBindText(`
/bind r old_command
/bind f1 first_command
/bind r new_command
/unbind f1
`);
  const active = resolveBindMap(parsed.entries);

  assert.deepEqual(active.map((entry) => [entry.key, entry.command]), [["r", "new_command"]]);
});

test("normalizes commands before comparing imported binds with presets", () => {
  assert.equal(normalizeCommandText("  invoke   Something  "), "invoke Something");
  assert.equal(commandsEquivalent("Invoke Something", " invoke   something "), true);
  assert.equal(commandsEquivalent("invoke one", "invoke two"), false);
});
