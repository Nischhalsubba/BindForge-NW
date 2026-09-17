# Spec: Simplified Navigation Foundation

## Objective

Reduce the app's top-level navigation to three user-facing destinations while preserving every existing workflow:

1. **Keybinds** — browse/search the catalogue, packs, filtering, collections, and preset actions.
2. **My Setup** — the user's own imported keymap, conflict detection, and the future home for characters, profiles, visual keymaps, comparison, cleanup, and rollback history.
3. **Build** — compose a keybind, bind a supported command, or create a say-message bind.

The product must become more capable without adding top-level navigation items. Help and Settings remain utilities.

## Assumptions

- The current single-page/hash-routing model remains in place for this slice.
- Existing deep links such as `#compose-keybind`, `#build-command`, and `#say-message` remain valid.
- The first slice does not move keymap state between components; it makes the existing Personal keymap surface the canonical `My Setup` destination.
- No Neverwinter commands, catalogue mappings, saved-data schema, dependencies, or production deploy policy change in this slice.

## Tech Stack

- Next.js 16.3.4
- React 19.3.0
- TypeScript 6 tooling compatibility + TypeScript 7 compiler package
- Playwright 1.62.1
- Node 22+

## Commands

From `web/`:

- Core verification: `npm run check`
- Browser typecheck: `npm run typecheck:browser`
- Browser regression: `npm run test:browser`
- Full release gate: `npm run check:release`

## Project Structure

- `web/app/components/AppHeader.tsx` — global product navigation and hero entry points.
- `web/app/components/PrimaryWorkspace.tsx` — existing Search / Compose / Command / Say workspace routing.
- `web/app/components/WorkspaceControls.tsx` — existing Personal keymap and collection/pack controls.
- `web/e2e/experience-workflows.spec.ts` — workflow/navigation browser behavior.

## Code Style

Follow the existing functional React/TypeScript style. Preserve the current hash-based deep links and accessible names. Prefer additive/targeted changes rather than introducing a second router or duplicate navigation component.

## Testing Strategy

Use browser-level behavior tests because this change is primarily information architecture and navigation behavior.

Required coverage:

- Primary navigation exposes exactly three destination links: Keybinds, My Setup, Build.
- `My Setup` navigates to the existing Personal keymap surface.
- `Build` navigates to the existing Compose flow by default.
- Existing direct deep links to Compose, Command, and Say continue to work.
- Existing desktop/tablet/mobile regression jobs remain green.

## Boundaries

### Always
- Keep Keybinds / My Setup / Build as the only primary destinations.
- Preserve keyboard accessibility, focus behavior, hash deep links, and existing tools.
- Keep ordinary feature commits free of `[deploy]`.

### Ask first
- Saved-data schema changes.
- New dependencies.
- Removing existing command-generation functionality.
- Introducing a separate page/router architecture.

### Never
- Guess or invent Neverwinter command mappings.
- Make incomplete features look production-ready.
- Add a new top-level destination for a feature that fits Keybinds, My Setup, or Build.

## Success Criteria

- The visible primary-nav destination set is exactly Keybinds / My Setup / Build.
- My Setup resolves to the current Personal keymap import/conflict-analysis surface.
- Build resolves to Compose while Command and Say remain reachable as build tools.
- Existing deep links continue to work.
- Core, desktop, tablet, mobile, dependency/security gates remain green.
- No production deployment is triggered by the feature branch or ordinary merge.

## Implementation Plan

1. Add a failing browser regression describing the three-destination navigation model.
2. Update AppHeader labels, destinations, hero copy, and hero index to the new information architecture.
3. Give the existing Personal keymap surface a stable `my-setup` destination anchor.
4. Verify old deep links and all responsive browser gates.
5. Merge only after the complete PR check matrix is green.

## Next Module

After this foundation lands, start `character-profiles` inside My Setup rather than adding another primary navigation item.
