export const COMMUNITY_REPORT_OUTCOMES = ["works", "does-not-work", "needs-update"];

export function buildCommunityReport({
  preset,
  outcome,
  gameVersion = "",
  className = "",
  paragon = "",
  note = "",
  reportedAt = new Date().toISOString(),
} = {}) {
  if (!preset?.id || !preset?.title || !COMMUNITY_REPORT_OUTCOMES.includes(outcome)) return null;
  return {
    schemaVersion: 1,
    presetId: String(preset.id),
    presetTitle: String(preset.title),
    outcome,
    gameVersion: String(gameVersion).trim().slice(0, 80),
    className: String(className || preset.className || "").trim().slice(0, 80),
    paragon: String(paragon).trim().slice(0, 80),
    note: String(note).trim().slice(0, 500),
    reportedAt,
    trust: "unreviewed-community-evidence",
  };
}

export function buildCommunityPack({ name, gameVersion = "", presetIds = [], source = "local-export", createdAt = new Date().toISOString() } = {}) {
  const ids = [...new Set((Array.isArray(presetIds) ? presetIds : []).map((id) => String(id).trim()).filter(Boolean))];
  if (!String(name ?? "").trim() || !ids.length) return null;
  return {
    schemaVersion: 1,
    name: String(name).trim().slice(0, 80),
    gameVersion: String(gameVersion).trim().slice(0, 80),
    presetIds: ids,
    source,
    createdAt,
    trust: "community-pack-unverified",
  };
}

export function canPromoteCommunityEvidence(report) {
  return false;
}
