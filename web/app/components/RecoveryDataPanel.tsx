"use client";

import { useEffect, useState } from "react";
import { RECOVERY_STORAGE_KEY, parseRecoveryRecords } from "../lib/recovery-data.mjs";
import type { RecoveryRecord } from "../lib/recovery-data.mjs";
import styles from "./RecoveryDataPanel.module.css";

function downloadRecovery(records: RecoveryRecord[]) {
  const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), records }, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `bindforge-recovery-${new Date().toISOString().slice(0, 10)}.json`;
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function RecoveryDataPanel() {
  const [records, setRecords] = useState<RecoveryRecord[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    try { setRecords(parseRecoveryRecords(window.localStorage.getItem(RECOVERY_STORAGE_KEY))); } catch { setRecords([]); }
  }, []);

  function clear() {
    if (!window.confirm("Clear preserved recovery data? This cannot be undone unless you exported it first.")) return;
    try { window.localStorage.removeItem(RECOVERY_STORAGE_KEY); } catch { /* session state still clears */ }
    setRecords([]);
    setStatus("Recovery archive cleared.");
  }

  return (
    <div className={styles.root}>
      {records.length ? (
        <>
          <p><strong>{records.length} preserved recovery record{records.length === 1 ? "" : "s"}.</strong> BindForge saved these raw values before falling back from invalid local data.</p>
          <ol>{records.map((record) => <li key={record.id}><span><strong>{record.storageKey}</strong><small>{new Date(record.createdAt).toLocaleString()}</small></span><p>{record.reason}</p></li>)}</ol>
          <div className={styles.actions}><button onClick={() => { downloadRecovery(records); setStatus("Recovery archive exported."); }} type="button">Export recovery data</button><button onClick={clear} type="button">Clear recovery data</button></div>
        </>
      ) : <p>No corrupted local data has been preserved in this browser.</p>}
      <p aria-live="polite" className={styles.status} role="status">{status}</p>
    </div>
  );
}
