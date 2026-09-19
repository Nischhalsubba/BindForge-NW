import test from "node:test";
import assert from "node:assert/strict";
import { buildCatalogPacks } from "../app/lib/catalog-packs.mjs";

test("expanded quick packs include class-specific animation-cancel review sets when matching evidence exists", () => {
  const presets = [
    { id: "r", className: "Ranger", type: "Animation Cancel", searchTerms: ["ranger", "hunter"], confidence: "community-tested" },
    { id: "b", className: "Barbarian", type: "Animation Cancel", searchTerms: ["barbarian", "dps"], confidence: "experimental" },
    { id: "f", className: "Fighter / Cleric", type: "Animation Cancel", searchTerms: ["fighter", "dps"], confidence: "community-tested" },
    { id: "c", className: "Fighter / Cleric", type: "Animation Cancel", searchTerms: ["cleric"], confidence: "community-tested" },
  ];
  const ids = buildCatalogPacks(presets).map((pack) => pack.id);
  for (const id of ["ranger-animation-cancel","barbarian-animation-cancel","fighter-animation-cancel","cleric-animation-cancel"]) {
    assert.equal(ids.includes(id), true, id);
  }
});
