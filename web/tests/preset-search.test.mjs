import assert from "node:assert/strict";
import test from "node:test";
import { normalizeSearchText, scorePresetSearch, searchHighlightTerms, suggestPresetSearches } from "../app/lib/preset-search.mjs";

const fighter = {
  id: "fighter-dps-animation-cancel-left-click",
  type: "Animation Cancel",
  className: "Fighter / Cleric",
  title: "Fighter DPS Animation Cancel: Left Click",
  plainEnglish: "Runs the Fighter class power and evaluates the normal left-click at-will.",
  command: '"+specialClassPower $$ +Evaluateleftclick $$ ++specialClassPower"',
  searchTerms: ["fighter", "dps", "animation", "cancel", "left", "click", "lbutton", "specialclasspower"],
};

const barbarian = {
  id: "barbarian-dps-animation-cancel-right-click",
  type: "Animation Cancel",
  className: "Barbarian",
  title: "Barbarian DPS Animation Cancel: Right Click",
  plainEnglish: "Runs the Barbarian DPS right-click animation-cancel sequence.",
  command: '"+powertrayexec 1 $$ +tacticalspecial"',
  searchTerms: ["barbarian", "dps", "animation", "cancel", "right", "click", "rbutton"],
};

const vipBank = {
  id: "vip-bank",
  type: "VIP Services",
  className: "Any Class",
  title: "Open VIP Bank",
  plainEnglish: "Opens the VIP bank service.",
  command: '"gensendmessage Vipaction_Bank activate"',
  searchTerms: ["vip", "bank", "service"],
};

const presets = [fighter, barbarian, vipBank];

test("normalizes punctuation, hyphens, and camelCase for search", () => {
  assert.equal(normalizeSearchText("At-Will + specialClassPower"), "at will + special class power");
});

test("matches player abbreviations and separate intent words", () => {
  assert.ok(scorePresetSearch(barbarian, "barb cancel") > 0);
  assert.equal(scorePresetSearch(vipBank, "barb cancel"), 0);
});

test("tolerates small typos without making unrelated presets match", () => {
  assert.ok(scorePresetSearch(fighter, "figther cancel") > 0);
  assert.equal(scorePresetSearch(vipBank, "figther cancel"), 0);
});

test("understands common mouse wording and command fragments", () => {
  assert.ok(scorePresetSearch(fighter, "left mouse fighter") > 0);
  assert.ok(scorePresetSearch(fighter, "specialclasspower") > 0);
});

test("relevance scoring ranks the intended preset first", () => {
  const ranked = presets
    .map((preset) => ({ preset, score: scorePresetSearch(preset, "fighter cancel") }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);
  assert.equal(ranked[0]?.preset.id, fighter.id);
});

test("highlight terms include useful aliases", () => {
  const terms = searchHighlightTerms("barb lmb");
  assert.ok(terms.includes("barbarian"));
  assert.ok(terms.includes("lbutton"));
});

test("no-result recovery suggests catalogue-backed searches", () => {
  const typoSuggestions = suggestPresetSearches(presets, "figther", 3);
  assert.equal(typoSuggestions[0], "Fighter / Cleric");
  const fallbackSuggestions = suggestPresetSearches(presets, "zzzzzz", 3);
  assert.ok(fallbackSuggestions.includes("Animation Cancel"));
});
