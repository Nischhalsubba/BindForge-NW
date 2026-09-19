export function appendRecentPreset(current = [], presetId, limit = 8) {
  const clean = String(presetId ?? "").trim();
  const list = Array.isArray(current) ? current.filter((id) => typeof id === "string" && id.trim()) : [];
  if (!clean) return list.slice(0, limit);
  return [clean, ...list.filter((id) => id !== clean)].slice(0, Math.max(1, limit));
}

export function appendRecentChange(current = [], change = {}, limit = 8) {
  const presetId = String(change?.presetId ?? "").trim();
  const from = String(change?.from ?? "").trim();
  const to = String(change?.to ?? "").trim();
  if (!presetId || !to || from === to) return Array.isArray(current) ? current.slice(0, limit) : [];
  const item = {
    presetId,
    from,
    to,
    changedAt: typeof change.changedAt === "string" && change.changedAt ? change.changedAt : new Date().toISOString(),
  };
  const list = Array.isArray(current) ? current.filter((entry) => entry && typeof entry === "object" && entry.presetId) : [];
  return [item, ...list.filter((entry) => !(entry.presetId === presetId && entry.to === to))].slice(0, Math.max(1, limit));
}
