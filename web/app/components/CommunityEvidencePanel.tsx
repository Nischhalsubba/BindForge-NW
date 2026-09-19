"use client";

import { useState } from "react";
import type { KeybindPreset } from "../data/keybindPresets";
import { buildCommunityReport, type CommunityOutcome } from "../lib/community-evidence.mjs";
import styles from "./CommunityEvidencePanel.module.css";

function downloadReport(report: unknown, presetId: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `bindforge-report-${presetId}-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function CommunityEvidencePanel({ preset }: { preset: KeybindPreset }) {
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState<CommunityOutcome>("works");
  const [gameVersion, setGameVersion] = useState("");
  const [paragon, setParagon] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  function exportReport() {
    const report = buildCommunityReport({ preset, outcome, gameVersion, paragon, note });
    if (!report) return;
    downloadReport(report, preset.id);
    setStatus("Community report downloaded. It remains unreviewed evidence and does not change this preset’s trust label.");
  }

  return (
    <details className={styles.root} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>Report current game behavior</summary>
      {open ? <div className={styles.body}>
        <p>Record what you observed without silently changing catalogue confidence. A maintainer must review evidence before any trust label can change.</p>
        <div className={styles.fields}>
          <label>Result<select aria-label={`Community result for ${preset.title}`} onChange={(event) => setOutcome(event.target.value as CommunityOutcome)} value={outcome}><option value="works">Works</option><option value="does-not-work">Doesn’t work</option><option value="needs-update">Needs update</option></select></label>
          <label>Game version / patch<input aria-label={`Game version for ${preset.title}`} onChange={(event) => setGameVersion(event.target.value)} placeholder="Required, e.g. patch date/version" value={gameVersion} /></label>
          <label>Class<input disabled value={preset.className} /></label>
          <label>Paragon (if relevant)<input aria-label={`Paragon for ${preset.title}`} onChange={(event) => setParagon(event.target.value)} value={paragon} /></label>
        </div>
        <label className={styles.note}>Observation<textarea aria-label={`Community note for ${preset.title}`} maxLength={500} onChange={(event) => setNote(event.target.value)} rows={3} value={note} /></label>
        <button disabled={!gameVersion.trim()} onClick={exportReport} type="button">Download unreviewed report</button>
        <p aria-live="polite" role="status">{status}</p>
      </div> : null}
    </details>
  );
}
