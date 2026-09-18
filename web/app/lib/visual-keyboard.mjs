import { baseKey, commandsEquivalent, normalizeCombo } from "./keybind-core.mjs";

export const VISUAL_KEYBOARD_ROWS = [
  [
    { id: "escape", label: "Esc", width: 1.2 },
    { id: "f1", label: "F1" }, { id: "f2", label: "F2" }, { id: "f3", label: "F3" }, { id: "f4", label: "F4" },
    { id: "f5", label: "F5" }, { id: "f6", label: "F6" }, { id: "f7", label: "F7" }, { id: "f8", label: "F8" },
    { id: "f9", label: "F9" }, { id: "f10", label: "F10" }, { id: "f11", label: "F11" }, { id: "f12", label: "F12" },
    { id: "printscreen", label: "PrtSc" }, { id: "scrolllock", label: "Scroll" }, { id: "pause", label: "Pause" },
  ],
  [
    { id: "grave", label: "`" },
    { id: "1", label: "1" }, { id: "2", label: "2" }, { id: "3", label: "3" }, { id: "4", label: "4" }, { id: "5", label: "5" },
    { id: "6", label: "6" }, { id: "7", label: "7" }, { id: "8", label: "8" }, { id: "9", label: "9" }, { id: "0", label: "0" },
    { id: "minus", label: "-" }, { id: "equals", label: "=" }, { id: "backspace", label: "Backspace", width: 2 },
  ],
  [
    { id: "tab", label: "Tab", width: 1.5 },
    { id: "q", label: "Q" }, { id: "w", label: "W" }, { id: "e", label: "E" }, { id: "r", label: "R" }, { id: "t", label: "T" },
    { id: "y", label: "Y" }, { id: "u", label: "U" }, { id: "i", label: "I" }, { id: "o", label: "O" }, { id: "p", label: "P" },
    { id: "leftbracket", label: "[" }, { id: "rightbracket", label: "]" }, { id: "backslash", label: "\\", width: 1.5 },
  ],
  [
    { id: "capslock", label: "Caps", width: 1.8 },
    { id: "a", label: "A" }, { id: "s", label: "S" }, { id: "d", label: "D" }, { id: "f", label: "F" }, { id: "g", label: "G" },
    { id: "h", label: "H" }, { id: "j", label: "J" }, { id: "k", label: "K" }, { id: "l", label: "L" },
    { id: "semicolon", label: ";" }, { id: "quote", label: "'" }, { id: "enter", label: "Enter", width: 2.2 },
  ],
  [
    { id: "shift", label: "Shift", width: 2.3 },
    { id: "z", label: "Z" }, { id: "x", label: "X" }, { id: "c", label: "C" }, { id: "v", label: "V" }, { id: "b", label: "B" },
    { id: "n", label: "N" }, { id: "m", label: "M" }, { id: "comma", label: "," }, { id: "period", label: "." }, { id: "slash", label: "/" },
  ],
  [
    { id: "ctrl", label: "Ctrl", width: 1.5 },
    { id: "alt", label: "Alt", width: 1.5 },
    { id: "space", label: "Space", width: 6 },
    { id: "left", label: "←" }, { id: "up", label: "↑" }, { id: "down", label: "↓" }, { id: "right", label: "→" },
  ],
  [
    { id: "insert", label: "Ins" }, { id: "home", label: "Home" }, { id: "pageup", label: "PgUp" },
    { id: "delete", label: "Del" }, { id: "end", label: "End" }, { id: "pagedown", label: "PgDn" },
    { id: "numlock", label: "Num" }, { id: "divide", label: "/" }, { id: "multiply", label: "*" }, { id: "subtract", label: "-" },
    { id: "numpad7", label: "7" }, { id: "numpad8", label: "8" }, { id: "numpad9", label: "9" }, { id: "add", label: "+" },
    { id: "numpad4", label: "4" }, { id: "numpad5", label: "5" }, { id: "numpad6", label: "6" }, { id: "numpadenter", label: "Enter", width: 1.5 },
    { id: "numpad1", label: "1" }, { id: "numpad2", label: "2" }, { id: "numpad3", label: "3" },
    { id: "numpad0", label: "0", width: 2 }, { id: "decimal", label: "." },
  ],
];

export const VISUAL_KEYBOARD_KEYS = VISUAL_KEYBOARD_ROWS.flat();

const stateLabels = {
  unknown: "Unknown",
  available: "Available",
  imported: "Imported",
  customized: "Customized",
  conflict: "Conflict",
};

