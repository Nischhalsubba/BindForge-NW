# BindForge NW roadmap specification

Source: user-approved feature table in the 2026-11-09 conversation.

## Product constraints
- Primary task is quick bind/unbind copying; guests can always browse/build/copy.
- Neverwinter-inspired branding; official wordmark is sourced, but the current crimson/gold palette and Cinzel/Source Sans 3 font pairing are interpretations, not verified official brand tokens.
- Accessibility for older users: comfortable text and controls, keyboard focus, sticky desktop context, reflow, light/dark/high contrast, reduced motion. No blanket WCAG claim.
- Preserve existing production data, catalogue evidence and migration paths.
- Cloud storage records planned/supplied setups. Never claim the site applied commands or read the live game state.

## Approved roadmap and status
| Area | Acceptance criteria | Dependency |
|---|---|---|
| Accounts | Google + email login, explicit guest migration, export and deletion | Supabase project, Google OAuth configuration |
| Cloud saving | Autosave, cross-device sync, durable per-user outbox, optimistic version checks, manual conflict resolution, retry | Account/session + database migration |
| Character setups | Sync existing characters/profiles/imports, PvE/PvP/dungeon labels, duplicate profiles | Existing profile schema |
| Fast copying | Recent/pinned commands, paired copy, repeat last, keyboard shortcuts | Local activity storage |
| Assignment overview | Used-key table, key search, physical keyboard/mouse views, assigned filters | Existing keymap evidence |
| Conflict checking | Pack/imported conflicts, before/after previews, evidence-backed suggestions | Existing planner |
| Combination builder | Button/drag reorder, duplicate, undo/redo, reusable named combinations, output explanation | Durable draft storage |
| Command builder | Parameter fields, required checks, examples, argument presets, reference search | Curated command parameter schema |
| Accessibility | Persistent text/theme/contrast/motion preferences, keyboard operation and screen-reader verification | Real browser/AT testing |
| Recovery | Named snapshots, version compare, restore, recover deleted combinations | Revision storage |
| Organisation | Tags/collections, bulk select and reassignment with conflict review | Workspace document |
| Import/export | Preview/errors, filenames, selective/changed-only export | Existing import/export parsers |
| Sharing | Private/unlisted/public snapshots, revoke, read-only view, duplicate | Backend access model |
| Community | Submit/report/evidence/version/date | Moderation backend |
| Trust | Patch notices, verification history, review queue, saved-preset notifications | Maintainer evidence |
| Learning | First-bind tour, help/glossary/apply/test/restore guides | Existing onboarding |
| Collaboration | Guild libraries, roles, change proposals and approval | Membership/policy tests |
| Personalisation | QWERTY/AZERTY/QWERTZ, left-handed maps, mouse labels, language | Layout data + translations |
| Offline app | Installable shell, cached catalogue, offline creation and reconnect sync | Cache policy excludes account endpoints |
| AI assistance | Catalogue-grounded suggestions and explanations; uncertainty + human review | Optional model backend; no invented commands |
| Administration | Catalogue/moderation/evidence/release/feedback tools | Trusted roles, audit trail |

## Delivery boundary
Implement backend-independent behavior and a deployable account/sync foundation now. Live OAuth, database policies, cross-device synchronization and cloud-dependent community/collaboration require a connected owner-controlled Supabase project. Do not substitute a mock login or label blocked features complete. Every roadmap row stays tracked until independently verified.

## Current delivery status
| Area | Status in this branch |
|---|---|
| Accounts, cloud saving | Foundation implemented; release blocked on provider/deployment/integration tests |
| Character setups | Existing profile documents included in cloud envelope; live sync not verified |
| Fast copying | Recent/pinned/repeat/paired reference copy and opt-in shortcut implemented; browser verification pending |
| Assignment overview, conflict checking | Existing app capabilities retained; broader approved additions still pending |
| Combination builder | Drafts, named reuse, duplicate, button reorder and persistent undo/redo implemented; browser verification pending |
| Command builder | Existing command lab retained; typed parameter schemas and argument presets pending |
| Accessibility | Existing persistent preferences retained; new controls use shared tokens; manual AT checks pending |
| Recovery | Cloud revision storage/export and local pending/quarantine recovery controls implemented; named compare/restore flow pending |
| Organisation, import/export, learning, personalisation | Existing capabilities retained; approved expansions pending |
| Sharing, community, trust, collaboration, offline app, AI, administration | Backend-dependent expansions pending |
