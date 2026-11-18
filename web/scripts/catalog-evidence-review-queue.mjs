// A non-blocking, deterministic triage view of the catalog-health evidence findings.
// This prioritizes human research; it never asserts that a command has been verified.
const REASONS = [
  "stale-verification",
  "duplicate-command-review",
  "missing-verification-date",
  "missing-source-url",
];

export function buildCatalogEvidenceReviewQueue(presets, findings, limit = 20) {
  const sourceIds = new Set((findings.missingSource ?? []).map((entry) => entry.id));
  const undatedIds = new Set((findings.missingVerificationDate ?? []).map((entry) => entry.id));
  const staleIds = new Set((findings.staleVerification ?? []).map((entry) => entry.id));
  const duplicateCommands = new Set(findings.duplicateCommands ?? []);
  const byReason = Object.fromEntries(REASONS.map((reason) => [reason, 0]));

  const queue = presets.flatMap((preset) => {
    const reasons = [];
    if (staleIds.has(preset.id)) reasons.push("stale-verification");
    if (duplicateCommands.has(preset.command)) reasons.push("duplicate-command-review");
    if (undatedIds.has(preset.id)) reasons.push("missing-verification-date");
    if (sourceIds.has(preset.id)) reasons.push("missing-source-url");
    if (!reasons.length) return [];

    for (const reason of reasons) byReason[reason] += 1;
    return [{
      id: preset.id,
      title: preset.title,
      sectionFile: preset.sectionFile,
      sourceType: preset.sourceType,
      confidence: preset.confidence,
      reasons,
    }];
  });

  // Most urgent first, then stable identifiers, so rerunning does not reshuffle
  // the review work whenever the file enumeration order changes.
  queue.sort((a, b) =>
    REASONS.indexOf(a.reasons[0]) - REASONS.indexOf(b.reasons[0]) ||
    String(a.id).localeCompare(String(b.id))
  );

  const safeLimit = Number.isInteger(limit) ? Math.max(0, limit) : 20;
  return { totalNeedingReview: queue.length, byReason, next: queue.slice(0, safeLimit) };
}
