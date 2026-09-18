import { normalizeCombo, normalizeCommandText } from "./keybind-core.mjs";

function unwrapOuterQuotes(value) {
  const text = String(value ?? "").trim();
  return text.length >= 2 && text.startsWith('"') && text.endsWith('"')
    ? text.slice(1, -1).trim()
    : text;
}

function nativeKey(value) {
  return normalizeCombo(value)
    .split("+")
    .filter(Boolean)
    .map((part) => part.toUpperCase())
    .join("+");
}

function safeNativeCommand(value) {
  const command = unwrapOuterQuotes(normalizeCommandText(value));
  if (!command || /[\r\n]/.test(command)) return null;
  return command.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function buildNativeBindFile(entries = []) {
  const lines = [];
  const skipped = [];

  for (const entry of Array.isArray(entries) ? entries : []) {
    const key = nativeKey(entry?.key);
    const nativeCommand = safeNativeCommand(entry?.command);
    if (!key || !nativeCommand.command) {
      skipped.push({ key: normalizeCombo(entry?.key), reason: !key ? "missing-key" : nativeCommand.reason });
      continue;
    }
    lines.push(`${key} "${nativeCommand.command}"`);
  }

  return {
    content: lines.length ? `${lines.join("\n")}\n` : "",
    skipped,
  };
}

export function buildNativeRestoreFile(keys = [], personalBinds = []) {
  const byKey = new Map();
  for (const entry of Array.isArray(personalBinds) ? personalBinds : []) {
    const key = normalizeCombo(entry?.key);
    if (key && typeof entry?.command === "string") byKey.set(key, entry.command);
  }

  const requestedKeys = [...new Set((Array.isArray(keys) ? keys : []).map(normalizeCombo).filter(Boolean))];
  const restoreEntries = [];
  const unresolvedKeys = [];

  for (const key of requestedKeys) {
    if (byKey.has(key)) restoreEntries.push({ key, command: byKey.get(key) });
    else unresolvedKeys.push(key);
  }

  return {
    ...buildNativeBindFile(restoreEntries),
    unresolvedKeys,
  };
}

export function makeNativeBindFilename(characterName, profileName, date = new Date().toISOString().slice(0, 10)) {
  const slug = [characterName, profileName]
    .map((value) => String(value ?? "").normalize("NFKD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase())
    .filter(Boolean)
    .join("-") || "pack";
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(String(date)) ? String(date) : new Date().toISOString().slice(0, 10);
  return `bindforge-${slug}-${safeDate}.txt`;
}

export function buildBindLoadCommand(filename) {
  const safe = String(filename ?? "").trim().replace(/[\r\n"]/g, "");
  return safe ? `/bind_load_file ${safe}` : "/bind_load_file <filename>";
}
