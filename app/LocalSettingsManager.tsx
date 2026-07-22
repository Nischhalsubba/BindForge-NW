"use client";

import { useMemo, useRef } from "react";
import { useBindForge } from "./BindForgeProvider";

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
    <section className="local-backup-card" aria-labelledby="local-backup-title">
      <div className="local-backup-heading">
        <div><p className="eyebrow">Browser backup</p><h3 id="local-backup-title">Your setup stays here</h3></div>
        <span className="local-save-dot" aria-hidden="true" />
      </div>
      <p className="local-backup-copy">Custom keys, filters, output mode, command-lab settings, and custom chat messages are saved automatically on this device.</p>
      <div className="local-save-status" role="status" aria-live="polite"><strong>{status}</strong><span>{savedLabel}</span></div>
      <div className="local-backup-actions">
        <button className="local-primary-action" onClick={exportBackup} type="button">Export backup</button>
        <button className="local-secondary-action" onClick={() => fileInput.current?.click()} type="button">Import backup</button>
        <button className="local-danger-action" onClick={clearSavedData} type="button">Clear saved data</button>
      </div>
      <input
        accept="application/json,.json"
        aria-label="Import a BindForge backup file"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void importBackup(file);
          event.target.value = "";
        }}
        ref={fileInput}
        type="file"
      />
      <p className="local-privacy-note">Stored only in this browser. Clearing site data removes it unless you export a backup file.</p>
    </section>
  );
}
