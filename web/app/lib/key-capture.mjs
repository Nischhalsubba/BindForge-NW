const modifierCodes = new Set([
  "ControlLeft", "ControlRight", "ShiftLeft", "ShiftRight", "AltLeft", "AltRight", "MetaLeft", "MetaRight",
]);

const codeAliases = {
  Escape: "escape",
  Backspace: "backspace",
  Tab: "tab",
  Enter: "enter",
  Space: "space",
  Insert: "insert",
  Delete: "delete",
  Home: "home",
  End: "end",
  PageUp: "pageup",
  PageDown: "pagedown",
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  CapsLock: "capslock",
  NumLock: "numlock",
  ScrollLock: "scrolllock",
  Pause: "pause",
  PrintScreen: "printscreen",
  Minus: "minus",
  Equal: "equals",
  BracketLeft: "lbracket",
  BracketRight: "rbracket",
  Backslash: "backslash",
  IntlBackslash: "backslash",
  Semicolon: "semicolon",
  Quote: "apostrophe",
  Backquote: "grave",
  Comma: "comma",
  Period: "period",
  Slash: "slash",
  NumpadDecimal: "numpaddecimal",
  NumpadDivide: "numpaddivide",
  NumpadMultiply: "numpadmultiply",
  NumpadSubtract: "numpadsubtract",
  NumpadAdd: "numpadadd",
  NumpadEnter: "numpadenter",
};

function fallbackKeyToken(key) {
  const clean = String(key ?? "").trim().toLowerCase();
  if (!clean || ["control", "shift", "alt", "meta", "dead", "unidentified"].includes(clean)) return "";
  if (clean === " ") return "space";
  if (clean === "esc") return "escape";
  if (clean === "arrowup") return "up";
  if (clean === "arrowdown") return "down";
  if (clean === "arrowleft") return "left";
  if (clean === "arrowright") return "right";
  return clean.replace(/\s+/g, "");
}

export function keyTokenFromCode(code, key = "", location = 0) {
  const cleanCode = String(code ?? "");
  if (!cleanCode || modifierCodes.has(cleanCode)) return "";

  const keyMatch = /^Key([A-Z])$/.exec(cleanCode);
  if (keyMatch) return keyMatch[1].toLowerCase();

  const digitMatch = /^Digit([0-9])$/.exec(cleanCode);
  if (digitMatch) return digitMatch[1];

  const functionMatch = /^F([1-9]|1[0-9]|2[0-4])$/.exec(cleanCode);
  if (functionMatch) return cleanCode.toLowerCase();

  const numpadMatch = /^Numpad([0-9])$/.exec(cleanCode);
  if (numpadMatch) return `numpad${numpadMatch[1]}`;

  if (codeAliases[cleanCode]) return codeAliases[cleanCode];

  if (location === 3 && /^[0-9]$/.test(String(key))) return `numpad${key}`;
  return fallbackKeyToken(key);
}

export function comboFromKeyboardLike(event) {
  if (!event || event.metaKey) return "";
  const token = keyTokenFromCode(event.code, event.key, event.location);
  if (!token) return "";
  const modifiers = [];
  if (event.ctrlKey) modifiers.push("ctrl");
  if (event.altKey) modifiers.push("alt");
  if (event.shiftKey) modifiers.push("shift");
  return [...modifiers, token].join("+");
}
