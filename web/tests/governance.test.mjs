// Verifies repository-level governance and application handoff files after the web workspace move.
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const repositoryRoot = new URL("../../", import.meta.url);
const workspaceRoot = new URL("../", import.meta.url);

const repositoryFiles = [
  ".github/dependabot.yml",
  ".github/workflows/quality.yml",
  ".github/workflows/security.yml",
  ".github/workflows/catalog-maintenance.yml",
  ".github/SECURITY.md",
  ".github/CODEOWNERS",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/catalog_correction.yml",
  ".github/pull_request_template.md",
  ".node-version",
];

const workspaceFiles = [
  "SUPPORT.md",
  "CONTRIBUTING.md",
  "CHANGELOG.md",
  "docs/INCIDENT_AND_ROLLBACK.md",
  "docs/RELEASE_TEMPLATE.md",
  "docs/FINAL_PROJECT_STATUS.md",
  "scripts/catalog-health.mjs",
];

/** Resolves a repository-relative path against the supplied URL root. */
function resolveFrom(root, path) {
  return new URL(path, root);
}

test("repository governance and application handoff files remain present", async () => {
  await Promise.all([
    ...repositoryFiles.map((path) => access(resolveFrom(repositoryRoot, path))),
    ...workspaceFiles.map((path) => access(resolveFrom(workspaceRoot, path))),
  ]);
});

test("quality workflow uses least privilege and runs complete checks inside the web workspace", async () => {
  const workflow = await readFile(resolveFrom(repositoryRoot, ".github/workflows/quality.yml"), "utf8");
  assert.match(workflow, /permissions:\n\s+contents: read/);
  assert.match(workflow, /working-directory: web/);
  assert.match(workflow, /cache-dependency-path: web\/package-lock\.json/);
  assert.match(workflow, /node-version-file: \.node-version/);
  assert.match(workflow, /npm run security:audit/);
  assert.match(workflow, /npm run check/);
  assert.match(workflow, /npm run typecheck:browser/);
  assert.match(workflow, /mobile-chromium/);
  assert.match(workflow, /tablet-chromium/);
  assert.match(workflow, /desktop-chromium/);
  assert.match(workflow, /npx --no-install playwright test --project=/);
  assert.match(workflow, /npx --no-install playwright install --with-deps chromium/);
  assert.match(workflow, /fail-fast: false/);
  assert.doesNotMatch(workflow, /uses:\s+[^\s]+@v\d/);
});

test("security workflow audits dependencies and runs CodeQL with immutable action pins", async () => {
  const workflow = await readFile(resolveFrom(repositoryRoot, ".github/workflows/security.yml"), "utf8");
  assert.match(workflow, /npm audit --audit-level=low/);
  assert.match(workflow, /github\/codeql-action\/init@[0-9a-f]{40}/);
  assert.match(workflow, /github\/codeql-action\/analyze@[0-9a-f]{40}/);
  assert.doesNotMatch(workflow, /uses:\s+[^\s]+@v\d/);
});

test("Dependabot tracks the relocated npm workspace and repository actions", async () => {
  const config = await readFile(resolveFrom(repositoryRoot, ".github/dependabot.yml"), "utf8");
  assert.match(config, /package-ecosystem: npm[\s\S]*directory: \/web/);
  assert.match(config, /package-ecosystem: github-actions[\s\S]*directory: \//);
  assert.match(config, /package-ecosystem: github-actions[\s\S]*interval: weekly/);
});

test("repository runtime stays pinned to the release-tested Node.js version", async () => {
  const nodeVersion = await readFile(resolveFrom(repositoryRoot, ".node-version"), "utf8");
  assert.equal(nodeVersion.trim(), "22.19.0");
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
