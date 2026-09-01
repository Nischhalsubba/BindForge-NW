"use client";

import { useBindForge } from "./BindForgeProvider";

export default function FilterTopBar({ resultCount }: { resultCount: number }) {
  const { state, setMode, setSearch, resetFilters } = useBindForge();

  return (
    <section className="filter-top-bar" aria-label="Keybind search and output controls" data-testid="filter-toolbar">
      <div className="filter-top-summary" aria-live="polite">
        <span>Keybind library</span>
        <strong data-testid="result-count">{resultCount} keybinds</strong>
      </div>

      <label className="filter-top-search" htmlFor="keybind-library-search">
        <span>Search keybinds</span>
        <input
          aria-label="Search keybind library"
          autoComplete="off"
          id="keybind-library-search"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search keybinds"
          type="search"
          value={state.search}
        />
      </label>

      <div className="filter-top-output">
        <span>Command output</span>
        <div className="filter-top-mode" aria-label="Output mode" role="group">
          <button aria-pressed={state.mode === "bind"} onClick={() => setMode("bind")} type="button">Bind</button>
          <button aria-pressed={state.mode === "unbind"} onClick={() => setMode("unbind")} type="button">Unbind</button>
        </div>
        <small>Only /bind changes to /unbind; the key and full command stay exactly the same.</small>
      </div>

      <button aria-label="Reset keybind library filters" className="filter-top-reset" onClick={resetFilters} type="button">Reset</button>
    </section>
  );
}
