import test from "node:test";
import assert from "node:assert/strict";
import { assertCatalogIntegrity, catalogIntegrityErrors } from "../app/lib/catalog-integrity.mjs";

function validCatalogs() {
  return {
    presets: [
      {
        id: "invoke",
        type: "Invocation / Character",
        className: "Any Class",
        title: "Invoke",
        plainEnglish: "Open invocation.",
        defaultKey: "ctrl+i",
        command: "invoke",
        searchTerms: ["invoke", "prayer"],
        difficulty: "Easy",
      },
    ],
    commands: [
      {
        id: "showfps",
        command: "/showfps",
        bindCommand: "showfps",
        aliases: [],
        params: "1 or 0",
        category: "Performance",
      },
    ],
    keyCombos: [
      {
        combo: "ctrl+i",
        baseKey: "i",
        modifiers: ["ctrl"],
        category: "letter",
        status: "core",
      },
    ],
  };
}

test("accepts a valid catalog set", () => {
  assert.equal(assertCatalogIntegrity(validCatalogs()), true);
  assert.deepEqual(catalogIntegrityErrors(validCatalogs()), []);
});

test("reports duplicate preset ids, command entries, and combinations", () => {
  const catalogs = validCatalogs();
  catalogs.presets.push({ ...catalogs.presets[0] });
  catalogs.commands.push({ ...catalogs.commands[0] });
  catalogs.keyCombos.push({ ...catalogs.keyCombos[0] });

  const errors = catalogIntegrityErrors(catalogs);
  assert.ok(errors.includes("Duplicate preset id: invoke"));
  assert.ok(errors.includes("Duplicate command entry: showfps | Performance | 1 or 0"));
  assert.ok(errors.includes("Duplicate key combination: ctrl+i"));
});

test("allows command variants with the same id", () => {
  const catalogs = validCatalogs();
  catalogs.commands.push({
    ...catalogs.commands[0],
    params: "toggle",
    category: "Advanced performance",
  });

  assert.deepEqual(catalogIntegrityErrors(catalogs), []);
});

test("rejects malformed command syntax", () => {
  const catalogs = validCatalogs();
  catalogs.commands[0].command = "showfps";
  catalogs.commands[0].bindCommand = "/showfps";

  const errors = catalogIntegrityErrors(catalogs);
  assert.ok(errors.includes("Command showfps must expose a slash-prefixed command."));
  assert.ok(errors.includes("Command showfps has an invalid bind command."));
});

test("rejects mismatched key-combination metadata", () => {
  const catalogs = validCatalogs();
  catalogs.keyCombos[0].baseKey = "o";
  catalogs.keyCombos[0].modifiers = ["alt"];

  const errors = catalogIntegrityErrors(catalogs);
  assert.ok(errors.includes("Key combination ctrl+i does not end with its base key."));
  assert.ok(errors.includes("Key combination ctrl+i modifiers do not match the combo string."));
});

test("throws one actionable aggregate error", () => {
  const catalogs = validCatalogs();
  catalogs.presets[0].difficulty = "Unknown";

  assert.throws(
    () => assertCatalogIntegrity(catalogs),
    /BindForge catalog integrity failed:\n- Preset invoke has an unsupported difficulty\./,
  );
});
