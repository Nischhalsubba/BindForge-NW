const ACADEMY_ROOT = "https://neverwinterguide.netlify.app";
const PARAGONS = {
  barbarian: ["blademaster", "sentinel"],
  bard: ["minstrel", "songblade"],
  cleric: ["arbiter", "devout"],
  fighter: ["dreadnought", "vanguard"],
  paladin: ["justicar", "oathkeeper"],
  ranger: ["hunter", "warden"],
  rogue: ["assassin", "whisperknife"],
  warlock: ["hellbringer", "soulweaver"],
  wizard: ["arcanist", "thaumaturge"],
};

function terms(preset) {
  return [preset?.title, preset?.plainEnglish, ...(Array.isArray(preset?.searchTerms) ? preset.searchTerms : [])]
    .join(" ").toLowerCase();
}

function matchingClasses(preset) {
  const haystack = terms(preset);
  const direct = String(preset?.className ?? "").toLowerCase();
  if (direct === "fighter / cleric") {
    const rows = [];
    if (haystack.includes("fighter")) rows.push("fighter");
    if (haystack.includes("cleric") || haystack.includes("devout") || haystack.includes("arbiter")) rows.push("cleric");
    return rows.length ? rows : ["fighter", "cleric"];
  }
  const known = Object.keys(PARAGONS).find((slug) => direct === slug);
  return known ? [known] : [];
}

export function academyLinksForPreset(preset = {}) {
  const haystack = terms(preset);
  const classes = matchingClasses(preset);
  if (!classes.length) return [{ label: "Neverwinter Academy classes", url: `${ACADEMY_ROOT}/classes/` }];
  return classes.map((classSlug) => {
    const paragon = PARAGONS[classSlug].find((candidate) => haystack.includes(candidate));
    const path = paragon ? `/classes/${classSlug}/${paragon}/` : `/classes/${classSlug}/`;
    const labelClass = classSlug.charAt(0).toUpperCase() + classSlug.slice(1);
    const labelParagon = paragon ? ` · ${paragon.charAt(0).toUpperCase() + paragon.slice(1)}` : "";
    return { label: `Academy: ${labelClass}${labelParagon}`, url: `${ACADEMY_ROOT}${path}` };
  });
}

export const ACADEMY_BASE_URL = ACADEMY_ROOT;