function assignmentBaseKey(combo) {
  const key = baseKey(combo);
  const aliases = {
    esc: "escape",
    return: "enter",
    del: "delete",
    pgup: "pageup",
    pgdn: "pagedown",
    leftarrow: "left",
    rightarrow: "right",
    uparrow: "up",
    downarrow: "down",
    numpadplus: "add",
    numpadminus: "subtract",
    numpadmultiply: "multiply",
    numpaddivide: "divide",
    numpaddecimal: "decimal",
    numpadsubtract: "subtract",
    numpadadd: "add",
    lbracket: "leftbracket",
    rbracket: "rightbracket",
    apostrophe: "quote",
    "`": "grave",
    "-": "minus",
    "=": "equals",
    "[": "leftbracket",
    "]": "rightbracket",
    "\\": "backslash",
    ";": "semicolon",
    "'": "quote",
    ",": "comma",
    ".": "period",
    "/": "slash",
  };
  return aliases[key] ?? key;
}

function toCustomAssignments(presets, keyValues) {
  return presets.flatMap((preset) => {
    const current = normalizeCombo(keyValues?.[preset.id] ?? preset.defaultKey ?? "");
    const original = normalizeCombo(preset.defaultKey ?? "");
    if (!current || current === original) return [];
    return [{
      source: "BindForge",
      presetId: preset.id,
      title: preset.title ?? preset.id,
      combo: current,
      command: String(preset.command ?? ""),
      baseKey: assignmentBaseKey(current),
    }];
  });
}

function toImportedAssignments(personalBinds) {
  if (!Array.isArray(personalBinds)) return [];
  return personalBinds.flatMap((entry) => {
    const combo = normalizeCombo(entry?.key ?? "");
    if (!combo || typeof entry?.command !== "string") return [];
    return [{
      source: "Imported",
      combo,
      command: entry.command,
      raw: typeof entry.raw === "string" ? entry.raw : "",
      lineNumber: Number.isFinite(entry.lineNumber) ? entry.lineNumber : 0,
      baseKey: assignmentBaseKey(combo),
    }];
  });
}

function conflictsFor(customAssignments, importedAssignments) {
  const conflicts = [];
  const customByCombo = new Map();

  for (const assignment of customAssignments) {
    const group = customByCombo.get(assignment.combo) ?? [];
    group.push(assignment);
    customByCombo.set(assignment.combo, group);
  }

  for (const [combo, assignments] of customByCombo) {
    if (assignments.length > 1) {
      conflicts.push({
        type: "duplicate-custom",
        combo,
        message: `${assignments.length} customized BindForge assignments use ${combo}.`,
      });
    }

    const imported = importedAssignments.filter((entry) => entry.combo === combo);
    for (const custom of assignments) {
      for (const existing of imported) {
        if (!commandsEquivalent(custom.command, existing.command)) {
          conflicts.push({
            type: "imported-collision",
            combo,
            message: `BindForge and the imported keymap use ${combo} for different commands.`,
            custom,
            imported: existing,
          });
        }
      }
    }
  }

  return conflicts;
}

export function buildVisualKeyboardState({ presets = [], keyValues = {}, personalBinds = [] } = {}) {
  const customAssignments = toCustomAssignments(presets, keyValues);
  const importedAssignments = toImportedAssignments(personalBinds);
  const hasPersonalKeymap = importedAssignments.length > 0;
  const keys = VISUAL_KEYBOARD_KEYS.map((definition) => {
    const custom = customAssignments.filter((assignment) => assignment.baseKey === definition.id);
    const imported = importedAssignments.filter((assignment) => assignment.baseKey === definition.id);
    const conflicts = conflictsFor(custom, imported);
    const state = conflicts.length
      ? "conflict"
      : custom.length
        ? "customized"
        : imported.length
          ? "imported"
          : hasPersonalKeymap
            ? "available"
            : "unknown";

    const evidence = [];
    if (custom.length) evidence.push(`${custom.length} customized BindForge ${custom.length === 1 ? "assignment" : "assignments"}`);
    if (imported.length) evidence.push(`${imported.length} imported ${imported.length === 1 ? "bind" : "binds"}`);
    if (conflicts.length) evidence.push(`${conflicts.length} ${conflicts.length === 1 ? "conflict" : "conflicts"}`);

    return {
      ...definition,
      state,
      stateLabel: stateLabels[state],
      customAssignments: custom,
      importedAssignments: imported,
      conflicts,
      accessibleLabel: `${definition.label}, ${stateLabels[state]}${evidence.length ? `, ${evidence.join(", ")}` : ""}`,
    };
  });

  const summary = { unknown: 0, available: 0, imported: 0, customized: 0, conflict: 0 };
  for (const key of keys) summary[key.state] += 1;

  const visibleIds = new Set(VISUAL_KEYBOARD_KEYS.map((key) => key.id));
  const unmappedAssignments = [...customAssignments, ...importedAssignments]
    .filter((assignment) => !visibleIds.has(assignment.baseKey));

  return {
    hasPersonalKeymap,
    keys,
    byKey: new Map(keys.map((key) => [key.id, key])),
    summary,
    unmappedAssignments,
  };
}
