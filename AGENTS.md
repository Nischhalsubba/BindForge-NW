# Repository Instructions

## Setup

BindForge NW is a Next.js, React, TypeScript, Tailwind CSS, and data-driven Neverwinter utility.

```bash
npm ci
npm run dev
```

Use Node.js 22.13 or newer and the committed npm lockfile.

## Commands

| Task | Command |
|---|---|
| Start development server | `npm run dev` |
| Lint | `npm run lint` |
| Type-check | `npm run typecheck` |
| Build production bundle | `npm run build` |
| Run full verification | `npm run check` |
| Start production server | `npm run start` |

## Key files

- `app/page.tsx`: interface state, filtering, key normalization, warnings, command generation, and clipboard behavior.
- `app/data/keybindPresets.ts`: player-facing preset library.
- `app/data/keyCombos.ts`: supported combinations and safety metadata.
- `app/data/commands.ts`: console-command catalog.
- `app/globals.css`: visual tokens and responsive component styling.
- `app/layout.tsx`: metadata, structured data, fonts, and shell.
- `app/opengraph-image.tsx`: dynamic social image.
- `public/robots.txt`: crawler policy.
- `public/llms.txt`: machine-readable product summary.
- `docs/PRODUCT_AND_ENGINEERING_CASE_STUDY.md`: architecture and product reference.

## Architecture rules

- Keep data records typed and stable.
- Preserve unique IDs when editing presets or commands.
- Keep command-generation and normalization logic deterministic.
- Do not duplicate catalog data inside UI components.
- Keep safety metadata separate from visual presentation.
- Prefer small pure helpers for normalization, warnings, filtering, and output generation.
- Move reusable logic out of `app/page.tsx` when adding tests or expanding features.

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
- Keep visible keyboard focus.
- Ensure warning levels are not communicated by color alone.
- Keep clipboard feedback exposed through an appropriate status region.
- Test narrow mobile layouts and keyboard-only operation.
- Use descriptive text for command purpose, not command syntax alone.

## Testing and verification

Before committing meaningful changes:

1. Run `npm run check`.
2. Start the production build with `npm run start`.
3. Test search across presets, commands, and combinations.
4. Test class, type, category, and safety filters.
5. Test modifier normalization order.
6. Test bind and unbind output.
7. Test custom command arguments.
8. Test clipboard confirmation.
9. Test safe, warning, and dangerous key examples.
10. Verify dynamic Open Graph generation.
11. Review mobile, tablet, and desktop layouts.
12. Confirm no unverified data claim was introduced.

## Do not

- Do not claim current-game compatibility without verification.
- Do not treat the key-warning system as a security guarantee.
- Do not hard-code product statistics in the README when the app calculates them from data.
- Do not add game assets without reviewing ownership and licensing.
- Do not present the generated repository thumbnail as a browser screenshot.
- Do not add a public deployment link until the deployment is tested.
- Do not describe the project as affiliated with the Neverwinter rights holders.
