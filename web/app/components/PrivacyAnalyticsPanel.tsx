"use client";

import { useEffect, useMemo, useState } from "react";
import { clearLocalAnalyticsEvents, readLocalAnalyticsEvents } from "../lib/local-analytics-client";
import { summarizeAnalyticsEvents, type AnalyticsEvent } from "../lib/privacy-analytics.mjs";
import styles from "./PrivacyAnalyticsPanel.module.css";

function downloadJson(filename: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function PrivacyAnalyticsPanel() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  useEffect(() => {
    const refresh = () => setEvents(readLocalAnalyticsEvents());
    refresh();
    window.addEventListener("bindforge:analytics", refresh);
    return () => window.removeEventListener("bindforge:analytics", refresh);
  }, []);
  const summary = useMemo(() => summarizeAnalyticsEvents(events), [events]);

  return (
    <div className={styles.root}>
      <p>Usage insights are <strong>device-local only</strong>. BindForge records an allowlisted event name plus coarse route/class/action context. It never records pasted binds, keymap contents, character/profile names, free-text searches, IP addresses, cookies, or device identifiers.</p>
      <div className={styles.summary}>
        <span><strong>{summary.total}</strong><small>local events</small></span>
        <span><strong>{summary.byName.zero_result_search ?? 0}</strong><small>zero-result searches</small></span>
        <span><strong>{summary.importDropoff}</strong><small>ready imports not confirmed</small></span>
        <span><strong>{summary.byName.workflow_error ?? 0}</strong><small>workflow errors</small></span>
      </div>
      <p>Import drop-off is computed locally as ready import previews minus confirmed imports. Blocked validation previews are counted as workflow errors instead of drop-off.</p>
      <details>
        <summary>Event counts</summary>
        <ul>{Object.entries(summary.byName).sort().map(([name,count]) => <li key={name}><code>{name}</code><span>{count}</span></li>)}</ul>
      </details>
      <div className={styles.actions}>
        <button disabled={!events.length} onClick={() => downloadJson(`bindforge-local-analytics-${new Date().toISOString().slice(0,10)}.json`, { schemaVersion: 1, exportedAt: new Date().toISOString(), events })} type="button">Export local analytics</button>
        <button disabled={!events.length} onClick={() => { if (!window.confirm("Clear local analytics from this browser? This cannot be undone unless you export them first.")) return; clearLocalAnalyticsEvents(); setEvents([]); }} type="button">Clear local analytics</button>
      </div>
    </div>
  );
}
