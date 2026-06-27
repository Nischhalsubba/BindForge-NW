export type Bind = {
  category: string;
  title: string;
  keys: string;
  command: string;
  note: string;
  priority: "Core" | "Optional" | "Reset";
};

export const binds: Bind[] = [
  {
    category: "Movement",
    title: "Auto run",
    keys: "Num Lock",
    command: "/bind NumLock ++autorun",
    note: "Travel and zone movement.",
    priority: "Core",
  },
  {
    category: "Movement",
    title: "Interact",
    keys: "F",
    command: "/bind F interact",
    note: "NPCs, loot, doors, and objects.",
    priority: "Core",
  },
  {
    category: "Combat",
    title: "Target nearest enemy",
    keys: "Tab",
    command: "/bind Tab target_enemy_near",
    note: "Fast target selection in crowded fights.",
    priority: "Core",
  },
  {
    category: "Combat",
    title: "Encounter power 1",
    keys: "Q",
    command: "/bind Q +PowerTrayExec 2",
    note: "Sample encounter slot bind.",
    priority: "Core",
  },
  {
    category: "Combat",
    title: "Encounter power 2",
    keys: "E",
    command: "/bind E +PowerTrayExec 3",
    note: "Sample encounter slot bind.",
    priority: "Core",
  },
  {
    category: "Combat",
    title: "Daily power 1",
    keys: "1",
    command: "/bind 1 +PowerTrayExec 6",
    note: "Sample daily slot bind.",
    priority: "Core",
  },
  {
    category: "Items",
    title: "Open inventory",
    keys: "I",
    command: "/bind I inventory",
    note: "Bag access.",
    priority: "Core",
  },
  {
    category: "Items",
    title: "Use belt item",
    keys: "B",
    command: "/bind B +InventoryExec 0",
    note: "Example item activation bind.",
    priority: "Optional",
  },
  {
    category: "Interface",
    title: "Character sheet",
    keys: "C",
    command: "/bind C character",
    note: "Character window.",
    priority: "Optional",
  },
  {
    category: "Interface",
    title: "Hide interface screenshot",
    keys: "Alt + F12",
    command: "/bind Alt+F12 screenshot_ui_jpg",
    note: "Clean screenshot command.",
    priority: "Optional",
  },
  {
    category: "Chat",
    title: "Reply to last tell",
    keys: "R",
    command: "/bind R startchatreply",
    note: "Private message reply.",
    priority: "Core",
  },
  {
    category: "Utility",
    title: "Remove F10 bind",
    keys: "F10",
    command: "/unbind F10",
    note: "Single-key reset example.",
    priority: "Reset",
  },
];
