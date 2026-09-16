export function isNeverwinterBindPayload(value) {
  const lines = String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 && lines.every((line) => /^\/(?:bind|unbind)\s+/i.test(line));
}
