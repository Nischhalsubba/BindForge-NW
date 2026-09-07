export type OutputMode = "bind" | "unbind";
export type ExperienceLevel = "simple" | "standard" | "advanced";
export type ThemeChoice = "system" | "light" | "dark";
export type TextSizeChoice = "small" | "default" | "large" | "extra-large";
export type DensityChoice = "comfortable" | "standard" | "compact";
export type ContrastChoice = "standard" | "high";

export type AccessibilityPreferencesV3 = {
  experience: ExperienceLevel;
  theme: ThemeChoice;
  textSize: TextSizeChoice;
  density: DensityChoice;
  contrast: ContrastChoice;
  largeControls: boolean;
  reducedMotion: boolean;
  explainTerms: boolean;
  confirmRisky: boolean;
  showRawCommands: boolean;
};

export type SavedSettingsV3 = {
  version: 3;
  savedAt: string;
  keys: Record<string, string>;
  filters: { className: string; actionType: string; difficulty: string; search: string; mode: OutputMode };
  commandLab: { key: string; extraText: string; keySearch: string; keyCategory: string; commandSearch: string; commandCategory: string; showRisky: boolean };
  customSay: { key: string; message: string };
  preferences: AccessibilityPreferencesV3;
};

export type BackupParseResult =
  | { ok: true; value: SavedSettingsV3; migratedFrom: 1 | 2 | null }
  | { ok: false; error: string };

export const BACKUP_VERSION: 3;
export const MAX_BACKUP_BYTES: number;
export function createDefaultPreferences(): AccessibilityPreferencesV3;
export function createLegacyPreferences(): AccessibilityPreferencesV3;
export function createDefaultBackup(savedAt?: string): SavedSettingsV3;
export function parseBackupValue(input: unknown, options?: { now?: string }): BackupParseResult;
export function parseBackupJson(text: string, options?: { now?: string }): BackupParseResult;
