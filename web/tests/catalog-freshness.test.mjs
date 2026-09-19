import test from "node:test";
import assert from "node:assert/strict";
import { catalogFreshnessSummary } from "../app/lib/catalog-freshness.mjs";
import { verificationHistoryForPreset } from "../app/lib/verification-history.mjs";

test("summarizes dated, stale, and undated catalogue verification", () => {
  const summary = catalogFreshnessSummary([
    { id: "recent", verifiedAt: "2026-09-01" },
    { id: "stale", verifiedAt: "2025-01-01" },
    { id: "missing" },
  ], new Date("2026-09-18T00:00:00Z"), 180);

  assert.deepEqual(summary, {
    total: 3,
    dated: 2,
    recent: 1,
    stale: 1,
    undated: 1,
    needReview: 2,
    datedPercent: 67,
    recentPercent: 33,
    newestDate: "2026-09-01",
  });
});

test("preserves explicit verification history and migrates a legacy verification date without inventing a success result", () => {
  const explicit = verificationHistoryForPreset({
    verifiedAt: "2026-08-01",
    verificationHistory: [
      { date: "2026-07-01", result: "working", gameVersion: "Module A" },
      { date: "2026-09-01", result: "changed", gameVersion: "Module B", note: "Syntax changed" },
    ],
  });
  assert.equal(explicit[0].date, "2026-09-01");
  assert.equal(explicit[0].result, "changed");

  const legacy = verificationHistoryForPreset({ verifiedAt: "2026-08-01", gameVersion: "Current" });
  assert.equal(legacy.length, 1);
  assert.equal(legacy[0].result, "unknown");
  assert.match(legacy[0].note, /legacy/i);
});


test("tracks re-verification debt against the latest important Neverwinter update", () => {
  const summary = catalogFreshnessSummary([
    { verifiedAt: "2026-09-18" },
    { verifiedAt: "2026-09-16" },
    {},
  ], new Date("2026-09-19T00:00:00Z"), 180);
  assert.equal(summary.needsGameUpdateReview, 2);
  assert.equal(summary.latestImportantUpdate.date, "2026-09-17");
});
