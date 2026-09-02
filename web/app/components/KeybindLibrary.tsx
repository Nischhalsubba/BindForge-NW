"use client";

import { useEffect, useMemo, useState } from "react";
import { useBindForge } from "../BindForgeProvider";
import { keybindPresets } from "../data/keybindPresets";
import type { KeybindPreset, KeybindType } from "../data/keybindPresets";
import type { PresetConfidence, PresetSourceType } from "../data/keybindTypes";
import { baseKey, buildPresetLine, normalizeCombo } from "../lib/keybind-core.mjs";
import { SAFE_KEY_SUGGESTIONS, normalizedKey } from "../lib/safe-key-suggestions";
import type { CopyResultState } from "../page";
import FilterTopBar from "../FilterTopBar";
import { CompactKeybindRow } from "./CompactKeybindRow";
import { Icon } from "./Icon";
import { KeybindCard } from "./KeybindCard";
import type { KeybindSafetyStatus } from "./KeybindCard";
import { WorkspaceControls } from "./WorkspaceControls";

const LIBRARY_SETTINGS_KEY = "bindforge-nw:library:v1";
const INITIAL_VISIBLE_GROUPS = keybindPresets.length;
const GROUP_BATCH_SIZE = 3;

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
type StoredLibraryState = {
  favourites: string[];
  collections: Record<string, string[]>;
  viewMode: ViewMode;
  sortMode: SortMode;
  collapsedGroups: string[];
  provenanceFilter: ProvenanceFilter;
  safeOnly: boolean;
};

const defaultLibraryState: StoredLibraryState = {
  favourites: [], collections: {}, viewMode: "cards", sortMode: "recommended",
  collapsedGroups: [], provenanceFilter: "all", safeOnly: false,
};

