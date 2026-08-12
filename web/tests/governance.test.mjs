// Verifies repository-level governance and application handoff files after the web workspace move.
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const repositoryRoot = new URL("../../", import.meta.url);
const workspaceRoot = new URL("../", import.meta.url);

const repositoryFiles = [
  ".github/dependabot.yml",
  ".github/workflows/quality.yml",
  ".github/workflows/catalog-maintenance.yml",
  ".github/CODEOWNERS",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/catalog_correction.yml",
  ".github/pull_request_template.md",
];

const workspaceFiles = [
  "SECURITY.md",
  "SUPPORT.md",
  "CONTRIBUTING.md",
  "CHANGELOG.md",
  "docs/INCIDENT_AND_ROLLBACK.md",
  "docs/RELEASE_TEMPLATE.md",
  "docs/FINAL_PROJECT_STATUS.md",
  "scripts/catalog-health.mjs",
];

const resolveFrom = (root, path) => new URL(path, root);

test("repository governance and application handoff files remain present", async () => {
  await Promise.all([
    ...repositoryFiles.map((path) => access(resolveFrom(repositoryRoot, path))),
    ...workspaceFiles.map((path) => access(resolveFrom(workspaceRoot, path))),
  ]);
});

test("quality workflow uses least privilege and runs inside the web workspace", async () => {
  const workflow = await readFile(resolveFrom(repositoryRoot, ".github/workflows/quality.yml"), "utf8");
  assert.match(workflow, /permissions:\n\s+contents: read/);
  assert.match(workflow, /working-directory: web/);
  assert.match(workflow, /cache-dependency-path: web\/package-lock\.json/);
  assert.match(workflow, /npm run check:release/);
});

test("Dependabot tracks the relocated npm workspace and repository actions", async () => {
  const config = await readFile(resolveFrom(repositoryRoot, ".github/dependabot.yml"), "utf8");
  assert.match(config, /package-ecosystem: npm[\s\S]*directory: \/web/);
  assert.match(config, /package-ecosystem: github-actions[\s\S]*directory: \//);
});

test("catalog health is part of the normal release check", async () => {
  const packageInfo = JSON.parse(await readFile(resolveFrom(workspaceRoot, "package.json"), "utf8"));
  assert.equal(packageInfo.scripts["catalog:health"], "node scripts/catalog-health.mjs");
  assert.match(packageInfo.scripts.check, /npm run catalog:health/);
});

test("public attribution remains Archew", async () => {
  const packageInfo = JSON.parse(await readFile(resolveFrom(workspaceRoot, "package.json"), "utf8"));
  const readme = await readFile(resolveFrom(workspaceRoot, "README.md"), "utf8");
  assert.equal(packageInfo.author, "Archew");
  assert.match(readme, /Designed and developed by Archew\./);
});
