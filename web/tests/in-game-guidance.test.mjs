import assert from "node:assert/strict";
import test from "node:test";
import { isNeverwinterBindPayload } from "../app/lib/in-game-guidance.mjs";

test("shows in-game guidance for bind and unbind commands", () => {
  assert.equal(isNeverwinterBindPayload('/bind 5 "gensendmessage Vipaction_Bank activate"'), true);
  assert.equal(isNeverwinterBindPayload('/unbind 5 "gensendmessage Vipaction_Bank activate"'), true);
  assert.equal(isNeverwinterBindPayload('/bind 5 foo\n/bind 6 bar'), true);
});

test("does not treat share links, backups, or ordinary text as game commands", () => {
  assert.equal(isNeverwinterBindPayload("https://neverwinterkeybind.netlify.app/?preset=test"), false);
  assert.equal(isNeverwinterBindPayload('{"version":3,"preferences":{}}'), false);
  assert.equal(isNeverwinterBindPayload("Copied share link"), false);
  assert.equal(isNeverwinterBindPayload(""), false);
});

test("mixed payloads do not open game guidance", () => {
  assert.equal(isNeverwinterBindPayload('/bind 5 foo\nhttps://example.com'), false);
});
