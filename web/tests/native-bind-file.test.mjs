import test from "node:test";
import assert from "node:assert/strict";
import {
  buildBindLoadCommand,
  buildNativeBindFile,
  buildNativeRestoreFile,
  makeNativeBindFilename,
} from "../app/lib/native-bind-file.mjs";

test("builds a Neverwinter loadable bind file without slash commands", () => {
  const result = buildNativeBindFile([
    { key: "ctrl+r", command: "gensendmessage Chat_Reply activate" },
    { key: "F1", command: '"say Pulling!$$+PowerTrayExec 3"' },
  ]);
  assert.equal(result.content, 'CTRL+R "gensendmessage Chat_Reply activate"\nF1 "say Pulling!$$+PowerTrayExec 3"\n');
  assert.deepEqual(result.skipped, []);
});

test("creates a safe filename and matching load command", () => {
  assert.equal(makeNativeBindFilename("My Character", "AoE / DPS", "2026-09-18"), "bindforge-my-character-aoe-dps-2026-09-18.txt");
  assert.equal(buildBindLoadCommand("bindforge-test.txt"), "/bind_load_file bindforge-test.txt");
});

test("builds a restore file only from imported evidence and reports unresolved keys", () => {
  const result = buildNativeRestoreFile(
    ["ctrl+r", "f2"],
    [{ mode: "bind", key: "ctrl+r", command: "old_command", raw: "/bind ctrl+r old_command", lineNumber: 1 }],
  );
  assert.equal(result.content, 'CTRL+R "old_command"\n');
  assert.deepEqual(result.unresolvedKeys, ["f2"]);
});
