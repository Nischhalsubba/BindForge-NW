# Branch protection

Protect `main` with the following repository settings.

## Required pull-request rules

- Require a pull request before merging.
- Require at least one approving review when another maintainer is available.
- Dismiss stale approvals when new commits are pushed.
- Require conversation resolution before merging.
- Require branches to be up to date before merging.
- Block force pushes and branch deletion.
- Apply the rules to administrators.

## Required status checks

Require these checks by their workflow/job names:

- `Quality / check`
- `Production smoke / smoke`
- Netlify deploy preview
- Cloudflare Workers deployment preview

Do not merge while a required check is pending, cancelled, skipped unexpectedly, or failing.

## Merge method

Use squash merge for feature work unless preserving a meaningful multi-commit history is necessary. Delete merged feature branches after deployment verification.

## Release evidence

A release is complete only when:

1. lint, TypeScript, unit, catalog, production build, Playwright, and axe checks pass;
2. the live production smoke suite passes;
3. Netlify production reports `ready` for the merge commit;
4. Cloudflare reports a successful build for the same source state;
5. mobile, tablet, and desktop layouts are reviewed;
6. the release status document records the commit and known limitations.

These settings must be applied in GitHub repository settings by an administrator. This document is the source of truth for the expected configuration.
