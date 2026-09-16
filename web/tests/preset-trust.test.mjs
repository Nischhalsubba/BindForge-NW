import assert from "node:assert/strict";
import test from "node:test";
import { presetTrustInfo, trustNeedsCaution } from "../app/lib/preset-trust.mjs";

test("verified presets keep a clear evidence label", () => {
  const trust = presetTrustInfo({ confidence: "verified", sourceType: "official", verifiedAt: "2026-09-01", gameVersion: "Module 32" });
  assert.equal(trust.label, "Verified");
  assert.equal(trust.sourceLabel, "Official source");
  assert.equal(trust.checkedLabel, "Checked 2026-09-01");
  assert.equal(trust.versionLabel, "Module 32");
  assert.equal(trustNeedsCaution({ confidence: "verified" }), false);
});

test("community-tested presets explain that players should still test them", () => {
  const trust = presetTrustInfo({ confidence: "community-tested", sourceType: "community" });
  assert.equal(trust.label, "Community tested");
  assert.match(trust.description, /Test it on your character/i);
  assert.equal(trustNeedsCaution({ confidence: "community-tested" }), true);
});

test("experimental and risky presets are never promoted to verified", () => {
  assert.equal(presetTrustInfo({ confidence: "experimental", sourceType: "user-submitted" }).label, "Experimental");
  assert.equal(presetTrustInfo({ difficulty: "Risky" }).label, "Experimental");
  assert.equal(presetTrustInfo({ difficulty: "Easy" }).label, "Community tested");
});
