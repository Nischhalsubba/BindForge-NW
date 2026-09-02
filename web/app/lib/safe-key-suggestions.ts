const MODIFIERS = [
  "ctrl+alt+shift",
  "ctrl+shift",
  "ctrl+alt",
  "alt+shift",
] as const;

const SAFE_BASE_KEYS = [
  "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12",
  "numpad0", "numpad1", "numpad2", "numpad3", "numpad4", "numpad5", "numpad6", "numpad7", "numpad8", "numpad9",
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
] as const;

const WINDOWS_RESERVED = new Set([
  "alt+f4",
  "alt+tab",
  "ctrl+alt+delete",
  "ctrl+shift+escape",
]);

export const KNOWN_NEVERWINTER_NATIVE_BASE_KEYS = new Set([
  "w", "a", "s", "d", "space", "shift", "t", "b", "c", "u", "n", "o", "i", "alt",
  "q", "e", "r", "tab", "f", "g", "k", "m", "j", "p", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
  "lbutton", "rbutton", "mbutton", "escape", "enter",
]);

export const SAFE_KEY_SUGGESTIONS = MODIFIERS.flatMap((modifier) =>
  SAFE_BASE_KEYS.map((baseKey) => `${modifier}+${baseKey}`),
).filter((combo) => !WINDOWS_RESERVED.has(combo));

export function suggestedKeyForIndex(index: number) {
  return SAFE_KEY_SUGGESTIONS[index % SAFE_KEY_SUGGESTIONS.length];
}

export function normalizedKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function isKnownNativeBaseKey(value: string) {
  const baseKey = normalizedKey(value).split("+").at(-1) ?? "";
  const hasMultipleModifiers = normalizedKey(value).split("+").length >= 3;
  return KNOWN_NEVERWINTER_NATIVE_BASE_KEYS.has(baseKey) && !hasMultipleModifiers;
}
