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
const AUTOSAVE_DELAY_MS = 220;

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

type StoredBackupResult = {
  backup: SavedSettingsV2;
  storageAvailable: boolean;
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

function storageGet(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function storageRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
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

function readStoredBackup(): StoredBackupResult {
  let storageAvailable = true;
  let current: string | null = null;

  try {
    current = window.localStorage.getItem(SETTINGS_KEY);
  } catch {
    storageAvailable = false;
  }

  if (current) {
    const parsed = parseBackupJson(current);
    if (parsed.ok) return { backup: parsed.value, storageAvailable };
  }

  const legacy = storageGet(LEGACY_SETTINGS_KEY);
  if (legacy) {
    const parsed = parseBackupJson(legacy);
    if (parsed.ok) {
      storageAvailable = storageSet(SETTINGS_KEY, JSON.stringify(parsed.value)) && storageAvailable;
      storageAvailable = storageRemove(LEGACY_SETTINGS_KEY) && storageAvailable;
      return { backup: parsed.value, storageAvailable };
    }
  }

  return { backup: createDefaultBackup(DEFAULT_SAVED_AT), storageAvailable };
}

export function BindForgeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BindForgeState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState("Ready to save customizations");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const saveTimer = useRef<number | null>(null);
  const skipNextSave = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const { backup, storageAvailable } = readStoredBackup();
      const theme = validTheme(storageGet(THEME_KEY));
      applyTheme(theme);
      setState(stateFromBackup(backup, theme));
      setSavedAt(backup.savedAt === DEFAULT_SAVED_AT ? null : backup.savedAt);
      setStatus(
        storageAvailable
          ? backup.savedAt === DEFAULT_SAVED_AT
            ? "Ready to save customizations"
            : "Previous settings restored"
          : "Browser storage is unavailable; changes will last only for this session",
      );
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      const backup = backupFromState(state);
      const settingsSaved = storageSet(SETTINGS_KEY, JSON.stringify(backup));
      const themeSaved = storageSet(THEME_KEY, state.theme);
      saveTimer.current = null;

      if (settingsSaved && themeSaved) {
        setSavedAt(backup.savedAt);
        setStatus("Saved automatically");
      } else {
        setStatus("Browser storage is unavailable; changes will last only for this session");
      }
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
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
      const persisted = storageSet(SETTINGS_KEY, JSON.stringify(backup));
      const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `bindforge-backup-v2-${new Date().toISOString().slice(0, 10)}.json`;
      link.hidden = true;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setSavedAt(backup.savedAt);
      setStatus(persisted ? "Version 2 backup exported" : "Backup exported; browser storage remains unavailable");
    },
    importBackup: async (file) => {
      if (file.size > MAX_BACKUP_BYTES) {
        setStatus("Backup file is larger than 256 KB");
        return;
      }

      try {
        const parsed = parseBackupJson(await file.text());
        if (!parsed.ok) {
          setStatus(parsed.error);
          return;
        }

        const next = stateFromBackup(parsed.value, state.theme);
        setState(next);
        const persisted = storageSet(SETTINGS_KEY, JSON.stringify(parsed.value));
        storageRemove(LEGACY_SETTINGS_KEY);
        setSavedAt(parsed.value.savedAt);
        setStatus(
          persisted
            ? parsed.migratedFrom === 1
              ? "Version 1 backup migrated and restored"
              : "Backup validated and restored"
            : "Backup restored for this session; browser storage is unavailable",
        );
      } catch {
        setStatus("The backup file could not be read");
      }
    },
    clearSavedData: () => {
      if (!window.confirm("Clear all saved BindForge settings from this browser?")) return;
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      skipNextSave.current = true;
      const settingsRemoved = storageRemove(SETTINGS_KEY);
      const legacyRemoved = storageRemove(LEGACY_SETTINGS_KEY);
      const themeRemoved = storageRemove(THEME_KEY);
      setState(defaultState());
      setSavedAt(null);
      setStatus(
        settingsRemoved && legacyRemoved && themeRemoved
          ? "Saved data cleared"
          : "Session reset; browser storage could not be cleared",
      );
    },
  }), [hydrated, patchState, savedAt, state, status]);

  return <BindForgeContext.Provider value={value}>{children}</BindForgeContext.Provider>;
}

export function useBindForge() {
  const context = useContext(BindForgeContext);
  if (!context) throw new Error("useBindForge must be used inside BindForgeProvider");
  return context;
}
