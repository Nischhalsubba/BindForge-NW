export type ModifierLike = {
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
};

export type KeyboardLike = ModifierLike & {
  code?: string;
  key?: string;
  location?: number;
};

export type MouseLike = ModifierLike & {
  button?: number;
};

export function keyTokenFromCode(code?: string, key?: string, location?: number): string;
export function mouseTokenFromButton(button?: number): string;
export function comboFromKeyboardLike(event?: KeyboardLike | null): string;
export function comboFromMouseLike(event?: MouseLike | null): string;
