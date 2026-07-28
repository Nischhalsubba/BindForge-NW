<div align="center">

<img src="./docs/assets/bindforge-nw-thumbnail.svg" width="100%" alt="BindForge NW branded repository thumbnail" />

# BindForge NW

### Build, review, organize, and export Neverwinter keybinds without memorizing console commands

A data-driven preset browser, conflict planner, command explorer, collection manager, and copy-ready `/bind` or `/unbind` generator.

![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=111111)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)

[Live application](https://neverwinterkeybind.netlify.app) · [Engineering case study](./docs/PRODUCT_AND_ENGINEERING_CASE_STUDY.md) · [Architecture](./docs/architecture.md) · [Release status](./docs/RELEASE_STATUS.md)

</div>

## Product

BindForge NW helps Neverwinter players find, edit, validate, organize, share, and export practical keybind commands without searching scattered forum posts, wiki fragments, spreadsheets, or old chat messages.

## Main capabilities

| Capability | Description |
|---|---|
| Preset library | Searchable binds for combat, utility, class, companion, VIP, camera, social, and other actions |
| Conflict planner | Duplicate detection, common native-key warnings, intentional-override guidance, and next-safer-key replacement |
| Bulk bind packs | Select visible presets, copy bind/unbind packs, and download text files |
| Favourites and collections | Save favourites and named local collections in the browser |
| Shareable views | Copy URLs for a selected preset, collection, and active filters |
| Provenance | Source type, confidence, verification date, game-version notes, and provenance filtering |
| Advanced browsing | Card or compact view, sorting, collapsible groups, progressive group rendering, collection filtering, safety filtering, and search highlighting |
| Bind and unbind modes | Generate `/bind` or `/unbind` output from the same shared state |
| Command Lab | Combine supported keys with catalog commands and optional arguments |
| Custom chat builder | Generate safe, normalized `say` message binds |
| Local persistence | Save filters, keys, appearance, Command Lab, custom chat, favourites, collections, and library preferences |
| Backup tools | Export, validate, import, migrate, and clear versioned JSON settings |
| Responsive UI | Mobile, tablet, and desktop layouts with keyboard, touch-target, and reduced-motion support |
| Copy feedback | Local copied states, global toast feedback, fallback handling, errors, and accessible announcements |

## Command output

```text
/bind <key> <command> <optional arguments>
/unbind <key>
```

Example:

```text
/bind ctrl+b gensendmessage Vipaction_Bankvendor activate
```

## Run locally

Requirements:

- Node.js 22.13 or newer
- npm with the committed lockfile

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Verification

Install browser-test tooling once when working locally:

```bash
npm install --no-save @playwright/test@1.55.0 axe-core@4.10.2
npx playwright install chromium
```

Run the complete local release gate:

```bash
npm run check:release
```

The Quality gate covers ESLint, TypeScript, unit and catalog tests, production build, mobile/tablet/desktop Playwright checks, persistence, recovery, keyboard navigation, card and compact layouts, progressive rendering, retired-PWA protection, and dark/light axe accessibility checks.

The `Production smoke` workflow verifies a deploy preview for pull requests and the canonical Netlify domain after merge. It exercises the critical user journeys, captures desktop/tablet/mobile screenshots, fails on runtime errors and overflow, verifies accessibility and touch targets, and uploads the release evidence as an artifact.

The scheduled `Production monitor` workflow checks the live homepage, canonical and Open Graph metadata, social image, robots, sitemap, security headers, and retired service-worker endpoint every day. The same contract can be run manually:

```bash
node scripts/verify-production.mjs https://neverwinterkeybind.netlify.app
```

## Production

- Canonical URL: `https://neverwinterkeybind.netlify.app`
- Netlify deploys `main` automatically.
- Cloudflare Workers provides an additional production-compatible deployment path.
- Offline/PWA support is intentionally not part of the current release.
- Current evidence, rollback criteria, and accepted limitations are recorded in [docs/RELEASE_STATUS.md](./docs/RELEASE_STATUS.md) and [docs/phase-9-10-release-proof.md](./docs/phase-9-10-release-proof.md).

## Stylesheet architecture

Application code imports one authoritative stylesheet entrypoint: `app/app.css`, organized into tokens, base, theme, layout, components, and responsive layers. Component CSS modules remain limited to isolated interactive surfaces.

## Data maintenance

Before publishing command updates:

- verify behavior against the current Neverwinter version
- record a source URL when available
- record a verification date
- preserve aliases and required arguments
- clearly mark uncertain or undocumented behavior
- review default-key conflicts
- never describe advisory safety guidance as a guarantee

## Branch protection

Required checks and merge protections are documented in [docs/BRANCH_PROTECTION.md](./docs/BRANCH_PROTECTION.md). Pull requests should not merge until Quality, Production smoke, and deployment previews are green.

## Known limitations

- Neverwinter commands can change after patches.
- Some commands are undocumented or inconsistently supported.
- BindForge generates text but cannot apply binds inside the game.
- Players must paste generated commands themselves.
- Conflict guidance is advisory because personal in-game remaps are not readable by a browser.
- Favourites and collections are browser-local unless exported or shared.
- Offline installation is intentionally unsupported in the current release.

## Disclaimer

BindForge NW is an independent community project. It is not affiliated with or endorsed by Cryptic Studios, Arc Games, Gearbox Publishing, or the Neverwinter rights holders. Game names, commands, and related assets belong to their respective owners.

## Studio

Designed and developed by Archew.
