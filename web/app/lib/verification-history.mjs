const VALID_RESULTS = new Set(["working", "needs-retest", "changed", "unknown"]);

function normalizeRecord(record) {
  if (!record || typeof record !== "object") return null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(record.date ?? "")) ? String(record.date) : "";
  if (!date) return null;
  const result = VALID_RESULTS.has(record.result) ? record.result : "unknown";
  return {
    date,
    result,
    ...(record.gameVersion ? { gameVersion: String(record.gameVersion) } : {}),
    ...(record.sourceUrl ? { sourceUrl: String(record.sourceUrl) } : {}),
    ...(record.note ? { note: String(record.note) } : {}),
  };
}

export function verificationHistoryForPreset(preset = {}) {
  const explicit = (Array.isArray(preset.verificationHistory) ? preset.verificationHistory : [])
    .map(normalizeRecord)
    .filter(Boolean)
    .sort((left, right) => right.date.localeCompare(left.date));
  if (explicit.length) return explicit;

  if (/^\d{4}-\d{2}-\d{2}$/.test(String(preset.verifiedAt ?? ""))) {
    return [{
      date: String(preset.verifiedAt),
      result: "unknown",
      ...(preset.gameVersion ? { gameVersion: String(preset.gameVersion) } : {}),
      ...(preset.sourceUrl ? { sourceUrl: String(preset.sourceUrl) } : {}),
      note: "Legacy verification record migrated without a recorded outcome.",
    }];
  }
  return [];
}

export function latestVerificationForPreset(preset = {}) {
  return verificationHistoryForPreset(preset)[0] ?? null;
}
