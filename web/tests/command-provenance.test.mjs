import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app/data/commands.ts", import.meta.url), "utf8");

test("core bind and UI persistence commands carry current reference-review provenance", () => {
  for (const id of ["bind","bind_load_file","bind_save_file","cmdlist","unbind","bind_local_load_file","bind_local_save_file","ui_load_file","ui_save_file"]) {
    const start = source.indexOf(`"id": "${id}"`);
    assert.notEqual(start, -1, id);
    const snippet = source.slice(start, start + 900);
    assert.match(snippet, /"verificationStatus": "reference-confirmed"/, id);
    assert.match(snippet, /"verifiedAt": "2026-09-19"/, id);
    assert.match(snippet, /neverwinter\.fandom\.com\/wiki\/Console_command/, id);
  }
});
