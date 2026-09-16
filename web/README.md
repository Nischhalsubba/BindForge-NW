<div align="center">

<img src="./docs/assets/bindforge-nw-thumbnail.svg" width="100%" alt="BindForge NW branded repository thumbnail" />

# BindForge NW

### Find it. Build it. Bind it.

A local-first Neverwinter keybind workbench for finding, composing, reviewing, organizing and exporting commands without memorizing console syntax.

![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=111111)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)

[Live application](https://neverwinterkeybind.netlify.app) · [Engineering case study](./docs/PRODUCT_AND_ENGINEERING_CASE_STUDY.md) · [Architecture](./docs/architecture.md) · [Release status](./docs/RELEASE_STATUS.md)

</div>

## Product

BindForge NW helps Neverwinter players find, edit, validate, organize, share and export practical keybind commands while keeping evidence, conflict risk and rollback paths visible. The maintained application lives in this `web/` workspace.

## Main capabilities

| Capability | Description |
|---|---|
| Plain-language Search v2 | Search titles, descriptions, command fragments, aliases and player wording with typo tolerance and relevance ranking |
| Visual key builder | Capture keyboard keys, Ctrl/Alt/Shift combinations, left/right/middle mouse input and `+`-separated key combinations |
| Four primary workflows | Search existing keybinds, Compose a verified bind, use Command Lab, or create a Say message |
| Experience levels | Simple prioritizes guided Search/Compose, Standard balances everyday tools, Advanced surfaces technical/export controls |
| Personal keymap import | Paste or open bind text locally so new presets can be compared against the player's actual imported keys |
| Conflict planner | Selected-pack duplicates, imported-keymap conflicts, native-key warnings, override guidance and safer-key suggestions |
| Pack review | Review exact final commands, remove items, copy/download bind packs and prepare rollback/unbind output |
| Class & role quick packs | Evidence-backed catalogue groupings that preserve current verification levels and never invent build recommendations |
| Trust and provenance | Verified, Community tested and Experimental labels plus source/evidence context and verification dates where known |
| Favourites and collections | Save useful presets and named local collections in the browser |
| Portable sharing | Copy shareable views for selected presets, collections and active filters |
| In-game guidance | After copying a bind, show concise paste/test/recovery/rollback steps for Neverwinter |
| Local backup | Export, validate, import, migrate and clear versioned local settings |
| Accessibility | Theme, text-size, density, high-contrast, larger-control and reduced-motion preferences with keyboard/focus support |

### Key-combination behavior

BindForge treats `+` as a **combination separator**, not a standalone bind key. This applies to both the regular keyboard `+` and numpad `+`. Examples:

```text
5 + 6              -> 5+6
Ctrl + 5           -> ctrl+5
Ctrl + Right Click -> ctrl+rbutton
```

The underlying Neverwinter command syntax remains unchanged when commands are generated.

## Command output

```text
/bind <key> <command> <optional arguments>
/unbind <key>
```

Example:

```text
/bind ctrl+b gensendmessage Vipaction_Bankvendor activate
```

## Trust model

Trust labels describe the evidence BindForge has, not a guarantee that a command will work forever:

- **Verified** — documented or direct evidence supports the preset.
- **Community tested** — community evidence reports the behavior working; retest on the current game version.
- **Experimental** — user-submitted, risky, patch-sensitive or otherwise in need of careful testing.

Neverwinter updates can invalidate formerly working commands. Preserve provenance and verification dates rather than silently upgrading confidence.

## Run locally

Requirements:

- Node.js version declared in `../.node-version`
- npm with the committed lockfile

From `web/`:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Verification

The normal engineering gate checks focused-test guards, ESLint, TypeScript, unit tests, catalog health and the production Next.js build:

```bash
npm run check
```

The release gate adds browser typechecking and Playwright coverage across mobile, tablet and desktop:

```bash
npx playwright install chromium
npm run check:release
```

Release regression coverage includes keyboard/focus behavior, touch geometry, overflow, themes, high contrast, reduced motion, enlarged text, 200%-zoom-equivalent geometry, tablet landscape, saved-data migration, the four workflows, packs, personal conflict review and first-visit help.

## Repository layout

```text
repository/
├── .github/             GitHub Quality and Security workflows
├── web/                 Maintained Next.js application
│   ├── app/             Product routes, components, state and catalogue UI
│   ├── docs/            Architecture, operations and release documentation
│   ├── e2e/             Playwright browser regression tests
│   ├── public/          Public assets and crawler files
│   ├── scripts/         Catalogue, release and maintenance checks
│   └── tests/           Node contract and data tests
├── netlify.toml         Production deployment policy
├── package.json         Cloudflare Workers Builds bootstrap
├── package-lock.json    Bootstrap lockfile
└── wrangler.jsonc       Additional OpenNext deployment configuration
```

## Production

- Canonical application: `https://neverwinterkeybind.netlify.app`
- Netlify is the canonical public deployment.
- Cloudflare Workers remains an additional OpenNext-compatible path.
- Offline/PWA installation is intentionally not part of the current release.
- Production deployment is gated by the repository's `netlify.toml` policy and a `[deploy]` marker on an authorized main-branch merge.

Current evidence, rollback criteria and accepted limitations are recorded in [docs/RELEASE_STATUS.md](./docs/RELEASE_STATUS.md).

## Data maintenance

Before publishing command updates:

- verify behavior against the current Neverwinter version
- record a source URL when available
- record a verification date
- preserve aliases and required arguments
- clearly mark uncertain or undocumented behavior
- review default-key conflicts
- never describe advisory safety guidance as a guarantee
- keep class/role quick packs catalogue-backed rather than inferring new build advice

## Known limitations

- Neverwinter commands can change after patches.
- Some commands are undocumented or inconsistently supported.
- BindForge generates text but cannot apply binds inside the game.
- Players must paste generated commands themselves.
- Personal conflict detection is only as complete as the bind text a player imports; the browser cannot read Neverwinter's live keymap automatically.
- Favourites, collections, preferences and imported keymap context are browser-local unless exported/shared through an explicit user action.

## Disclaimer

BindForge NW is an independent community project. It is not affiliated with or endorsed by Cryptic Studios, Arc Games, Gearbox Publishing, or the Neverwinter rights holders. Game names, commands and related assets belong to their respective owners.

## Studio

Designed and developed by Archew.
