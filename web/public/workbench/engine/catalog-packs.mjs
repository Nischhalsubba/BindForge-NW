const PACK_DEFINITIONS = [
  {
    id: "barbarian-dps",
    title: "Barbarian DPS",
    className: "Barbarian",
    role: "DPS",
    description: "Existing Barbarian presets explicitly tagged for DPS in the current catalogue.",
    filters: { className: "Barbarian", actionType: "All", search: "barbarian dps" },
    match: (preset) => preset.className === "Barbarian" && hasTerm(preset, "dps"),
  },
  {
    id: "fighter-dps",
    title: "Fighter DPS",
    className: "Fighter / Cleric",
    role: "DPS",
    description: "Existing Fighter presets explicitly tagged for DPS in the current catalogue.",
    filters: { className: "Fighter / Cleric", actionType: "All", search: "fighter dps" },
    match: (preset) => preset.className === "Fighter / Cleric" && hasTerm(preset, "fighter") && hasTerm(preset, "dps"),
  },
  {
    id: "ranger-hunter",
    title: "Ranger Hunter",
    className: "Ranger",
    role: "Hunter",
    description: "Ranger Hunter presets already present in the catalogue, grouped without changing their commands.",
    filters: { className: "Ranger", actionType: "All", search: "ranger hunter" },
    match: (preset) => preset.className === "Ranger" && hasTerm(preset, "hunter"),
  },
  {
    id: "warlock-animation-cancel",
    title: "Warlock animation cancels",
    className: "Warlock",
    role: "Class set",
    description: "Existing Warlock animation-cancel presets grouped as one reviewable set.",
    filters: { className: "Warlock", actionType: "Animation Cancel", search: "" },
    match: (preset) => preset.className === "Warlock" && preset.type === "Animation Cancel",
  },
  {
    id: "paladin-animation-cancel",
    title: "Paladin animation cancel",
    className: "Paladin",
    role: "Class set",
    description: "Existing Paladin animation-cancel presets grouped as one reviewable set.",
    filters: { className: "Paladin", actionType: "Animation Cancel", search: "" },
    match: (preset) => preset.className === "Paladin" && preset.type === "Animation Cancel",
  },
  {
    id: "ranger-animation-cancel",
    title: "Ranger animation cancels",
    className: "Ranger",
    role: "Hunter / class set",
    description: "Existing Ranger animation-cancel presets grouped for review; evidence labels remain visible.",
    filters: { className: "Ranger", actionType: "Animation Cancel", search: "" },
    match: (preset) => preset.className === "Ranger" && preset.type === "Animation Cancel",
  },
  {
    id: "barbarian-animation-cancel",
    title: "Barbarian animation cancels",
    className: "Barbarian",
    role: "DPS / class set",
    description: "Existing Barbarian animation-cancel presets grouped without upgrading their evidence level.",
    filters: { className: "Barbarian", actionType: "Animation Cancel", search: "" },
    match: (preset) => preset.className === "Barbarian" && preset.type === "Animation Cancel",
  },
  {
    id: "fighter-animation-cancel",
    title: "Fighter animation cancels",
    className: "Fighter / Cleric",
    role: "Fighter",
    description: "Fighter-tagged animation-cancel presets from the shared Fighter / Cleric catalogue category.",
    filters: { className: "Fighter / Cleric", actionType: "Animation Cancel", search: "fighter" },
    match: (preset) => preset.className === "Fighter / Cleric" && preset.type === "Animation Cancel" && hasTerm(preset, "fighter"),
  },
  {
    id: "cleric-animation-cancel",
    title: "Cleric animation cancels",
    className: "Fighter / Cleric",
    role: "Cleric",
    description: "Cleric-tagged animation-cancel presets from the shared Fighter / Cleric catalogue category.",
    filters: { className: "Fighter / Cleric", actionType: "Animation Cancel", search: "cleric" },
    match: (preset) => preset.className === "Fighter / Cleric" && preset.type === "Animation Cancel" && hasTerm(preset, "cleric"),
  },
  {
    id: "bard-songs",
    title: "Bard songs",
    className: "Bard",
    role: "Class set",
    description: "Existing Bard Song presets grouped together for faster selection and review.",
    filters: { className: "Bard", actionType: "Bard Songs", search: "" },
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
      filters: { ...definition.filters },
      presetIds: matching.map((preset) => preset.id),
      count: matching.length,
      confidence,
    };
  }).filter((pack) => pack.count > 0);
}

export function packNeedsReview(pack) {
  return pack.confidence.experimental > 0 || pack.confidence["community-tested"] > 0;
}
