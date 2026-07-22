"use client";

import { useMemo } from "react";
import { useBindForge } from "./BindForgeProvider";
import { keybindPresets } from "./data/keybindPresets";

const actionTypes = ["All", ...Array.from(new Set(keybindPresets.map((preset) => preset.type)))];

export default function FilterTopBar({ resultCount }: { resultCount: number }) {
  const { state, setActionType, setMode, setSearch, resetFilters } = useBindForge();
  const options = useMemo(() => actionTypes, []);

  return (
    <section className="filter-top-bar" aria-label="Keybind filters and search">
      <div className="filter-top-summary">
        <span>Keybind library</span>
        <strong>{resultCount} keybinds</strong>
      </div>

      <label className="filter-top-search">
        <span>Search</span>
        <input
          autoComplete="off"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search keybinds"
          type="search"
          value={state.search}
        />
      </label>

      <label className="filter-top-select">
        <span>Action type</span>
        <select onChange={(event) => setActionType(event.target.value as typeof state.actionType)} value={state.actionType}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option === "All" ? "All actions" : option}
            </option>
          ))}
        </select>
      </label>

      <div className="filter-top-mode" aria-label="Output mode">
        <button aria-pressed={state.mode === "bind"} onClick={() => setMode("bind")} type="button">Bind</button>
        <button aria-pressed={state.mode === "unbind"} onClick={() => setMode("unbind")} type="button">Unbind</button>
      </div>

      <button className="filter-top-reset" onClick={resetFilters} type="button">Reset</button>
    </section>
  );
}
