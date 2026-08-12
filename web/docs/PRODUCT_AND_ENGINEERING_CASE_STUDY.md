# BindForge NW — Product and Engineering Case Study

> A product, UX, data-model, safety, frontend architecture, SEO, testing, and maintenance case study for the BindForge NW repository.

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Repository Snapshot](#repository-snapshot)
3. [Product Context](#product-context)
4. [Problem Statement](#problem-statement)
5. [Target Users](#target-users)
6. [Core Product Promise](#core-product-promise)
7. [Primary User Flow](#primary-user-flow)
8. [Information Architecture](#information-architecture)
9. [Data Model](#data-model)
10. [Command Generation](#command-generation)
11. [Key Normalization](#key-normalization)
12. [Safety Model](#safety-model)
13. [Search and Filtering](#search-and-filtering)
14. [Frontend Architecture](#frontend-architecture)
15. [Visual Design System](#visual-design-system)
16. [Accessibility](#accessibility)
17. [Performance](#performance)
18. [SEO and Discoverability](#seo-and-discoverability)
19. [Testing Strategy](#testing-strategy)
20. [Data Governance](#data-governance)
21. [Deployment](#deployment)
22. [Repository Statistics](#repository-statistics)
23. [Risk Register](#risk-register)
24. [Roadmap](#roadmap)
25. [Portfolio Review Notes](#portfolio-review-notes)
26. [AI Coding Agent Notes](#ai-coding-agent-notes)
27. [Launch Checklist](#launch-checklist)
28. [Disclaimer](#disclaimer)

---

## Executive Summary

BindForge NW is a browser-based Neverwinter utility for creating copy-ready keybind and unbind commands. It combines three data collections:

- practical keybind presets
- supported key combinations with safety metadata
- searchable console commands

The product reduces a repetitive player problem: finding an old command, remembering its required syntax, selecting a usable key, and avoiding conflicts with ordinary movement, combat, chat, menu, or operating-system shortcuts.

The implementation uses Next.js, React, TypeScript, Tailwind CSS, and static in-repository data. It currently provides search, filters, bind/unbind mode, modifier normalization, warning lookup, custom command arguments, copy-to-clipboard behavior, metadata, JSON-LD, and a dynamic Open Graph image.

The strongest product quality is that it translates technical command syntax into a guided player workflow. The largest ongoing risk is data freshness. Console commands can change after game updates, and community documentation is not always authoritative.

---

## Repository Snapshot

| Attribute | Current state |
|---|---|
| Repository | `Nischhalsubba/BindForge-NW` |
| Visibility | Public |
| Default branch | `main` |
| Product type | Neverwinter gaming utility |
| Framework | Next.js 16.2 |
| UI | React 19.2 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4.2 plus custom CSS |
| Data source | Typed local TypeScript collections |
| Testing | Automated tests not confirmed |
| Deployment | Public production domain not confirmed |

---

## Product Context

Neverwinter keybind workflows are unusually fragmented. Players often learn commands from:

- old forum posts
- wiki pages
- spreadsheets
- Discord messages
- personal text files
- copied binds from other players

These sources vary in freshness, syntax quality, explanation, and safety guidance.

BindForge NW turns that fragmented reference process into a product flow:

1. describe what the player wants to do
2. find a relevant preset or command
3. choose a key
4. review risk
5. generate valid syntax
6. copy it

---

## Problem Statement

Players should not need to memorize console syntax or manually reconstruct commands every time they want to create or remove a bind.

The product must solve five related problems:

- discovery
- syntax generation
- key selection
- conflict awareness
- confidence before copying

A command generator without safety warnings is incomplete. A command catalog without plain-language descriptions is difficult to use. A warning system without accurate command data merely produces nervous-looking misinformation.

---

## Target Users

### Primary

Neverwinter PC players who want practical binds without learning the entire command system.

### Secondary

- Bard players using song sequences
- experienced players maintaining several characters
- build authors sharing recommended binds
- guild members helping newer players
- players testing command behavior after patches

### User assumptions

The application assumes the user can:

- understand basic keyboard combinations
- paste a command into the relevant game context
- test a bind carefully
- restore a default key if needed

---

## Core Product Promise

> Find or build the command you need, understand the risk, and copy a clean bind line without memorizing console syntax.

This promise depends on three forms of clarity:

- plain-language descriptions
- visible safety status
- predictable output formatting

---

## Primary User Flow

```text
Search or browse
  → filter by class, category, or safety
  → choose preset or console command
  → choose or edit key combination
  → normalize modifiers
  → check warnings
  → generate bind or unbind output
  → copy command
```

### Alternate flow

A user who already knows the command can skip presets and use the custom command builder directly.

---

## Information Architecture

The interface has two major layers:

### Guided preset experience

- global search
- class filter
- type filter
- safety filter
- grouped result cards
- editable key field
- generated output
- warning message
- copy action

### Advanced reference experience

- console-command search
- command category filtering
- key-combination search
- key category filtering
- advanced key visibility
- selected command
- custom arguments
- selected combination
- generated output

The two layers serve different expertise levels without forcing every user through the advanced interface.

---

## Data Model

### Keybind presets

A preset contains:

```ts
{
  id,
  type,
  className,
  title,
  plainEnglish,
  defaultKey,
  command,
  searchTerms,
  difficulty
}
```

This model supports search, grouping, filtering, explanation, and output generation.

### Key combinations

A key-combination record contains the normalized combination, base key, modifier list, category, status, and optional note.

### Console commands

A console-command record includes a stable identifier, display command, bind-ready form, parameters, aliases, and category.

### Design strength

The product statistics displayed in the interface are calculated from these arrays, so catalog growth automatically updates the visible totals.

---

## Command Generation

### Bind mode

```text
/bind <key> <command> <optional arguments>
```

### Unbind mode

```text
/unbind <key>
```

### Preset output

Preset generation uses the edited key when available and otherwise falls back to the preset default.

### Custom output

The custom builder combines:

- selected key
- selected bind command
- optional arguments
- current bind/unbind mode

Arguments are appended only when non-empty.

### Reliability opportunity

The generation helpers are ideal candidates for extraction into pure modules and unit tests.

---

## Key Normalization

The current modifier order is:

```text
ctrl → alt → shift → base key
```

Normalization:

- trims whitespace
- lowercases input
- removes internal spaces
- splits on `+`
- removes empty pieces
- orders known modifiers
- keeps the first non-modifier as the base key

### Edge cases to test

- duplicate modifiers
- missing base key
- unsupported modifier words
- more than one base key
- uppercase input
- trailing plus signs
- mouse-button names
- function keys

---

## Safety Model

The warning model currently covers common conflicts such as:

- `W`, `A`, `S`, `D`, and Space
- Tab
- interaction and loot keys
- inventory and menu shortcuts
- chat and reply keys
- number keys
- mouse attack buttons
- Escape
- dangerous Windows shortcuts

Warnings are grouped into informational, warning, and danger levels.

### Important limitation

The model is advisory. It cannot know a player's custom in-game configuration, accessibility remapping, keyboard layout, operating system, or current game version.

### Product requirement

Warnings must appear before or next to generated output, not buried in documentation after the user has copied the command.

---

## Search and Filtering

### Preset search

Preset search includes:

- title
- type
- class
- plain-language description
- command syntax
- search terms

It combines with class, type, and safety filters.

### Command search

Command search includes:

- command name
- bind-ready command
- parameters
- aliases
- category

### Key search

Key search includes:

- combination
- base key
- modifiers
- category
- status
- notes

### Search principle

The search model favors recall. Players often know the desired behavior but not the exact command name.

---

## Frontend Architecture

### Current structure

`app/page.tsx` currently owns most interaction logic and rendering.

Responsibilities include:

- search state
- filters
- custom keys
- copy mode
- command selection
- argument state
- combination selection
- normalization
- warnings
- derived lists
- clipboard behavior

### Strength

The product is easy to understand in one file.

### Cost

As the project grows, this file can become difficult to test and maintain.

### Recommended extraction

```text
app/lib/normalizeCombo.ts
app/lib/generateCommand.ts
app/lib/keyWarnings.ts
app/lib/filterPresets.ts
app/components/PresetFilters.tsx
app/components/PresetGroup.tsx
app/components/AdvancedBuilder.tsx
```

The data collections should remain separate from UI components.

---

## Visual Design System

The working interface uses:

- parchment background
- warm white surfaces
- deep green primary actions
- rust accent
- blue informational color
- clear success, warning, and danger tokens
- compact eight-pixel corner radius
- strong visible focus ring

The dynamic Open Graph image uses a darker navy identity with bright blue highlights. The repository thumbnail combines that identity with the actual warm command-builder interface.

---

## Accessibility

### Existing positive signals

- semantic controls
- visible focus styling
- status region for copy confirmation
- plain-language descriptions
- responsive layout
- warning labels in text

### Required verification

- full keyboard flow
- screen-reader labels
- filter group semantics
- warning announcement behavior
- status-message timing
- color contrast
- mobile zoom and reflow
- accessible command-code presentation

### Recommendation

Do not communicate risk by color alone. Every warning should include readable text and severity language.

---

## Performance

### Positive factors

- local static data
- no API dependency for the primary flow
- memoized filtering
- small framework dependency set
- server-rendered metadata
- static utility behavior

### Risks

- large data collections bundled into the client page
- repeated full-array search as catalogs grow
- monolithic page component
- future media or analytics additions

### Improvements

- measure bundle contribution of each data catalog
- split advanced tools if they become large
- consider server-side indexing only if catalog size justifies it
- avoid premature backend complexity

---

## SEO and Discoverability

Implemented:

- search-focused title and description
- keyword metadata
- Open Graph metadata
- Twitter card metadata
- dynamic image generation
- SoftwareApplication JSON-LD
- crawler policy
- machine-readable project summary

Pending after deployment:

- canonical production URL
- sitemap
- verified social preview
- production structured-data validation

---

## Testing Strategy

### Unit tests

Highest-value pure functions:

- `normalizeCombo`
- `baseKey`
- `warningForKey`
- `presetLine`
- `customLine`
- preset filtering
- command filtering
- key-combination filtering

### Component tests

- filter controls
- bind/unbind toggle
- warning presentation
- copy feedback
- custom arguments
- empty state

### End-to-end tests

- search a known preset
- select class and type filters
- edit a key
- generate bind output
- switch to unbind mode
- copy output
- choose a risky key
- build a custom command
- verify mobile layout

### Data tests

- unique IDs
- non-empty command strings
- valid difficulty values
- valid class/type values
- duplicate default-key detection
- missing search terms
- unsafe key-status mismatch

---

## Data Governance

Every command should ideally carry:

- source
- source URL or reference
- date added
- date last verified
- game version or patch context
- confidence level
- known limitations

This would let the product distinguish between verified, community-reported, historical, and experimental commands.

---

## Deployment

A public production domain was not confirmed during this documentation pass.

Before publishing:

1. run `npm ci`
2. run `npm run check`
3. run the production server
4. test all filters and builders
5. validate metadata and JSON-LD
6. verify robots and `llms.txt`
7. verify the Open Graph image
8. add canonical URL and sitemap
9. capture real desktop and mobile screenshots
10. update README with the verified deployment

---

## Repository Statistics

The README includes live GitHub badges for:

- stars
- forks
- open issues
- latest commit activity

The application itself calculates current product-catalog totals from source data for:

- presets
- key combinations
- commands

The application counters are the correct source of truth for product depth.

---

## Risk Register

| Risk | Severity | Mitigation |
|---|---:|---|
| Outdated game command | High | source and verification dates |
| Risky command labeled safe | High | review process and data tests |
| Default key conflicts with player setup | High | visible warnings and editable keys |
| Monolithic page becomes difficult to test | Medium | extract pure helpers and components |
| No automated tests | High | add unit, data, and browser coverage |
| Public deployment not verified | Medium | publish and test before linking |
| Community data treated as official | High | confidence labels and disclaimer |
| Thumbnail mistaken for screenshot | Low | label asset explicitly |

---

## Roadmap

### Phase 1: Reliability

- extract pure command helpers
- add unit tests
- add schema/data validation
- add unique-ID tests

### Phase 2: Data quality

- add sources
- add verification dates
- add confidence levels
- add game-version notes

### Phase 3: User features

- personal bind collections
- import/export
- shareable preset URLs
- favorites
- recent commands

### Phase 4: Accessibility

- screen-reader review
- keyboard testing
- warning announcements
- contrast audit

### Phase 5: Portfolio and deployment

- publish verified production build
- validate metadata
- capture real screenshots
- add short product walkthrough

---

## Portfolio Review Notes

This repository demonstrates:

- product design for a technical gaming workflow
- information architecture
- data-driven UI
- search and filtering
- safety-oriented interaction design
- command generation
- typed content modeling
- SEO implementation
- dynamic social-image generation

A truthful portfolio summary would be:

> Designed and developed a data-driven Neverwinter keybind utility that converts preset and console-command references into a guided search, safety-check, bind/unbind generation, and clipboard workflow using Next.js, React, TypeScript, and Tailwind CSS.

Do not claim:

- official game affiliation
- guaranteed command validity
- guaranteed safety
- verified deployment uptime
- automated test coverage that is not present

---

## AI Coding Agent Notes

Inspect in this order:

1. `AGENTS.md`
2. `README.md`
3. `package.json`
4. `app/page.tsx`
5. `app/data/keybindPresets.ts`
6. `app/data/keyCombos.ts`
7. `app/data/commands.ts`
8. `app/globals.css`
9. `app/layout.tsx`
10. `app/opengraph-image.tsx`
11. public metadata files

### Safe first changes

- add tests
- extract pure helpers
- add data validation
- improve accessibility labels
- add source metadata

### Avoid

- changing command syntax without verification
- labeling experimental commands safe
- hard-coding catalog totals in documentation
- adding a backend without a real requirement
- presenting the repository thumbnail as a screenshot

---

## Launch Checklist

### Product

- [ ] Search works across presets
- [ ] Filters combine correctly
- [ ] Bind and unbind modes work
- [ ] Custom builder works
- [ ] Copy confirmation works

### Data

- [ ] IDs are unique
- [ ] Commands are sourced
- [ ] Verification dates are current
- [ ] Risk labels are reviewed
- [ ] Default keys are reviewed

### Accessibility

- [ ] Keyboard flow works
- [ ] Focus is visible
- [ ] Warnings include text
- [ ] Status feedback is announced
- [ ] Mobile reflow works

### Engineering

- [ ] `npm ci` succeeds
- [ ] `npm run check` succeeds
- [ ] Production server starts
- [ ] Automated tests pass once added

### SEO and deployment

- [ ] Production URL verified
- [ ] Canonical URL added
- [ ] Sitemap added
- [ ] Open Graph image verified
- [ ] JSON-LD validated
- [ ] Real screenshots captured

---

## Disclaimer

BindForge NW is an independent community utility. It is not affiliated with or endorsed by Cryptic Studios, Arc Games, Gearbox Publishing, or the Neverwinter rights holders. Commands may change after game updates, safety warnings are advisory, and generated binds should be tested carefully. The repository thumbnail is a designed presentation asset derived from the application's real visual system and dynamic Open Graph design; it is not a browser screenshot.
