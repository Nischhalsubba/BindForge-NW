export type OutputMode = "bind" | "unbind";

export type SavedSettingsV2 = {
  version: 2;
  savedAt: string;
  keys: Record<string, string>;
  filters: {
    className: string;
    actionType: string;
    difficulty: string;
    search: string;
    mode: OutputMode;
  };
  commandLab: {
    key: string;
    extraText: string;
    keySearch: string;
    keyCategory: string;
    commandSearch: string;
    commandCategory: string;
    showRisky: boolean;
  };
  customSay: {
    key: string;
    message: string;
  };
};

export type BackupParseResult =
  | { ok: true; value: SavedSettingsV2; migratedFrom: 1 | null }
  | { ok: false; error: string };

export const BACKUP_VERSION: 2;
export const MAX_BACKUP_BYTES: number;
export function createDefaultBackup(savedAt?: string): SavedSettingsV2;
export function parseBackupValue(input: unknown, options?: { now?: string }): BackupParseResult;
export function parseBackupJson(text: string, options?: { now?: string }): BackupParseResult;
