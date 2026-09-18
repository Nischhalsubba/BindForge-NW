"use client";

import { useEffect, useMemo, useState } from "react";
import { useBindForge } from "../BindForgeProvider";
import { keybindPresets } from "../data/keybindPresets";
import type { KeybindPreset, KeybindType } from "../data/keybindPresets";
import type { PresetConfidence, PresetSourceType } from "../data/keybindTypes";
import {
  baseKey,
  buildPresetLine,
  commandsEquivalent,
  normalizeCombo,
  parseBindText,
  resolveBindMap,
} from "../lib/keybind-core.mjs";
import {
  buildBindLoadCommand,
  buildNativeBindFile,
  buildNativeRestoreFile,
  makeNativeBindFilename,
} from "../lib/native-bind-file.mjs";
import {
  cloneProfile,
  createDefaultProfileWorkspace,
  getActiveCharacter,
  getActiveProfile,
  parseProfileWorkspaceJson,
} from "../lib/profile-workspace.mjs";
import { scorePresetSearch, suggestPresetSearches } from "../lib/preset-search.mjs";
import { SAFE_KEY_SUGGESTIONS, normalizedKey } from "../lib/safe-key-suggestions";
import type { CopyResultState } from "../page";
import FilterTopBar from "../FilterTopBar";
import { CompactKeybindRow } from "./CompactKeybindRow";
import { Icon } from "./Icon";
import { KeybindCard } from "./KeybindCard";
import type { KeybindSafetyStatus } from "./KeybindCard";
import { WorkspaceControls } from "./WorkspaceControls";
import type { PackReviewItem } from "./WorkspaceControls";

const LIBRARY_SETTINGS_KEY = "bindforge-nw:library:v1";
const PROFILE_WORKSPACE_KEY = "bindforge-nw:profiles:v1";
const INITIAL_VISIBLE_GROUPS = keybindPresets.length;
const GROUP_BATCH_SIZE = 3;
const MAX_PERSONAL_BIND_FILE_BYTES = 512 * 1024;
const MAX_PROFILE_WORKSPACE_BYTES = 512 * 1024;

const typeOrder: KeybindType[] = [
  "Invocation / Character", "Targeting", "VIP Services", "Bard Songs", "Animation Cancel", "Combat",
  "Companion", "Inventory / Buffs", "Loot / Interact", "Utility", "Camera / Screenshot", "Risky / Testing", "Social",
];

