# BindForge NW release status

## Release candidate

This document tracks the final roadmap delivery PR and must be updated with the merge commit after all required checks pass.

## Implemented product scope

- Responsive searchable keybind library
- Editable bind and unbind generation
- Command Lab and custom chat builder
- Copy success, fallback, and error feedback
- Conflict warnings, duplicate detection, and next-safer-key guidance
- Bulk bind/unbind selection, copy, and text download
- Favourites and named browser-local collections
- Shareable preset, collection, and filter URLs
- Card and compact views
- Sorting, collapsible groups, safety filters, provenance filters, and search highlighting
- Preset provenance, confidence, verification date, and source presentation
- Local settings, backup export/import, recovery UI, and theme controls
- Canonical metadata, Open Graph, robots, sitemap, and structured data
- Dedicated local Quality and live Production smoke workflows

## Required evidence before merge

| Gate | Required result |
|---|---|
| ESLint | Pass |
| Application TypeScript | Pass |
| Unit and catalog tests | Pass |
| Next.js production build | Pass |
| Playwright TypeScript | Pass |
| Mobile/tablet/desktop regression | Pass |
| Dark/light axe checks | Pass |
| Live production smoke | Pass |
| Netlify deploy preview | Ready |
| Cloudflare preview | Successful |

## Known product limitations

- Browser applications cannot read a player's existing Neverwinter keymap, so conflict planning remains advisory.
- Commands may change after game patches and should be reverified against current behavior.
- Favourites and collections are stored locally unless the user exports or shares them.
- Some community commands do not yet have a public source URL or verification date; the interface identifies these gaps rather than presenting them as verified.
- PWA installation is not part of the current product scope.

## Production

Canonical URL: `https://neverwinterkeybind.netlify.app`

The release is considered verified only after the final merge commit is deployed and the post-merge Production smoke workflow passes.
