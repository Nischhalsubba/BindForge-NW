import test from "node:test";
import assert from "node:assert/strict";
import { buildResearchCandidate } from "../app/lib/research-candidate.mjs";

test("creates an explicitly unverified local research candidate with active filters", () => {
  const result = buildResearchCandidate({ query: "new ranger command", className: "Ranger", actionType: "Combat", createdAt: "2026-09-19T00:00:00Z" });
  assert.equal(result.query, "new ranger command");
  assert.equal(result.filters.className, "Ranger");
  assert.equal(result.status, "unverified-research-candidate");
});
