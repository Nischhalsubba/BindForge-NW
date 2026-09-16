import assert from "node:assert/strict";
import test from "node:test";
import { buildCatalogPacks, packNeedsReview } from "../app/lib/catalog-packs.mjs";

const presets = [
  {
    id: "barb-dps",
    className: "Barbarian",
    type: "Animation Cancel",
    difficulty: "Advanced",
    confidence: "experimental",
    searchTerms: ["barbarian", "dps", "animation", "cancel"],
  },
  {
    id: "fighter-dps",
    className: "Fighter / Cleric",
    type: "Animation Cancel",
    difficulty: "Advanced",
    confidence: "experimental",
    searchTerms: ["fighter", "dps", "animation", "cancel"],
  },
  {
    id: "ranger-hunter-a",
    className: "Ranger",
    type: "Animation Cancel",
    difficulty: "Advanced",
    confidence: "community-tested",
    searchTerms: ["ranger", "hunter", "animation", "cancel"],
  },
  {
    id: "ranger-other",
    className: "Ranger",
    type: "Utility",
    difficulty: "Easy",
    confidence: "verified",
    searchTerms: ["ranger", "utility"],
  },
  {
    id: "bard-song",
    className: "Bard",
    type: "Bard Songs",
    difficulty: "Easy",
    confidence: "verified",
    searchTerms: ["bard", "song"],
  },
];

test("builds class/role packs only from matching existing metadata", () => {
  const packs = buildCatalogPacks(presets);
  const barbarian = packs.find((pack) => pack.id === "barbarian-dps");
  const fighter = packs.find((pack) => pack.id === "fighter-dps");
  const ranger = packs.find((pack) => pack.id === "ranger-hunter");
  const bard = packs.find((pack) => pack.id === "bard-songs");

  assert.deepEqual(barbarian?.presetIds, ["barb-dps"]);
  assert.deepEqual(fighter?.presetIds, ["fighter-dps"]);
  assert.deepEqual(ranger?.presetIds, ["ranger-hunter-a"]);
  assert.deepEqual(bard?.presetIds, ["bard-song"]);
  assert.equal(packs.some((pack) => pack.presetIds.includes("ranger-other")), false);
});

test("pack filters reproduce the same explicit class/role intent", () => {
  const packs = buildCatalogPacks(presets);
  assert.deepEqual(packs.find((pack) => pack.id === "barbarian-dps")?.filters, {
    className: "Barbarian",
    actionType: "All",
    search: "barbarian dps",
  });
  assert.deepEqual(packs.find((pack) => pack.id === "bard-songs")?.filters, {
    className: "Bard",
    actionType: "Bard Songs",
    search: "",
  });
});

test("experimental and community-tested packs remain reviewable", () => {
  const packs = buildCatalogPacks(presets);
  assert.equal(packNeedsReview(packs.find((pack) => pack.id === "barbarian-dps")), true);
  assert.equal(packNeedsReview(packs.find((pack) => pack.id === "ranger-hunter")), true);
  assert.equal(packNeedsReview(packs.find((pack) => pack.id === "bard-songs")), false);
});
