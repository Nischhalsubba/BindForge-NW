export type KeyboardLike = {
  code?: string;
  key?: string;
  location?: number;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
};

export function keyTokenFromCode(code?: string, key?: string, location?: number): string;
export function comboFromKeyboardLike(event?: KeyboardLike | null): string;
