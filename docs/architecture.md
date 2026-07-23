# BindForge NW architecture

## State ownership

`BindForgeProvider` is the single source of truth for user-editable application state:

- preset filters and output mode
- edited preset keys
- Command Lab selections and filters
- custom chat key and message
- appearance choice
- local backup status and timestamp

Components read state and call actions through `useBindForge`. They do not synchronize through DOM queries, mutation observers, synthetic input events, or document-wide event listeners.

## Component boundaries

- `app/layout.tsx` mounts the provider once for the application.
- `app/page.tsx` composes the application and owns only transient clipboard feedback.
- `AppHeader` renders catalog totals and copy feedback.
- `FilterSidebar` renders class and difficulty filters plus appearance and backup controls.
- `FilterTopBar` renders search, action type, output mode, and reset controls.
- `KeybindLibrary` filters and groups presets and renders editable keybind cards.
- `CommandLab` filters key and command references and generates custom commands.
- `CustomSayBuilder` generates a custom `say` bind from provider state.
- `LocalSettingsManager` exposes provider-backed import, export, and clear actions.
- `ThemeSwitcher` changes the provider-owned appearance preference.

Pure command generation, normalization, backup validation, catalog integrity, and clipboard behavior live outside presentation components so Node tests can exercise them without a browser.

## Persistence and recovery

The provider hydrates validated version 2 settings from local storage, migrates valid version 1 data, applies the saved appearance, and debounces subsequent saves. Storage access is guarded so privacy modes, quota errors, or disabled storage do not crash the application.

Backup imports are size-limited and parsed through `backup-schema.mjs` before they can replace working state. Export creates a temporary downloadable object URL and releases it immediately afterward. Clearing saved data cancels pending autosaves and suppresses the next persistence cycle so deleted data is not silently recreated.

## Styling boundaries

The historical visual layers remain ordered in `app/layout.tsx`. The final sidebar structure, interaction geometry, typography, mobile behavior, and Command Lab empty state are consolidated in `app/sidebar-stabilization.css`. New sidebar fixes should modify that file instead of adding another override stylesheet, because humans have already invented enough cascading layers.

## Accessibility

Interactive controls use semantic buttons, labels, fieldsets, legends, status regions, and focusable command previews. Command Lab search fields have explicit accessible names, empty results are announced, the page exposes a skip link, and reduced-motion preferences are respected.

Playwright verifies keyboard entry, route recovery, shared-state filtering, generation, persistence, clearing saved data, and an axe baseline.

## Recovery and release safety

Next.js route recovery files provide loading, not-found, and runtime-error experiences. Unit tests cover pure command, backup, clipboard, and catalog behavior. GitHub Actions runs lint, type checking, unit tests, the production build, Chromium regression tests, and the accessibility baseline before release.

The manual `Release verification` workflow repeats the complete gate and retains browser artifacts for the release record.
