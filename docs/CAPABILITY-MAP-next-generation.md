# Capability Map: Neverwinter Keybind — Next Generation

## Product principle

Add capability without adding navigation complexity. New features do not earn a new top-level destination by default. The primary product navigation stays limited to **Keybinds**, **My Setup**, and **Build**; Help and Settings remain utilities.

| Module id | Responsibility | Depends on |
|---|---|---|
| navigation-foundation | Simplify the information architecture and keep existing workflows reachable through Keybinds / My Setup / Build | — |
| character-profiles | Save characters, class/paragon/role context, and multiple named keymap profiles | navigation-foundation |
| visual-keymap | Visualize occupied, free, conflicting, and suggested keys for the active profile | character-profiles |
| keymap-analysis | Import full keymaps, compare profiles, detect conflicts, clean/migrate bindings, maintain rollback history, and export/load native Neverwinter bind files with evidence-based restore data | character-profiles, visual-keymap |
| catalogue-intelligence | Expand commands/presets, version verification/history, source health, live `/cmdlist` reconciliation, animation-cancel evidence, and zero-result research candidates | navigation-foundation |
| community-verification | Collect structured Works / Doesn't work / Needs update / class-paragon reports and turn evidence into confidence signals | catalogue-intelligence |
| usage-insights | Privacy-conscious workflow/error/search telemetry used to improve navigation, search, and catalogue coverage | navigation-foundation |
| performance-pwa | Raise runtime performance, preserve Chromium mobile/tablet/desktop coverage plus Firefox/WebKit critical-flow compatibility, and make an explicit installability/offline decision | navigation-foundation |
| academy-integration | Contextually connect keybinds and profiles to relevant Neverwinter Academy guides/builds without adding another permanent primary nav item | character-profiles, catalogue-intelligence |

## Build order

1. `navigation-foundation`
2. `character-profiles`
3. `visual-keymap`
4. `keymap-analysis`
5. `catalogue-intelligence`
6. `community-verification`
7. `usage-insights`
8. `performance-pwa`
9. `academy-integration`

Independent work may proceed in parallel after the navigation foundation, but the user-facing information architecture must continue to fit the three-destination model.
