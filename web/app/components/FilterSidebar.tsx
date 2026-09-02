"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useBindForge } from "../BindForgeProvider";
import { keybindPresets } from "../data/keybindPresets";
import type { KeybindClass, KeybindType } from "../data/keybindPresets";
import { Icon } from "./Icon";
import styles from "./FilterSidebar.module.css";

const classFilters = ["All", ...Array.from(new Set(keybindPresets.map((preset) => preset.className)))] as Array<KeybindClass | "All">;
const actionFilters = ["All", ...Array.from(new Set(keybindPresets.map((preset) => preset.type)))] as Array<KeybindType | "All">;
const workspaceLinks = [
  { href: "#search-keybinds", label: "Search keybinds" },
  { href: "#compose-keybind", label: "Compose keybind" },
  { href: "#build-command", label: "Build command" },
  { href: "#say-message", label: "Say message" },
];

export function FilterSidebar() {
  const { state, setClassName, setActionType, setDifficulty, resetFilters } = useBindForge();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const shell = document.querySelector<HTMLElement>(".app-shell");
    const shellHadInert = shell?.hasAttribute("inert") ?? false;
    const previousAriaHidden = shell?.getAttribute("aria-hidden") ?? null;

    document.body.style.overflow = "hidden";
    shell?.setAttribute("inert", "");
    shell?.setAttribute("aria-hidden", "true");
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      if (shell) {
        if (!shellHadInert) shell.removeAttribute("inert");
        if (previousAriaHidden === null) shell.removeAttribute("aria-hidden");
        else shell.setAttribute("aria-hidden", previousAriaHidden);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function closeDrawer() {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function renderPanel(prefix: "desktop" | "drawer", includeClose: boolean) {
    const titleId = `${prefix}-filter-panel-title`;
    const navigationTitleId = `${prefix}-navigation-title`;
    const classTitleId = `${prefix}-class-filter-title`;
    const actionTitleId = `${prefix}-action-filter-title`;
    const difficultyTitleId = `${prefix}-difficulty-filter-title`;

    return (
      <div className={styles.content}>
        <div className={styles.head}>
          <div>
            <p>Refine results</p>
            <h2 id={titleId}>Filters</h2>
          </div>
          <div className={styles.headActions}>
            <button className={styles.reset} onClick={resetFilters} type="button">Reset all</button>
            {includeClose ? <button aria-label="Close filters" className={styles.close} onClick={closeDrawer} ref={closeRef} type="button"><Icon name="close" /></button> : null}
          </div>
        </div>

        <nav className={`${styles.section} ${styles.navigation}`} aria-labelledby={navigationTitleId}>
          <h3 id={navigationTitleId}>Jump to</h3>
          <div className={styles.navigationGrid}>
            {workspaceLinks.map((link) => (
              <a data-gsap-nav href={link.href} key={link.href} onClick={includeClose ? closeDrawer : undefined}>{link.label}</a>
            ))}
          </div>
        </nav>

        <section className={styles.section} role="group" aria-labelledby={classTitleId}>
          <h3 id={classTitleId}>Class</h3>
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
                {state.className === className ? <span aria-hidden="true"><Icon name="check" /></span> : <span aria-hidden="true" />}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby={actionTitleId}>
          <h3 id={actionTitleId}>Action type</h3>
          <select
            aria-label="Filter keybinds by action type"
            className={styles.select}
            onChange={(event) => setActionType(event.target.value as typeof state.actionType)}
            value={state.actionType}
          >
            {actionFilters.map((actionType) => (
              <option key={actionType} value={actionType}>
                {actionType === "All" ? "All actions" : actionType}
              </option>
            ))}
          </select>
        </section>

        <section className={styles.section} role="group" aria-labelledby={difficultyTitleId}>
          <h3 id={difficultyTitleId}>Difficulty</h3>
          <div className={styles.difficultyOptions}>
            {(["All", "Easy", "Advanced", "Risky"] as const).map((item) => (
              <button
                aria-pressed={state.difficulty === item}
                className={styles.difficulty}
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
  }

  const drawer = open && typeof document !== "undefined"
    ? createPortal(
      <div className={styles.drawerLayer} data-testid="filter-drawer-layer" data-gsap-enter>
        <button aria-label="Dismiss filters" className={styles.backdrop} onClick={closeDrawer} type="button" />
        <div aria-labelledby="drawer-filter-panel-title" aria-modal="true" className={styles.drawer} id="mobile-filter-drawer" role="dialog">
          {renderPanel("drawer", true)}
          <div className={styles.drawerFooter}>
            <button className={styles.showResults} onClick={closeDrawer} type="button">Show results</button>
          </div>
        </div>
      </div>,
      document.body,
    )
    : null;

  return (
    <>
      <button
        aria-controls="mobile-filter-drawer"
        aria-expanded={open}
        className={styles.mobileTrigger}
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <Icon name="filter" /> Filters &amp; navigation
      </button>

      <aside aria-labelledby="desktop-filter-panel-title" className={styles.desktopPanel} id="filter-panel">
        {renderPanel("desktop", false)}
      </aside>
      {drawer}
    </>
  );
}
