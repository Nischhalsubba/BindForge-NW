const modifierCodes = new Set([
  "ControlLeft", "ControlRight", "ShiftLeft", "ShiftRight", "AltLeft", "AltRight", "MetaLeft", "MetaRight",
]);

const COMBO_SEPARATOR = "+";
const separatorOnly = /^\s*\++\s*$/;

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
  NumpadEnter: "numpadenter",
};

const mouseButtonAliases = {
  0: "lbutton",
  1: "mbutton",
  2: "rbutton",
};

function fallbackKeyToken(key) {
  const clean = String(key ?? "").trim().toLowerCase();
  if (!clean || clean.includes(COMBO_SEPARATOR) || ["control", "shift", "alt", "meta", "dead", "unidentified"].includes(clean)) return "";
  if (clean === " ") return "space";
  if (clean === "esc") return "escape";
  if (clean === "arrowup") return "up";
  if (clean === "arrowdown") return "down";
  if (clean === "arrowleft") return "left";
  if (clean === "arrowright") return "right";
  return clean.replace(/\s+/g, "");
}

function comboWithModifiers(token, event) {
  if (!token || !event || event.metaKey) return "";
  const modifiers = [];
  if (event.ctrlKey) modifiers.push("ctrl");
  if (event.altKey) modifiers.push("alt");
  if (event.shiftKey) modifiers.push("shift");
  return [...modifiers, token].join(COMBO_SEPARATOR);
}

export function sanitizeComboInput(value) {
  const compactSeparators = String(value ?? "")
    .replace(/\s*\+\s*/g, COMBO_SEPARATOR)
    .replace(/\+{2,}/g, COMBO_SEPARATOR)
    .trim();
  return separatorOnly.test(compactSeparators) ? "" : compactSeparators;
}

export function comboTokens(value) {
  const clean = sanitizeComboInput(value);
  const withoutTrailingSeparator = clean.endsWith(COMBO_SEPARATOR) ? clean.slice(0, -1) : clean;
  return withoutTrailingSeparator.split(COMBO_SEPARATOR).map((token) => token.trim()).filter(Boolean);
}

export function comboAwaitingNext(value) {
  const clean = sanitizeComboInput(value);
  return Boolean(clean) && clean.endsWith(COMBO_SEPARATOR);
}

export function armComboSeparator(value) {
  const clean = sanitizeComboInput(value);
  if (!clean || clean.endsWith(COMBO_SEPARATOR)) return clean;
  return `${clean}${COMBO_SEPARATOR}`;
}

export function appendComboToken(currentValue, token) {
  const current = sanitizeComboInput(currentValue);
  const next = sanitizeComboInput(token).replace(/\+$/, "");
  if (!next) return current;
  if (!current || !current.endsWith(COMBO_SEPARATOR)) return next;
  const prefix = current.slice(0, -1).trim();
  return prefix ? `${prefix}${COMBO_SEPARATOR}${next}` : next;
}

export function removeLastComboToken(value) {
  const clean = sanitizeComboInput(value);
  if (!clean) return "";
  if (clean.endsWith(COMBO_SEPARATOR)) return clean.slice(0, -1);
  const tokens = comboTokens(clean);
  tokens.pop();
  return tokens.join(COMBO_SEPARATOR);
}

export function keyTokenFromCode(code, key = "", location = 0) {
  const cleanCode = String(code ?? "");
  const cleanKey = String(key ?? "").trim();
  if (!cleanCode || modifierCodes.has(cleanCode)) return "";

  const keyMatch = /^Key([A-Z])$/.exec(cleanCode);
  if (keyMatch) return keyMatch[1].toLowerCase();

  const digitMatch = /^Digit([0-9])$/.exec(cleanCode);
  if (digitMatch) return digitMatch[1];

  const functionMatch = /^F([1-9]|1[0-9]|2[0-4])$/.exec(cleanCode);
  if (functionMatch) return cleanCode.toLowerCase();

  const numpadMatch = /^Numpad([0-9])$/.exec(cleanCode);
  if (numpadMatch) return `numpad${numpadMatch[1]}`;

  // Both physical + keys are reserved for joining captured keys. Never expose
  // NumpadAdd as a standalone key token because + is BindForge's combo separator.
  if (cleanCode === "NumpadAdd") return "";
  if (cleanKey.includes(COMBO_SEPARATOR)) return "";

  if (codeAliases[cleanCode]) return codeAliases[cleanCode];

  if (location === 3 && /^[0-9]$/.test(cleanKey)) return `numpad${cleanKey}`;
  return fallbackKeyToken(cleanKey);
}

export function mouseTokenFromButton(button) {
  return mouseButtonAliases[Number(button)] ?? "";
}

export function comboFromKeyboardLike(event) {
  if (!event) return "";
  const token = keyTokenFromCode(event.code, event.key, event.location);
  return comboWithModifiers(token, event);
}

export function comboFromMouseLike(event) {
  if (!event) return "";
  const token = mouseTokenFromButton(event.button);
  return comboWithModifiers(token, event);
}
