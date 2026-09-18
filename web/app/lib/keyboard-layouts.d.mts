export type VisualKeyboardDefinition = {
  id: string;
  label: string;
  width?: number;
};

export type KeyboardLayoutOption = {
  id: string;
  label: string;
};

export const KEYBOARD_LAYOUTS: readonly KeyboardLayoutOption[];

export function getVisualKeyboardRowsForLayout(
  baseRows: readonly (readonly VisualKeyboardDefinition[])[],
  layoutId?: string,
): VisualKeyboardDefinition[][];
