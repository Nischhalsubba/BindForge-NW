export const RECOVERY_STORAGE_KEY = "bindforge-nw:recovery:v1";

export function makeRecoveryRecord(storageKey, raw, reason, createdAt = new Date().toISOString()) {
  const source = String(storageKey ?? "unknown");
  const body = String(raw ?? "");
  const time = String(createdAt);
  return {
    id: `recovery-${time}-${source.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
    storageKey: source,
    raw: body,
    reason: String(reason ?? "Invalid local data"),
    createdAt: time,
  };
}

export function parseRecoveryRecords(raw) {
  try {
    const parsed = JSON.parse(String(raw ?? ""));
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((record) => record
      && typeof record === "object"
      && typeof record.storageKey === "string"
      && typeof record.raw === "string"
      && typeof record.reason === "string"
      && typeof record.createdAt === "string"
      ? [record]
      : []);
  } catch {
    return [];
  }
}

export function appendRecoveryRecord(records = [], record, limit = 8) {
  const rows = Array.isArray(records) ? records : [];
  if (!record) return rows.slice(0, limit);
  const deduped = rows.filter((item) => !(item?.storageKey === record.storageKey && item?.raw === record.raw));
  return [record, ...deduped].slice(0, Math.max(1, limit));
}
