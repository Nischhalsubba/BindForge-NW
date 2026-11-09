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

export function isCompleteCombo(value) {
  const raw = String(value ?? "").trim().toLowerCase().replace(/\s+/g, "");
  if (!raw || raw.startsWith("+") || raw.endsWith("+") || raw.includes("++")) return false;

  const normalized = normalizeCombo(raw);
  if (!normalized) return false;

  return normalized
    .split("+")
    .some((part) => !modifierAliases[part]);
}

export function baseKey(value) {
  const combo = normalizeCombo(value);
  return combo.split("+").pop() ?? combo;
}

export function normalizeCommandText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function commandsEquivalent(left, right) {
  return normalizeCommandText(left).toLowerCase() === normalizeCommandText(right).toLowerCase();
}

export function parseBindText(value) {
  const entries = [];
  const ignored = [];
  const lines = String(value ?? "").replace(/^\uFEFF/, "").split(/\r?\n/);

  lines.forEach((rawLine, index) => {
    const raw = rawLine.trim();
    if (!raw || raw.startsWith("#") || raw.startsWith("//") || raw.startsWith(";")) return;

    const match = raw.match(/^\/?(bind|unbind)\s+(\S+)(?:\s+([\s\S]*))?$/i);
    if (!match) {
      ignored.push({ lineNumber: index + 1, raw: rawLine });
      return;
    }

    const mode = match[1].toLowerCase();
    const key = normalizeCombo(match[2]);
    const command = normalizeCommandText(match[3] ?? "");

    if (!key || (mode === "bind" && !command)) {
      ignored.push({ lineNumber: index + 1, raw: rawLine });
      return;
    }

    entries.push({ mode, key, command, raw: rawLine, lineNumber: index + 1 });
  });

  return { entries, ignored };
}

export function resolveBindMap(entries) {
  const active = new Map();
  for (const entry of Array.isArray(entries) ? entries : []) {
    const key = normalizeCombo(entry?.key);
    if (!key) continue;
    if (entry?.mode === "unbind") active.delete(key);
    else active.set(key, { ...entry, mode: "bind", key, command: normalizeCommandText(entry?.command) });
  }
  return Array.from(active.values());
}

export function normalizeMessage(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/"/g, "'")
    .trim();
}

export function buildPresetLine({ defaultKey, command }, keyValue, mode = "bind") {
  const key = normalizeCombo(keyValue) || normalizeCombo(defaultKey) || "<key>";
  const commandText = String(command ?? "").trim();
  const verb = mode === "unbind" ? "unbind" : "bind";
  return `/${verb} ${key}${commandText ? ` ${commandText}` : ""}`;
}

export function buildCustomLine(keyValue, bindCommand, customArgs = "", mode = "bind") {
  const key = normalizeCombo(keyValue) || "<key>";
  const command = String(bindCommand ?? "").trim();
  const args = String(customArgs ?? "").trim();
  const verb = mode === "unbind" ? "unbind" : "bind";
  return `/${verb} ${key}${command ? ` ${command}` : ""}${args ? ` ${args}` : ""}`;
}

export function buildSayLine(keyValue, message) {
  const key = normalizeCombo(keyValue) || "<key>";
  const cleanMessage = normalizeMessage(message) || "<message>";
  return `/bind ${key} "say ${cleanMessage}"`;
}
