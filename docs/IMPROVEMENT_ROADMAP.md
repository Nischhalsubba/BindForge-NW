# BindForge NW improvement roadmap

This branch implements the remaining stabilization and product improvements as one tracked program.

## Release stabilization

- [ ] Repair Playwright mobile, tablet, and desktop regressions.
- [ ] Pass dark and light axe baselines.
- [ ] Add a focused-test guard for `test.only`, `describe.only`, and `fit`.
- [ ] Record production smoke verification.

## Architecture and maintenance

- [ ] Consolidate accumulated CSS layers into a smaller authoritative style system.
- [ ] Remove obsolete overrides and reduce `!important` usage.
- [ ] Use one application version source across package metadata, structured data, and release docs.
- [ ] Refresh README and release records.

## Keybind safety and trust

- [ ] Add conflict categories for native override, duplicate BindForge key, Windows-reserved shortcut, and unknown personal remap.
- [ ] Add an explicit intentional-native-override state for Ranger Q, E, R, and LButton presets.
- [ ] Add preset provenance, confidence, source, game-version, and verification-date fields.

## Product workflow

- [ ] Add multi-select keybind cards.
- [ ] Add copy-selected bind and unbind packs.
- [ ] Add text-file bind-pack download.
- [ ] Add favourites and locally stored collections.
- [ ] Add shareable filter and preset URLs.
- [ ] Add compact browsing, sorting, collapsible groups, and search highlighting.

## Release condition

This branch is not ready to merge until lint, TypeScript, unit/catalog tests, production build, Playwright projects, dark/light axe checks, and production smoke verification are green.
