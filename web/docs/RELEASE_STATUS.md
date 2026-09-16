# BindForge NW release status

## Release candidate

BindForge has completed the planned product/workflow work and is in final accessibility, responsive, performance, documentation, and production-proof hardening. The release is considered complete only when the final merged commit is the exact commit served by the canonical Netlify production site and the release browser/security gates remain green.

## Implemented product scope

- Plain-language Search v2 with aliases, player wording, typo tolerance, relevance ranking, and no-result recovery
- Cards and Compact library presentations with progressive details
- Visual key-combination capture for keyboard modifiers, keyboard keys, and left/right/middle mouse input
- Regular and numpad `+` treated as combination separators rather than standalone bind keys
- Search, Compose, Command Lab, and Say workflows
- Simple / Standard / Advanced experience-level behavior
- Editable `/bind` and `/unbind` generation
- Trust labels and provenance for Verified, Community tested, and Experimental data
- Class/role quick packs derived only from existing catalogue metadata
- Personal keymap paste/file import with local conflict analysis
- Selected-pack duplicate detection, native-key warnings, safer-key guidance, and explicit override paths
- Sticky selection/review flow with final bind output and rollback/unbind copy/download
- Favourites, named collections, portable sharing, and versioned browser-local backup/restore
- Post-copy “Use this in Neverwinter” guidance with worked/failed recovery paths
- First-visit task orientation and persistent terminology/trust glossary
- Light/dark theme, text-size, density, high-contrast, larger-control, and reduced-motion preferences
- Responsive mobile/tablet/desktop workbench with keyboard/focus and touch-target support
- Lazy-loaded Compose, Command Lab, Say, and portable tools so Search remains the initial workbench path
- Canonical metadata, Open Graph, robots, sitemap, structured data, and production security headers
- Retired legacy service worker; offline/PWA installation is intentionally out of scope
- Quality and Security CI with Playwright browser evidence

## Required release evidence

| Gate | Required result |
|---|---|
| ESLint | Pass |
| Application TypeScript | Pass |
| Unit and catalogue tests | Pass |
| Next.js production build | Pass |
| Playwright TypeScript | Pass |
| Mobile/tablet/desktop regression | Pass |
| 200%-zoom-equivalent geometry | Pass |
| Extra-large text / high contrast / larger controls | Pass |
| Reduced-motion behavior | Pass |
| Keyboard-only workflow navigation | Pass |
| Tablet landscape / horizontal overflow | Pass |
| Axe/accessibility baseline | Pass |
| Dependency audit and CodeQL | Pass |
| Exact Netlify production commit | Match final `main` merge |
| Production screenshot | Visually reviewed |

## Known product limitations

- BindForge cannot read Neverwinter's live keymap directly. Personal conflict detection is only as complete as the bind text the player pastes or imports.
- Neverwinter commands can change after game patches and should be reverified against current behavior.
- Some community/experimental commands do not have public documentation; the interface preserves their lower confidence instead of presenting them as verified.
- Favourites, collections, preferences, imported keymap context, and saved work remain browser-local unless the user explicitly exports or shares them.
- BindForge generates command text but cannot apply it inside the game; the player must paste and test commands in Neverwinter.
- PWA installation and offline use are intentionally not part of the current product scope.

## Production

Canonical URL: `https://neverwinterkeybind.netlify.app`

Final release verification requires:

1. the final hardening pull request to pass Quality and Security,
2. the authorized merge commit to include the repository's production `[deploy]` marker,
3. Netlify production to report `ready` for that exact merge commit,
4. a fresh production screenshot to show the intended field-manual UI without startup/theme overlap, and
5. the post-merge browser/security checks to remain green.

Current release decision: **Release candidate — awaiting final merged production proof.**
