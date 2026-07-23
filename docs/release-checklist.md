# BindForge NW release checklist

## Local verification

Use Node.js 22.13 or newer and the committed lockfile.

```bash
npm ci
npm install --no-save @playwright/test@1.55.0 axe-core@4.10.2
npx playwright install chromium
npm run check:release
```

`npm run check:release` runs lint, TypeScript validation, Node unit and catalog tests, the production build, Playwright regression tests, and the axe accessibility baseline.

## Automated gate

- [ ] `npm ci` succeeds with the committed lockfile.
- [ ] ESLint passes.
- [ ] TypeScript type checking passes.
- [ ] Node unit and catalog tests pass.
- [ ] The production Next.js build succeeds.
- [ ] Playwright smoke and regression tests pass in Chromium.
- [ ] Persistence and clear-data regression tests pass.
- [ ] Route recovery tests pass.
- [ ] The keyboard-navigation check passes.
- [ ] The axe accessibility baseline reports no violations.
- [ ] Typecheck, build, Playwright report, and test-result artifacts are retained.

Run the **Release verification** workflow from GitHub Actions before promoting a release. A green pull-request workflow is required, but it does not replace the manually recorded release run.

## Manual browser review

- [ ] Search, class, action, and difficulty filters update the same shared state.
- [ ] Bind and unbind previews update immediately.
- [ ] Edited keys survive a reload.
- [ ] Command Lab selections and filters survive a reload.
- [ ] Custom chat key and message survive a reload.
- [ ] System, Light, and Dark appearance choices work and survive a reload.
- [ ] Backup export, validated import, v1 migration, and clear actions work.
- [ ] Clearing data does not recreate the deleted backup immediately.
- [ ] Clipboard success and manual-copy fallback messages are understandable.
- [ ] Loading, not-found, and runtime-error recovery pages are usable.
- [ ] Keyboard navigation, focus indicators, responsive layouts, and reduced motion are acceptable.
- [ ] Desktop, tablet, and mobile layouts are visually reviewed.

## Release record

Record the release commit, verification workflow URL, deployment URL, tester, date, browser, viewport coverage, and any accepted limitations in the release notes. Do not promote a build with a failed or cancelled automated gate. Computers are perfectly capable of failing without being given ceremonial permission.
