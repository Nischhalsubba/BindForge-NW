import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const requiredFiles = [
  ".github/dependabot.yml",
  ".github/workflows/security.yml",
  ".github/workflows/catalog-maintenance.yml",
  ".github/workflows/maintenance.yml",
  ".github/CODEOWNERS",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/catalog_correction.yml",
  ".github/pull_request_template.md",
  "SECURITY.md",
  "SUPPORT.md",
  "CONTRIBUTING.md",
  "CHANGELOG.md",
  "docs/INCIDENT_AND_ROLLBACK.md",
  "docs/RELEASE_TEMPLATE.md",
  "docs/FINAL_PROJECT_STATUS.md",
  "scripts/catalog-health.mjs",
];

test("repository governance and handoff files remain present", async () => {
  await Promise.all(requiredFiles.map((path) => access(path)));
});

test("security workflow uses explicit least-privilege permissions", async () => {
  const workflow = await readFile(".github/workflows/security.yml", "utf8");
  assert.match(workflow, /permissions:\n\s+contents: read/);
  assert.match(workflow, /security-events: write/);
  assert.match(workflow, /npm audit --omit=dev --audit-level=high/);
  assert.match(workflow, /github\/codeql-action\/analyze@v3/);
});

test("catalog health is part of the normal release check", async () => {
  const packageInfo = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(packageInfo.scripts["catalog:health"], "node scripts/catalog-health.mjs");
  assert.match(packageInfo.scripts.check, /npm run catalog:health/);
});

test("public attribution remains Archew", async () => {
  const packageInfo = JSON.parse(await readFile("package.json", "utf8"));
  const readme = await readFile("README.md", "utf8");
  assert.equal(packageInfo.author, "Archew");
  assert.match(readme, /Designed and developed by Archew\./);
});
