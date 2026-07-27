"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useBindForge } from "../BindForgeProvider";
import { keybindPresets } from "../data/keybindPresets";
import type { KeybindPreset, KeybindType, PresetConfidence, PresetSourceType } from "../data/keybindPresets";
import { baseKey, buildPresetLine, normalizeCombo } from "../lib/keybind-core.mjs";
import { normalizedKey } from "../lib/safe-key-suggestions";
import type { CopyResultState } from "../page";
import FilterTopBar from "../FilterTopBar";
import { Icon } from "./Icon";

const LIBRARY_SETTINGS_KEY = "bindforge-nw:library:v1";
const typeOrder: KeybindType[] = ["Invocation / Character", "Targeting", "VIP Services", "Bard Songs", "Animation Cancel", "Combat", "Companion", "Inventory / Buffs", "Loot / Interact", "Utility", "Camera / Screenshot", "Risky / Testing", "Social"];
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
const replacementPool = [
  ..."abcdefghijklmnopqrstuvwxyz".split("").map((key) => `ctrl+shift+alt+${key}`),
  ...Array.from({ length: 12 }, (_, index) => `ctrl+shift+f${index + 1}`),
  ...Array.from({ length: 10 }, (_, index) => `ctrl+alt+numpad${index}`),
];

type CopyHandler = (text: string, label: string, target: HTMLElement | null) => Promise<CopyResultState>;
type CardCopyState = "idle" | "copying" | CopyResultState;
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
  favourites: [],
  collections: {},
  viewMode: "cards",
  sortMode: "recommended",
  collapsedGroups: [],
  provenanceFilter: "all",
  safeOnly: false,
};

