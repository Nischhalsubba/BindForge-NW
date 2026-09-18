import test from "node:test";
import assert from "node:assert/strict";
import { parseCmdlist, reconcileCmdlist } from "../app/lib/cmdlist-reconcile.mjs";

test("parses slash-prefixed and bare cmdlist entries without duplicating commands", () => {
  const parsed = parseCmdlist(`
/bind Bind a key to a command
/bind_load_file Load entity keybinds from a file
cmdlist Show all available commands
/bind duplicate line
not-a-command???
`);
  assert.deepEqual(parsed.commands, ["bind", "bind_load_file", "cmdlist"]);
  assert.equal(parsed.ignored.length, 1);
});

test("reconciles pasted game commands against the BindForge catalogue without claiming removals", () => {
  const result = reconcileCmdlist(
    "/bind Bind a key\n/bind_load_file Load binds\n/new_live_command New in game",
    [
      { command: "/bind", bindCommand: "bind", aliases: [] },
      { command: "/cmdlist", bindCommand: "cmdlist", aliases: [] },
      { command: "/showfps", bindCommand: "showfps", aliases: ["fps"] },
    ],
  );
  assert.deepEqual(result.matched, ["bind"]);
  assert.deepEqual(result.missingFromBindForge, ["bind_load_file", "new_live_command"]);
  assert.deepEqual(result.notSeenInPastedList, ["cmdlist", "showfps"]);
  assert.equal(result.pastedCount, 3);
  assert.equal(result.catalogCount, 3);
});


test("parses chat-prefixed cmdlist output and ignores headings", () => {
  const parsed = parseCmdlist("[System] bind Bind a key\n[12:34] [System] bind_load_file Load a file\nCommands available:\nUsage: /cmdlist");
  assert.deepEqual(parsed.commands, ["bind", "bind_load_file", "cmdlist"]);
  assert.equal(parsed.ignored.some((line) => /Commands available/.test(line.raw)), true);
});
