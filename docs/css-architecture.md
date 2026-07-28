# CSS architecture

BindForge loads global styles through `app/app.css` in one documented order:

1. `tokens`
2. `base`
3. `theme`
4. `layout`
5. `components`
6. `responsive`

## Ownership rules

- Add semantic color, spacing, radius, shadow, and control-size values to `app/styles/tokens.css`.
- Add page-shell and shared grid rules to `app/styles/layout.css`.
- Add reusable global controls only to `app/styles/components.css`.
- Add mobile and tablet behavior only to `app/styles/responsive.css`.
- Use CSS modules for component-specific layouts and interactive surfaces.
- Do not add another global override stylesheet to `app/app.css`.

## Breakpoints

- Mobile: below 680 px
- Tablet: 680 px through 1050 px
- Desktop: above 1050 px

## Controls

Shared form controls use the design tokens for height, padding, border, background, radius, focus, disabled, and transition states. Component modules may refine layout but should not redefine the complete control system.

## Migration status

Seven obsolete sidebar and dock override files were removed during Phase 4. A small set of still-active historical files remains imported inside the appropriate layout, component, or responsive layer. Those files are no longer allowed to control cascade order directly from `app/app.css` and can be folded into their owning layer incrementally without changing the public entrypoint.

## Verification

`tests/css-architecture.test.mjs` protects the entrypoint order, removed imports, required design tokens, and shared breakpoints. `e2e/visual-layout.spec.ts` captures desktop, tablet, mobile, compact, pack-tools, settings, filter-drawer, dark-theme, and light-theme layouts as CI artifacts while checking document overflow and key surface visibility.
