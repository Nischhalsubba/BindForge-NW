import test from "node:test";
import assert from "node:assert/strict";
import { validateCatalogData } from "../scripts/catalog-integrity.mjs";

const validPreset = {
  id: "test-preset",
  type: "Utility",
  className: "Any Class",
  title: "Test preset",
  plainEnglish: "Runs a harmless test command.",
  defaultKey: "ctrl+f3",
  command: "showfps 1",
  searchTerms: ["test", "fps"],
  difficulty: "Easy",
};

const validCommand = {
  id: "showfps",
  command: "/showfps",
  bindCommand: "showfps",
  aliases: [],
  params: "1 or 0",
  category: "Performance information",
};

const validCombo = {
  combo: "ctrl+f3",
  baseKey: "f3",
  modifiers: ["ctrl"],
  category: "function key",
  status: "core",
};

function validate(overrides = {}) {
  return validateCatalogData({
    presets: overrides.presets ?? [validPreset],
    commands: overrides.commands ?? [validCommand],
    keyCombos: overrides.keyCombos ?? [validCombo],
  });
}

test("accepts a valid catalog fixture", () => {
  const result = validate();
  assert.equal(result.errors.length, 0);
});

test("rejects duplicate preset ids", () => {
  const result = validate({
    presets: [validPreset, { ...validPreset, title: "Another title" }],
  });
  assert.ok(result.errors.some((item) => item.message.includes("Duplicate preset id")));
});

test("rejects invalid preset enums", () => {
  const result = validate({
    presets: [{ ...validPreset, type: "Unknown", className: "Wizard", difficulty: "Impossible" }],
  });
  assert.equal(result.errors.filter((item) => item.message.startsWith("Unknown")).length, 3);
});

test("rejects invalid default key syntax", () => {
  const result = validate({ presets: [{ ...validPreset, defaultKey: "ctrl+alt" }] });
  assert.ok(result.errors.some((item) => item.message.includes("Invalid default key syntax")));
});

test("rejects unbalanced command quotes", () => {
  const result = validate({ presets: [{ ...validPreset, command: '"say broken' }] });
  assert.ok(result.errors.some((item) => item.message.includes("unbalanced double quotes")));
});

test("warns when a preset command contains a placeholder", () => {
  const result = validate({ presets: [{ ...validPreset, command: "Team_Invite <string>" }] });
  assert.equal(result.errors.length, 0);
  assert.ok(result.warnings.some((item) => item.message.includes("unresolved placeholder")));
});

test("rejects duplicate command ids and malformed command syntax", () => {
  const result = validate({
    commands: [validCommand, { ...validCommand, command: "showfps", bindCommand: "/showfps" }],
  });
  assert.ok(result.errors.some((item) => item.message.includes("Duplicate command id")));
  assert.ok(result.errors.some((item) => item.message.includes("command must start with /")));
  assert.ok(result.errors.some((item) => item.message.includes("bindCommand must not start with /")));
});

test("rejects duplicate and inconsistent key combinations", () => {
  const result = validate({
    keyCombos: [
      validCombo,
      { ...validCombo, baseKey: "f4", modifiers: ["alt"], status: "mystery" },
    ],
  });
  assert.ok(result.errors.some((item) => item.message.includes("Duplicate combo")));
  assert.ok(result.errors.some((item) => item.message.includes("Unknown combo status")));
  assert.ok(result.errors.some((item) => item.message.includes("modifiers must match combo prefix")));
  assert.ok(result.errors.some((item) => item.message.includes("baseKey must equal")));
});
