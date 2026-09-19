# Main branch protection

The repository ships a ready-to-import GitHub ruleset in [`protect-main.json`](./protect-main.json).

The ruleset targets only `main` and:

- requires pull requests;
- requires the exact Core, desktop/tablet/mobile Chromium, Firefox, WebKit, Dependency Audit, and CodeQL checks;
- requires branches to be up to date with `main` before merge;
- blocks force pushes;
- blocks deletion of `main`;
- has no bypass actors.

Production releases do not need a protection bypass. The manual **Release Production** workflow validates the current `main`, creates a release branch whose marker commit is `release: production [deploy]`, and prints a prefilled compare URL. A maintainer opens that PR normally, so GitHub emits the ordinary `pull_request` event and every required check runs under the ruleset. Merge the release PR only after those gates are green.

Netlify remains fail-closed. It accepts either the release marker commit itself (squash/rebase) or a normal merge commit whose second parent is that release marker, and only when the marker commit changes `.github/production-release.json`.

## Apply in GitHub

GitHub requires repository administration permission to create or import a ruleset.

1. Open **Settings → Rules → Rulesets** for this repository.
2. Choose **New ruleset → Import a ruleset**.
3. Import `.github/rulesets/protect-main.json`.
4. Confirm the target is exactly `main` and enforcement is **Active**.
5. Save the ruleset.
6. Verify GitHub reports `main` as protected and that a direct push is rejected.

Do not add a deployment requirement or a bypass actor to the ruleset. Production authorization remains the separate `[deploy]` release-PR flow.
