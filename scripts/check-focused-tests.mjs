import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const roots = ["e2e", "tests"];
const supported = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const patterns = [
  /\btest\.only\s*\(/,
  /\bdescribe\.only\s*\(/,
  /\bit\.only\s*\(/,
  /\bfit\s*\(/,
  /\bfdescribe\s*\(/,
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (supported.has(extname(entry.name))) files.push(path);
  }
  return files;
}

const failures = [];
for (const root of roots) {
  let files = [];
  try {
    files = await walk(root);
  } catch (error) {
    if (error?.code === "ENOENT") continue;
    throw error;
  }

  for (const file of files) {
    const text = await readFile(file, "utf8");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (patterns.some((pattern) => pattern.test(line))) {
        failures.push(`${file}:${index + 1}: ${line.trim()}`);
      }
    });
  }
}

if (failures.length) {
  console.error("Focused tests are not allowed in committed test suites:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("No focused tests found.");
