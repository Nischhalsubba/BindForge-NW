"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import LocalSettingsManager from "../LocalSettingsManager";
import ThemeSwitcher from "../ThemeSwitcher";
import { AccessibilityPreferences } from "../AccessibilityPreferences";
import styles from "./SettingsPanel.module.css";

export function SettingsPanel() {
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
      if (event.key === "Escape") {
        setOpen(false);
        window.requestAnimationFrame(() => triggerRef.current?.focus());
      }
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

  function closePanel() {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  const layer = open && typeof document !== "undefined"
    ? createPortal(
      <div className={styles.layer} data-testid="settings-layer">
        <button aria-label="Dismiss settings" className={styles.backdrop} onClick={closePanel} type="button" />
        <section aria-labelledby="settings-title" aria-modal="true" className={styles.panel} id="app-settings-panel" role="dialog">
          <header className={styles.header}>
            <div><p>Preferences and local data</p><h2 id="settings-title">Local archive</h2></div>
            <button aria-label="Close settings" className={styles.close} onClick={closePanel} ref={closeRef} type="button">×</button>
          </header>
          <div className={styles.content}>
            <section className={styles.section} aria-labelledby="appearance-settings-title">
              <div className={styles.sectionHeading}><h3 id="appearance-settings-title">Appearance</h3><p>Choose the light, dark, or system theme used by this browser.</p></div>
              <ThemeSwitcher />
            </section>
            <section className={styles.section} aria-labelledby="accessibility-settings-title">
              <div className={styles.sectionHeading}><h3 id="accessibility-settings-title">Accessibility &amp; experience</h3><p>Adjust reading size, spacing, motion, assistance, and how much technical detail BindForge shows.</p></div>
              <AccessibilityPreferences />
            </section>
            <section className={styles.section} aria-labelledby="backup-settings-title">
              <div className={styles.sectionHeading}><h3 id="backup-settings-title">Data and backup</h3><p>Export, restore, or clear your locally saved setup and preferences.</p></div>
              <LocalSettingsManager />
            </section>
          </div>
        </section>
      </div>,
      document.body,
    )
    : null;

  return (
    <div className={styles.root}>
      <button aria-controls="app-settings-panel" aria-expanded={open} className={styles.trigger} onClick={() => setOpen(true)} ref={triggerRef} type="button">
        Local data &amp; backup
      </button>
      {layer}
    </div>
  );
}
