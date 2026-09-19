import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = new URL("../app/", import.meta.url);
const TOTAL_BUDGET = 500_000;
const FILE_BUDGET = 90_000;

async function walk(directoryUrl) {
  const entries = await readdir(directoryUrl, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const url = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directoryUrl);
    if (entry.isDirectory()) files.push(...await walk(url));
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(url);
  }
  return files;
}

const rows = [];
for (const file of await walk(root)) {
  const content = await readFile(file, "utf8");
  if (!/^["']use client["'];/m.test(content)) continue;
  const meta = await stat(file);
  rows.push({ file: path.relative(new URL("../", import.meta.url).pathname, file.pathname), bytes: meta.size });
}
rows.sort((a,b) => b.bytes - a.bytes);
const totalBytes = rows.reduce((sum,row) => sum + row.bytes, 0);
const oversized = rows.filter((row) => row.bytes > FILE_BUDGET);
const report = { totalBytes, totalBudget: TOTAL_BUDGET, fileBudget: FILE_BUDGET, clientFiles: rows.length, largest: rows.slice(0,10), oversized };
console.log(JSON.stringify(report, null, 2));
if (totalBytes > TOTAL_BUDGET || oversized.length) {
  console.error("Client component source budget exceeded. Split/lazy-load advanced surfaces before adding more client code.");
  process.exitCode = 1;
}