function normalizeText(value: string) { return value.trim().toLowerCase(); }
function warningForKey(value: string) { const combo = normalizeCombo(value); const key = baseKey(value); return warnings.find((item) => item.keys.includes(combo) || item.keys.includes(key)); }
function groupedPresets(presets: KeybindPreset[]) { return presets.reduce<Record<string, KeybindPreset[]>>((groups, preset) => { const key = `${preset.type} · ${preset.className}`; groups[key] = [...(groups[key] ?? []), preset]; return groups; }, {}); }
function unique(values: string[]) { return Array.from(new Set(values)); }
function difficultyRank(value: KeybindPreset["difficulty"]) { return value === "Easy" ? 0 : value === "Advanced" ? 1 : 2; }
function provenanceLabel(preset: KeybindPreset) {
  const source = preset.sourceType ? preset.sourceType.replace("-", " ") : "community";
  const confidence = preset.confidence ? preset.confidence.replace("-", " ") : "unverified";
  return `${source} · ${confidence}`;
}
function highlight(value: string, query: string) {
  const needle = query.trim();
  if (!needle) return value;
  const expression = new RegExp(`(${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  return value.split(expression).map((part, index) => expression.test(part) ? <mark key={`${part}-${index}`}>{part}</mark> : <Fragment key={`${part}-${index}`}>{part}</Fragment>);
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
      collapsedGroups: Array.isArray(parsed.collapsedGroups) ? parsed.collapsedGroups : [],
      provenanceFilter: typeof parsed.provenanceFilter === "string" ? parsed.provenanceFilter : "all",
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

function KeybindCard({ preset, duplicate, selected, favourite, compact, query, onCopy, onSelect, onFavourite, onReplace }: {
  preset: KeybindPreset;
  duplicate: boolean;
  selected: boolean;
  favourite: boolean;
  compact: boolean;
  query: string;
  onCopy: CopyHandler;
  onSelect: () => void;
  onFavourite: () => void;
  onReplace: () => void;
}) {
  const { state, setKey, resetKey } = useBindForge();
  const preview = useRef<HTMLElement>(null);
  const resetTimer = useRef<number | null>(null);
  const [copyState, setCopyState] = useState<CardCopyState>("idle");
  const keyValue = state.keys[preset.id] ?? preset.defaultKey;
  const line = buildPresetLine(preset, keyValue, state.mode);
  const warning = warningForKey(keyValue);
  const status = duplicate
    ? { level: "danger" as const, message: "This key is already used by another BindForge preset." }
    : warning ?? { level: "safe" as const, message: "No common native-key conflict detected. Check your personal in-game bindings before applying." };

  async function handleCopy() {
    setCopyState("copying");
    const result = await onCopy(line, preset.title, preview.current);
    setCopyState(result);
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyState("idle"), result === "error" ? 4200 : 2200);
  }

  const copyLabel = copyState === "copying" ? "Copying…" : copyState === "copied" || copyState === "fallback" ? "Copied" : copyState === "error" ? "Try again" : "Copy command";

  return (
    <article className={`bind-card ${compact ? "bind-card-compact" : ""} ${selected ? "is-selected" : ""} ${copyState === "copied" || copyState === "fallback" ? "is-copied" : ""}`} data-preset-id={preset.id}>
      <header className="card-header">
        <div className="card-meta"><span className={`level-pill level-${preset.difficulty.toLowerCase()}`}>{preset.difficulty}</span><span>{preset.className}</span></div>
        <div className="card-header-actions">
          <button aria-label={`${favourite ? "Remove" : "Add"} ${preset.title} ${favourite ? "from" : "to"} favourites`} aria-pressed={favourite} className="icon-text-button" onClick={onFavourite} type="button">{favourite ? "★" : "☆"}</button>
          <label className="select-preset"><input checked={selected} onChange={onSelect} type="checkbox" /><span>Select</span></label>
        </div>
      </header>
      <div className="card-copy"><h4>{highlight(preset.title, query)}</h4><p>{highlight(preset.plainEnglish, query)}</p></div>
      <div className="provenance-row" aria-label="Preset provenance">
        <span>{provenanceLabel(preset)}</span>
        {preset.verifiedAt ? <span>Checked {preset.verifiedAt}</span> : <span>Verification date pending</span>}
        {preset.sourceUrl ? <a href={preset.sourceUrl} rel="noreferrer" target="_blank">Source</a> : <span>Community source</span>}
      </div>
      <div className="card-editor">
        <label className="key-field"><span>Suggested key combination</span><input aria-describedby={`${preset.id}-key-help`} onChange={(event) => setKey(preset.id, event.target.value)} spellCheck={false} value={keyValue} /><small id={`${preset.id}-key-help`}>Editable. Suggested combinations avoid common defaults but cannot account for personal remaps.</small></label>
        <div className={`key-status status-${status.level}`}><Icon name="shield" /><span>{status.message}</span></div>
        {(duplicate || warning) && !preset.intentionalNativeOverride ? <button className="replacement-button" onClick={onReplace} type="button">Use next safer key</button> : null}
      </div>
      <div className="command-preview"><div className="command-label"><span>Command preview</span><span>{state.mode}</span></div><code ref={preview} tabIndex={0}>{line}</code></div>
      <div className="card-actions">
        <button aria-label={`${copyLabel}: ${preset.title}`} className={`primary-button copy-action copy-action-${copyState}`} disabled={duplicate || copyState === "copying"} onClick={() => { void handleCopy(); }} type="button"><Icon name={copyState === "error" ? "warning" : copyState === "copied" || copyState === "fallback" ? "shield" : "copy"} /> {copyLabel}</button>
        <button className="secondary-button" onClick={() => { resetKey(preset.id); setCopyState("idle"); }} type="button"><Icon name="reset" /> Reset suggestion</button>
      </div>
      <p aria-live="polite" className="sr-only">{copyState === "copied" || copyState === "fallback" ? `${preset.title} copied.` : copyState === "error" ? `Copy failed for ${preset.title}.` : ""}</p>
    </article>
  );
}

export function KeybindLibrary({ onCopy }: { onCopy: CopyHandler }) {
  const { state, setKey, resetFilters } = useBindForge();
  const [library, setLibrary] = useState<StoredLibraryState>(defaultLibraryState);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCollection, setActiveCollection] = useState("all");
  const [collectionName, setCollectionName] = useState("");
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
    try { window.localStorage.setItem(LIBRARY_SETTINGS_KEY, JSON.stringify(library)); } catch { /* session-only */ }
  }, [hydrated, library]);

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
    return result.sort((left, right) => {
      if (library.sortMode === "title") return left.title.localeCompare(right.title);
      if (library.sortMode === "difficulty") return difficultyRank(left.difficulty) - difficultyRank(right.difficulty) || left.title.localeCompare(right.title);
      if (library.sortMode === "class") return left.className.localeCompare(right.className) || left.title.localeCompare(right.title);
      return typeOrder.indexOf(left.type) - typeOrder.indexOf(right.type) || left.title.localeCompare(right.title);
    });
  }, [activeCollection, keyUseCounts, library, state.actionType, state.className, state.difficulty, state.keys, state.search]);

  const grouped = useMemo(() => groupedPresets(filtered), [filtered]);
  const selectedPresets = useMemo(() => keybindPresets.filter((preset) => selectedIds.includes(preset.id)), [selectedIds]);
  const conflictCount = useMemo(() => filtered.filter((preset) => {
    const value = state.keys[preset.id] ?? preset.defaultKey;
    return Boolean(warningForKey(value)) || (keyUseCounts[normalizedKey(value)] ?? 0) > 1;
  }).length, [filtered, keyUseCounts, state.keys]);

  function patchLibrary(patch: Partial<StoredLibraryState>) { setLibrary((current) => ({ ...current, ...patch })); }
  function toggleSelected(id: string) { setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  function toggleFavourite(id: string) { patchLibrary({ favourites: library.favourites.includes(id) ? library.favourites.filter((item) => item !== id) : [...library.favourites, id] }); }
  function toggleGroup(groupName: string) { patchLibrary({ collapsedGroups: library.collapsedGroups.includes(groupName) ? library.collapsedGroups.filter((item) => item !== groupName) : [...library.collapsedGroups, groupName] }); }
  function replacementFor(preset: KeybindPreset) {
    const used = new Set(Object.entries(state.keys).filter(([id]) => id !== preset.id).map(([, value]) => normalizedKey(value)));
    return replacementPool.find((candidate) => !used.has(normalizedKey(candidate)) && !warningForKey(candidate)) ?? preset.defaultKey;
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
    const url = `${window.location.origin}${window.location.pathname}${params.size ? `?${params}` : ""}#keybind-library`;
    window.history.replaceState(null, "", url);
    await onCopy(url, "Shareable BindForge view", null);
  }

  return (
    <section className={`library library-${library.viewMode}`} id="keybind-library" tabIndex={-1}>
      <FilterTopBar resultCount={filtered.length} />
      <div className="library-planner" aria-label="Library planning tools">
        <div><p className="eyebrow">Planner</p><h2>{filtered.length} keybinds found</h2><p>{conflictCount} visible presets need review. Select presets to build a portable command pack.</p></div>
        <div className="planner-controls">
          <label>View<select aria-label="Library view" onChange={(event) => patchLibrary({ viewMode: event.target.value as ViewMode })} value={library.viewMode}><option value="cards">Cards</option><option value="compact">Compact</option></select></label>
          <label>Sort<select aria-label="Sort keybinds" onChange={(event) => patchLibrary({ sortMode: event.target.value as SortMode })} value={library.sortMode}><option value="recommended">Recommended</option><option value="title">Title</option><option value="difficulty">Difficulty</option><option value="class">Class</option></select></label>
          <label>Source<select aria-label="Filter by provenance" onChange={(event) => patchLibrary({ provenanceFilter: event.target.value as ProvenanceFilter })} value={library.provenanceFilter}><option value="all">All sources</option><option value="official">Official</option><option value="wiki">Wiki</option><option value="community">Community</option><option value="user-submitted">User submitted</option><option value="verified">Verified</option><option value="community-tested">Community tested</option><option value="experimental">Experimental</option></select></label>
          <label className="checkbox-control"><input checked={library.safeOnly} onChange={(event) => patchLibrary({ safeOnly: event.target.checked })} type="checkbox" />Safe or intentional only</label>
        </div>
      </div>

      <div className="collection-toolbar">
        <label>Collection<select aria-label="Browse collection" onChange={(event) => setActiveCollection(event.target.value)} value={activeCollection}><option value="all">All presets</option><option value="favourites">Favourites ({library.favourites.length})</option>{Object.keys(library.collections).sort().map((name) => <option key={name} value={name}>{name} ({library.collections[name].length})</option>)}</select></label>
        <input aria-label="New collection name" onChange={(event) => setCollectionName(event.target.value)} placeholder="New collection name" value={collectionName} />
        <button className="secondary-button" disabled={!selectedIds.length || !collectionName.trim()} onClick={addCollection} type="button">Save selected to collection</button>
        <button className="secondary-button" disabled={activeCollection === "all" || activeCollection === "favourites"} onClick={removeActiveCollection} type="button">Delete collection</button>
        <button className="secondary-button" onClick={() => { void shareView(); }} type="button">Copy share link</button>
      </div>

      <div className="bulk-toolbar" aria-label="Selected bind pack">
        <strong>{selectedIds.length} selected</strong>
        <button className="secondary-button" disabled={!filtered.length} onClick={() => setSelectedIds(filtered.map((preset) => preset.id))} type="button">Select visible</button>
        <button className="secondary-button" disabled={!selectedIds.length} onClick={() => setSelectedIds([])} type="button">Clear selection</button>
        <button className="primary-button" disabled={!selectedIds.length} onClick={() => { void copyPack("bind"); }} type="button">Copy bind pack</button>
        <button className="secondary-button" disabled={!selectedIds.length} onClick={() => { void copyPack("unbind"); }} type="button">Copy unbind pack</button>
        <button className="secondary-button" disabled={!selectedIds.length} onClick={() => downloadPack("bind")} type="button">Download bind .txt</button>
        <button className="secondary-button" disabled={!selectedIds.length} onClick={() => downloadPack("unbind")} type="button">Download unbind .txt</button>
      </div>

      <div className="active-filter-row" aria-label="Active filters"><span>{state.className === "All" ? "All classes" : state.className}</span><span>{state.actionType === "All" ? "All actions" : state.actionType}</span><span>{state.difficulty === "All" ? "All difficulty levels" : state.difficulty}</span><span>{activeCollection === "all" ? "All collections" : activeCollection}</span></div>
      {filtered.length ? <div className="group-stack">{Object.entries(grouped).map(([groupName, presets]) => {
        const collapsed = library.collapsedGroups.includes(groupName);
        return <section className="bind-group" key={groupName}><div className="group-heading"><div><h3>{groupName}</h3><p>Copy-ready presets with editable keys</p></div><div className="group-heading-actions"><span>{presets.length} {presets.length === 1 ? "bind" : "binds"}</span><button aria-expanded={!collapsed} className="icon-text-button" onClick={() => toggleGroup(groupName)} type="button">{collapsed ? "Expand" : "Collapse"}</button></div></div>{collapsed ? null : <div className="bind-grid">{presets.map((preset) => <KeybindCard compact={library.viewMode === "compact"} duplicate={(keyUseCounts[normalizedKey(state.keys[preset.id] ?? preset.defaultKey)] ?? 0) > 1} favourite={library.favourites.includes(preset.id)} key={preset.id} onCopy={onCopy} onFavourite={() => toggleFavourite(preset.id)} onReplace={() => setKey(preset.id, replacementFor(preset))} onSelect={() => toggleSelected(preset.id)} preset={preset} query={state.search} selected={selectedIds.includes(preset.id)} />)}</div>}</section>;
      })}</div> : <div className="empty-state"><div className="empty-icon"><Icon name="search" /></div><h3>No matching keybinds</h3><p>Try a broader search, collection, provenance option, or safety filter.</p><button className="primary-button" onClick={() => { resetFilters(); setActiveCollection("all"); patchLibrary({ provenanceFilter: "all", safeOnly: false }); }} type="button">Clear filters</button></div>}
    </section>
  );
}
