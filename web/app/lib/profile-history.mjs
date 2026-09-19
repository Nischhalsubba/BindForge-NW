function cloneBinds(value = []) { return Array.isArray(value) ? value.map((entry) => ({ ...entry })) : []; }

export function makeProfileSnapshot(profile = {}, reason = "Change", createdAt = new Date().toISOString()) {
  return {
    id: `snapshot-${createdAt}-${String(reason).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    createdAt,
    reason: String(reason || "Change"),
    keyValues: { ...(profile.keyValues ?? {}) },
    personalBinds: cloneBinds(profile.personalBinds),
    personalSourceName: String(profile.personalSourceName ?? ""),
    personalImportedAt: String(profile.personalImportedAt ?? ""),
  };
}

export function pushProfileSnapshot(history = [], snapshot, limit = 12) {
  const rows = Array.isArray(history) ? history : [];
  if (!snapshot) return rows.slice(0, limit);
  const first = rows[0];
  if (first?.reason === snapshot.reason) {
    const delta = Math.abs(new Date(snapshot.createdAt).getTime() - new Date(first.createdAt).getTime());
    if (Number.isFinite(delta) && delta <= 5000) return rows.slice(0, limit);
  }
  return [snapshot, ...rows.filter((row) => row?.id !== snapshot.id)].slice(0, Math.max(1, limit));
}

export function restoreSnapshotProfile(profile = {}, snapshot = {}) {
  return {
    ...profile,
    keyValues: { ...(snapshot.keyValues ?? {}) },
    personalBinds: cloneBinds(snapshot.personalBinds),
    personalSourceName: String(snapshot.personalSourceName ?? ""),
    personalImportedAt: String(snapshot.personalImportedAt ?? ""),
    updatedAt: new Date().toISOString(),
  };
}
