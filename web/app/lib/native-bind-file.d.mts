export type NativeBindEntry = {
  key?: string;
  command?: string;
};

export type NativeBindSkip = {
  key: string;
  reason: "missing-key" | "unsupported-command" | "embedded-quotes" | null;
};

export type NativeBindFileResult = {
  content: string;
  skipped: NativeBindSkip[];
};

export type ImportedPersonalBind = {
  key?: string;
  command?: string;
};

export type NativeRestoreResult = NativeBindFileResult & {
  unresolvedKeys: string[];
};

export function buildNativeBindFile(entries?: NativeBindEntry[]): NativeBindFileResult;
export function buildNativeRestoreFile(keys?: string[], personalBinds?: ImportedPersonalBind[]): NativeRestoreResult;
export function makeNativeBindFilename(characterName?: string, profileName?: string, date?: string): string;
export function buildBindLoadCommand(filename?: string): string;
