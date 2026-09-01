import test from "node:test";
import assert from "node:assert/strict";
import { comboFromKeyboardLike, keyTokenFromCode } from "../app/lib/key-capture.mjs";

test("distinguishes number-row and numpad digits", () => {
  assert.equal(keyTokenFromCode("Digit9", "9", 0), "9");
  assert.equal(keyTokenFromCode("Numpad9", "9", 3), "numpad9");
});

test("captures modifiers in Neverwinter order", () => {
  assert.equal(comboFromKeyboardLike({ code: "KeyR", key: "r", ctrlKey: true, shiftKey: true }), "ctrl+shift+r");
  assert.equal(comboFromKeyboardLike({ code: "Numpad9", key: "9", location: 3, ctrlKey: true, altKey: true }), "ctrl+alt+numpad9");
});

test("maps navigation and punctuation to catalog tokens", () => {
  assert.equal(keyTokenFromCode("ArrowUp", "ArrowUp", 0), "up");
  assert.equal(keyTokenFromCode("BracketLeft", "[", 0), "lbracket");
  assert.equal(keyTokenFromCode("NumpadAdd", "+", 3), "numpadadd");
});

test("does not emit modifier-only or meta combinations", () => {
  assert.equal(comboFromKeyboardLike({ code: "ControlLeft", key: "Control", ctrlKey: true }), "");
  assert.equal(comboFromKeyboardLike({ code: "KeyK", key: "k", metaKey: true }), "");
});
