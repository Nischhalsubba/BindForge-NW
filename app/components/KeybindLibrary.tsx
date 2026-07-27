"use client";

import { useMemo, useRef, useState } from "react";
import { useBindForge } from "../BindForgeProvider";
import { keybindPresets } from "../data/keybindPresets";
import type { KeybindPreset, KeybindType } from "../data/keybindPresets";
import { baseKey, buildPresetLine, normalizeCombo } from "../lib/keybind-core.mjs";
import { normalizedKey } from "../lib/safe-key-suggestions";
import type { CopyResultState } from "../page";
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

type CopyHandler = (text: string, label: string, target: HTMLElement | null) => Promise<CopyResultState>;
type CardCopyState = "idle" | "copying" | CopyResultState;

function normalizeText(value: string) { return value.trim().toLowerCase(); }
function warningForKey(value: string) { const combo = normalizeCombo(value); const key = baseKey(value); return warnings.find((item) => item.keys.includes(combo) || item.keys.includes(key)); }
function groupedPresets(presets: KeybindPreset[]) { return presets.reduce<Record<string, KeybindPreset[]>>((groups, preset) => { const key = `${preset.type} · ${preset.className}`; groups[key] = [...(groups[key] ?? []), preset]; return groups; }, {}); }

function KeybindCard({ preset, duplicate, onCopy }: { preset: KeybindPreset; duplicate: boolean; onCopy: CopyHandler }) {
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

  const copyLabel = copyState === "copying"
    ? "Copying…"
    : copyState === "copied" || copyState === "fallback"
      ? "Copied"
      : copyState === "error"
        ? "Try again"
        : "Copy command";

  return (
    <article className={`bind-card ${copyState === "copied" || copyState === "fallback" ? "is-copied" : ""}`}>
      <header className="card-header">
        <div className="card-meta">
          <span className={`level-pill level-${preset.difficulty.toLowerCase()}`}>{preset.difficulty}</span>
          <span>{preset.className}</span>
        </div>
        <span className="card-type">{preset.type}</span>
      </header>

      <div className="card-copy">
        <h4>{preset.title}</h4>
        <p>{preset.plainEnglish}</p>
      </div>

      <div className="card-editor">
        <label className="key-field">
          <span>Suggested key combination</span>
          <input aria-describedby={`${preset.id}-key-help`} onChange={(event) => setKey(preset.id, event.target.value)} spellCheck={false} value={keyValue} />
          <small id={`${preset.id}-key-help`}>Editable. Suggested combinations avoid common default controls but cannot account for personal remaps.</small>
        </label>
        <div className={`key-status status-${status.level}`}>
          <Icon name="shield" />
          <span>{status.message}</span>
        </div>
      </div>

      <div className="command-preview">
        <div className="command-label"><span>Command preview</span><span>{state.mode}</span></div>
        <code ref={preview} tabIndex={0}>{line}</code>
      </div>

      <div className="card-actions">
        <button
          aria-label={`${copyLabel}: ${preset.title}`}
          className={`primary-button copy-action copy-action-${copyState}`}
          disabled={duplicate || copyState === "copying"}
          onClick={() => { void handleCopy(); }}
          type="button"
        >
          <Icon name={copyState === "error" ? "warning" : copyState === "copied" || copyState === "fallback" ? "shield" : "copy"} /> {copyLabel}
        </button>
        <button className="secondary-button" onClick={() => { resetKey(preset.id); setCopyState("idle"); }} type="button"><Icon name="reset" /> Reset suggestion</button>
      </div>
      <p aria-live="polite" className="sr-only">{copyState === "copied" || copyState === "fallback" ? `${preset.title} copied.` : copyState === "error" ? `Copy failed for ${preset.title}.` : ""}</p>
    </article>
  );
}

export function KeybindLibrary({ onCopy }: { onCopy: CopyHandler }) {
  const { state, resetFilters } = useBindForge();
  const filtered = useMemo(() => {
    const query = normalizeText(state.search);
    return keybindPresets.filter((preset) => {
      const haystack = normalizeText(`${preset.title} ${preset.type} ${preset.className} ${preset.plainEnglish} ${preset.command} ${preset.searchTerms.join(" ")}`);
      return (state.className === "All" || preset.className === state.className) && (state.actionType === "All" || preset.type === state.actionType) && (state.difficulty === "All" || preset.difficulty === state.difficulty) && (!query || haystack.includes(query));
    }).sort((left, right) => typeOrder.indexOf(left.type) - typeOrder.indexOf(right.type));
  }, [state.actionType, state.className, state.difficulty, state.search]);
  const grouped = useMemo(() => groupedPresets(filtered), [filtered]);
  const keyUseCounts = useMemo(() => Object.values(state.keys).reduce<Record<string, number>>((counts, value) => {
    const key = normalizedKey(value);
    if (key) counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {}), [state.keys]);

  return (
    <section className="library" id="keybind-library">
      <FilterTopBar resultCount={filtered.length} />
      <div className="library-toolbar"><div><p className="eyebrow">Keybind library</p><h2>{filtered.length} keybinds found</h2><p>Commands remain editable. The preview updates as you type.</p></div></div>
      <div className="active-filter-row" aria-label="Active filters"><span>{state.className === "All" ? "All classes" : state.className}</span><span>{state.actionType === "All" ? "All actions" : state.actionType}</span><span>{state.difficulty === "All" ? "All difficulty levels" : state.difficulty}</span></div>
      {filtered.length ? <div className="group-stack">{Object.entries(grouped).map(([groupName, presets]) => <section className="bind-group" key={groupName}><div className="group-heading"><div><h3>{groupName}</h3><p>Copy-ready presets with editable keys</p></div><span>{presets.length} {presets.length === 1 ? "bind" : "binds"}</span></div><div className="bind-grid">{presets.map((preset) => <KeybindCard duplicate={(keyUseCounts[normalizedKey(state.keys[preset.id] ?? preset.defaultKey)] ?? 0) > 1} key={preset.id} onCopy={onCopy} preset={preset} />)}</div></section>)}</div> : <div className="empty-state"><div className="empty-icon"><Icon name="search" /></div><h3>No matching keybinds</h3><p>Try a broader search or clear one of the active filters.</p><button className="primary-button" onClick={resetFilters} type="button">Clear filters</button></div>}
    </section>
  );
}
