"use client";

import { useState } from "react";
import { useBindForge } from "../BindForgeProvider";
import { keybindPresets } from "../data/keybindPresets";
import type { KeybindClass, KeybindType } from "../data/keybindPresets";
import LocalSettingsManager from "../LocalSettingsManager";
import ThemeSwitcher from "../ThemeSwitcher";
import { Icon } from "./Icon";

const classFilters = ["All", ...Array.from(new Set(keybindPresets.map((preset) => preset.className)))] as Array<KeybindClass | "All">;
const actionFilters = ["All", ...Array.from(new Set(keybindPresets.map((preset) => preset.type)))] as Array<KeybindType | "All">;

export function FilterSidebar() {
  const { state, setClassName, setActionType, setDifficulty, resetFilters } = useBindForge();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button aria-expanded={open} aria-controls="filter-panel" className="mobile-filter-button" onClick={() => setOpen((value) => !value)} type="button"><Icon name="filter" /> Filters</button>
      <aside className={`filter-panel ${open ? "filter-panel-open" : ""}`} id="filter-panel">
        <div className="filter-panel-head"><div><p className="eyebrow">Refine results</p><h2>Filters</h2></div><button className="text-button" onClick={resetFilters} type="button">Reset all</button></div>
        <fieldset className="filter-section"><legend>Class</legend><div className="filter-options">{classFilters.map((className) => <button aria-pressed={state.className === className} className="filter-option" key={className} onClick={() => setClassName(className)} type="button"><span>{className === "All" ? "All classes" : className}</span>{state.className === className ? <span aria-hidden="true">✓</span> : null}</button>)}</div></fieldset>
        <fieldset className="filter-section"><legend>Action type</legend><div className="filter-options compact-options">{actionFilters.map((type) => <button aria-pressed={state.actionType === type} className="filter-option" key={type} onClick={() => setActionType(type)} type="button"><span>{type === "All" ? "All actions" : type}</span>{state.actionType === type ? <span aria-hidden="true">✓</span> : null}</button>)}</div></fieldset>
        <fieldset className="filter-section"><legend>Difficulty</legend><div className="difficulty-options">{(["All", "Easy", "Advanced", "Risky"] as const).map((item) => <button aria-pressed={state.difficulty === item} className={`difficulty-chip difficulty-${item.toLowerCase()}`} key={item} onClick={() => setDifficulty(item)} type="button">{item}</button>)}</div></fieldset>
        <div className="filter-tip"><Icon name="shield" /><p><strong>Back up first.</strong> Save your current binds before testing unfamiliar commands.</p></div>
        <ThemeSwitcher />
        <LocalSettingsManager />
      </aside>
    </>
  );
}
