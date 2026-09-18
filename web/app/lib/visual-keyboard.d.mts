export type VisualKeyboardStateName = "unknown" | "available" | "imported" | "customized" | "conflict";

export type VisualKeyboardDefinition = {
  id: string;
  label: string;
  width?: number;
};

export type VisualKeyboardPreset = {
  id: string;
  title?: string;
  defaultKey?: string;
  command?: string;
};

export type VisualKeyboardPersonalBind = {
  mode?: "bind";
  key: string;
  command: string;
  raw?: string;
  lineNumber?: number;
};

export type VisualKeyboardAssignment = {
  source: "BindForge" | "Imported";
  combo: string;
  command: string;
  baseKey: string;
  presetId?: string;
  title?: string;
  raw?: string;
  lineNumber?: number;
};

export type VisualKeyboardKeyState = VisualKeyboardDefinition & {
  state: VisualKeyboardStateName;
  stateLabel: string;
  customAssignments: VisualKeyboardAssignment[];
  importedAssignments: VisualKeyboardAssignment[];
  conflicts: Array<{ type: string; combo: string; message: string }>;
  accessibleLabel: string;
};

export const VISUAL_KEYBOARD_ROWS: VisualKeyboardDefinition[][];
export const VISUAL_KEYBOARD_KEYS: VisualKeyboardDefinition[];

export function buildVisualKeyboardState(options?: {
  presets?: VisualKeyboardPreset[];
  keyValues?: Record<string, string>;
  personalBinds?: VisualKeyboardPersonalBind[];
}): {
  hasPersonalKeymap: boolean;
  keys: VisualKeyboardKeyState[];
  byKey: Map<string, VisualKeyboardKeyState>;
  summary: Record<VisualKeyboardStateName, number>;
  unmappedAssignments: VisualKeyboardAssignment[];
};
