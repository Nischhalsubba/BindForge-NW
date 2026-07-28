# Incident and rollback process

## Trigger conditions

Treat the release as an incident when production has a broken primary journey, inaccessible controls, incorrect generated commands, widespread stale assets, security exposure, persistent deployment failure, or destructive browser-data behavior.

## Immediate response

1. Record the production URL, deploy ID, commit, time, browser, and screenshots.
2. Stop additional merges and deployments.
3. Reproduce in a clean browser profile.
4. Check Production smoke, Production monitor, Security, Catalog maintenance, Netlify, and Cloudflare-compatible build evidence.
5. Identify whether the failure is code, data, configuration, or stale client state.

## Rollback

Prefer the least destructive option:

1. Restore the last known-good Netlify deployment when the failure is deployment-specific.
2. Revert the responsible merge commit when the defect is in source control.
3. Avoid force-pushing `main`.
4. Do not introduce emergency service-worker caching as a workaround.
5. Preserve browser-local data formats unless a documented migration is included.

## Recovery verification

After rollback or repair, rerun:

- Quality
- Production smoke
- Security
- Catalog maintenance
- Production monitor
- manual Cards, Compact, Settings, filters, copy, collections, backup, themes, keyboard, and mobile checks

## Follow-up

Document root cause, impact, detection gap, corrective action, and prevention. Add a regression test before closing the incident whenever the failure can be automated.
