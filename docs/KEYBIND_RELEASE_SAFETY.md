# Keybind command safety and release checklist

> Status: contributor review checklist, not a claim that the product has passed an audit. This document introduces review expectations; it does not change application behavior.

## Why this exists

Keep generated Neverwinter bind/unbind output understandable, reversible, source-backed and usable by keyboard-only players.

## Review rules

1. For each command or preset, record provenance, game-patch applicability, expected effect and whether it is verified, community-tested, experimental or unknown. A UI trust label must never imply testing that did not occur.
2. Treat user-imported keymaps as the comparison source, not as permission to overwrite assignments. Surface duplicate keys, native-game key collisions and mutually exclusive actions before copy/export.
3. Preserve exact command syntax, quoting and whitespace. Keep copy-bind, copy-unbind, package export and rollback payloads distinguishable. Never silently concatenate incompatible commands.
4. Character profiles and local collections must not be mutated merely by browsing presets or previewing combinations. State explicitly when local data is exported, erased or restored.
5. Verify large text, focus order, accessible names, error messages and mouse/keyboard capture for symbols, modifiers, international layouts and reserved keys.

## Verification

From repository root run `npm run check` (this delegates to the web workspace). Manual test: create one bind, generate unbind, paste into a plain-text editor, import it again, detect a conflict, undo an edit, navigate using keyboard alone and verify the result against a supported in-game command source. Do not describe in-game execution as automated.

## Required evidence in a change request

PR: exact before/after command output (redacted if personal), game version and provenance, test environment, screenshots of conflict/rollback states, accessibility findings, check results and known unsupported cases.

## Rollback and incident response

Restore the previous preset mapping/version, keep exported unbind text accessible and document how users undo an in-game assignment.

## Acceptance criteria

- [ ] The change addresses a stated user or maintainer risk.
- [ ] Evidence and source-of-truth references are attached or explicitly marked unavailable.
- [ ] Relevant automated checks are reported with actual outcomes; unrun checks are not marked passing.
- [ ] Negative, failure and recovery states are accounted for.
- [ ] A reviewer can understand what changed, remaining risk and how to revert it.

Document owner: repository maintainers. Review this checklist when workflows, dependencies or public claims materially change.
