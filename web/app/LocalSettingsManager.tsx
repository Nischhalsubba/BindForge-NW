"use client";

import { useMemo, useRef } from "react";
import { useBindForge } from "./BindForgeProvider";
import styles from "./LocalSettingsManager.module.css";

export default function LocalSettingsManager() {
  const { status, savedAt, exportBackup, importBackup, clearSavedData } = useBindForge();
  const fileInput = useRef<HTMLInputElement>(null);

  const savedLabel = useMemo(() => {
    if (!savedAt) return "No local backup yet";
    try {
      return `Last saved ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(savedAt))}`;
    } catch {
      return "Local backup available";
    }
  }, [savedAt]);

  return (
    <section className={styles.card} aria-labelledby="local-backup-title">
      <div className={styles.heading}>
        <div><p className={styles.eyebrow}>Browser backup</p><h3 id="local-backup-title">Your setup stays here</h3></div>
        <span className={styles.dot} aria-hidden="true" />
      </div>
      <p className={styles.copy}>Custom keys, filters, output mode, command-lab settings, and custom chat messages are saved automatically on this device.</p>
      <div className={`${styles.status} local-save-status`} role="status" aria-live="polite"><strong>{status}</strong><span>{savedLabel}</span></div>
      <div className={styles.actions}>
        <button className={styles.primary} onClick={exportBackup} type="button">Export backup</button>
        <button onClick={() => fileInput.current?.click()} type="button">Import backup</button>
        <button className={styles.danger} onClick={clearSavedData} type="button">Clear saved data</button>
      </div>
      <input accept="application/json,.json" aria-label="Import a Neverwinter Keybind backup file" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importBackup(file); event.target.value = ""; }} ref={fileInput} type="file" />
      <p className={styles.privacy}>Stored only in this browser. Clearing site data removes it unless you export a backup file.</p>
    </section>
  );
}