const warnings: Array<{ keys: string[]; message: string; level: "info" | "warn" | "danger" }> = [
  { keys: ["w", "a", "s", "d", "space"], message: "This key is commonly used for movement or jumping.", level: "danger" },
  { keys: ["tab"], message: "Tab is often used for targeting or Bard perform mode.", level: "warn" },
  { keys: ["f", "g"], message: "This key is often used for interact, loot, or nearby prompts.", level: "warn" },
  { keys: ["i", "c", "m", "p", "j", "k", "l"], message: "This key may open a menu, inventory, map, journal, or character window.", level: "warn" },
  { keys: ["enter", "r"], message: "This key may be used for chat or replying to messages.", level: "warn" },
  { keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"], message: "Number keys are often used for powers, items, or potion slots.", level: "info" },
  { keys: ["lbutton", "rbutton", "mbutton"], message: "Mouse buttons are usually used for attacks or camera control.", level: "danger" },
  { keys: ["escape"], message: "Escape is normally used to close menus.", level: "danger" },
  { keys: ["alt+f4", "alt+tab", "ctrl+alt+delete"], message: "This combination is reserved by Windows. Avoid using it.", level: "danger" },
];

type CopyHandler = (text: string, label: string, target: HTMLElement | null) => Promise<CopyResultState>;
type ViewMode = "cards" | "compact";
type SortMode = "recommended" | "title" | "difficulty" | "class";
type ProvenanceFilter = "all" | PresetSourceType | PresetConfidence;
type PersonalBind = {
  mode: "bind";
  key: string;
  command: string;
  raw: string;
  lineNumber: number;
};
type KeymapProfile = {
  id: string;
  name: string;
  keyValues: Record<string, string>;
  personalBinds: PersonalBind[];
  personalSourceName: string;
  personalImportedAt: string;
  updatedAt: string;
};
type CharacterProfile = {
  id: string;
  name: string;
  className: string;
  paragon: string;
  role: string;
  profiles: KeymapProfile[];
};
type ProfileWorkspace = {
  version: number;
  activeCharacterId: string;
  activeProfileId: string;
  characters: CharacterProfile[];
};
type StoredLibraryState = {
  favourites: string[];
  collections: Record<string, string[]>;
  viewMode: ViewMode;
  sortMode: SortMode;
  collapsedGroups: string[];
  provenanceFilter: ProvenanceFilter;
  safeOnly: boolean;
  personalBinds: PersonalBind[];
  personalSourceName: string;
  personalImportedAt: string;
};

const defaultLibraryState: StoredLibraryState = {
  favourites: [], collections: {}, viewMode: "cards", sortMode: "recommended",
  collapsedGroups: [], provenanceFilter: "all", safeOnly: false,
  personalBinds: [], personalSourceName: "", personalImportedAt: "",
};

function unique(values: string[]) { return Array.from(new Set(values)); }
function difficultyRank(value: KeybindPreset["difficulty"]) { return value === "Easy" ? 0 : value === "Advanced" ? 1 : 2; }
function warningForKey(value: string) {
  const combo = normalizeCombo(value);
  const key = baseKey(value);
  return warnings.find((item) => item.keys.includes(combo) || item.keys.includes(key));
}
function shortCommand(value: string) {
  const command = value.trim();
  return command.length > 72 ? `${command.slice(0, 69)}…` : command;
}
function statusFor(
  preset: KeybindPreset,
  keyValue: string,
  duplicate: boolean,
  personalBind: PersonalBind | undefined,
  hasPersonalKeymap: boolean,
): KeybindSafetyStatus {
  if (duplicate) return { level: "danger", message: "This key is also used by another selected preset in this pack." };
  if (personalBind) {
    if (commandsEquivalent(personalBind.command, preset.command)) {
      return { level: "safe", message: "This exact command is already present on this key in your imported keymap." };
    }
    return {
      level: preset.intentionalNativeOverride ? "warn" : "danger",
      message: `Your imported keymap uses this key for “${shortCommand(personalBind.command)}”. Applying this preset will replace that personal bind.`,
    };
  }
  const commonWarning = warningForKey(keyValue);
  if (commonWarning) return commonWarning;
  return hasPersonalKeymap
    ? { level: "safe", message: "No conflict found in your imported keymap and no common native-key conflict detected." }
    : { level: "safe", message: "No common native-key conflict detected. Import your keymap for personal conflict detection." };
}
function groupedPresets(presets: KeybindPreset[]) {
  return presets.reduce<Record<string, KeybindPreset[]>>((groups, preset) => {
    const key = `${preset.type} · ${preset.className}`;
    groups[key] = [...(groups[key] ?? []), preset];
    return groups;
  }, {});
}
function sanitizePersonalBinds(value: unknown): PersonalBind[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const candidate = entry as Partial<PersonalBind>;
    const key = normalizeCombo(candidate.key ?? "");
    if (!key || typeof candidate.command !== "string") return [];
    return [{
      mode: "bind" as const,
      key,
      command: candidate.command,
      raw: typeof candidate.raw === "string" ? candidate.raw : `/bind ${key} ${candidate.command}`,
      lineNumber: typeof candidate.lineNumber === "number" ? candidate.lineNumber : 0,
    }];
  });
}
function readStoredLibraryState(): StoredLibraryState {
  try {
    const value = window.localStorage.getItem(LIBRARY_SETTINGS_KEY);
    if (!value) return defaultLibraryState;
    const parsed = JSON.parse(value) as Partial<StoredLibraryState>;
    return {
      favourites: Array.isArray(parsed.favourites) ? parsed.favourites : [],
      collections: parsed.collections && typeof parsed.collections === "object" ? parsed.collections : {},
      viewMode: parsed.viewMode === "compact" ? "compact" : "cards",
      sortMode: ["recommended", "title", "difficulty", "class"].includes(parsed.sortMode ?? "") ? parsed.sortMode as SortMode : "recommended",
      collapsedGroups: [],
      provenanceFilter: typeof parsed.provenanceFilter === "string" ? parsed.provenanceFilter as ProvenanceFilter : "all",
      safeOnly: Boolean(parsed.safeOnly),
      personalBinds: sanitizePersonalBinds(parsed.personalBinds),
      personalSourceName: typeof parsed.personalSourceName === "string" ? parsed.personalSourceName : "",
      personalImportedAt: typeof parsed.personalImportedAt === "string" ? parsed.personalImportedAt : "",
    };
  } catch {
    return defaultLibraryState;
  }
}
function downloadText(filename: string, text: string, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
function createId(prefix: string) {
  const suffix = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${suffix}`;
}
function keyValuesEqual(left: Record<string, string>, right: Record<string, string>) {
  const leftEntries = Object.entries(left);
  const rightEntries = Object.entries(right);
  if (leftEntries.length !== rightEntries.length) return false;
  return leftEntries.every(([key, value]) => right[key] === value);
}

export function KeybindLibrary({ onCopy }: { onCopy: CopyHandler }) {
  const { state, hydrated: settingsHydrated, setKey, replaceKeys, setSearch, resetFilters } = useBindForge();
  const [library, setLibrary] = useState<StoredLibraryState>(defaultLibraryState);
  const [profileWorkspace, setProfileWorkspace] = useState<ProfileWorkspace | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCollection, setActiveCollection] = useState("all");
  const [collectionName, setCollectionName] = useState("");
  const [visibleGroupCount, setVisibleGroupCount] = useState(INITIAL_VISIBLE_GROUPS);
  const [personalImportMessage, setPersonalImportMessage] = useState("");
  const [profileStatus, setProfileStatus] = useState("");
  const [nativePackStatus, setNativePackStatus] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [profilesHydrated, setProfilesHydrated] = useState(false);

  useEffect(() => {
    setLibrary(readStoredLibraryState());
    const params = new URLSearchParams(window.location.search);
    const presetId = params.get("preset");
    const collection = params.get("collection");
    if (presetId && keybindPresets.some((preset) => preset.id === presetId)) setSelectedIds([presetId]);
    if (collection) setActiveCollection(collection);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(LIBRARY_SETTINGS_KEY, JSON.stringify(library)); } catch { /* session only */ }
  }, [hydrated, library]);

  useEffect(() => {
    if (!settingsHydrated || !hydrated || profilesHydrated) return;
    let next: ProfileWorkspace | null = null;
    try {
      const stored = window.localStorage.getItem(PROFILE_WORKSPACE_KEY);
      if (stored) {
        const parsed = parseProfileWorkspaceJson(stored);
        if (parsed.ok) next = parsed.value as ProfileWorkspace;
      }
    } catch { /* create a safe local workspace below */ }

    const migrated = !next;
    if (!next) {
      next = createDefaultProfileWorkspace({
        keyValues: state.keys,
        personalBinds: library.personalBinds,
        personalSourceName: library.personalSourceName,
        personalImportedAt: library.personalImportedAt,
      }) as ProfileWorkspace;
    }

    setProfileWorkspace(next);
    const active = getActiveProfile(next) as KeymapProfile | null;
    if (active) replaceKeys(active.keyValues);
    try { window.localStorage.setItem(PROFILE_WORKSPACE_KEY, JSON.stringify(next)); } catch { /* session only */ }
    if (migrated && (library.personalBinds.length || library.personalSourceName || library.personalImportedAt)) {
      setLibrary((current) => ({ ...current, personalBinds: [], personalSourceName: "", personalImportedAt: "" }));
      setProfileStatus("Existing keymap migrated into My Character · Default.");
    }
    setProfilesHydrated(true);
  }, [hydrated, library.personalBinds, library.personalImportedAt, library.personalSourceName, profilesHydrated, replaceKeys, settingsHydrated, state.keys]);

  useEffect(() => {
    if (!profilesHydrated || !profileWorkspace) return;
    try { window.localStorage.setItem(PROFILE_WORKSPACE_KEY, JSON.stringify(profileWorkspace)); } catch { /* session only */ }
  }, [profileWorkspace, profilesHydrated]);

  useEffect(() => {
    if (!profilesHydrated) return;
    setProfileWorkspace((current) => {
      if (!current) return current;
      const character = current.characters.find((item) => item.id === current.activeCharacterId);
      const profile = character?.profiles.find((item) => item.id === current.activeProfileId);
      if (!character || !profile || keyValuesEqual(profile.keyValues, state.keys)) return current;
      const updatedAt = new Date().toISOString();
      return {
        ...current,
        characters: current.characters.map((item) => item.id === character.id ? {
          ...item,
          profiles: item.profiles.map((candidate) => candidate.id === profile.id ? { ...candidate, keyValues: { ...state.keys }, updatedAt } : candidate),
        } : item),
      };
    });
  }, [profilesHydrated, state.keys]);

  useEffect(() => {
    if (!hydrated || state.preferences.experience !== "simple") return;
    setActiveCollection("all");
    setCollectionName("");
    setSelectedIds([]);
    setLibrary((current) => {
      const alreadySimple = current.viewMode === "cards"
        && current.sortMode === "recommended"
        && current.provenanceFilter === "all"
        && current.safeOnly === false;
      if (alreadySimple) return current;
      return {
        ...current,
        viewMode: "cards",
        sortMode: "recommended",
        provenanceFilter: "all",
        safeOnly: false,
      };
    });
  }, [hydrated, state.preferences.experience]);

  useEffect(() => {
    setVisibleGroupCount(INITIAL_VISIBLE_GROUPS);
  }, [state.search, state.className, state.actionType, state.difficulty, activeCollection, library.provenanceFilter, library.safeOnly, library.sortMode]);

  const fallbackWorkspace = useMemo(() => createDefaultProfileWorkspace({ keyValues: state.keys }) as ProfileWorkspace, [state.keys]);
  const resolvedWorkspace = profileWorkspace ?? fallbackWorkspace;
  const activeCharacter = (getActiveCharacter(resolvedWorkspace) as CharacterProfile | null) ?? resolvedWorkspace.characters[0];
  const activeProfile = (getActiveProfile(resolvedWorkspace) as KeymapProfile | null) ?? activeCharacter.profiles[0];
  const personalBinds = useMemo(() => activeProfile.personalBinds ?? [], [activeProfile.personalBinds]);
  const personalSourceName = activeProfile.personalSourceName ?? "";

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const favouriteSet = useMemo(() => new Set(library.favourites), [library.favourites]);
  const selectedPresets = useMemo(() => keybindPresets.filter((preset) => selectedSet.has(preset.id)), [selectedSet]);
  const selectedKeyUseCounts = useMemo(() => selectedPresets.reduce<Record<string, number>>((counts, preset) => {
    const key = normalizedKey(state.keys[preset.id] ?? preset.defaultKey);
    if (key) counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {}), [selectedPresets, state.keys]);
  const personalByKey = useMemo(() => new Map(personalBinds.map((entry) => [normalizedKey(entry.key), entry])), [personalBinds]);
  const hasPersonalKeymap = Boolean(personalBinds.length || personalSourceName);

  const filtered = useMemo(() => {
    const query = state.search.trim();
    const collectionIds = activeCollection === "favourites" ? library.favourites : activeCollection === "all" ? null : library.collections[activeCollection] ?? [];
    const result = keybindPresets.flatMap((preset) => {
      const searchScore = query ? scorePresetSearch(preset, query) : 1;
      if (query && searchScore <= 0) return [];
      const keyValue = state.keys[preset.id] ?? preset.defaultKey;
      const key = normalizedKey(keyValue);
      const duplicate = selectedSet.has(preset.id) && (selectedKeyUseCounts[key] ?? 0) > 1;
      const status = statusFor(preset, keyValue, duplicate, personalByKey.get(key), hasPersonalKeymap);
      const provenanceMatch = library.provenanceFilter === "all" || preset.sourceType === library.provenanceFilter || preset.confidence === library.provenanceFilter;
      const matchesFilters = (state.className === "All" || preset.className === state.className)
        && (state.actionType === "All" || preset.type === state.actionType)
        && (state.difficulty === "All" || preset.difficulty === state.difficulty)
        && (!collectionIds || collectionIds.includes(preset.id))
        && provenanceMatch
        && (!library.safeOnly || status.level === "safe" || Boolean(preset.intentionalNativeOverride));
      return matchesFilters ? [{ preset, searchScore }] : [];
    });
    return result.sort((left, right) => {
      if (library.sortMode === "recommended" && query && right.searchScore !== left.searchScore) return right.searchScore - left.searchScore;
      const leftPreset = left.preset;
      const rightPreset = right.preset;
      return library.sortMode === "title"
        ? leftPreset.title.localeCompare(rightPreset.title)
        : library.sortMode === "difficulty"
          ? difficultyRank(leftPreset.difficulty) - difficultyRank(rightPreset.difficulty) || leftPreset.title.localeCompare(rightPreset.title)
          : library.sortMode === "class"
            ? leftPreset.className.localeCompare(rightPreset.className) || leftPreset.title.localeCompare(rightPreset.title)
            : typeOrder.indexOf(leftPreset.type) - typeOrder.indexOf(rightPreset.type) || leftPreset.title.localeCompare(rightPreset.title);
    }).map(({ preset }) => preset);
  }, [activeCollection, hasPersonalKeymap, library.collections, library.favourites, library.provenanceFilter, library.safeOnly, library.sortMode, personalByKey, selectedKeyUseCounts, selectedSet, state.actionType, state.className, state.difficulty, state.keys, state.search]);

  const searchOnlyMatchCount = useMemo(() => {
    const query = state.search.trim();
    if (!query) return keybindPresets.length;
    return keybindPresets.filter((preset) => scorePresetSearch(preset, query) > 0).length;
  }, [state.search]);
  const searchSuggestions = useMemo(() => filtered.length || !state.search.trim()
    ? []
    : suggestPresetSearches(keybindPresets, state.search, 3), [filtered.length, state.search]);
  const groupedEntries = useMemo(() => Object.entries(groupedPresets(filtered)), [filtered]);
  const visibleGroups = groupedEntries.slice(0, visibleGroupCount);
  const selectedReviewItems = useMemo<PackReviewItem[]>(() => selectedPresets.map((preset) => {
    const keyValue = state.keys[preset.id] ?? preset.defaultKey;
    const key = normalizedKey(keyValue);
    const duplicate = (selectedKeyUseCounts[key] ?? 0) > 1;
    const status = statusFor(preset, keyValue, duplicate, personalByKey.get(key), hasPersonalKeymap);
    return {
      id: preset.id,
      title: preset.title,
      keyValue: normalizeCombo(keyValue),
      line: buildPresetLine(preset, keyValue, "bind"),
      statusLevel: status.level,
      statusMessage: status.message,
      confidence: `${preset.confidence ? preset.confidence.replace("-", " ") : "unverified"}${preset.verifiedAt ? ` · checked ${preset.verifiedAt}` : ""}`,
    };
  }), [hasPersonalKeymap, personalByKey, selectedKeyUseCounts, selectedPresets, state.keys]);
  const selectedReviewCount = useMemo(() => selectedReviewItems.filter((item) => item.statusLevel !== "safe").length, [selectedReviewItems]);
  const conflictCount = useMemo(() => filtered.filter((preset) => {
    const keyValue = state.keys[preset.id] ?? preset.defaultKey;
    const key = normalizedKey(keyValue);
    const duplicate = selectedSet.has(preset.id) && (selectedKeyUseCounts[key] ?? 0) > 1;
    return statusFor(preset, keyValue, duplicate, personalByKey.get(key), hasPersonalKeymap).level !== "safe";
  }).length, [filtered, hasPersonalKeymap, personalByKey, selectedKeyUseCounts, selectedSet, state.keys]);

  function patchLibrary(patch: Partial<StoredLibraryState>) { setLibrary((current) => ({ ...current, ...patch })); }
  function saveWorkspace(next: ProfileWorkspace) {
    setProfileWorkspace(next);
    try { window.localStorage.setItem(PROFILE_WORKSPACE_KEY, JSON.stringify(next)); } catch { /* session only */ }
  }
  function patchActiveCharacter(patch: Partial<CharacterProfile>) {
    if (!profileWorkspace) return;
    saveWorkspace({ ...profileWorkspace, characters: profileWorkspace.characters.map((character) => character.id === profileWorkspace.activeCharacterId ? { ...character, ...patch } : character) });
  }
  function patchActiveProfile(patch: Partial<KeymapProfile>) {
    if (!profileWorkspace) return;
    const updatedAt = new Date().toISOString();
    saveWorkspace({
      ...profileWorkspace,
      characters: profileWorkspace.characters.map((character) => character.id === profileWorkspace.activeCharacterId ? {
        ...character,
        profiles: character.profiles.map((profile) => profile.id === profileWorkspace.activeProfileId ? { ...profile, ...patch, updatedAt } : profile),
      } : character),
    });
  }
  function toggleSelected(id: string) { setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  function toggleFavourite(id: string) { patchLibrary({ favourites: favouriteSet.has(id) ? library.favourites.filter((item) => item !== id) : [...library.favourites, id] }); }
  function toggleGroup(groupName: string) { patchLibrary({ collapsedGroups: library.collapsedGroups.includes(groupName) ? library.collapsedGroups.filter((item) => item !== groupName) : [...library.collapsedGroups, groupName] }); }
  function replacementFor(preset: KeybindPreset) {
    const currentKey = normalizeCombo(state.keys[preset.id] ?? preset.defaultKey);
    const occupied = new Set(personalBinds.map((entry) => normalizedKey(entry.key)));
    for (const selected of selectedPresets) {
      if (selected.id === preset.id) continue;
      occupied.add(normalizedKey(state.keys[selected.id] ?? selected.defaultKey));
    }
    const replacement = SAFE_KEY_SUGGESTIONS.find((candidate) => {
      const key = normalizeCombo(candidate);
      return key !== currentKey && !warningForKey(candidate) && !occupied.has(normalizedKey(candidate));
    });
    return replacement ?? preset.defaultKey;
  }
  function addCollection() {
    const name = collectionName.trim();
    if (!name || !selectedIds.length) return;
    patchLibrary({ collections: { ...library.collections, [name]: unique([...(library.collections[name] ?? []), ...selectedIds]) } });
    setActiveCollection(name);
    setCollectionName("");
  }
  function removeActiveCollection() {
    if (activeCollection === "all" || activeCollection === "favourites") return;
    const next = { ...library.collections };
    delete next[activeCollection];
    patchLibrary({ collections: next });
    setActiveCollection("all");
  }
  function updateProfileKey(presetId: string, value: string) {
    setKey(presetId, value);
    patchActiveProfile({ keyValues: { ...activeProfile.keyValues, [presetId]: value } });
  }
  function resetProfileKey(preset: KeybindPreset) {
    setKey(preset.id, preset.defaultKey);
    patchActiveProfile({ keyValues: { ...activeProfile.keyValues, [preset.id]: preset.defaultKey } });
  }
  function switchCharacter(id: string) {
    if (!profileWorkspace) return;
    const character = profileWorkspace.characters.find((item) => item.id === id);
    const profile = character?.profiles[0];
    if (!character || !profile) return;
    const next = { ...profileWorkspace, activeCharacterId: character.id, activeProfileId: profile.id };
    saveWorkspace(next);
    replaceKeys(profile.keyValues);
    setPersonalImportMessage("");
    setProfileStatus(`Switched to ${character.name} · ${profile.name}.`);
  }
  function switchProfile(id: string) {
    if (!profileWorkspace) return;
    const profile = activeCharacter.profiles.find((item) => item.id === id);
    if (!profile) return;
    saveWorkspace({ ...profileWorkspace, activeProfileId: profile.id });
    replaceKeys(profile.keyValues);
    setPersonalImportMessage("");
    setProfileStatus(`Switched to ${activeCharacter.name} · ${profile.name}.`);
  }
  function addCharacter() {
    if (!profileWorkspace) return;
    const now = new Date().toISOString();
    const profile: KeymapProfile = {
      id: createId("profile"), name: "Default", keyValues: { ...state.keys }, personalBinds: [],
      personalSourceName: "", personalImportedAt: "", updatedAt: now,
    };
    const character: CharacterProfile = {
      id: createId("character"), name: "New character", className: "Unassigned", paragon: "", role: "DPS", profiles: [profile],
    };
    saveWorkspace({ ...profileWorkspace, activeCharacterId: character.id, activeProfileId: profile.id, characters: [...profileWorkspace.characters, character] });
    replaceKeys(profile.keyValues);
    setPersonalImportMessage("");
    setProfileStatus("Character created. Name it and choose its class, role, and paragon.");
  }
  function addProfile() {
    if (!profileWorkspace) return;
    const profile = cloneProfile(activeProfile, { id: createId("profile"), name: "New profile" }) as KeymapProfile;
    const next: ProfileWorkspace = {
      ...profileWorkspace,
      activeProfileId: profile.id,
      characters: profileWorkspace.characters.map((character) => character.id === activeCharacter.id ? { ...character, profiles: [...character.profiles, profile] } : character),
    };
    saveWorkspace(next);
    replaceKeys(profile.keyValues);
    setPersonalImportMessage("");
    setProfileStatus("Profile cloned from the previous profile. Rename or customize it.");
  }
  function deleteCharacter() {
    if (!profileWorkspace || profileWorkspace.characters.length <= 1) return;
    const remaining = profileWorkspace.characters.filter((character) => character.id !== activeCharacter.id);
    const character = remaining[0];
    const profile = character.profiles[0];
    saveWorkspace({ ...profileWorkspace, activeCharacterId: character.id, activeProfileId: profile.id, characters: remaining });
    replaceKeys(profile.keyValues);
    setPersonalImportMessage("");
    setProfileStatus("Character deleted. Switched to the next available character.");
  }
  function deleteProfile() {
    if (!profileWorkspace || activeCharacter.profiles.length <= 1) return;
    const profiles = activeCharacter.profiles.filter((profile) => profile.id !== activeProfile.id);
    const profile = profiles[0];
    saveWorkspace({
      ...profileWorkspace,
      activeProfileId: profile.id,
      characters: profileWorkspace.characters.map((character) => character.id === activeCharacter.id ? { ...character, profiles } : character),
    });
    replaceKeys(profile.keyValues);
    setPersonalImportMessage("");
    setProfileStatus("Profile deleted. Switched to the next available profile.");
  }
  function importPersonalBinds(text: string, sourceName = "Pasted keymap") {
    const parsed = parseBindText(text);
    if (!parsed.entries.length) {
      setPersonalImportMessage(parsed.ignored.length ? "No valid /bind or /unbind lines were found. Check the pasted format and try again." : "Paste at least one /bind or /unbind line first.");
      return;
    }
    const active = resolveBindMap(parsed.entries) as PersonalBind[];
    patchActiveProfile({ personalBinds: active, personalSourceName: sourceName, personalImportedAt: new Date().toISOString() });
    const ignoredNote = parsed.ignored.length ? ` ${parsed.ignored.length} unsupported ${parsed.ignored.length === 1 ? "line was" : "lines were"} ignored.` : "";
    setPersonalImportMessage(`${active.length} active ${active.length === 1 ? "bind" : "binds"} analyzed. Personal conflict detection is active.${ignoredNote}`);
  }
  async function importPersonalFile(file: File) {
    if (file.size > MAX_PERSONAL_BIND_FILE_BYTES) {
      setPersonalImportMessage("That bind file is larger than 512 KB. Choose a smaller text export.");
      return;
    }
    try {
      importPersonalBinds(await file.text(), file.name || "Imported bind file");
    } catch {
      setPersonalImportMessage("The selected bind file could not be read.");
    }
  }
  function clearPersonalBinds() {
    patchActiveProfile({ personalBinds: [], personalSourceName: "", personalImportedAt: "" });
    setPersonalImportMessage("Personal keymap cleared for this profile. BindForge is using common conflict guidance only.");
  }
  function exportProfiles() {
    if (!profileWorkspace) return;
    downloadText(`bindforge-my-setup-v1-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(profileWorkspace, null, 2), "application/json;charset=utf-8");
    setProfileStatus("My Setup backup exported.");
  }
  async function importProfiles(file: File) {
    if (file.size > MAX_PROFILE_WORKSPACE_BYTES) {
      setProfileStatus("My Setup backup is larger than 512 KB.");
      return;
    }
    try {
      const parsed = parseProfileWorkspaceJson(await file.text());
      if (!parsed.ok) {
        setProfileStatus(parsed.error);
        return;
      }
      const next = parsed.value as ProfileWorkspace;
      const profile = getActiveProfile(next) as KeymapProfile | null;
      if (!profile) {
        setProfileStatus("My Setup backup does not contain a valid active profile.");
        return;
      }
      saveWorkspace(next);
      replaceKeys(profile.keyValues);
      setPersonalImportMessage("");
      setProfileStatus("My Setup backup validated and restored.");
    } catch {
      setProfileStatus("The My Setup backup could not be read.");
    }
  }
  function clearSecondaryFiltersKeepSearch() {
    const query = state.search;
    resetFilters();
    setSearch(query);
    setActiveCollection("all");
    patchLibrary({ provenanceFilter: "all", safeOnly: false });
  }
  function applySearchSuggestion(suggestion: string) {
    resetFilters();
    setSearch(suggestion);
    setActiveCollection("all");
    patchLibrary({ provenanceFilter: "all", safeOnly: false });
  }
  function linesFor(mode: "bind" | "unbind") { return selectedPresets.map((preset) => buildPresetLine(preset, state.keys[preset.id] ?? preset.defaultKey, mode)).join("\n"); }
  async function copyPack(mode: "bind" | "unbind") { if (selectedPresets.length) await onCopy(linesFor(mode), `${selectedPresets.length} ${mode} commands`, null); }
  function downloadPack(mode: "bind" | "unbind") { if (selectedPresets.length) downloadText(`bindforge-${mode}-pack-${new Date().toISOString().slice(0, 10)}.txt`, `${linesFor(mode)}\n`); }
  function nativeFilename() { return makeNativeBindFilename(activeCharacter.name, activeProfile.name); }
  function nativeEntries() {
    return selectedPresets.map((preset) => ({ key: state.keys[preset.id] ?? preset.defaultKey, command: preset.command }));
  }
  function downloadNativePack() {
    if (!selectedPresets.length) return;
    const result = buildNativeBindFile(nativeEntries());
    if (!result.content) {
      setNativePackStatus("No valid Neverwinter bind-file lines could be generated from this selection.");
      return;
    }
    const filename = nativeFilename();
    downloadText(filename, result.content);
    const skipped = result.skipped.length
      ? ` ${result.skipped.length} selected command${result.skipped.length === 1 ? " was" : "s were"} left out because BindForge could not verify safe bind-file quoting for it.`
      : "";
    setNativePackStatus(`Downloaded ${filename}.${skipped} Copy the load command next and test the file in Neverwinter before relying on it.`);
  }
  async function copyNativeLoadCommand() {
    if (!selectedPresets.length) return;
    const filename = nativeFilename();
    await onCopy(buildBindLoadCommand(filename), "Neverwinter bind-file load command", null);
    setNativePackStatus(`Load command copied for ${filename}. Keep the downloaded file name unchanged so the command matches it.`);
  }
  function downloadNativeRestore() {
    if (!selectedPresets.length) return;
    const keys = selectedPresets.map((preset) => state.keys[preset.id] ?? preset.defaultKey);
    const restore = buildNativeRestoreFile(keys, personalBinds);
    if (!restore.content) {
      setNativePackStatus("No previous imported bindings were found for these selected keys, so BindForge did not invent a restore file.");
      return;
    }
    const filename = nativeFilename().replace(/\.txt$/i, "-restore.txt");
    downloadText(filename, restore.content);
    const unresolved = restore.unresolvedKeys.length
      ? ` ${restore.unresolvedKeys.length} selected key${restore.unresolvedKeys.length === 1 ? " had" : "s had"} no imported previous binding and were left out.`
      : "";
    const skipped = restore.skipped.length
      ? ` ${restore.skipped.length} imported previous binding${restore.skipped.length === 1 ? " was" : "s were"} also skipped because its bind-file quoting was not safely verified.`
      : "";
    setNativePackStatus(`Downloaded evidence-based restore file ${filename}.${unresolved}${skipped}`);
  }
  async function shareView() {
    const params = new URLSearchParams();
    if (selectedIds.length === 1) params.set("preset", selectedIds[0]);
    if (activeCollection !== "all") params.set("collection", activeCollection);
    if (state.search) params.set("q", state.search);
    if (state.className !== "All") params.set("class", state.className);
    if (state.actionType !== "All") params.set("type", state.actionType);
    if (state.difficulty !== "All") params.set("difficulty", state.difficulty);
    const queryString = params.toString();
    const url = `${window.location.origin}${window.location.pathname}${queryString ? `?${queryString}` : ""}#keybind-library`;
    window.history.replaceState(null, "", url);
    await onCopy(url, "Shareable BindForge view", null);
  }

  return (
    <section className={`library library-${library.viewMode}`} id="keybind-library" tabIndex={-1}>
      <FilterTopBar resultCount={filtered.length} />
      <WorkspaceControls
        resultCount={filtered.length}
        conflictCount={conflictCount}
        viewMode={library.viewMode}
        sortMode={library.sortMode}
        provenanceFilter={library.provenanceFilter}
        safeOnly={library.safeOnly}
        selectedCount={selectedIds.length}
        selectedReviewCount={selectedReviewCount}
        reviewItems={selectedReviewItems}
        visibleCount={filtered.length}
        activeCollection={activeCollection}
        favouritesCount={library.favourites.length}
        collections={library.collections}
        collectionName={collectionName}
        personalBindCount={personalBinds.length}
        personalSourceName={personalSourceName}
        personalImportMessage={personalImportMessage}
        characters={resolvedWorkspace.characters}
        activeCharacterId={resolvedWorkspace.activeCharacterId}
        activeProfileId={resolvedWorkspace.activeProfileId}
        activeCharacter={activeCharacter}
        activeProfile={activeProfile}
        profileStatus={profileStatus}
        canDeleteCharacter={resolvedWorkspace.characters.length > 1}
        canDeleteProfile={activeCharacter.profiles.length > 1}
        onViewModeChange={(value) => patchLibrary({ viewMode: value })}
        onSortModeChange={(value) => patchLibrary({ sortMode: value })}
        onProvenanceFilterChange={(value) => patchLibrary({ provenanceFilter: value })}
        onSafeOnlyChange={(value) => patchLibrary({ safeOnly: value })}
        onActiveCollectionChange={setActiveCollection}
        onCollectionNameChange={setCollectionName}
        onAddCollection={addCollection}
        onRemoveCollection={removeActiveCollection}
        onShareView={() => { void shareView(); }}
        onSelectVisible={() => setSelectedIds(filtered.map((preset) => preset.id))}
        onClearSelection={() => setSelectedIds([])}
        onRemoveSelected={(id) => setSelectedIds((current) => current.filter((item) => item !== id))}
        onCopyPack={(mode) => { void copyPack(mode); }}
        onDownloadPack={downloadPack}
        nativeFilename={nativeFilename()}
        nativePackStatus={nativePackStatus}
        onDownloadNativePack={downloadNativePack}
        onCopyNativeLoadCommand={() => { void copyNativeLoadCommand(); }}
        onDownloadNativeRestore={downloadNativeRestore}
        onImportPersonalText={(text) => importPersonalBinds(text)}
        onImportPersonalFile={(file) => { void importPersonalFile(file); }}
        onClearPersonalBinds={clearPersonalBinds}
        onActiveCharacterChange={switchCharacter}
        onActiveProfileChange={switchProfile}
        onAddCharacter={addCharacter}
        onAddProfile={addProfile}
        onCharacterNameChange={(value) => patchActiveCharacter({ name: value })}
        onCharacterClassChange={(value) => patchActiveCharacter({ className: value })}
        onCharacterParagonChange={(value) => patchActiveCharacter({ paragon: value })}
        onCharacterRoleChange={(value) => patchActiveCharacter({ role: value })}
        onProfileNameChange={(value) => patchActiveProfile({ name: value })}
        onDeleteCharacter={deleteCharacter}
        onDeleteProfile={deleteProfile}
        onExportProfiles={exportProfiles}
        onImportProfiles={(file) => { void importProfiles(file); }}
      />
      {state.preferences.experience !== "simple" ? (
        <div className="active-filter-row" aria-label="Active filters"><span>{state.className === "All" ? "All classes" : state.className}</span><span>{state.actionType === "All" ? "All actions" : state.actionType}</span><span>{state.difficulty === "All" ? "All difficulty levels" : state.difficulty}</span><span>{activeCollection === "all" ? "All collections" : activeCollection}</span></div>
      ) : null}

      {filtered.length ? (
        <>
          <div className="group-stack">
            {visibleGroups.map(([groupName, presets]) => {
              const collapsed = library.collapsedGroups.includes(groupName);
              return (
                <section className="bind-group" key={groupName}>
                  <div className="group-heading">
                    <div>
                      <h3>{groupName}<span className="group-title-context"> · {state.className === "All" ? "Any Class" : state.className}</span></h3>
                      <p>Copy-ready presets with editable keys</p>
                    </div>
                    <div className="group-heading-actions"><span>{presets.length} {presets.length === 1 ? "bind" : "binds"}</span><button aria-expanded={!collapsed} className="icon-text-button" onClick={() => toggleGroup(groupName)} type="button">{collapsed ? "Expand" : "Collapse"}</button></div>
                  </div>
                  {collapsed ? null : (
                    <div className="bind-grid">
                      {presets.map((preset) => {
                        const keyValue = state.keys[preset.id] ?? preset.defaultKey;
                        const key = normalizedKey(keyValue);
                        const duplicate = selectedSet.has(preset.id) && (selectedKeyUseCounts[key] ?? 0) > 1;
                        const personalBind = personalByKey.get(key);
                        const warning = warningForKey(keyValue);
                        const status = statusFor(preset, keyValue, duplicate, personalBind, hasPersonalKeymap);
                        const personalConflict = Boolean(personalBind && !commandsEquivalent(personalBind.command, preset.command));
                        const shared = {
                          preset,
                          duplicate,
                          favourite: favouriteSet.has(preset.id),
                          key: preset.id,
                          onCopy,
                          onFavourite: () => toggleFavourite(preset.id),
                          onSelect: () => toggleSelected(preset.id),
                          selected: selectedSet.has(preset.id),
                        };
                        const canReplace = (duplicate || Boolean(warning) || personalConflict) && !preset.intentionalNativeOverride;
                        return library.viewMode === "compact"
                          ? <CompactKeybindRow {...shared} canReplace={canReplace} copyDisabled={duplicate} keyValue={keyValue} line={buildPresetLine(preset, keyValue, state.mode)} mode={state.mode} onKeyChange={(value) => updateProfileKey(preset.id, value)} onReset={() => resetProfileKey(preset)} replacementKey={replacementFor(preset)} status={status} />
                          : <KeybindCard {...shared} beginner={state.preferences.experience === "simple"} canReplace={canReplace} keyValue={keyValue} mode={state.mode} onKeyChange={(value) => updateProfileKey(preset.id, value)} onReset={() => resetProfileKey(preset)} query={state.search} replacementKey={replacementFor(preset)} status={status} />;
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
          {visibleGroupCount < groupedEntries.length ? (
            <div className="load-more-groups">
              <p>Showing {visibleGroups.length} of {groupedEntries.length} groups. More groups stay unloaded until requested.</p>
              <button className="secondary-button" onClick={() => setVisibleGroupCount((count) => Math.min(groupedEntries.length, count + GROUP_BATCH_SIZE))} type="button">Show more groups</button>
              <button className="text-button" onClick={() => setVisibleGroupCount(groupedEntries.length)} type="button">Expand all groups</button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="empty-state" data-testid="search-empty-state">
          <div className="empty-icon"><Icon name="search" /></div>
          <h3>No matching keybinds</h3>
          {state.search.trim() && searchOnlyMatchCount > 0 ? (
            <>
              <p>{searchOnlyMatchCount} {searchOnlyMatchCount === 1 ? "keybind matches" : "keybinds match"} “{state.search.trim()}”, but the current filters or collection are hiding {searchOnlyMatchCount === 1 ? "it" : "them"}.</p>
              <button className="primary-button" onClick={clearSecondaryFiltersKeepSearch} type="button">Show search matches</button>
            </>
          ) : state.search.trim() ? (
            <>
              <p>Try a related class, action, or player phrase. Search understands common abbreviations and small typos.</p>
              {searchSuggestions.length ? <div className="card-actions" aria-label="Suggested searches">{searchSuggestions.map((suggestion) => <button className="secondary-button" key={suggestion} onClick={() => applySearchSuggestion(suggestion)} type="button">Try “{suggestion}”</button>)}</div> : null}
              <button className="text-button" onClick={() => setSearch("")} type="button">Clear search</button>
            </>
          ) : (
            <>
              <p>Try a broader collection, provenance option, or safety filter.</p>
              <button className="primary-button" onClick={() => { resetFilters(); setActiveCollection("all"); patchLibrary({ provenanceFilter: "all", safeOnly: false }); }} type="button">Clear filters</button>
            </>
          )}
        </div>
      )}
    </section>
  );
}