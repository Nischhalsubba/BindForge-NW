import test from "node:test";
import assert from "node:assert/strict";
import { LATEST_IMPORTANT_GAME_UPDATE, verificationNeedsGameUpdateReview } from "../app/lib/game-version.mjs";

test("flags missing or pre-update verification without claiming the command is broken", () => {
  assert.equal(LATEST_IMPORTANT_GAME_UPDATE.date, "2026-09-17");
  assert.equal(verificationNeedsGameUpdateReview("2026-09-16"), true);
  assert.equal(verificationNeedsGameUpdateReview("2026-09-17"), false);
  assert.equal(verificationNeedsGameUpdateReview(), true);
});
