export function buildResearchCandidate({ query = "", className = "All", actionType = "All", difficulty = "All", createdAt = new Date().toISOString() } = {}) {
  const clean = String(query).trim();
  if (!clean) return null;
  return {
    schemaVersion: 1,
    kind: "bindforge-research-candidate",
    query: clean.slice(0, 240),
    filters: {
      className: String(className).slice(0, 80),
      actionType: String(actionType).slice(0, 80),
      difficulty: String(difficulty).slice(0, 80),
    },
    createdAt,
    status: "unverified-research-candidate",
  };
}
