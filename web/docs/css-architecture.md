# CSS architecture

BindForge NW has one public stylesheet entrypoint: `app/app.css`.

The current field-manual identity is still carried by a small set of named global layers, but cross-product design contracts now have a single owner:

1. `atelier-zero.css` — base visual identity and primitive palette
2. `branding.css` — product identity details
3. `group-visibility.css` — catalogue disclosure behavior
4. `pixel-polish.css` and `ui-fixes.css` — bounded legacy refinement layers that must not define new global tokens
5. `preferences.css` — user-selected theme, contrast, density, text-size, and motion preferences
6. `app.css` — final shared accessibility and layout invariants

## Ownership rules

- `app.css` is the **only** owner of the canonical `--content` width and the cross-product accessibility tokens (`--type-*`, `--control-*`, focus and motion tokens).
- `atelier-zero.css` owns the field-manual palette and the three font roles: display, UI/body, and mono.
- Component CSS modules may refine component geometry, but functional text and controls must reuse the shared type/control floor instead of introducing 9–12 px text or 40–42 px controls.
- `preferences.css` may override semantic values for dark/high-contrast/large-control modes; it must not reset a user's saved appearance choice.
- Do not add another global override stylesheet to `app/app.css`.
- New shared spacing, radius, shadow, and semantic-color work should continue moving toward the files under `app/styles/`; existing legacy refinement layers should shrink rather than gain new ownership.

## Canonical shared values

- Content width: `--content: 1520px`
- Functional meta text: `--type-meta: 0.8125rem`
- Functional label text: `--type-label: 0.875rem`
- Body text: `--type-body: 1rem`
- Minimum control height: `--control-min: 44px`
- Primary control height: `--control-primary: 48px`
- Focus ring: 3 px with 3 px offset

These are product contracts, not per-screen suggestions.

## Breakpoints

The maintained responsive layer uses:

- Mobile: below 680 px
- Tablet: 680 px through 1050 px
- Desktop: above 1050 px

Some identity/refinement files still contain content-driven breakpoints for specific editorial compositions. Those breakpoints may adapt a component but must not redefine the shared mobile/tablet contract.

## Typography

The global web font system is intentionally limited to three families:

- **Playfair Display** — editorial/display moments
- **Inter** — UI and body copy
- **JetBrains Mono** — commands, keys, metadata, and technical values

Do not add a second near-identical sans family.

## Controls

Shared form controls use the design tokens for height, padding, border, background, focus, disabled, and transition states. Component modules may refine layout but should not redefine the complete control system.

Destructive controls require confirmation or an immediately visible undo path. Import/read errors must state a recovery action.

## Migration status

Seven obsolete sidebar and dock override files were removed during the earlier cleanup. `ui-fixes.css` and `pixel-polish.css` remain as bounded legacy refinement layers, but their former competing `--content` ownership has been removed. Future design-system cleanup should move rules out of those files into their semantic owners instead of adding more overrides.

## Verification

`tests/css-architecture.test.mjs` protects:

- the maintained entrypoint order,
- removed historical imports,
- required accessibility tokens,
- one canonical `--content` owner,
- the three-font-role contract,
- shared control-size floors in advanced/onboarding modules,
- shared responsive breakpoints.

The Playwright suite additionally verifies responsive overflow, focus behavior, accessibility states, onboarding, settings, and the primary workbench across desktop, tablet, and mobile projects.
