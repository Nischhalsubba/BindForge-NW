// Builds a catalog-health report from the typed preset-section modules and blocks structural corruption.
import { readdir, writeFile } from "node:fs/promises";

const sectionsDirectory = new URL("../app/data/keybindPresetSections/", import.meta.url);
const outputPath = new URL("../catalog-health.json", import.meta.url);
const files = (await readdir(sectionsDirectory)).filter((name) => name.endsWith(".ts")).sort();
const presets = [];

/** Loads the exported preset array from one TypeScript section module. */
async function loadPresetArray(file) {
  const module = await import(new URL(file, sectionsDirectory));
  const exportedArrays = Object.values(module).filter(Array.isArray);

  if (exportedArrays.length !== 1) {
    throw new Error(`Expected exactly one exported preset array in ${file}, found ${exportedArrays.length}`);
  }

  return exportedArrays[0];
}

for (const file of files) {
  for (const preset of await loadPresetArray(file)) presets.push({ ...preset, sectionFile: file });
}

/** Returns repeated, non-empty values for a catalog field. */
function duplicateValues(field) {
  return [...new Set(
    presets
      .filter((preset, index) => presets.findIndex((item) => item[field] === preset[field]) !== index)
      .map((preset) => preset[field])
      .filter(Boolean),
  )];
}

/** Infers provenance when an older preset does not yet declare sourceType explicitly. */
function inferSourceType(preset) {
  const evidence = `${preset.plainEnglish ?? ""} ${preset.notes ?? ""}`.toLowerCase();
  if (preset.sourceType) return preset.sourceType;
  if (evidence.includes("wiki supplied") || evidence.includes("wiki-supplied")) return "wiki";
  if (evidence.includes("user supplied") || evidence.includes("user-submitted")) return "user-submitted";
  return "community";
}

const normalized = presets.map((preset) => ({
  ...preset,
  sourceType: inferSourceType(preset),
  confidence: preset.confidence ?? (preset.difficulty === "Risky" ? "experimental" : "community-tested"),
}));

const duplicateIds = duplicateValues("id");
const duplicateCommands = duplicateValues("command");
const missingSource = normalized.filter((preset) => !preset.sourceUrl).map(({ id, title, sourceType, sectionFile }) => ({ id, title, sourceType, sectionFile }));
const missingVerificationDate = normalized.filter((preset) => !preset.verifiedAt).map(({ id, title, sectionFile }) => ({ id, title, sectionFile }));
const invalidVerificationDates = normalized.filter((preset) => preset.verifiedAt && !/^\d{4}-\d{2}-\d{2}$/.test(preset.verifiedAt)).map(({ id, verifiedAt, sectionFile }) => ({ id, verifiedAt, sectionFile }));
const riskyWithoutExperimentalFlag = normalized.filter((preset) => preset.difficulty === "Risky" && preset.confidence !== "experimental").map(({ id, title, confidence, sectionFile }) => ({ id, title, confidence, sectionFile }));
const missingRequiredFields = normalized.filter((preset) => !preset.id || !preset.title || !preset.command || !preset.plainEnglish || !preset.defaultKey || !preset.difficulty).map(({ id, title, sectionFile }) => ({ id, title, sectionFile }));

const report = {
  generatedAt: new Date().toISOString(),
  sectionCount: files.length,
  presetCount: normalized.length,
  coverage: {
    sourceUrlPercent: normalized.length ? Math.round(((normalized.length - missingSource.length) / normalized.length) * 100) : 0,
    verifiedAtPercent: normalized.length ? Math.round(((normalized.length - missingVerificationDate.length) / normalized.length) * 100) : 0,
  },
  findings: {
    duplicateIds,
    duplicateCommands,
    missingRequiredFields,
    missingSource,
    missingVerificationDate,
    invalidVerificationDates,
    riskyWithoutExperimentalFlag,
  },
};

await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

// Provenance gaps are reported without blocking unrelated work. Structural catalog corruption blocks CI.
const blocking = duplicateIds.length + missingRequiredFields.length + invalidVerificationDates.length;
if (blocking > 0) process.exitCode = 1;
