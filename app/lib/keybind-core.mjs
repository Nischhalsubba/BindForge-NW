const modifierAliases = {
  ctrl: "ctrl",
  control: "ctrl",
  lctrl: "ctrl",
  leftctrl: "ctrl",
  leftcontrol: "ctrl",
  rctrl: "ctrl",
  rightctrl: "ctrl",
  rightcontrol: "ctrl",
  alt: "alt",
  lalt: "alt",
  leftalt: "alt",
  ralt: "alt",
  rightalt: "alt",
  shift: "shift",
  lshift: "shift",
  leftshift: "shift",
  rshift: "shift",
  rightshift: "shift",
};

const modifierOrder = ["ctrl", "alt", "shift"];

export function normalizeCombo(value) {
  const parts = String(value ?? "")
    .split("+")
    .map((part) => part.trim().toLowerCase().replace(/\s+/g, ""))
    .filter(Boolean);

  const modifiers = [];
  const keys = [];

  for (const part of parts) {
    const modifier = modifierAliases[part];
    if (modifier) {
      if (!modifiers.includes(modifier)) modifiers.push(modifier);
    } else if (!keys.includes(part)) {
      keys.push(part);
    }
  }

  const orderedModifiers = modifierOrder.filter((modifier) => modifiers.includes(modifier));
  return [...orderedModifiers, ...keys].join("+");
}

export function baseKey(value) {
  const combo = normalizeCombo(value);
  return combo.split("+").pop() ?? combo;
}

export function normalizeMessage(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/"/g, "'")
    .trim();
}

export function buildPresetLine({ defaultKey, command }, keyValue, mode = "bind") {
  const key = normalizeCombo(keyValue) || normalizeCombo(defaultKey) || "<key>";
  return mode === "unbind" ? `/unbind ${key}` : `/bind ${key} ${String(command).trim()}`;
}

export function buildCustomLine(keyValue, bindCommand, customArgs = "", mode = "bind") {
  const key = normalizeCombo(keyValue) || "<key>";
  if (mode === "unbind") return `/unbind ${key}`;

  const command = String(bindCommand ?? "").trim();
  const args = String(customArgs ?? "").trim();
  return `/bind ${key} ${command}${args ? ` ${args}` : ""}`.trimEnd();
}

export function buildSayLine(keyValue, message) {
  const key = normalizeCombo(keyValue) || "<key>";
  const cleanMessage = normalizeMessage(message) || "<message>";
  return `/bind ${key} "say ${cleanMessage}"`;
}
