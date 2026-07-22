# Remaining R1 and R2 work

This branch tracks the unfinished R1 production-stabilization and R2 architecture tasks after PR #25 was merged.

## R1

- Add route-level error, loading, and not-found states.
- Add Playwright smoke and regression coverage.
- Add an accessibility baseline with axe checks.
- Add and document the production release checklist.
- Run lint, typecheck, unit tests, catalog validation, browser tests, accessibility checks, and production build in CI.

## R2

- Integrate the shared BindForge provider across the application.
- Remove DOM-query synchronization, MutationObserver usage, and synthetic input events.
- Move filters, key selections, Command Lab state, custom say state, theme, and persistence into shared state.
- Split the main page into focused components.
- Consolidate obsolete CSS layers and document the architecture.
- Add regression coverage for persistence, filtering, generation, and recovery flows.
