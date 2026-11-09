# Cloud Workspace Implementation Plan

> **For agentic workers:** Execute natively task by task; use a fresh whole-branch reviewer before handoff.

**Goal:** Make the existing production app ready for authenticated, revision-safe cloud workspaces while shipping useful local workflow improvements.

**Architecture:** Preserve existing React providers and browser storage. An explicit whitelist of versioned product documents forms the cloud envelope; no OAuth tokens, unrelated local storage, or telemetry enter exports. Supabase Auth handles identity and a revision-checked PostgreSQL RPC handles writes. Guest browsing/copying remains independent of backend configuration.

**Tech Stack:** Next.js/React/TypeScript, existing pure .mjs modules and Node tests, Supabase Auth/Postgres with RLS.

**Spec:** docs/superpowers/specs/2026-11-09-cloud-workspace.md

## Global Constraints
Preserve guest workflows, existing saved data and source confidence. Never simulate successful login/sync. Never overwrite conflicting remote revisions silently. No secrets in public environment variables. No production merge/deploy until release checks and backend integration verification pass.

## Review Focus
- An old offline device must not overwrite a newer cloud revision.
- A second account on a shared browser must not receive the first account's outbox or imported keymap.
- Missing backend configuration must leave local copy/build usable.
- Corrupt or oversized imported cloud payloads must fail without touching local data.
- Identity and permission checks must use verified sessions and database ownership, not client-supplied user IDs.

### Task 1: Workspace envelope, outbox and conflict rules
Files: web/app/lib/cloud-workspace.mjs + declarations; web/tests/cloud-workspace.test.mjs.
Interfaces: validateEnvelope(value), collectWorkspace(storage), planSync(local,remote,baseRevision), makeOutbox(userId,envelope,baseRevision), validateOutbox(value,userId).
- [x] Write failing tests for corrupt payload, owner mismatch, explicit migration and stale revisions.
- [x] Implement pure functions and test exact serialization/whitelist behavior.
- [x] Run Node test suite.

### Task 2: Supabase account and revision-safe storage
Files: web/supabase/migrations/202611090001_workspace.sql; web/app/lib/supabase-client.ts; web/app/components/CloudWorkspacePanel.tsx; .env.example; account setup documentation.
Interfaces: Auth provides verified user/session; database write RPC accepts expected revision and JSON envelope, deriving owner from auth.uid().
- [x] Implement Google/email auth, explicit local/cloud review, per-user durable outbox, retry and conflict UI.
- [x] Add owner-only SQL policies, export and account deletion RPC.
- [x] Verify configuration-disabled path, typecheck and unit contracts.
- [ ] Apply/test migration and real OAuth only after Supabase is connected.

### Task 3: Fast-copy and combination persistence
Files: copy activity module/component; VerifiedBindBuilder; workspace export allowlist.
- [x] Add recent/pinned/repeat/paired copy without delaying clipboard actions.
- [x] Persist action-chain drafts and history; add duplicate/undo/redo.
- [ ] Test state migration and clipboard-independent behavior.

### Task 4: Accessibility, complete-roadmap traceability and handoff
- [x] Preserve roadmap statuses for all approved rows; do not mark deferred/backend-blocked work done.
- [ ] Run focused tests, full available checks and fresh code review.
- [ ] Create a draft PR with accurate validation and backend setup requirements.

Later feature slices are specified in the source table; they remain pending, not counted as delivered by this foundational PR.

## Execution ledger — 2026-11-09
- Tasks 1/3 pure workflow contracts: initial regression tests failed then passed. Current full suite: 151/151.
- Task 2: dedicated Supabase project created after owner selection. Both migrations applied. Transaction tests verified RLS, CAS, no direct writes/anonymous RPC, identity-bound save/delete and cascading deletion; generated test records rolled back.
- One fresh whole-branch review found recovery/identity/schema/route/copy defects. Fix pass added strict document shapes, normalized fingerprints, clean-device pull, account-keyed recovery, identity guards, route-aware autosave, builder limits/preserved invalid drafts/history, say-copy history and visibility of recents with many pins. Runtime lifecycle fixes still need browser integration tests.
- Final check: npm run check passed: focused-test guard, lint (one pre-existing FirstVisitHelp hook warning), typecheck, 151 tests, catalogue health, client-boundary audit, production build. Build reports existing multiple-lockfile root warning.
- Browser gate: managed preview rejected Next CLI flags; temporary wrapper could not access the runtime Node executable. No claim of browser verification for this branch.
- Ruling: keep this as a draft PR, preserving main and production — OAuth credentials/deployment configuration and real browser/account flows remain unverified; shipping early risks account-data loss.
- Ruling: product workspace export is limited to current documents plus individual revision downloads — a complete provider account-data archive requires additional API work.
- Ruling: local quarantine is a recovery convenience, not encrypted storage — separate browser profiles are needed for privacy from people who can inspect same-origin storage.
- Deferred minor: existing FirstVisitHelp hook dependency warning and build workspace-root warning.
- Pending release gates: Google provider configuration; frontend public environment setup; real Google/email login; two-device/two-tab conflict and offline recovery; route-transition/sign-out/guest migration validation; screen-reader/manual accessibility testing.
- Later roadmap rows remain pending. No entire approved area is claimed complete solely from this foundation.
