# BindForge NW

BindForge NW is a Neverwinter keybind builder. It lets players pick a key or
combo, choose a console command, and copy a ready-to-paste `/bind` line.

## Features

- Browse Neverwinter console commands
- Search and filter command categories
- Pick from generated key combos
- Type any custom key, number, text, or combo
- Copy a complete `/bind <key> <command>` line
- Show advanced and reserved combos only when needed

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```

## Edit Data

- Console commands: `app/data/commands.ts`
- Key combos: `app/data/keyCombos.ts`
- Main interface: `app/page.tsx`

The key combo catalog is based on the local Neverwinter combo reference file,
and the command list is based on the Neverwinter console command wiki.
