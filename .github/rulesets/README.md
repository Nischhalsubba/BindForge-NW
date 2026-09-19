# Main branch protection

The repository ships a ready-to-import GitHub ruleset in [`protect-main.json`](./protect-main.json).

The ruleset targets only `main` and:

- requires pull requests;
- requires the exact Core, desktop/tablet/mobile Chromium, Firefox, WebKit, Dependency Audit, and CodeQL checks;
- requires branches to be up to date with `main` before merge;
- blocks force pushes;
- blocks deletion of `main`;
- has no bypass actors.

Production releases do not need a protection bypass. The manual **Release Production** workflow creates a dedicated release PR, waits for the same verified gates, then squash-merges it with the subject `release: production [deploy]`. Netlify remains fail-closed and only builds that explicit production marker on `main`.

## Apply in GitHub

GitHub requires repository administration permission to create or import a ruleset.

1. Open **Settings → Rules → Rulesets** for this repository.
2. Choose **New ruleset → Import a ruleset**.
3. Import `.github/rulesets/protect-main.json`.
4. Confirm the target is exactly `main` and enforcement is **Active**.
5. Save the ruleset.
6. Verify GitHub reports `main` as protected and that a direct push is rejected.

Do not add a deployment requirement to the ruleset. Production authorization remains the separate `[deploy]` release PR flow.
