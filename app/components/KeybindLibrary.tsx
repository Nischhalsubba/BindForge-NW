"use client";

import { useMemo, useRef } from "react";
import { useBindForge } from "../BindForgeProvider";
import { keybindPresets } from "../data/keybindPresets";
import type { KeybindPreset, KeybindType } from "../data/keybindPresets";
import { baseKey, buildPresetLine, normalizeCombo } from "../lib/keybind-core.mjs";
import FilterTopBar from "../FilterTopBar";
import { Icon } from "./Icon";

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

function normalizeText(value: string) { return value.trim().toLowerCase(); }
function warningForKey(value: string) { const combo = normalizeCombo(value); const key = baseKey(value); return warnings.find((item) => item.keys.includes(combo) || item.keys.includes(key)); }
function groupedPresets(presets: KeybindPreset[]) { return presets.reduce<Record<string, KeybindPreset[]>>((groups, preset) => { const key = `${preset.type} · ${preset.className}`; groups[key] = [...(groups[key] ?? []), preset]; return groups; }, {}); }

function KeybindCard({ preset, onCopy }: { preset: KeybindPreset; onCopy: (text: string, label: string, target: HTMLElement | null) => void }) {
  const { state, setKey, resetKey } = useBindForge();
  const preview = useRef<HTMLElement>(null);
  const keyValue = state.keys[preset.id] ?? preset.defaultKey;
  const line = buildPresetLine(preset, keyValue, state.mode);
  const warning = warningForKey(keyValue);
  return (
    <article className="bind-card">
      <div className="card-header"><div className="card-meta"><span className={`level-pill level-${preset.difficulty.toLowerCase()}`}>{preset.difficulty}</span><span>{preset.className}</span></div><span className="card-type">{preset.type}</span></div>
      <div className="card-copy"><h4>{preset.title}</h4><p>{preset.plainEnglish}</p></div>
      <div className="card-editor"><label className="key-field"><span>Key combination</span><input aria-describedby={`${preset.id}-key-help`} onChange={(event) => setKey(preset.id, event.target.value)} spellCheck={false} value={keyValue} /><small id={`${preset.id}-key-help`}>Examples: F3, Ctrl+R, Left Ctrl+Shift+R</small></label><div className={`key-status ${warning ? `status-${warning.level}` : "status-safe"}`}><Icon name="shield" /><span>{warning?.message ?? "No common conflict found for this key."}</span></div></div>
      <div className="command-preview"><div className="command-label"><span>Command preview</span><span>{state.mode}</span></div><code ref={preview} tabIndex={0}>{line}</code></div>
      <div className="card-actions"><button className="primary-button" onClick={() => onCopy(line, preset.title, preview.current)} type="button"><Icon name="copy" /> Copy command</button><button className="secondary-button" onClick={() => resetKey(preset.id)} type="button"><Icon name="reset" /> Reset</button></div>
    </article>
  );
}

export function KeybindLibrary({ onCopy }: { onCopy: (text: string, label: string, target: HTMLElement | null) => void }) {
  const { state, resetFilters } = useBindForge();
  const filtered = useMemo(() => {
    const query = normalizeText(state.search);
    return keybindPresets.filter((preset) => {
      const haystack = normalizeText(`${preset.title} ${preset.type} ${preset.className} ${preset.plainEnglish} ${preset.command} ${preset.searchTerms.join(" ")}`);
      return (state.className === "All" || preset.className === state.className) && (state.actionType === "All" || preset.type === state.actionType) && (state.difficulty === "All" || preset.difficulty === state.difficulty) && (!query || haystack.includes(query));
    }).sort((left, right) => typeOrder.indexOf(left.type) - typeOrder.indexOf(right.type));
  }, [state.actionType, state.className, state.difficulty, state.search]);
  const grouped = useMemo(() => groupedPresets(filtered), [filtered]);

  return (
    <section className="library" id="keybind-library">
      <FilterTopBar resultCount={filtered.length} />
      <div className="library-toolbar"><div><p className="eyebrow">Keybind library</p><h2>{filtered.length} keybinds found</h2><p>Commands remain editable. The preview updates as you type.</p></div></div>
      <div className="active-filter-row" aria-label="Active filters"><span>{state.className === "All" ? "All classes" : state.className}</span><span>{state.actionType === "All" ? "All actions" : state.actionType}</span><span>{state.difficulty === "All" ? "All difficulty levels" : state.difficulty}</span></div>
      {filtered.length ? <div className="group-stack">{Object.entries(grouped).map(([groupName, presets]) => <section className="bind-group" key={groupName}><div className="group-heading"><div><h3>{groupName}</h3><p>Copy-ready presets with editable keys</p></div><span>{presets.length} {presets.length === 1 ? "bind" : "binds"}</span></div><div className="bind-grid">{presets.map((preset) => <KeybindCard key={preset.id} onCopy={onCopy} preset={preset} />)}</div></section>)}</div> : <div className="empty-state"><div className="empty-icon"><Icon name="search" /></div><h3>No matching keybinds</h3><p>Try a broader search or clear one of the active filters.</p><button className="primary-button" onClick={resetFilters} type="button">Clear filters</button></div>}
    </section>
  );
}
