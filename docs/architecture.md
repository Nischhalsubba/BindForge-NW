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

- `app/page.tsx` composes the application and owns only transient clipboard feedback.
- `AppHeader` renders catalog totals and copy feedback.
- `FilterSidebar` renders class and difficulty filters plus appearance and backup controls.
- `FilterTopBar` renders search, action type, output mode, and reset controls.
- `KeybindLibrary` filters and groups presets and renders editable keybind cards.
- `CommandLab` filters key/command references and generates custom commands.
- `CustomSayBuilder` generates a custom `say` bind from provider state.
- `LocalSettingsManager` exposes provider-backed import, export, and clear actions.
- `ThemeSwitcher` changes the provider-owned appearance preference.

## Persistence

The provider hydrates validated version 2 settings from local storage, migrates valid version 1 data, applies the saved appearance, and debounces subsequent saves. Backup imports are parsed through `backup-schema.mjs` before they can replace working state.

## Recovery and release safety

Next.js route recovery files provide loading, not-found, and runtime-error experiences. Unit tests cover pure command, backup, clipboard, and catalog behavior. Playwright covers smoke, persistence, generation, recovery, and axe accessibility checks. GitHub Actions runs lint, type checking, unit tests, production build, browser tests, and the accessibility baseline before release.
