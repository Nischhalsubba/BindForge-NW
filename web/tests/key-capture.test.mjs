import test from "node:test";
import assert from "node:assert/strict";
import {
  comboFromKeyboardLike,
  comboFromMouseLike,
  keyTokenFromCode,
  mouseTokenFromButton,
} from "../app/lib/key-capture.mjs";

test("distinguishes number-row and numpad digits", () => {
  assert.equal(keyTokenFromCode("Digit9", "9", 0), "9");
  assert.equal(keyTokenFromCode("Numpad9", "9", 3), "numpad9");
});

test("captures keyboard modifiers in Neverwinter order", () => {
  assert.equal(comboFromKeyboardLike({ code: "KeyR", key: "r", ctrlKey: true, shiftKey: true }), "ctrl+shift+r");
  assert.equal(comboFromKeyboardLike({ code: "Digit5", key: "5", ctrlKey: true }), "ctrl+5");
  assert.equal(comboFromKeyboardLike({ code: "Numpad9", key: "9", location: 3, ctrlKey: true, altKey: true }), "ctrl+alt+numpad9");
});

test("maps navigation and punctuation to catalog tokens", () => {
  assert.equal(keyTokenFromCode("ArrowUp", "ArrowUp", 0), "up");
  assert.equal(keyTokenFromCode("BracketLeft", "[", 0), "lbracket");
  assert.equal(keyTokenFromCode("Equal", "=", 0), "equals");
  assert.equal(keyTokenFromCode("NumpadAdd", "+", 3), "numpadadd");
});

test("reserves literal plus for joining key combinations", () => {
  assert.equal(keyTokenFromCode("Equal", "+", 0), "");
  assert.equal(keyTokenFromCode("UnidentifiedCode", "+", 0), "");
  assert.equal(comboFromKeyboardLike({ code: "Equal", key: "+", shiftKey: true }), "");
  assert.equal(comboFromKeyboardLike({ code: "Digit5", key: "5", ctrlKey: true }), "ctrl+5");
});

test("maps supported mouse buttons to Neverwinter tokens", () => {
  assert.equal(mouseTokenFromButton(0), "lbutton");
  assert.equal(mouseTokenFromButton(1), "mbutton");
  assert.equal(mouseTokenFromButton(2), "rbutton");
  assert.equal(mouseTokenFromButton(3), "");
});

test("captures mouse buttons with keyboard modifiers", () => {
  assert.equal(comboFromMouseLike({ button: 0 }), "lbutton");
  assert.equal(comboFromMouseLike({ button: 2, ctrlKey: true }), "ctrl+rbutton");
  assert.equal(comboFromMouseLike({ button: 1, ctrlKey: true, altKey: true, shiftKey: true }), "ctrl+alt+shift+mbutton");
});

test("does not emit modifier-only, meta, or unsupported mouse combinations", () => {
  assert.equal(comboFromKeyboardLike({ code: "ControlLeft", key: "Control", ctrlKey: true }), "");
  assert.equal(comboFromKeyboardLike({ code: "KeyK", key: "k", metaKey: true }), "");
  assert.equal(comboFromMouseLike({ button: 0, metaKey: true }), "");
  assert.equal(comboFromMouseLike({ button: 4 }), "");
});
