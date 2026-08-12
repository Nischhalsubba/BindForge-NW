#!/usr/bin/env node
/**
 * Cloudflare Workers Builds still invokes the OpenNext CLI from the repository root.
 * This tiny bootstrap keeps the real Next.js project owned by web/ while forwarding
 * Cloudflare's build, deploy, upload, and preview commands into that workspace.
 */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const webRoot = path.resolve(__dirname, '../../web');
const cliPath = path.join(webRoot, 'node_modules', '.bin', 'opennextjs-cloudflare');

/** Ensures the web workspace has its locked dependencies before Cloudflare invokes OpenNext. */
function ensureWebDependencies() {
  if (fs.existsSync(cliPath)) return;

  const install = spawnSync('npm', ['ci'], {
    cwd: webRoot,
    stdio: 'inherit',
    shell: false,
  });

  if (install.status !== 0) process.exit(install.status ?? 1);
}

/** Forwards the original Cloudflare CLI arguments to the workspace-local OpenNext executable. */
function runOpenNext() {
  ensureWebDependencies();
  const command = process.platform === 'win32' ? `${cliPath}.cmd` : cliPath;
  const result = spawnSync(command, process.argv.slice(2), {
    cwd: webRoot,
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  process.exit(result.status ?? 1);
}

runOpenNext();
