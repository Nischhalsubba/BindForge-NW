import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../app/data/keybindPresets.ts", import.meta.url);
const outputPath = new URL("../catalog-health.json", import.meta.url);
const source = await readFile(sourcePath, "utf8");

const objectBlocks = [...source.matchAll(/\{[\s\S]*?\n\s*\},?/g)].map((match) => match[0]);
const presets = objectBlocks
  .map((block) => ({
    id: block.match(/\bid:\s*["'`]([^"'`]+)["'`]/)?.[1],
    title: block.match(/\btitle:\s*["'`]([^"'`]+)["'`]/)?.[1],
    command: block.match(/\bcommand:\s*["'`]([^"'`]+)["'`]/)?.[1],
    sourceUrl: block.match(/\bsourceUrl:\s*["'`]([^"'`]+)["'`]/)?.[1],
    verifiedAt: block.match(/\bverifiedAt:\s*["'`]([^"'`]+)["'`]/)?.[1],
    confidence: block.match(/\bconfidence:\s*["'`]([^"'`]+)["'`]/)?.[1],
    difficulty: block.match(/\bdifficulty:\s*["'`]([^"'`]+)["'`]/)?.[1],
  }))
  .filter((preset) => preset.id && preset.command);

const duplicateIds = [...new Set(presets.filter((preset, index) => presets.findIndex((item) => item.id === preset.id) !== index).map((preset) => preset.id))];
const duplicateCommands = [...new Set(presets.filter((preset, index) => presets.findIndex((item) => item.command === preset.command) !== index).map((preset) => preset.command))];
const missingSource = presets.filter((preset) => !preset.sourceUrl).map(({ id, title }) => ({ id, title }));
const missingVerificationDate = presets.filter((preset) => !preset.verifiedAt).map(({ id, title }) => ({ id, title }));
const invalidVerificationDates = presets.filter((preset) => preset.verifiedAt && !/^\d{4}-\d{2}-\d{2}$/.test(preset.verifiedAt)).map(({ id, verifiedAt }) => ({ id, verifiedAt }));
const riskyWithoutExperimentalFlag = presets.filter((preset) => preset.difficulty === "Risky" && preset.confidence !== "experimental").map(({ id, title, confidence }) => ({ id, title, confidence }));

const report = {
  generatedAt: new Date().toISOString(),
  presetCount: presets.length,
  coverage: {
    sourceUrlPercent: presets.length ? Math.round(((presets.length - missingSource.length) / presets.length) * 100) : 0,
    verifiedAtPercent: presets.length ? Math.round(((presets.length - missingVerificationDate.length) / presets.length) * 100) : 0,
  },
  findings: {
    duplicateIds,
    duplicateCommands,
    missingSource,
    missingVerificationDate,
    invalidVerificationDates,
    riskyWithoutExperimentalFlag,
  },
};

await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

const blocking = duplicateIds.length + invalidVerificationDates.length + riskyWithoutExperimentalFlag.length;
if (blocking > 0) process.exitCode = 1;
