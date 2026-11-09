import { normalizeCombo } from "./keybind-core.mjs";
export const COPY_HISTORY_KEY = "bindforge-nw:copy-history:v1";
const empty = () => ({ version: 1, shortcutEnabled: false, items: [] });
export function parseCopyHistory(raw) {
  try {
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!value || value.version !== 1 || !Array.isArray(value.items))
      return empty();
    return {
      version: 1,
      shortcutEnabled: value.shortcutEnabled === true,
      items: value.items
        .filter(
          (x) =>
            x &&
            typeof x.text === "string" &&
            x.text.length <= 20000 &&
            typeof x.label === "string" &&
            typeof x.copiedAt === "string",
        )
        .slice(0, 50)
        .map((x) => ({
          text: x.text,
          label: x.label.slice(0, 120),
          copiedAt: x.copiedAt,
          pinned: x.pinned === true,
        })),
    };
  } catch {
    return empty();
  }
}
export function recordCopy(value, entry, copiedAt = new Date().toISOString()) {
  const state = parseCopyHistory(value);
  if (
    !entry ||
    typeof entry.text !== "string" ||
    !entry.text.trim() ||
    entry.text.length > 20000
  )
    return state;
  const old = state.items.find((x) => x.text === entry.text);
  const item = {
    text: entry.text,
    label: String(entry.label || "Command").slice(0, 120),
    copiedAt,
    pinned: old?.pinned === true,
  };
  const candidates = [
    item,
    ...state.items.filter((x) => x.text !== entry.text),
  ];
  while (candidates.length > 50) {
    let index = candidates.length - 1;
    while (index > 0 && candidates[index].pinned) index--;
    if (index === 0) {
      candidates.splice(1, 1);
    } else candidates.splice(index, 1);
  }
  return { ...state, items: candidates };
}
export function togglePin(value, text) {
  const state = parseCopyHistory(value);
  return {
    ...state,
    items: state.items.map((item) =>
      item.text === text ? { ...item, pinned: !item.pinned } : item,
    ),
  };
}
export function pairedBindOutput(text) {
  const lines = String(text ?? "")
    .trim()
    .split(/\r?\n/);
  const keys = [];
  for (const line of lines) {
    const match = line.match(/^\/bind\s+([^\s]+)\s+.+$/i);
    if (!match) return null;
    keys.push(normalizeCombo(match[1]));
  }
  if (!keys.length) return null;
  return (
    lines.join("\n") +
    "\n" +
    [...new Set(keys)].map((key) => "/unbind " + key).join("\n")
  );
}
