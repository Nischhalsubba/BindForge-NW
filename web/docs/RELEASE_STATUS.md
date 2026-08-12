# BindForge NW release status

## Release candidate

The application has completed the planned structural phases. Final release readiness now depends on automated production proof, deploy-preview review, and post-merge verification of the exact deployed commit.

## Implemented product scope

- Responsive searchable keybind library
- Dedicated Cards and Compact presentations
- Progressive group rendering and expandable card details
- Editable bind and unbind generation
- Command Lab and custom chat builder
- Copy success, fallback, and error feedback
- Conflict warnings, duplicate detection, and next-safer-key guidance
- Bulk bind/unbind selection, copy, and text download
- Favourites and named browser-local collections
- Shareable preset, collection, and filter URLs
- Sorting, collapsible groups, safety filters, provenance filters, and search highlighting
- Local settings, backup export/import, recovery UI, and theme controls
- Mobile filter drawer, Settings dialog, keyboard navigation, reduced motion, and 44 px touch targets
- Canonical metadata, Open Graph, robots, sitemap, structured data, and production security headers
- Retired legacy service worker and unsupported PWA claims
- Quality, Production smoke, and scheduled Production monitor workflows

## Required evidence before release sign-off

| Gate | Required result |
|---|---|
| ESLint | Pass |
| Application TypeScript | Pass |
| Unit and catalog tests | Pass |
| Next.js production build | Pass |
| Playwright TypeScript | Pass |
| Mobile/tablet/desktop regression | Pass |
| Dark/light axe checks | Pass |
| Runtime console/page/request guards | Pass |
| Live/deploy-preview production smoke | Pass |
| Production HTTP and metadata contract | Pass |
| Netlify deploy preview | Ready and visually reviewed |
| Cloudflare preview | Successful |
| Screenshot evidence artifact | Captured |
| Post-merge production monitor | Pass on deployed merge commit |

## Known product limitations

- Browser applications cannot read a player's existing Neverwinter keymap, so conflict planning remains advisory.
- Commands may change after game patches and should be reverified against current behavior.
- Favourites and collections are stored locally unless the user exports or shares them.
- Some community commands do not yet have a public source URL or verification date; the interface identifies these gaps rather than presenting them as verified.
- PWA installation and offline use are intentionally not part of the current product scope.

## Production

Canonical URL: `https://neverwinterkeybind.netlify.app`

The release is verified only after:

1. the final pull request is merged,
2. that merge commit is deployed to the canonical Netlify URL,
3. the post-merge Quality and Production smoke workflows pass,
4. the Production monitor contract passes against the live URL, and
5. the release record in `docs/phase-9-10-release-proof.md` contains the deployed commit and evidence links.

Current release decision: **Pending final evidence**.
