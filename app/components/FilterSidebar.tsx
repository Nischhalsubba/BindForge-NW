"use client";

import { useEffect, useRef, useState } from "react";
import { useBindForge } from "../BindForgeProvider";
import { keybindPresets } from "../data/keybindPresets";
import type { KeybindClass } from "../data/keybindPresets";
import { Icon } from "./Icon";
import styles from "./FilterSidebar.module.css";

const classFilters = ["All", ...Array.from(new Set(keybindPresets.map((preset) => preset.className)))] as Array<KeybindClass | "All">;

export function FilterSidebar() {
  const { state, setClassName, setDifficulty, resetFilters } = useBindForge();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function closeDrawer() {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  const panel = (
    <div className={styles.content}>
      <div className={styles.head}>
        <div>
          <p>Refine results</p>
          <h2 id="filter-panel-title">Filters</h2>
        </div>
        <div className={styles.headActions}>
          <button className={styles.reset} onClick={resetFilters} type="button">Reset all</button>
          <button aria-label="Close filters" className={styles.close} onClick={closeDrawer} ref={closeRef} type="button">×</button>
        </div>
      </div>

      <section className={styles.section} role="group" aria-labelledby="class-filter-title">
        <h3 id="class-filter-title">Class</h3>
        <div className={styles.options}>
          {classFilters.map((className) => (
            <button
              aria-pressed={state.className === className}
              className={styles.option}
              key={className}
              onClick={() => setClassName(className)}
              type="button"
            >
              <span>{className === "All" ? "All classes" : className}</span>
              {state.className === className ? <span aria-hidden="true">✓</span> : null}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section} role="group" aria-labelledby="difficulty-filter-title">
        <h3 id="difficulty-filter-title">Difficulty</h3>
        <div className={styles.difficultyOptions}>
          {(["All", "Easy", "Advanced", "Risky"] as const).map((item) => (
            <button
              aria-pressed={state.difficulty === item}
              className={`${styles.difficulty} ${styles[item.toLowerCase()]}`}
              key={item}
              onClick={() => setDifficulty(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <div className={styles.tip}>
        <Icon name="shield" />
        <p><strong>Back up first.</strong> Save your current binds before testing unfamiliar commands.</p>
      </div>
    </div>
  );

  return (
    <>
      <button
        aria-controls="filter-panel"
        aria-expanded={open}
        className={styles.mobileTrigger}
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <Icon name="filter" /> Filters
      </button>

      <aside aria-labelledby="filter-panel-title" className={styles.desktopPanel} id="filter-panel">
        {panel}
      </aside>

      {open ? (
        <div className={styles.drawerLayer} data-testid="filter-drawer-layer">
          <button aria-label="Close filters" className={styles.backdrop} onClick={closeDrawer} type="button" />
          <aside aria-labelledby="filter-panel-title" aria-modal="true" className={styles.drawer} role="dialog">
            {panel}
            <div className={styles.drawerFooter}>
              <button className={styles.showResults} onClick={closeDrawer} type="button">Show results</button>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
