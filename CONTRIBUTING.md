# Contributing to BindForge NW

BindForge NW accepts focused fixes, verified command updates, accessibility improvements, and maintenance changes.

## Before opening a pull request

1. Create a branch from the latest `main`.
2. Keep the change limited to one clear purpose.
3. Do not invent Neverwinter command behavior or verification evidence.
4. Record source URL, verification date, confidence, and game-version notes for catalog changes when available.
5. Run `npm ci` and `npm run check:release`.
6. Review desktop, tablet, and mobile layouts for visual changes.

## Catalog changes

Catalog entries should include a stable ID, plain-language purpose, command, safe default-key recommendation, search terms, difficulty, source type, confidence, and verification metadata where evidence exists.

Unverified community behavior must remain labelled as such. Risky commands require explicit difficulty and confidence treatment. Browser conflict guidance is advisory and must not be described as guaranteed.

## Pull requests

A pull request should explain:

- the problem
- the implementation
- user-facing impact
- verification performed
- screenshots for visual changes
- known limitations

Do not merge while required checks, deployment previews, or accessibility tests are failing.

## Style and architecture

- Preserve Archew attribution in the public application.
- Do not reintroduce personal profile or social links into the deployed app.
- Use the established CSS architecture and component-owned styles.
- Keep controls keyboard accessible and usable at 44 px touch targets on narrow/coarse-pointer layouts.
- Avoid adding service-worker or offline claims without a complete, separately reviewed PWA design.
