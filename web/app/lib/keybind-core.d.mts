export type BindMode = "bind" | "unbind";

export type PresetCommand = {
  defaultKey: string;
  command: string;
};

export type ParsedBindEntry = {
  mode: BindMode;
  key: string;
  command: string;
  raw: string;
  lineNumber: number;
};

export type IgnoredBindLine = {
  lineNumber: number;
  raw: string;
};

export type ParsedBindText = {
  entries: ParsedBindEntry[];
  ignored: IgnoredBindLine[];
};

export function normalizeCombo(value: unknown): string;
export function isCompleteCombo(value: unknown): boolean;
export function baseKey(value: unknown): string;
export function normalizeCommandText(value: unknown): string;
export function commandsEquivalent(left: unknown, right: unknown): boolean;
export function parseBindText(value: unknown): ParsedBindText;
export function resolveBindMap(entries: ParsedBindEntry[]): ParsedBindEntry[];
export function normalizeMessage(value: unknown): string;
export function buildPresetLine(preset: PresetCommand, keyValue: string, mode?: BindMode): string;
export function buildCustomLine(keyValue: string, bindCommand: string, customArgs?: string, mode?: BindMode): string;
export function buildSayLine(keyValue: string, message: string): string;
