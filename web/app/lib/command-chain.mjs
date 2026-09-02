import { normalizeCombo } from "./keybind-core.mjs";

export function sanitizeBindFragment(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed.slice(1).trim() : trimmed;
}

export function validateCustomFragment(value) {
  const fragment = sanitizeBindFragment(value);
  if (!fragment) return { ok: false, message: "Enter a command fragment." };
  if (fragment.includes("$$")) return { ok: false, message: "Add one command at a time; the builder inserts $$ separators." };
  if (fragment.includes('"')) return { ok: false, message: "Quotes are not allowed inside a command fragment." };
  return { ok: true, message: "" };
}

export function buildCommandChain(keyValue, fragments) {
  const key = normalizeCombo(keyValue) || "<key>";
  const cleanFragments = (Array.isArray(fragments) ? fragments : [])
    .map(sanitizeBindFragment)
    .filter(Boolean);

  if (!cleanFragments.length) return `/bind ${key} "<command>"`;
  return `/bind ${key} "${cleanFragments.join("$$")}"`;
}
