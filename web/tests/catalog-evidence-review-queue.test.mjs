import test from "node:test";
import assert from "node:assert/strict";
import { buildCatalogEvidenceReviewQueue } from "../scripts/catalog-evidence-review-queue.mjs";

const preset = (id, command) => ({
  id, title: id, command, sourceType: "community",
  confidence: "community-tested", sectionFile: "example.ts",
});

test("prioritizes stale verification and does not create duplicate tasks for the same preset", () => {
  const presets = [preset("missing-only", "one"), preset("stale", "two")];
  const report = buildCatalogEvidenceReviewQueue(presets, {
    staleVerification: [{ id: "stale" }],
    missingSource: [{ id: "stale" }, { id: "missing-only" }],
    missingVerificationDate: [{ id: "missing-only" }],
    duplicateCommands: [],
  });

  assert.equal(report.totalNeedingReview, 2);
  assert.deepEqual(report.next.map((item) => item.id), ["stale", "missing-only"]);
  assert.deepEqual(report.next[0].reasons, ["stale-verification", "missing-source-url"]);
  assert.deepEqual(report.next[1].reasons, ["missing-verification-date", "missing-source-url"]);
  assert.equal(report.byReason["missing-source-url"], 2);
});

test("flags both uses of an identical command for human review without marking either invalid", () => {
  const report = buildCatalogEvidenceReviewQueue(
    [preset("barbarian", "right-click"), preset("warlock", "right-click")],
    { duplicateCommands: ["right-click"] }
  );

  assert.equal(report.totalNeedingReview, 2);
  assert.deepEqual(report.next.map((item) => item.id), ["barbarian", "warlock"]);
  assert.equal(report.byReason["duplicate-command-review"], 2);
  assert.ok(report.next.every((item) => item.reasons.includes("duplicate-command-review")));
});

test("caps the display without hiding total debt or fabricating sources", () => {
  const presets = ["c", "a", "b"].map((id) => preset(id, id));
  const report = buildCatalogEvidenceReviewQueue(presets, {
    missingSource: presets.map(({ id }) => ({ id })),
  }, 2);

  assert.equal(report.totalNeedingReview, 3);
  assert.deepEqual(report.next.map((item) => item.id), ["a", "b"]);
  assert.equal(report.byReason["missing-source-url"], 3);
  assert.equal(Object.hasOwn(report.next[0], "sourceUrl"), false);
});

test("returns an empty review queue when the catalogue findings are clean", () => {
  const report = buildCatalogEvidenceReviewQueue([preset("safe", "command")], {});
  assert.equal(report.totalNeedingReview, 0);
  assert.deepEqual(report.next, []);
  assert.ok(Object.values(report.byReason).every((count) => count === 0));
});
