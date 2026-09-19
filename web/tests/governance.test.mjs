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
  ".github/workflows/release-production.yml",
  ".github/rulesets/protect-main.json",
  ".github/production-release.json",
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
  "scripts/client-boundary-audit.mjs",
  "docs/ADR-WEB-ONLY-PWA.md",
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
  assert.doesNotMatch(workflow, /npm run security:audit/);
  assert.match(workflow, /npm run check/);
  assert.match(workflow, /npm run typecheck:browser/);
  assert.match(workflow, /mobile-chromium/);
  assert.match(workflow, /tablet-chromium/);
  assert.match(workflow, /desktop-chromium/);
  assert.match(workflow, /desktop-firefox-smoke/);
  assert.match(workflow, /desktop-webkit-smoke/);
  assert.match(workflow, /browser: firefox/);
  assert.match(workflow, /browser: webkit/);
  assert.match(workflow, /npx --no-install playwright test --project=/);
  assert.match(workflow, /npx --no-install playwright install --with-deps "\$\{\{ matrix\.browser \}\}"/);
  assert.match(workflow, /fail-fast: false/);
  assert.doesNotMatch(workflow, /uses:\s+[^\s]+@v\d/);
});

test("security workflow reports dependency debt and runs CodeQL with immutable action pins", async () => {
  const workflow = await readFile(resolveFrom(repositoryRoot, ".github/workflows/security.yml"), "utf8");
  assert.match(workflow, /npm audit --audit-level=low/);
  assert.match(workflow, /continue-on-error: true/);
  assert.match(workflow, /Dependency audit findings/);
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

test("client component source weight is part of the normal quality gate", async () => {
  const packageInfo = JSON.parse(await readFile(resolveFrom(workspaceRoot, "package.json"), "utf8"));
  assert.equal(packageInfo.scripts["client:audit"], "node scripts/client-boundary-audit.mjs");
  assert.match(packageInfo.scripts.check, /npm run client:audit/);
});

test("PWA posture is explicitly web-only and the retired service worker stays retired", async () => {
  const adr = await readFile(resolveFrom(workspaceRoot, "docs/ADR-WEB-ONLY-PWA.md"), "utf8");
  assert.match(adr, /Decision: intentionally web-only/i);
  assert.match(adr, /no service worker/i);
  assert.match(adr, /catalogue freshness/i);
});

test("public attribution remains Archew", async () => {
  const packageInfo = JSON.parse(await readFile(resolveFrom(workspaceRoot, "package.json"), "utf8"));
  const readme = await readFile(resolveFrom(workspaceRoot, "README.md"), "utf8");
  assert.equal(packageInfo.author, "Archew");
  assert.match(readme, /Designed and developed by Archew\./);
});


test("main protection recipe requires PRs, exact verified gates, and no bypass", async () => {
  const recipe = JSON.parse(await readFile(resolveFrom(repositoryRoot, ".github/rulesets/protect-main.json"), "utf8"));
  assert.equal(recipe.name, "Protect main");
  assert.equal(recipe.target, "branch");
  assert.equal(recipe.enforcement, "active");
  assert.deepEqual(recipe.bypass_actors, []);
  assert.deepEqual(recipe.conditions.ref_name.include, ["refs/heads/main"]);
  assert.deepEqual(recipe.conditions.ref_name.exclude, []);

  const types = recipe.rules.map((rule) => rule.type);
  assert.equal(types.includes("deletion"), true);
  assert.equal(types.includes("non_fast_forward"), true);
  assert.equal(types.includes("pull_request"), true);
  assert.equal(types.includes("required_status_checks"), true);

  const pullRequest = recipe.rules.find((rule) => rule.type === "pull_request");
  assert.equal(pullRequest.parameters.required_approving_review_count, 0);
  assert.equal(pullRequest.parameters.required_review_thread_resolution, true);

  const checks = recipe.rules.find((rule) => rule.type === "required_status_checks");
  assert.equal(checks.parameters.strict_required_status_checks_policy, true);
  assert.deepEqual(
    checks.parameters.required_status_checks.map((item) => item.context).sort(),
    [
      "Browser regression (desktop-chromium)",
      "Browser regression (desktop-firefox-smoke)",
      "Browser regression (desktop-webkit-smoke)",
      "Browser regression (mobile-chromium)",
      "Browser regression (tablet-chromium)",
      "CodeQL",
      "Core verification",
      "Dependency audit",
    ].sort(),
  );
});

test("production release uses a checked PR instead of directly pushing to main", async () => {
  const workflow = await readFile(resolveFrom(repositoryRoot, ".github/workflows/release-production.yml"), "utf8");
  assert.match(workflow, /pull-requests:\s+write/);
  assert.match(workflow, /checks:\s+read/);
  assert.match(workflow, /\.github\/production-release\.json/);
  assert.match(workflow, /gh pr create/);
  assert.match(workflow, /gh pr merge/);
  assert.match(workflow, /--squash/);
  assert.match(workflow, /--subject "release: production \[deploy\]"/);
  assert.match(workflow, /Core verification/);
  assert.match(workflow, /Browser regression \(desktop-chromium\)/);
  assert.match(workflow, /Dependency audit/);
  assert.match(workflow, /CodeQL/);
  assert.doesNotMatch(workflow, /git push origin HEAD:main/);
});