function normalizeText(value: string) { return value.trim().toLowerCase(); }
function unique(values: string[]) { return Array.from(new Set(values)); }
function difficultyRank(value: KeybindPreset["difficulty"]) { return value === "Easy" ? 0 : value === "Advanced" ? 1 : 2; }
function warningForKey(value: string) {
  const combo = normalizeCombo(value);
  const key = baseKey(value);
  return warnings.find((item) => item.keys.includes(combo) || item.keys.includes(key));
}
function statusFor(keyValue: string, duplicate: boolean): KeybindSafetyStatus {
  if (duplicate) return { level: "danger", message: "This key is already used by another BindForge preset." };
  return warningForKey(keyValue) ?? { level: "safe", message: "No common native-key conflict detected. Check personal in-game bindings before applying." };
}
function groupedPresets(presets: KeybindPreset[]) {
  return presets.reduce<Record<string, KeybindPreset[]>>((groups, preset) => {
    const key = `${preset.type} · ${preset.className}`;
    groups[key] = [...(groups[key] ?? []), preset];
    return groups;
  }, {});
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
    };
  } catch {
    return defaultLibraryState;
  }
}
function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function KeybindLibrary({ onCopy }: { onCopy: CopyHandler }) {
  const { state, setKey, resetKey, resetFilters } = useBindForge();
  const [library, setLibrary] = useState<StoredLibraryState>(defaultLibraryState);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCollection, setActiveCollection] = useState("all");
  const [collectionName, setCollectionName] = useState("");
  const [visibleGroupCount, setVisibleGroupCount] = useState(INITIAL_VISIBLE_GROUPS);
  const [hydrated, setHydrated] = useState(false);

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
    setVisibleGroupCount(INITIAL_VISIBLE_GROUPS);
  }, [state.search, state.className, state.actionType, state.difficulty, activeCollection, library.provenanceFilter, library.safeOnly, library.sortMode]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const favouriteSet = useMemo(() => new Set(library.favourites), [library.favourites]);
  const keyUseCounts = useMemo(() => Object.values(state.keys).reduce<Record<string, number>>((counts, value) => {
    const key = normalizedKey(value);
    if (key) counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {}), [state.keys]);

  const filtered = useMemo(() => {
    const query = normalizeText(state.search);
    const collectionIds = activeCollection === "favourites" ? library.favourites : activeCollection === "all" ? null : library.collections[activeCollection] ?? [];
    const result = keybindPresets.filter((preset) => {
      const haystack = normalizeText(`${preset.title} ${preset.type} ${preset.className} ${preset.plainEnglish} ${preset.command} ${preset.searchTerms.join(" ")}`);
      const keyValue = state.keys[preset.id] ?? preset.defaultKey;
      const hasConflict = Boolean(warningForKey(keyValue)) || (keyUseCounts[normalizedKey(keyValue)] ?? 0) > 1;
      const provenanceMatch = library.provenanceFilter === "all" || preset.sourceType === library.provenanceFilter || preset.confidence === library.provenanceFilter;
      return (state.className === "All" || preset.className === state.className)
        && (state.actionType === "All" || preset.type === state.actionType)
        && (state.difficulty === "All" || preset.difficulty === state.difficulty)
        && (!query || haystack.includes(query))
        && (!collectionIds || collectionIds.includes(preset.id))
        && provenanceMatch
        && (!library.safeOnly || !hasConflict || Boolean(preset.intentionalNativeOverride));
    });
    return result.sort((left, right) => library.sortMode === "title"
      ? left.title.localeCompare(right.title)
      : library.sortMode === "difficulty"
        ? difficultyRank(left.difficulty) - difficultyRank(right.difficulty) || left.title.localeCompare(right.title)
        : library.sortMode === "class"
          ? left.className.localeCompare(right.className) || left.title.localeCompare(right.title)
          : typeOrder.indexOf(left.type) - typeOrder.indexOf(right.type) || left.title.localeCompare(right.title));
  }, [activeCollection, keyUseCounts, library.collections, library.favourites, library.provenanceFilter, library.safeOnly, library.sortMode, state.actionType, state.className, state.difficulty, state.keys, state.search]);

  const groupedEntries = useMemo(() => Object.entries(groupedPresets(filtered)), [filtered]);
  const visibleGroups = groupedEntries.slice(0, visibleGroupCount);
  const selectedPresets = useMemo(() => keybindPresets.filter((preset) => selectedSet.has(preset.id)), [selectedSet]);
  const conflictCount = useMemo(() => filtered.filter((preset) => {
    const value = state.keys[preset.id] ?? preset.defaultKey;
    return Boolean(warningForKey(value)) || (keyUseCounts[normalizedKey(value)] ?? 0) > 1;
  }).length, [filtered, keyUseCounts, state.keys]);

  function patchLibrary(patch: Partial<StoredLibraryState>) { setLibrary((current) => ({ ...current, ...patch })); }
  function toggleSelected(id: string) { setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  function toggleFavourite(id: string) { patchLibrary({ favourites: favouriteSet.has(id) ? library.favourites.filter((item) => item !== id) : [...library.favourites, id] }); }
  function toggleGroup(groupName: string) { patchLibrary({ collapsedGroups: library.collapsedGroups.includes(groupName) ? library.collapsedGroups.filter((item) => item !== groupName) : [...library.collapsedGroups, groupName] }); }
  function replacementFor(preset: KeybindPreset) {
    const currentKey = normalizeCombo(state.keys[preset.id] ?? preset.defaultKey);
    const usageCounts = keybindPresets.reduce<Record<string, number>>((counts, item) => {
      if (item.id === preset.id) return counts;
      const key = normalizeCombo(state.keys[item.id] ?? item.defaultKey);
      if (key) counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    }, {});
    const alternatives = SAFE_KEY_SUGGESTIONS
      .map((candidate) => ({ candidate, key: normalizeCombo(candidate), count: usageCounts[normalizeCombo(candidate)] ?? 0 }))
      .filter(({ candidate, key }) => key !== currentKey && !warningForKey(candidate))
      .sort((left, right) => left.count - right.count);
    return alternatives[0]?.candidate ?? preset.defaultKey;
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
  function linesFor(mode: "bind" | "unbind") { return selectedPresets.map((preset) => buildPresetLine(preset, state.keys[preset.id] ?? preset.defaultKey, mode)).join("\n"); }
  async function copyPack(mode: "bind" | "unbind") { if (selectedPresets.length) await onCopy(linesFor(mode), `${selectedPresets.length} ${mode} commands`, null); }
  function downloadPack(mode: "bind" | "unbind") { if (selectedPresets.length) downloadText(`bindforge-${mode}-pack-${new Date().toISOString().slice(0, 10)}.txt`, `${linesFor(mode)}\n`); }
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
      <WorkspaceControls resultCount={filtered.length} conflictCount={conflictCount} viewMode={library.viewMode} sortMode={library.sortMode} provenanceFilter={library.provenanceFilter} safeOnly={library.safeOnly} selectedCount={selectedIds.length} visibleCount={filtered.length} activeCollection={activeCollection} favouritesCount={library.favourites.length} collections={library.collections} collectionName={collectionName} onViewModeChange={(value) => patchLibrary({ viewMode: value })} onSortModeChange={(value) => patchLibrary({ sortMode: value })} onProvenanceFilterChange={(value) => patchLibrary({ provenanceFilter: value })} onSafeOnlyChange={(value) => patchLibrary({ safeOnly: value })} onActiveCollectionChange={setActiveCollection} onCollectionNameChange={setCollectionName} onAddCollection={addCollection} onRemoveCollection={removeActiveCollection} onShareView={() => { void shareView(); }} onSelectVisible={() => setSelectedIds(filtered.map((preset) => preset.id))} onClearSelection={() => setSelectedIds([])} onCopyPack={(mode) => { void copyPack(mode); }} onDownloadPack={downloadPack} />
      <div className="active-filter-row" aria-label="Active filters"><span>{state.className === "All" ? "All classes" : state.className}</span><span>{state.actionType === "All" ? "All actions" : state.actionType}</span><span>{state.difficulty === "All" ? "All difficulty levels" : state.difficulty}</span><span>{activeCollection === "all" ? "All collections" : activeCollection}</span></div>

      {filtered.length ? (
        <>
          <div className="group-stack">
            {visibleGroups.map(([groupName, presets]) => {
              const collapsed = library.collapsedGroups.includes(groupName);
              return (
                <section className="bind-group" key={groupName}>
                  <div className="group-heading">
                    <div><h3>{groupName}</h3><p>Copy-ready presets with editable keys</p></div>
                    <div className="group-heading-actions"><span>{presets.length} {presets.length === 1 ? "bind" : "binds"}</span><button aria-expanded={!collapsed} className="icon-text-button" onClick={() => toggleGroup(groupName)} type="button">{collapsed ? "Expand" : "Collapse"}</button></div>
                  </div>
                  {collapsed ? null : (
                    <div className="bind-grid">
                      {presets.map((preset) => {
                        const keyValue = state.keys[preset.id] ?? preset.defaultKey;
                        const duplicate = (keyUseCounts[normalizedKey(keyValue)] ?? 0) > 1;
                        const warning = warningForKey(keyValue);
                        const shared = {
                          preset,
                          duplicate,
                          favourite: favouriteSet.has(preset.id),
                          key: preset.id,
                          onCopy,
                          onFavourite: () => toggleFavourite(preset.id),
                          onReplace: () => setKey(preset.id, replacementFor(preset)),
                          onSelect: () => toggleSelected(preset.id),
                          selected: selectedSet.has(preset.id),
                        };
                        return library.viewMode === "compact"
                          ? <CompactKeybindRow {...shared} canReplace={(duplicate || Boolean(warning)) && !preset.intentionalNativeOverride} copyDisabled={duplicate} keyValue={keyValue} line={buildPresetLine(preset, keyValue, state.mode)} mode={state.mode} onKeyChange={(value) => setKey(preset.id, value)} onReset={() => resetKey(preset.id)} status={statusFor(keyValue, duplicate)} />
                          : <KeybindCard {...shared} canReplace={(duplicate || Boolean(warning)) && !preset.intentionalNativeOverride} keyValue={keyValue} mode={state.mode} onKeyChange={(value) => setKey(preset.id, value)} onReset={() => resetKey(preset.id)} query={state.search} status={statusFor(keyValue, duplicate)} />;
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
        <div className="empty-state"><div className="empty-icon"><Icon name="search" /></div><h3>No matching keybinds</h3><p>Try a broader search, collection, provenance option, or safety filter.</p><button className="primary-button" onClick={() => { resetFilters(); setActiveCollection("all"); patchLibrary({ provenanceFilter: "all", safeOnly: false }); }} type="button">Clear filters</button></div>
      )}
    </section>
  );
}
