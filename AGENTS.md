# Repository Instructions

## Setup

BindForge NW is a Next.js, React, TypeScript, Tailwind CSS, and data-driven Neverwinter utility.

```bash
npm ci
npm run dev
```

Use Node.js 22.13 or newer and the committed npm lockfile.

Browser tests additionally require:

```bash
npm install --no-save @playwright/test@1.55.0 axe-core@4.10.2
npx playwright install chromium
```

## Commands

| Task | Command |
|---|---|
| Start development server | `npm run dev` |
| Lint | `npm run lint` |
| Type-check | `npm run typecheck` |
| Run Node unit and catalog tests | `npm test` |
| Build production bundle | `npm run build` |
| Run application verification | `npm run check` |
| Run Playwright tests | `npm run test:browser` |
| Run complete release verification | `npm run check:release` |
| Start production server | `npm run start` |

## Key files

- `app/BindForgeProvider.tsx`: shared application state, hydration, persistence, backup, reset, and appearance actions.
- `app/page.tsx`: application composition and transient clipboard feedback.
- `app/components/FilterSidebar.tsx`: class and difficulty controls plus settings tools.
- `app/FilterTopBar.tsx`: search, action type, output mode, and reset controls.
- `app/components/KeybindLibrary.tsx`: preset filtering, grouping, editing, warnings, and output.
- `app/components/CommandLab.tsx`: command and key reference filters plus custom output.
- `app/components/CustomSayBuilder.tsx`: custom chat bind generation.
- `app/lib/keybind-core.mjs`: deterministic normalization and command generation.
- `app/lib/backup-schema.mjs`: backup validation and migration.
- `app/lib/catalog-integrity.mjs`: catalog validation.
- `app/data/keybindPresets.ts`: player-facing preset library.
- `app/data/keyCombos.ts`: supported combinations and safety metadata.
- `app/data/commands.ts`: console-command catalog.
- `app/sidebar-stabilization.css`: final sidebar geometry, typography, and interaction overrides.
- `app/error.tsx`, `app/loading.tsx`, `app/not-found.tsx`: route recovery states.
- `e2e/bindforge.spec.ts`: browser regression and accessibility tests.
- `.github/workflows/quality.yml`: pull-request and main-branch quality gate.
- `.github/workflows/release.yml`: manually triggered release verification.
- `docs/architecture.md`: current component and state architecture.
- `docs/release-checklist.md`: release procedure and manual review checklist.

## Architecture rules

- Keep `BindForgeProvider` as the single source of truth for user-editable state.
- Components must communicate through provider actions and props, not DOM queries, mutation observers, synthetic events, or document-wide listeners.
- Keep data records typed and stable.
- Preserve unique IDs when editing presets or commands.
- Keep command-generation and normalization logic deterministic and outside presentation components.
- Do not duplicate catalog data inside UI components.
- Keep safety metadata separate from visual presentation.
- Prefer small pure helpers for normalization, warnings, filtering, validation, and output generation.
- Do not add another sidebar override stylesheet. Modify `sidebar-stabilization.css` or consolidate the underlying layer instead.

## Data maintenance

For every new or changed command:

1. Record the source.
2. Record the verification date when possible.
3. Confirm required arguments and aliases.
4. Confirm class or category scope.
5. Review the proposed default key.
6. Assign an honest difficulty and safety level.
7. Avoid presenting undocumented behavior as guaranteed.

Never remove an alias or change a command silently when existing users may rely on it.

## Safety conventions

- Treat all key warnings as advisory, not guarantees.
- Keep Windows shortcuts and common movement, attack, interaction, chat, and menu keys flagged.
- Never label an unverified or destructive command as safe.
- Make risky behavior visible before the copy action.
- Keep `/unbind` behavior distinct from `/bind` behavior.

## Accessibility

- Preserve semantic labels for search, filters, inputs, and buttons.
- Keep visible keyboard focus and the skip link.
- Ensure warning levels are not communicated by color alone.
- Keep clipboard and persistence feedback exposed through status regions.
- Test narrow mobile layouts and keyboard-only operation.
- Use descriptive text for command purpose, not command syntax alone.
- Run the axe baseline after meaningful interaction or layout changes.

## Testing and verification

Before committing meaningful changes:

1. Run `npm run check`.
2. Run `npm run test:browser` when browser tooling is installed.
3. Test search across presets, commands, and combinations.
4. Test class, type, category, and safety filters.
5. Test modifier normalization order.
6. Test bind and unbind output.
7. Test custom command arguments and custom chat messages.
8. Test clipboard confirmation and fallback behavior.
9. Test persistence, backup import/export, and clear-data behavior.
10. Test loading, not-found, and runtime-error recovery.
11. Verify keyboard navigation and the axe baseline.
12. Review mobile, tablet, and desktop layouts.
13. Confirm no unverified game-data claim was introduced.

## Do not

- Do not claim current-game compatibility without verification.
- Do not treat the key-warning system as a security guarantee.
- Do not hard-code product statistics in documentation when the app calculates them from data.
- Do not add game assets without reviewing ownership and licensing.
- Do not present the generated repository thumbnail as a browser screenshot.
- Do not add a public deployment link until the deployment is tested.
- Do not describe the project as affiliated with the Neverwinter rights holders.
