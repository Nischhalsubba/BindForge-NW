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
const INITIAL_VISIBLE_GROUPS = keybindPresets.length;
const GROUP_BATCH_SIZE = 3;
const MAX_PERSONAL_BIND_FILE_BYTES = 512 * 1024;

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

function normalizeText(value: string) { return value.trim().toLowerCase(); }
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
  const [personalImportMessage, setPersonalImportMessage] = useState("");
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
  const selectedPresets = useMemo(() => keybindPresets.filter((preset) => selectedSet.has(preset.id)), [selectedSet]);
  const selectedKeyUseCounts = useMemo(() => selectedPresets.reduce<Record<string, number>>((counts, preset) => {
    const key = normalizedKey(state.keys[preset.id] ?? preset.defaultKey);
    if (key) counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {}), [selectedPresets, state.keys]);
  const personalByKey = useMemo(() => new Map(library.personalBinds.map((entry) => [normalizedKey(entry.key), entry])), [library.personalBinds]);
  const hasPersonalKeymap = Boolean(library.personalBinds.length || library.personalSourceName);

  const filtered = useMemo(() => {
    const query = normalizeText(state.search);
    const collectionIds = activeCollection === "favourites" ? library.favourites : activeCollection === "all" ? null : library.collections[activeCollection] ?? [];
    const result = keybindPresets.filter((preset) => {
      const haystack = normalizeText(`${preset.title} ${preset.type} ${preset.className} ${preset.plainEnglish} ${preset.command} ${preset.searchTerms.join(" ")}`);
      const keyValue = state.keys[preset.id] ?? preset.defaultKey;
      const key = normalizedKey(keyValue);
      const duplicate = selectedSet.has(preset.id) && (selectedKeyUseCounts[key] ?? 0) > 1;
      const status = statusFor(preset, keyValue, duplicate, personalByKey.get(key), hasPersonalKeymap);
      const provenanceMatch = library.provenanceFilter === "all" || preset.sourceType === library.provenanceFilter || preset.confidence === library.provenanceFilter;
      return (state.className === "All" || preset.className === state.className)
        && (state.actionType === "All" || preset.type === state.actionType)
        && (state.difficulty === "All" || preset.difficulty === state.difficulty)
        && (!query || haystack.includes(query))
        && (!collectionIds || collectionIds.includes(preset.id))
        && provenanceMatch
        && (!library.safeOnly || status.level === "safe" || Boolean(preset.intentionalNativeOverride));
    });
    return result.sort((left, right) => library.sortMode === "title"
      ? left.title.localeCompare(right.title)
      : library.sortMode === "difficulty"
        ? difficultyRank(left.difficulty) - difficultyRank(right.difficulty) || left.title.localeCompare(right.title)
        : library.sortMode === "class"
          ? left.className.localeCompare(right.className) || left.title.localeCompare(right.title)
          : typeOrder.indexOf(left.type) - typeOrder.indexOf(right.type) || left.title.localeCompare(right.title));
  }, [activeCollection, hasPersonalKeymap, library.collections, library.favourites, library.provenanceFilter, library.safeOnly, library.sortMode, personalByKey, selectedKeyUseCounts, selectedSet, state.actionType, state.className, state.difficulty, state.keys, state.search]);

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
  function toggleSelected(id: string) { setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  function toggleFavourite(id: string) { patchLibrary({ favourites: favouriteSet.has(id) ? library.favourites.filter((item) => item !== id) : [...library.favourites, id] }); }
  function toggleGroup(groupName: string) { patchLibrary({ collapsedGroups: library.collapsedGroups.includes(groupName) ? library.collapsedGroups.filter((item) => item !== groupName) : [...library.collapsedGroups, groupName] }); }
  function replacementFor(preset: KeybindPreset) {
    const currentKey = normalizeCombo(state.keys[preset.id] ?? preset.defaultKey);
    const occupied = new Set(library.personalBinds.map((entry) => normalizedKey(entry.key)));
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
  function importPersonalBinds(text: string, sourceName = "Pasted keymap") {
    const parsed = parseBindText(text);
    if (!parsed.entries.length) {
      setPersonalImportMessage(parsed.ignored.length ? "No valid /bind or /unbind lines were found. Check the pasted format and try again." : "Paste at least one /bind or /unbind line first.");
      return;
    }
    const active = resolveBindMap(parsed.entries) as PersonalBind[];
    patchLibrary({
      personalBinds: active,
      personalSourceName: sourceName,
      personalImportedAt: new Date().toISOString(),
    });
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
    patchLibrary({ personalBinds: [], personalSourceName: "", personalImportedAt: "" });
    setPersonalImportMessage("Personal keymap cleared. BindForge is using common conflict guidance only.");
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
        personalBindCount={library.personalBinds.length}
        personalSourceName={library.personalSourceName}
        personalImportMessage={personalImportMessage}
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
        onImportPersonalText={(text) => importPersonalBinds(text)}
        onImportPersonalFile={(file) => { void importPersonalFile(file); }}
        onClearPersonalBinds={clearPersonalBinds}
      />
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
                          ? <CompactKeybindRow {...shared} canReplace={canReplace} copyDisabled={duplicate} keyValue={keyValue} line={buildPresetLine(preset, keyValue, state.mode)} mode={state.mode} onKeyChange={(value) => setKey(preset.id, value)} onReset={() => resetKey(preset.id)} replacementKey={replacementFor(preset)} status={status} />
                          : <KeybindCard {...shared} canReplace={canReplace} keyValue={keyValue} mode={state.mode} onKeyChange={(value) => setKey(preset.id, value)} onReset={() => resetKey(preset.id)} query={state.search} replacementKey={replacementFor(preset)} status={status} />;
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
