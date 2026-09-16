export type BindMode = "bind" | "unbind";

export type PresetCommand = {
  defaultKey: string;
  command: string;
};

export function normalizeCombo(value: unknown): string;
export function isCompleteCombo(value: unknown): boolean;
export function baseKey(value: unknown): string;
export function normalizeMessage(value: unknown): string;
export function buildPresetLine(preset: PresetCommand, keyValue: string, mode?: BindMode): string;
export function buildCustomLine(keyValue: string, bindCommand: string, customArgs?: string, mode?: BindMode): string;
export function buildSayLine(keyValue: string, message: string): string;
