# Spec: Character and Keymap Profiles

## Objective

Turn **My Setup** into a local-first workspace for multiple Neverwinter characters and named keymap profiles while keeping the global navigation limited to **Keybinds / My Setup / Build**.

## User model

- A user may keep multiple characters.
- Each character has a name, class, optional paragon, and role.
- Each character owns one or more named keymap profiles such as Default, Single Target, AoE, Tank, Heal, or Custom.
- Exactly one character and one of its profiles are active.
- Preset key edits and imported personal binds belong to the active profile.
- Switching profiles immediately switches both edited preset keys and personal conflict analysis.

## Persistence

Use a separate versioned local store: `bindforge-nw:profiles:v1`.

The existing settings/backup v1/v2/v3 contract remains valid and importable. On first profile-workspace creation, the app migrates the already-hydrated current key map plus any legacy personal keymap into deterministic `My Character / Default` containers. This preserves existing work without forcing a breaking global backup-schema upgrade. If an existing global backup is restored later, its restored key map is synchronized into the active profile before the next reload so the restored work is not overwritten by stale profile data.

The profile workspace has its own JSON export/import controls inside My Setup. Import is validated before state is replaced.

## Safety invariants

- At least one character always exists.
- Every character always has at least one profile.
- Active character/profile IDs always resolve.
- Character/profile IDs are unique within their scope.
- Imported profile data is size-limited and structurally validated.
- Profile switching uses one atomic key-map replacement, not hundreds of independent UI writes.
- Legacy personal keymap data is migrated once and removed from the library-preferences store after successful profile initialization.
- No account, backend, or cloud dependency is introduced.

## UX

My Setup stays one destination. The surface provides:

1. Active character selector + Add character.
2. Active profile selector + Add profile.
3. A compact Manage section for character name/class/paragon/role, profile name, safe deletion, and setup backup.
4. Existing personal keymap import/conflict analysis, explicitly scoped to the active profile.

Advanced metadata is progressively disclosed. `#my-setup` opens the My Setup panel automatically.

## Acceptance

- Create, rename, switch, and safely delete characters.
- Create, rename, switch, and safely delete profiles.
- Active character/profile persists across reload.
- Key edits remain isolated by profile.
- Personal bind import/conflict analysis remains isolated by profile.
- Existing edited keys and legacy personal binds migrate into the default profile without loss.
- Setup JSON export/import round-trips characters/profiles.
- Existing global v1/v2/v3 backup import remains supported and persists into the active profile.
- Global navigation remains exactly Keybinds / My Setup / Build.
- No horizontal overflow at mobile/tablet/desktop sizes.
- Core, desktop, tablet, mobile, Dependency Audit, and CodeQL gates pass.
- Ordinary feature commits contain no `[deploy]` marker.

## Deferred

Visual keyboard mapping, drag/drop assignment, profile comparison, keymap cleanup/migration assistant, community profiles, and cloud sync are separate later modules.
