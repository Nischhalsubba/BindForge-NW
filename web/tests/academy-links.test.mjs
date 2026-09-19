import test from "node:test";
import assert from "node:assert/strict";
import { academyLinksForPreset } from "../app/lib/academy-links.mjs";

test("builds contextual Academy class and paragon routes", () => {
  assert.deepEqual(academyLinksForPreset({ className: "Ranger", title: "Hunter cancel", searchTerms: ["hunter"] }), [
    { label: "Academy: Ranger · Hunter", url: "https://neverwinterguide.netlify.app/classes/ranger/hunter/" },
  ]);
  assert.equal(academyLinksForPreset({ className: "Paladin", title: "Class power" })[0].url, "https://neverwinterguide.netlify.app/classes/paladin/");
});

test("handles the shared Fighter / Cleric catalogue class without inventing one route", () => {
  const links = academyLinksForPreset({ className: "Fighter / Cleric", title: "Fighter or Cleric class toggle", searchTerms: ["fighter", "cleric"] });
  assert.deepEqual(links.map((link) => link.url), [
    "https://neverwinterguide.netlify.app/classes/fighter/",
    "https://neverwinterguide.netlify.app/classes/cleric/",
  ]);
});
