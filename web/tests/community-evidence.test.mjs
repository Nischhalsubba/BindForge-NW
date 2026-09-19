import test from "node:test";
import assert from "node:assert/strict";
import { buildCommunityPack, buildCommunityReport, canPromoteCommunityEvidence } from "../app/lib/community-evidence.mjs";

test("community report carries version and class context but cannot auto-promote trust", () => {
  const report = buildCommunityReport({
    preset: { id: "p1", title: "Test", className: "Ranger" },
    outcome: "needs-update",
    gameVersion: "2026-09-17 live",
    paragon: "Hunter",
    note: "Changed after patch",
    reportedAt: "2026-09-19T00:00:00Z",
  });
  assert.equal(report.gameVersion, "2026-09-17 live");
  assert.equal(report.className, "Ranger");
  assert.equal(report.paragon, "Hunter");
  assert.equal(report.trust, "unreviewed-community-evidence");
  assert.equal(canPromoteCommunityEvidence(report), false);
});

test("community packs are versioned local artifacts with stable unique preset ids", () => {
  const pack = buildCommunityPack({ name: "Tank test", gameVersion: "Mod X", presetIds: ["a", "a", "b"], createdAt: "2026-09-19T00:00:00Z" });
  assert.deepEqual(pack.presetIds, ["a", "b"]);
  assert.equal(pack.schemaVersion, 1);
  assert.equal(pack.trust, "community-pack-unverified");
});
