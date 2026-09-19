"use client";

import type { KeybindPreset } from "../data/keybindPresets";
import type { RecentAssignmentChange } from "../lib/recent-activity.mjs";
import styles from "./RecentActivityPanel.module.css";

export function RecentActivityPanel({
  presets,
  recentPresetIds,
  recentChanges,
  onOpenPreset,
}: {
  presets: KeybindPreset[];
  recentPresetIds: string[];
  recentChanges: RecentAssignmentChange[];
  onOpenPreset: (preset: KeybindPreset) => void;
}) {
  const byId = new Map(presets.map((preset) => [preset.id, preset]));
  const recentPresets = recentPresetIds.flatMap((id) => {
    const preset = byId.get(id);
    return preset ? [preset] : [];
  });
  if (!recentPresets.length && !recentChanges.length) return null;

  return (
    <section className={styles.root} aria-labelledby="recent-activity-title" data-testid="recent-activity">
      <header><div><span>Local history</span><h3 id="recent-activity-title">Recent activity</h3></div><p>Recent copied keybinds and assignment edits stay on this device.</p></header>
      <div className={styles.columns}>
        <div><strong>Recent keybinds</strong>{recentPresets.length ? <ul>{recentPresets.map((preset) => <li key={preset.id}><button onClick={() => onOpenPreset(preset)} type="button">{preset.title}</button><small>{preset.type}</small></li>)}</ul> : <p>No copied keybinds yet.</p>}</div>
        <div><strong>Recently changed assignments</strong>{recentChanges.length ? <ul>{recentChanges.slice(0,6).map((change,index) => <li key={`${change.presetId}-${change.changedAt}-${index}`}><span>{byId.get(change.presetId)?.title ?? change.presetId}</span><code>{change.from || "—"} → {change.to}</code></li>)}</ul> : <p>No assignment edits yet.</p>}</div>
      </div>
    </section>
  );
}
