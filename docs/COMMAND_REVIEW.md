# Reviewing Neverwinter commands and bind packs

BindForge NW generates text for players to copy into the game; it does **not** execute commands in Neverwinter, inspect the live game keymap, or guarantee that a command still works after a patch. Treat those limits as acceptance criteria for every change.

## Trust and provenance

- **Verified:** only use when a command or preset meets the project's actual verification criteria with traceable evidence.
- **Community tested:** retain the community scope and test context; do not silently upgrade the label.
- **Experimental:** keep the uncertainty and recovery advice visible.
- Record the tested game patch/version, observation date, source URL or reproducible evidence, and platform when known.
- If evidence is missing, describe the command as unverified rather than guessing from syntax or a similar command.

## Change-specific review

| Area | Required acceptance checks |
| --- | --- |
| Search/aliases | Query variants find the intended preset without misidentifying unrelated commands |
| Key capture | Keyboard modifiers and mouse buttons are represented consistently; \`+\` is treated as a separator, not an independent key |
| Personal keymap | Imported text is compared locally; conflicting assignments are clearly distinguished from advisory native-key warnings |
| Composer and packs | Reordering, duplicates, command escaping and plain-language explanations remain aligned |
| Copy/export | Bind and matching unbind/rollback output are available; copied text matches the visible selection |
| Provenance UI | Trust badges, dates and sources match the underlying evidence and unknowns remain unknown |
| Accessibility | All flows work with keyboard, zoom, reduced motion, readable focus and mobile-sized controls |

## Local validation

Run from \`web/\` with a Node runtime compatible with \`web/package.json\`:

~~~bash
npm ci
npm run test
npm run catalog:health
npm run check
~~~

The stricter \`npm run check:release\` also exercises browser/type checks. Use it when interaction, responsive behavior or release risk changes. Keep \`catalog:health\` warnings in the review record; a structurally passing check does not imply full source coverage.

## Privacy and safety

Imported keymaps and saved character setups may reflect personal preferences. Do not copy real user imports, account data, credentials or private sharing links into tests, issues or PRs. Use synthetic fixtures. Preserve the local-first path and do not add telemetry or remote persistence without explicit product and privacy review.

## Player-facing manual test

Import a *synthetic* conflicting keymap, resolve one conflict, generate a pack, copy the bind and unbind output, and verify that the exported text remains reversible. Test failure/empty states and confirm that the UI does not claim to change the in-game setup.

## PR evidence and rollback

Document the command/preset before and after, its provenance, relevant patch/version, risk of collisions, tests run and manual acceptance outcome. Roll back individual catalog or command-rule changes rather than downgrading global checks. If a label is unsupported, demote the claim until evidence is available.
