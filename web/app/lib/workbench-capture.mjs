import {
  appendComboToken,
  armComboSeparator,
  comboFromKeyboardLike,
  comboFromMouseLike,
  removeLastComboToken,
} from "./key-capture.mjs";
export function captureKeyboard(value, event) {
  if (
    event.repeat ||
    event.isComposing ||
    event.key === "Tab" ||
    ["Control", "Alt", "Shift", "Meta"].includes(event.key)
  )
    return null;
  if (event.key === "+" || event.code === "NumpadAdd")
    return armComboSeparator(value);
  if (event.key === "Backspace" && value) return removeLastComboToken(value);
  const token = comboFromKeyboardLike(event);
  return token ? appendComboToken(value, token) : null;
}
export function captureMouse(value, event) {
  const token = comboFromMouseLike(event);
  return token ? appendComboToken(value, token) : null;
}
export function captureWheel(value, delta, event = {}) {
  const modifiers = [
    event.ctrlKey && "ctrl",
    event.altKey && "alt",
    event.shiftKey && "shift",
  ].filter(Boolean);
  return delta
    ? appendComboToken(
        value,
        [...modifiers, delta < 0 ? "wheelup" : "wheeldown"].join("+"),
      )
    : null;
}
