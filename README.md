<!-- interactive-readme-standard:start -->

<div align="center">

# BindForge-NW

**Branch-aware technical guide for [`agent/refine-colors-and-typography`](https://github.com/Nischhalsubba/BindForge-NW/tree/agent/refine-colors-and-typography)**

<p><img alt="branch: agent/refine-colors-and-typography" src="https://img.shields.io/static/v1?label=&message=branch%3A%20agent%2Frefine-colors-and-typography&color=5965F2&style=flat-square"> <img alt="Next.js" src="https://img.shields.io/static/v1?label=&message=Next.js&color=24292F&style=flat-square"> <img alt="React" src="https://img.shields.io/static/v1?label=&message=React&color=24292F&style=flat-square"> <img alt="Tailwind CSS" src="https://img.shields.io/static/v1?label=&message=Tailwind%20CSS&color=24292F&style=flat-square"> <img alt="TypeScript" src="https://img.shields.io/static/v1?label=&message=TypeScript&color=24292F&style=flat-square"> <img alt="CSS" src="https://img.shields.io/static/v1?label=&message=CSS&color=24292F&style=flat-square"> <img alt="JavaScript" src="https://img.shields.io/static/v1?label=&message=JavaScript&color=24292F&style=flat-square"> <img alt="docs: branch-aware" src="https://img.shields.io/static/v1?label=&message=docs%3A%20branch-aware&color=8250DF&style=flat-square"></p>

<p>
  <a href="https://github.com/Nischhalsubba/BindForge-NW/tree/agent/refine-colors-and-typography"><strong>Browse source</strong></a> ·
  <a href="https://github.com/Nischhalsubba/BindForge-NW/issues"><strong>Issues</strong></a> ·
  <a href="https://github.com/Nischhalsubba/BindForge-NW/codespaces/new?ref=agent%2Frefine-colors-and-typography"><strong>Open in Codespaces</strong></a>
</p>

</div>

> [!IMPORTANT]
> This guide is generated from the files actually present on `agent/refine-colors-and-typography`. It links to detected source paths, preserves project-authored notes, and avoids claiming components that were not found.

## At a glance

| Item | Detected value |
|---|---|
| Purpose | A Neverwinter keybind builder, console-command browser, safety checker, and copy-ready bind or unbind generator. |
| Branch role | Compared with `main` |
| Stack | Next.js, React, Tailwind CSS, TypeScript, CSS, JavaScript |
| Manifests | package.json |
| Prerequisites | Node.js |
| Delivery | GitHub Actions |
| License | No license file detected |

## Branch scope

This branch differs from the default branch in the following detected paths:

- [`README.md`](https://github.com/Nischhalsubba/BindForge-NW/blob/agent/refine-colors-and-typography/README.md)
- [`app/visual-refresh.css`](https://github.com/Nischhalsubba/BindForge-NW/blob/agent/refine-colors-and-typography/app/visual-refresh.css)

## Quick start

```bash
npm install
npm run dev
npm run start
npm run build
npm run test
```

### Configuration surface

- No committed environment example file was detected.

> Never commit secrets, private keys, production credentials, customer data, or unredacted infrastructure details.

## Repository map

```mermaid
flowchart TD
    ROOT["BindForge-NW / agent/refine-colors-and-typography"]
    ROOT --> P0[".github/"]
    ROOT --> P1["app/"]
    ROOT --> P2["docs/"]
    ROOT --> P3["e2e/"]
    ROOT --> P4["public/"]
    ROOT --> P5["tests/"]
    ROOT --> P6[".gitignore"]
    ROOT --> P7["AGENTS.md"]
    ROOT --> P8["eslint.config.mjs"]
    ROOT --> P9["next.config.ts"]
    ROOT --> P10["open-next.config.ts"]
    ROOT --> P11["package-lock.json"]
    ROOT --> P12["package.json"]
    ROOT --> P13["playwright.config.ts"]
    ROOT --> P14["postcss.config.mjs"]
    ROOT --> P15["tsconfig.json"]
    ROOT --> P16["tsconfig.playwright.json"]
    ROOT --> P17["wrangler.jsonc"]
```

| Responsibility | Detected source paths |
|---|---|
| Interface | [`app`](https://github.com/Nischhalsubba/BindForge-NW/tree/agent/refine-colors-and-typography/app), [`public`](https://github.com/Nischhalsubba/BindForge-NW/tree/agent/refine-colors-and-typography/public) |
| Quality | [`tests`](https://github.com/Nischhalsubba/BindForge-NW/tree/agent/refine-colors-and-typography/tests), [`e2e`](https://github.com/Nischhalsubba/BindForge-NW/tree/agent/refine-colors-and-typography/e2e) |
| Documentation | [`docs`](https://github.com/Nischhalsubba/BindForge-NW/tree/agent/refine-colors-and-typography/docs) |
| Delivery | [`.github`](https://github.com/Nischhalsubba/BindForge-NW/tree/agent/refine-colors-and-typography/.github) |

## Website or application map

```mermaid
flowchart TD
    APP["BindForge-NW"]
    APP --> R0["app"]
    APP --> R1["public"]
    R0 --> F0["app/not-found.tsx"]
    R0 --> F1["app/FilterTopBar.tsx"]
    R0 --> F2["app/LocalSettingsManager.tsx"]
    R0 --> F3["app/loading.tsx"]
    R0 --> F4["app/layout.tsx"]
    R0 --> F5["app/error.tsx"]
    R0 --> F6["app/BindForgeProvider.tsx"]
    R0 --> F7["app/page.tsx"]
    R0 --> F8["app/ThemeSwitcher.tsx"]
    R0 --> F9["app/opengraph-image.tsx"]
    R0 --> F10["app/components/AppHeader.tsx"]
    R0 --> F11["app/components/CommandLab.tsx"]
```

## Architecture and responsibility flow

```mermaid
flowchart LR
    USER["User / contributor"]
    USER --> A0["Interface: app, public"]
    A0 --> A1["Quality: tests, e2e"]
    A1 --> A2["Documentation: docs"]
    A2 --> A3["Delivery: .github"]
    A3 --> DELIVERY["Delivery: GitHub Actions"]
```

<details>
<summary><strong>Authentication and authorization flow</strong></summary>

```mermaid
flowchart LR
    USER["User"] --> SIGNIN["Sign-in or identity step"]
    SIGNIN --> VERIFY["Verify credentials / session"]
    VERIFY --> AUTHORIZE["Resolve permissions"]
    AUTHORIZE --> PROTECTED["Protected feature or data"]
    VERIFY -->|failure| RECOVER["Error or recovery path"]
```

Relevant detected files: [`app/data/catalogIntegrity.ts`](https://github.com/Nischhalsubba/BindForge-NW/blob/agent/refine-colors-and-typography/app/data/catalogIntegrity.ts).

> The diagram expresses the responsibility sequence only. Confirm exact providers, token formats, roles, and recovery behavior in the linked source.

</details>

## Quality, security, and operations

<table>
<tr>
<td width="33%" valign="top">

### Quality

- [`tests`](https://github.com/Nischhalsubba/BindForge-NW/tree/agent/refine-colors-and-typography/tests)
- [`e2e`](https://github.com/Nischhalsubba/BindForge-NW/tree/agent/refine-colors-and-typography/e2e)

Detected commands:
- `npm run dev`
- `npm run start`
- `npm run build`
- `npm run test`
- `npm run lint`
- `npm run typecheck`
- `npm run preview`

</td>
<td width="33%" valign="top">

### Security

- No dedicated security policy or automated dependency configuration was detected.

Review authentication, authorization, input validation, dependency updates, secret handling, and failure recovery before release.

</td>
<td width="34%" valign="top">

### Observability

- No dedicated observability integration was detected automatically.

Define useful logs, metrics, traces, alerts, and rollback signals for production-facing branches.

</td>
</tr>
</table>

## Delivery flow

```mermaid
flowchart LR
    CHANGE["Change on agent/refine-colors-and-typography"] --> CHECK["Tests and quality checks"]
    CHECK --> REVIEW["Review architecture and documentation impact"]
    REVIEW --> BUILD["Build or package"]
    BUILD --> DEPLOY["Deploy or release"]
    DEPLOY --> VERIFY["Verify health and rollback readiness"]
```

### Automation detected

- [`.github/workflows/quality.yml`](https://github.com/Nischhalsubba/BindForge-NW/blob/agent/refine-colors-and-typography/.github/workflows/quality.yml)
- [`.github/workflows/release.yml`](https://github.com/Nischhalsubba/BindForge-NW/blob/agent/refine-colors-and-typography/.github/workflows/release.yml)

## Contribution flow

```mermaid
flowchart LR
    FORK["Create branch"] --> CHANGE["Make focused change"]
    CHANGE --> TEST["Run relevant checks"]
    TEST --> DOCS["Update README and diagrams"]
    DOCS --> PR["Open pull request"]
    PR --> REVIEW["Review and iterate"]
    REVIEW --> MERGE["Merge when ready"]
```

- Keep changes focused and explain architectural consequences.
- Run the checks relevant to the changed area.
- Update diagrams whenever routes, modules, data models, authentication, jobs, or delivery paths change.
- Add screenshots or recordings for visual behavior changes when useful.
- Use issues for reproducible defects and pull requests for reviewable changes.

## Ownership and support

| Topic | Source |
|---|---|
| Repository | [`Nischhalsubba/BindForge-NW`](https://github.com/Nischhalsubba/BindForge-NW) |
| Branch | [`agent/refine-colors-and-typography`](https://github.com/Nischhalsubba/BindForge-NW/tree/agent/refine-colors-and-typography) |
| Ownership | No CODEOWNERS file detected |
| Contributing | Use the contribution flow above |
| Support | [Open or review issues](https://github.com/Nischhalsubba/BindForge-NW/issues) |
| License | No license file detected |

<details>
<summary><strong>Documentation maintenance checklist</strong></summary>

- [ ] Purpose and branch scope are accurate.
- [ ] Setup and configuration commands still work.
- [ ] Repository, application, API, data, authentication, job, and deployment diagrams match the code.
- [ ] Tests, security controls, observability, and rollback behavior are documented.
- [ ] Links point to real files on this branch.
- [ ] No secrets or private operational details are exposed.

</details>

<!-- interactive-readme-standard:end -->

<!-- project-authored-notes:start -->
<details>
<summary><strong>Project-authored notes preserved from this branch</strong></summary>

<div align="center">

<img src="./docs/assets/bindforge-nw-thumbnail.svg" width="100%" alt="BindForge NW branded repository thumbnail" />

# BindForge NW

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

</details>
<!-- project-authored-notes:end -->
