"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { keybindPresets } from "./data/keybindPresets";
import {
  MAX_BACKUP_BYTES,
  createDefaultBackup,
  parseBackupJson,
  parseBackupValue,
} from "./lib/backup-schema.mjs";
import type { SavedSettingsV2 } from "./lib/backup-schema.mjs";
import type { KeybindClass, KeybindType } from "./data/keybindPresets";

const SETTINGS_KEY = "bindforge-nw:settings:v2";
const LEGACY_SETTINGS_KEY = "bindforge-nw:settings:v1";
const THEME_KEY = "bindforge-nw:theme";
const DEFAULT_SAVED_AT = new Date(0).toISOString();

export type ThemeChoice = "system" | "light" | "dark";
export type OutputMode = "bind" | "unbind";
export type DifficultyFilter = "All" | "Easy" | "Advanced" | "Risky";

export type BindForgeState = {
  className: KeybindClass | "All";
  actionType: KeybindType | "All";
  difficulty: DifficultyFilter;
  search: string;
  mode: OutputMode;
  keys: Record<string, string>;
  commandLab: SavedSettingsV2["commandLab"] & { commandId: string };
  customSay: SavedSettingsV2["customSay"];
  theme: ThemeChoice;
};

type BindForgeContextValue = {
  state: BindForgeState;
  hydrated: boolean;
  status: string;
  savedAt: string | null;
  setClassName: (value: BindForgeState["className"]) => void;
  setActionType: (value: BindForgeState["actionType"]) => void;
  setDifficulty: (value: DifficultyFilter) => void;
  setSearch: (value: string) => void;
  setMode: (value: OutputMode) => void;
  setKey: (presetId: string, value: string) => void;
  resetKey: (presetId: string) => void;
  updateCommandLab: (patch: Partial<BindForgeState["commandLab"]>) => void;
  updateCustomSay: (patch: Partial<BindForgeState["customSay"]>) => void;
  setTheme: (value: ThemeChoice) => void;
  resetFilters: () => void;
  resetAll: () => void;
  exportBackup: () => void;
  importBackup: (file: File) => Promise<void>;
  clearSavedData: () => void;
};

const BindForgeContext = createContext<BindForgeContextValue | null>(null);

function defaultKeys() {
  return Object.fromEntries(keybindPresets.map((preset) => [preset.id, preset.defaultKey]));
}

function defaultState(): BindForgeState {
  return {
    className: "All",
    actionType: "All",
    difficulty: "All",
    search: "",
    mode: "bind",
    keys: defaultKeys(),
    commandLab: {
      key: "ctrl+b",
      extraText: "Vipaction_Bankvendor activate",
      keySearch: "",
      keyCategory: "All",
      commandSearch: "",
      commandCategory: "All",
      showRisky: false,
      commandId: "gensendmessage",
    },
    customSay: { key: "f1", message: "ARTIFACTS NOW" },
    theme: "system",
  };
}

function validTheme(value: string | null): ThemeChoice {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

function resolveTheme(choice: ThemeChoice) {
  if (choice !== "system") return choice;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(choice: ThemeChoice) {
  const resolved = resolveTheme(choice);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeChoice = choice;
  document.documentElement.style.colorScheme = resolved;
}

function stateFromBackup(settings: SavedSettingsV2, theme: ThemeChoice): BindForgeState {
  const defaults = defaultState();
  return {
    className: settings.filters.className as BindForgeState["className"],
    actionType: settings.filters.actionType as BindForgeState["actionType"],
    difficulty: settings.filters.difficulty as DifficultyFilter,
    search: settings.filters.search,
    mode: settings.filters.mode,
    keys: { ...defaults.keys, ...settings.keys },
    commandLab: { ...defaults.commandLab, ...settings.commandLab },
    customSay: settings.customSay,
    theme,
  };
}

function backupFromState(state: BindForgeState, savedAt = new Date().toISOString()): SavedSettingsV2 {
  const candidate = {
    version: 2,
    savedAt,
    keys: state.keys,
    filters: {
      className: state.className,
      actionType: state.actionType,
      difficulty: state.difficulty,
      search: state.search,
      mode: state.mode,
    },
    commandLab: {
      key: state.commandLab.key,
      extraText: state.commandLab.extraText,
      keySearch: state.commandLab.keySearch,
      keyCategory: state.commandLab.keyCategory,
      commandSearch: state.commandLab.commandSearch,
      commandCategory: state.commandLab.commandCategory,
      showRisky: state.commandLab.showRisky,
    },
    customSay: state.customSay,
  };
  const parsed = parseBackupValue(candidate);
  return parsed.ok ? parsed.value : createDefaultBackup(savedAt);
}

function readStoredBackup() {
  const current = window.localStorage.getItem(SETTINGS_KEY);
  if (current) {
    const parsed = parseBackupJson(current);
    if (parsed.ok) return parsed.value;
  }

  const legacy = window.localStorage.getItem(LEGACY_SETTINGS_KEY);
  if (legacy) {
    const parsed = parseBackupJson(legacy);
    if (parsed.ok) {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed.value));
      window.localStorage.removeItem(LEGACY_SETTINGS_KEY);
      return parsed.value;
    }
  }

  return createDefaultBackup(DEFAULT_SAVED_AT);
}

