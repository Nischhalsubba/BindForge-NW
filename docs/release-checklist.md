# BindForge NW release checklist

## Automated gate

- [ ] `npm ci` succeeds with the committed lockfile.
- [ ] ESLint passes.
- [ ] TypeScript type checking passes.
- [ ] Node unit tests pass.
- [ ] The production Next.js build succeeds.
- [ ] Playwright smoke and regression tests pass in Chromium.
- [ ] The axe accessibility baseline reports no violations.
- [ ] The Playwright report is retained as a workflow artifact.

Run the **Release verification** workflow from GitHub Actions before promoting a release.

## Manual browser review

- [ ] Search, class, action, and difficulty filters update the same shared state.
- [ ] Bind and unbind previews update immediately.
- [ ] Edited keys survive a reload.
- [ ] Command Lab selections and filters survive a reload.
- [ ] Custom chat key and message survive a reload.
- [ ] System, Light, and Dark appearance choices work and survive a reload.
- [ ] Backup export, validated import, v1 migration, and clear actions work.
- [ ] Clipboard success and manual-copy fallback messages are understandable.
- [ ] Loading, not-found, and runtime-error recovery pages are usable.
- [ ] Keyboard navigation, focus indicators, responsive layouts, and reduced motion are acceptable.

## Release record

Record the release commit, verification workflow URL, deployment URL, tester, date, and any accepted limitations in the release notes. Do not promote a build with a failed automated gate.
