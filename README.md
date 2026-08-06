<div align="center">

<img src="./docs/assets/bindforge-nw-thumbnail.svg" width="100%" alt="BindForge NW branded repository thumbnail" />

# BindForge NW

<!-- interactive-readme-standard:start -->

> [!NOTE]
> **Branch-specific documentation:** this section is maintained for [`agent/complete-pending-roadmap`](https://github.com/Nischhalsubba/BindForge-NW/tree/agent/complete-pending-roadmap). It is generated from the files present on this branch and preserves the project-authored README below.

<details open>
<summary><strong>Interactive repository guide</strong></summary>

## Branch overview

| Item | Value |
|---|---|
| Repository | [`Nischhalsubba/BindForge-NW`](https://github.com/Nischhalsubba/BindForge-NW) |
| Branch | [`agent/complete-pending-roadmap`](https://github.com/Nischhalsubba/BindForge-NW/tree/agent/complete-pending-roadmap) |
| Detected stack | Next.js, React, Tailwind CSS, TypeScript, CSS, JavaScript |
| Detected manifests | package.json |
| Documentation policy | Every maintained branch must explain purpose, setup, structure, architecture, flows, testing, delivery, security, and ownership. |

## Repository structure

```mermaid
flowchart TD
    ROOT["BindForge-NW / agent/complete-pending-roadmap"]
    ROOT --> P0[".github/"]
    ROOT --> P1["app/"]
    ROOT --> P2["docs/"]
    ROOT --> P3["e2e/"]
    ROOT --> P4["public/"]
    ROOT --> P5["scripts/"]
    ROOT --> P6["tests/"]
    ROOT --> P7[".gitignore"]
    ROOT --> P8["AGENTS.md"]
    ROOT --> P9["eslint.config.mjs"]
    ROOT --> P10["next.config.ts"]
    ROOT --> P11["open-next.config.ts"]
    ROOT --> P12["package-lock.json"]
    ROOT --> P13["package.json"]
    ROOT --> P14["playwright.config.ts"]
    ROOT --> P15["playwright.production.config.ts"]
    ROOT --> P16["postcss.config.mjs"]
    ROOT --> P17["tsconfig.json"]
    ROOT --> MORE["+ 2 more top-level entries"]
```

The diagram is generated from the branch's actual top-level files and directories. Use the branch link above for complete source navigation.

## Website or application structure

```mermaid
flowchart TD
    APP["BindForge-NW"]
    APP --> R0["app"]
    APP --> R1["public"]
    R0 --> F0["app/BindForgeProvider.tsx"]
    R0 --> F1["app/FilterTopBar.tsx"]
    R0 --> F2["app/LocalSettingsManager.tsx"]
    R0 --> F3["app/ThemeSwitcher.tsx"]
    R0 --> F4["app/components/AppHeader.tsx"]
    R0 --> F5["app/components/CommandLab.tsx"]
    R0 --> F6["app/components/CustomSayBuilder.tsx"]
    R0 --> F7["app/components/FilterSidebar.tsx"]
    R0 --> F8["app/components/Icon.tsx"]
    R0 --> F9["app/components/KeybindLibrary.tsx"]
    R0 --> F10["app/components/RecoveryPanel.tsx"]
    R0 --> F11["app/error.tsx"]
```

## Application and responsibility flow

```mermaid
flowchart LR
    ACTOR["User / contributor"]
    ACTOR --> A0["Interface: app, public"]
    A0 --> A1["Quality: tests, e2e"]
    A1 --> A2["Documentation: docs"]
    A2 --> A3["Delivery: .github, scripts"]
    A3 --> DELIVERY["Delivery: GitHub Actions"]
```

## Change-to-delivery flow

```mermaid
flowchart LR
    CHANGE["Change on agent/complete-pending-roadmap"]
    CHECK["Validate: npm run dev, npm run start, npm run build, npm run test, npm run lint"]
    REVIEW["Review documentation and architecture impact"]
    RELEASE["Merge, release, or deploy according to this branch"]
    CHANGE --> CHECK --> REVIEW --> RELEASE
```

## README requirements for this branch

- Explain what this branch contains and how it differs from the default branch.
- Keep installation, configuration, usage, testing, deployment, security, support, and license information accurate.
- Document repository, website or application, API, data, authentication, background-job, and deployment flows when they exist.
- Prefer Mermaid diagrams and expandable `<details>` sections for visual navigation.
- Link diagrams and modules to real source paths; never invent missing components.
- Preserve project-specific documentation and update diagrams whenever architecture or major paths change.
- Treat secrets, private infrastructure, customer data, and credentials as prohibited README content.

</details>

<!-- interactive-readme-standard:end -->

### Build Neverwinter keybinds without memorizing console commands

A data-driven keybind preset browser, console-command explorer, safety checker, and copy-ready `/bind` or `/unbind` generator.

![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=111111)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)

[Engineering case study](./docs/PRODUCT_AND_ENGINEERING_CASE_STUDY.md) · [Architecture](./docs/architecture.md) · [Release checklist](./docs/release-checklist.md)

</div>

## Product

BindForge NW helps Neverwinter players find, edit, generate, and copy practical keybind commands without searching scattered forum posts, wiki fragments, spreadsheets, or old chat messages.

Players can search and filter presets, edit key combinations, review conflict warnings, switch between bind and unbind output, build custom commands, create custom chat binds, and preserve settings in the browser.

## Main capabilities

| Capability | Description |
|---|---|
| Preset library | Ready-made binds for combat, utility, class, companion, VIP, camera, social, and other actions |
| Search and filtering | Search presets and filter by class, action type, and difficulty |
| Bind and unbind modes | Generate `/bind` or `/unbind` output from the same shared state |
| Command Lab | Combine supported keys with catalog commands and optional arguments |
| Custom chat builder | Generate safe, normalized `say` message binds |
| Conflict guidance | Warn about movement, menus, chat, mouse buttons, and reserved Windows combinations |
| Local persistence | Save filters, keys, appearance, Command Lab, and custom-chat settings in the browser |
| Backup tools | Export, validate, import, migrate, and clear versioned JSON settings |
| Recovery UI | Route-level loading, not-found, and runtime-error experiences |
| Responsive UI | Mobile-first toolbar and filter behavior with tablet and desktop enhancement |

## Command output

Bind mode:

```text
/bind <key> <command> <optional arguments>
```

Unbind mode:

```text
/unbind <key>
```

Example:

```text
/bind ctrl+b gensendmessage Vipaction_Bankvendor activate
```

## Architecture

`BindForgeProvider` is the single source of truth for user-editable application state. Components consume state and actions through `useBindForge`; they do not synchronize through document queries, mutation observers, or synthetic input events.

Important areas:

```text
app/
├── BindForgeProvider.tsx       shared state, persistence, theme, backup and recovery
├── FilterTopBar.tsx            responsive search, action filter, mode and reset controls
├── components/
│   ├── FilterSidebar.tsx       class, difficulty, appearance and backup controls
│   ├── KeybindLibrary.tsx      preset filtering, grouping and editable cards
│   ├── CommandLab.tsx          custom command generation
│   └── CustomSayBuilder.tsx    custom chat bind generation
├── lib/                        deterministic command, backup, clipboard and catalog helpers
├── error.tsx                   runtime recovery
├── loading.tsx                 route loading state
├── not-found.tsx               missing-route recovery
└── mobile-first.css            responsive layout and contrast corrections

e2e/
└── bindforge.spec.ts           mobile, tablet and desktop browser regression coverage
```

See [docs/architecture.md](./docs/architecture.md) for the detailed state and component boundaries.

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

Install the browser-test tooling once when working locally:

```bash
npm install --no-save @playwright/test@1.55.0 axe-core@4.10.2
npx playwright install chromium
```

Then run:

```bash
npm run check:release
```

The release check covers:

- ESLint
- TypeScript validation
- unit and catalog tests
- production build
- Playwright smoke and regression tests
- mobile, tablet, and desktop viewport coverage
- persistence and clear-data regression checks
- route recovery
- keyboard navigation
- axe accessibility checks in dark and light appearance

GitHub Actions retains typecheck, build, and Playwright diagnostics for failed runs.

## Current status

| Area | Status |
|---|---|
| Preset search and filtering | Implemented |
| Command and key-combination browsers | Implemented |
| Bind, unbind and custom-chat generation | Implemented |
| Shared provider architecture | Implemented |
| Browser-local persistence and backups | Implemented |
| Route recovery | Implemented |
| Unit and catalog tests | Implemented |
| Playwright regression suite | Under release stabilization in PR #31 |
| Accessibility baseline | Under release stabilization in PR #31 |
| Mobile-first responsive layout | Under release stabilization in PR #31 |
| Verified public production deployment | Pending |
| Real production screenshots | Pending deployment verification |

## Release process

A build is not ready for promotion until:

1. The pull-request Quality workflow passes.
2. The manually triggered Release verification workflow passes.
3. Desktop, tablet, and mobile layouts are reviewed.
4. Search, filters, output modes, persistence, backup, theme, clipboard, and recovery behavior are manually checked.
5. The production deployment URL is opened and smoke-tested.
6. The release record includes the commit, workflows, deployment, tester, browsers, viewports, date, and accepted limitations.

See [docs/release-checklist.md](./docs/release-checklist.md).

## Production deployment

A verified production URL is not yet documented. After deployment:

- run the production smoke checklist
- verify metadata, Open Graph image, `robots.txt`, and `llms.txt`
- add the canonical URL and sitemap
- record the deployment URL and commit
- capture real desktop and mobile screenshots

## Data maintenance

Before publishing command updates:

- verify behavior against the current game version
- record the source and verification date
- preserve aliases and required arguments
- clearly mark uncertain or undocumented behavior
- review default-key conflicts
- never describe advisory safety guidance as a guarantee

## Known limitations

- Neverwinter commands may change after patches.
- Some commands are undocumented or inconsistently supported.
- BindForge generates text but does not apply binds inside the game.
- Players must paste generated commands themselves.
- Conflict and safety guidance is advisory.
- A verified public production deployment is still pending.

## Roadmap

1. Finish PR #31 browser, accessibility, and responsive verification.
2. Run and record the manual Release verification workflow.
3. Publish and verify the production deployment.
4. Add the canonical URL and sitemap.
5. Capture real desktop and mobile production screenshots.
6. Record source and verification dates throughout the command catalog.
7. Add shareable preset URLs and personal bind collections.

## Disclaimer

BindForge NW is an independent community project. It is not affiliated with or endorsed by Cryptic Studios, Arc Games, Gearbox Publishing, or the Neverwinter rights holders. Game names, commands, and related assets belong to their respective owners.

## Author

Designed and developed by [Nischhal Raj Subba](https://github.com/Nischhalsubba).
