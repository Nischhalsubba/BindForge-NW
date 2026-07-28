"use client";

import { useEffect, useRef, useState } from "react";
import LocalSettingsManager from "../LocalSettingsManager";
import styles from "./SettingsPanel.module.css";

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
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
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function closePanel() {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <div className={styles.root}>
      <button aria-controls="app-settings-panel" aria-expanded={open} className={styles.trigger} onClick={() => setOpen(true)} ref={triggerRef} type="button">
        Local data &amp; backup
      </button>

      {open ? (
        <div className={styles.layer} data-testid="settings-layer">
          <button aria-label="Close settings" className={styles.backdrop} onClick={closePanel} type="button" />
          <section aria-labelledby="settings-title" aria-modal="true" className={styles.panel} id="app-settings-panel" role="dialog">
            <header className={styles.header}>
              <div><p>Preferences and data</p><h2 id="settings-title">Local archive</h2></div>
              <button aria-label="Close settings" className={styles.close} onClick={closePanel} ref={closeRef} type="button">×</button>
            </header>
            <div className={styles.content}>
              <section className={styles.section} aria-labelledby="backup-settings-title">
                <div className={styles.sectionHeading}><h3 id="backup-settings-title">Data and backup</h3><p>Export, restore, or clear your locally saved setup.</p></div>
                <LocalSettingsManager />
              </section>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
