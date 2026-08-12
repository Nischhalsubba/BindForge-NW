# Open Design UI Revamp and Release Verification

## Goal

Modernize BindForge NW into a clearer, calmer, mobile-first command workspace while completing the remaining automated and production release gates.

## Product direction

- Treat search and output mode as the primary task controls.
- Keep filters available without letting them dominate narrow screens.
- Improve hierarchy between discovery, preset editing, Command Lab, and custom chat tools.
- Reduce accumulated visual overrides and rely on one coherent responsive layer.
- Preserve fast scanning, keyboard access, visible focus, contrast, and 44 px touch targets.

## Release gates

- GitHub Quality workflow passes.
- Mobile, tablet, and desktop Chromium regression suites pass.
- Dark and light axe baselines pass.
- Cloudflare production build succeeds.
- Production URL passes smoke verification.
- Manual release record is completed with commit, workflow, deployment, devices, browsers, tester, and date.