export function BindForgeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BindForgeState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState("Ready to save customizations");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const settings = readStoredBackup();
      const theme = validTheme(window.localStorage.getItem(THEME_KEY));
      applyTheme(theme);
      setState(stateFromBackup(settings, theme));
      setSavedAt(settings.savedAt === DEFAULT_SAVED_AT ? null : settings.savedAt);
      setStatus(settings.savedAt === DEFAULT_SAVED_AT ? "Ready to save customizations" : "Previous settings restored");
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      const backup = backupFromState(state);
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(backup));
      window.localStorage.setItem(THEME_KEY, state.theme);
      setSavedAt(backup.savedAt);
      setStatus("Saved automatically");
    }, 220);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated) return;
    applyTheme(state.theme);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (state.theme === "system") applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [hydrated, state.theme]);

  const patchState = useCallback((patch: Partial<BindForgeState>) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  const value = useMemo<BindForgeContextValue>(() => ({
    state,
    hydrated,
    status,
    savedAt,
    setClassName: (className) => patchState({ className }),
    setActionType: (actionType) => patchState({ actionType }),
    setDifficulty: (difficulty) => patchState({ difficulty }),
    setSearch: (search) => patchState({ search }),
    setMode: (mode) => patchState({ mode }),
    setKey: (presetId, keyValue) => setState((current) => ({
      ...current,
      keys: { ...current.keys, [presetId]: keyValue },
    })),
    resetKey: (presetId) => {
      const preset = keybindPresets.find((item) => item.id === presetId);
      if (!preset) return;
      setState((current) => ({
        ...current,
        keys: { ...current.keys, [presetId]: preset.defaultKey },
      }));
    },
    updateCommandLab: (patch) => setState((current) => ({
      ...current,
      commandLab: { ...current.commandLab, ...patch },
    })),
    updateCustomSay: (patch) => setState((current) => ({
      ...current,
      customSay: { ...current.customSay, ...patch },
    })),
    setTheme: (theme) => patchState({ theme }),
    resetFilters: () => patchState({
      className: "All",
      actionType: "All",
      difficulty: "All",
      search: "",
      mode: "bind",
    }),
    resetAll: () => setState((current) => ({ ...defaultState(), theme: current.theme })),
    exportBackup: () => {
      const backup = backupFromState(state);
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(backup));
      const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `bindforge-backup-v2-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setSavedAt(backup.savedAt);
      setStatus("Version 2 backup exported");
    },
    importBackup: async (file) => {
      if (file.size > MAX_BACKUP_BYTES) {
        setStatus("Backup file is larger than 256 KB");
        return;
      }
      const parsed = parseBackupJson(await file.text());
      if (!parsed.ok) {
        setStatus(parsed.error);
        return;
      }
      const next = stateFromBackup(parsed.value, state.theme);
      setState(next);
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed.value));
      window.localStorage.removeItem(LEGACY_SETTINGS_KEY);
      setSavedAt(parsed.value.savedAt);
      setStatus(parsed.migratedFrom === 1 ? "Version 1 backup migrated and restored" : "Backup validated and restored");
    },
    clearSavedData: () => {
      if (!window.confirm("Clear all saved BindForge settings from this browser?")) return;
      window.localStorage.removeItem(SETTINGS_KEY);
      window.localStorage.removeItem(LEGACY_SETTINGS_KEY);
      window.localStorage.removeItem(THEME_KEY);
      setState(defaultState());
      setSavedAt(null);
      setStatus("Saved data cleared");
    },
  }), [hydrated, patchState, savedAt, state, status]);

  return <BindForgeContext.Provider value={value}>{children}</BindForgeContext.Provider>;
}

export function useBindForge() {
  const context = useContext(BindForgeContext);
  if (!context) throw new Error("useBindForge must be used inside BindForgeProvider");
  return context;
}
