const PACK_DEFINITIONS = [
  {
    id: "barbarian-dps",
    title: "Barbarian DPS",
    className: "Barbarian",
    role: "DPS",
    description: "Existing Barbarian presets explicitly tagged for DPS in the current catalogue.",
    match: (preset) => preset.className === "Barbarian" && hasTerm(preset, "dps"),
  },
  {
    id: "fighter-dps",
    title: "Fighter DPS",
    className: "Fighter / Cleric",
    role: "DPS",
    description: "Existing Fighter presets explicitly tagged for DPS in the current catalogue.",
    match: (preset) => preset.className === "Fighter / Cleric" && hasTerm(preset, "fighter") && hasTerm(preset, "dps"),
  },
  {
    id: "ranger-hunter",
    title: "Ranger Hunter",
    className: "Ranger",
    role: "Hunter",
    description: "Ranger Hunter presets already present in the catalogue, grouped without changing their commands.",
    match: (preset) => preset.className === "Ranger" && hasTerm(preset, "hunter"),
  },
  {
    id: "warlock-animation-cancel",
    title: "Warlock animation cancels",
    className: "Warlock",
    role: "Class set",
    description: "Existing Warlock animation-cancel presets grouped as one reviewable set.",
    match: (preset) => preset.className === "Warlock" && preset.type === "Animation Cancel",
  },
  {
    id: "paladin-animation-cancel",
    title: "Paladin animation cancel",
    className: "Paladin",
    role: "Class set",
    description: "Existing Paladin animation-cancel presets grouped as one reviewable set.",
    match: (preset) => preset.className === "Paladin" && preset.type === "Animation Cancel",
  },
  {
    id: "bard-songs",
    title: "Bard songs",
    className: "Bard",
    role: "Class set",
    description: "Existing Bard Song presets grouped together for faster selection and review.",
    match: (preset) => preset.className === "Bard" && preset.type === "Bard Songs",
  },
];

function hasTerm(preset, term) {
  const normalized = String(term).toLowerCase();
  return Array.isArray(preset.searchTerms)
    && preset.searchTerms.some((item) => String(item).toLowerCase() === normalized);
}

export function buildCatalogPacks(presets) {
  return PACK_DEFINITIONS.map((definition) => {
    const matching = presets.filter(definition.match);
    const confidence = matching.reduce(
      (counts, preset) => {
        const level = preset.confidence === "verified"
          ? "verified"
          : preset.confidence === "experimental" || preset.difficulty === "Risky"
            ? "experimental"
            : "community-tested";
        counts[level] += 1;
        return counts;
      },
      { verified: 0, "community-tested": 0, experimental: 0 },
    );
    return {
      id: definition.id,
      title: definition.title,
      className: definition.className,
      role: definition.role,
      description: definition.description,
      presetIds: matching.map((preset) => preset.id),
      count: matching.length,
      confidence,
    };
  }).filter((pack) => pack.count > 0);
}

export function packNeedsReview(pack) {
  return pack.confidence.experimental > 0 || pack.confidence["community-tested"] > 0;
}
