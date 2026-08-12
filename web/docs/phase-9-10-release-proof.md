# Phase 9 and 10 release proof

## Release candidate

- Production URL: `https://neverwinterkeybind.netlify.app`
- Candidate branch: `agent/phase-9-10-release-proof`
- Pull request: `#66`
- Candidate commit: update after final verification
- Merge commit: pending
- Production deploy commit: pending
- Release decision: pending automated and manual evidence

## Automated release gates

| Gate | Evidence required | Status |
|---|---|---|
| Quality workflow | Lint, application TypeScript, unit/catalog tests, production build, browser TypeScript, Playwright, axe | Pending |
| Production smoke | Critical journeys on mobile, tablet, and desktop | Pending |
| Runtime integrity | No console errors, page errors, or failed critical same-origin requests | Pending |
| Visual evidence | Cards, Details, Compact, Settings, and command-pack screenshots | Pending artifact |
| Responsive geometry | No document-level horizontal overflow | Pending |
| Touch accessibility | Essential mobile/tablet controls at least 44 px high | Pending |
| PWA retirement | No manifest, no registrations, `/sw.js` returns 404 | Pending |
| Production HTTP contract | Homepage, metadata, social image, robots, sitemap, and security headers | Pending |
| Netlify deploy preview | Candidate preview ready and reviewed | Pending |
| Cloudflare compatibility | Candidate build successful | Pending |

## Critical user journeys

- [ ] Search and reset filters
- [ ] Class, difficulty, and Action Type filtering
- [ ] Cards view
- [ ] Card Details open and close
- [ ] Compact view
- [ ] Edit suggested key and generate bind/unbind output
- [ ] Copy command feedback
- [ ] Select preset
- [ ] Collections and command-pack panel
- [ ] Copy and download pack controls
- [ ] Settings dialog
- [ ] Dark and light themes
- [ ] Saved settings survive reload
- [ ] Backup export/import and clear-data confirmation
- [ ] Keyboard skip navigation
- [ ] Mobile filter drawer and focus restoration
- [ ] Missing-route recovery

## Browser and viewport matrix

| Surface | Viewport | Automated | Manual |
|---|---:|---|---|
| Mobile Chromium | iPhone 13 profile | Pending | Pending |
| Tablet Chromium | iPad profile | Pending | Pending |
| Desktop Chromium | Desktop Chrome profile | Pending | Pending |
| Desktop Edge | 1440 x 900 | N/A | Pending |
| Desktop Firefox | 1440 x 900 | N/A | Pending |
| Real Android Chrome | device-native | N/A | Pending |

## Production contract

The production verifier requires:

- HTTP 2xx homepage with HTML content
- canonical and Open Graph URLs matching the production origin
- absolute HTTPS Open Graph image returning PNG
- valid `robots.txt` and sitemap URLs
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- a restrictive `Permissions-Policy`
- no linked web manifest
- `/sw.js` returning 404

## Rollback criteria

Rollback the deployment when any of the following is observed:

- homepage or keybind library cannot load
- search, filtering, command generation, or copy actions fail
- Cards or Compact layouts overflow or become unreadable
- Settings or mobile drawer traps focus or cannot close
- a serious or critical axe violation appears
- production canonical/social metadata points to the wrong origin
- stale service-worker behavior returns
- browser console or page errors occur during the critical journey

## Accepted limitations

- Conflict guidance cannot inspect a player's in-game remaps.
- Some community commands lack a public source or recent verification date.
- Favourites, collections, and settings remain browser-local unless exported.
- Generated commands must be pasted into Neverwinter manually.
- Offline/PWA installation is intentionally unsupported.

## Final sign-off

Complete only after the merge commit is deployed and the post-merge Production smoke and Production monitor workflows pass.

- Tester: pending
- Date: pending
- Deployed commit: pending
- Quality workflow URL: pending
- Production smoke URL: pending
- Production monitor URL: pending
- Screenshot artifact: pending
- Final decision: **Not yet verified**
