"use client";

import { useEffect, useState } from "react";
import { useBindForge } from "./BindForgeProvider";

export default function FilterTopBar({ resultCount }: { resultCount: number }) {
  const { state, setMode, setSearch, resetFilters } = useBindForge();
  const beginner = state.preferences.experience === "simple";
  const [announcedCount, setAnnouncedCount] = useState(resultCount);
  useEffect(() => {
    const timer = window.setTimeout(() => setAnnouncedCount(resultCount), 550);
    return () => window.clearTimeout(timer);
  }, [resultCount]);

  return (
    <section className="filter-top-bar" aria-label="Keybind search and output controls" data-testid="filter-toolbar" data-tour="keybind-search">
      <div className="filter-top-summary">
        <span>Keybind library</span>
        <strong data-testid="result-count">{resultCount} keybinds</strong>
        <span aria-live="polite" className="sr-only">{announcedCount} keybinds</span>
      </div>

      <label className="filter-top-search" htmlFor="keybind-library-search">
        <span>Search keybinds</span>
        <input
          aria-describedby="keybind-library-search-help"
          aria-label="Search keybind library"
          autoComplete="off"
          id="keybind-library-search"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Try ‘barb cancel’, ‘VIP bank’, or command text"
          type="search"
          value={state.search}
        />
        <span className="sr-only" id="keybind-library-search-help">Plain-language search accepts separate words, common abbreviations, command text, and small typos.</span>
      </label>

      {!beginner ? (
        <>
          <div className="filter-top-output">
            <span>Command output</span>
            <div
              aria-label="Command output mode. Switching modes changes only bind to unbind; the key and command stay intact."
              className="filter-top-mode"
              role="group"
              title="Only /bind changes to /unbind. The key and full command stay intact."
            >
              <button aria-pressed={state.mode === "bind"} onClick={() => setMode("bind")} type="button">Bind</button>
              <button aria-pressed={state.mode === "unbind"} onClick={() => setMode("unbind")} type="button">Unbind</button>
            </div>
          </div>

          <button aria-label="Reset keybind library filters" className="filter-top-reset" onClick={resetFilters} type="button">Reset</button>
        </>
      ) : null}
    </section>
  );
}