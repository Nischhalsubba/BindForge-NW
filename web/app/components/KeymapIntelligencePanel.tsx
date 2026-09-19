"use client";

import { useState } from "react";
import { compareProfiles } from "../lib/keymap-intelligence.mjs";
import type { ProfileHistorySnapshot } from "../lib/profile-history.mjs";
import styles from "./KeymapIntelligencePanel.module.css";

type Bind = { key: string; command: string };
type Profile = { id: string; name: string; characterName: string; keyValues: Record<string,string>; personalBinds: Bind[] };

export function KeymapIntelligencePanel({
  activeProfile,
  profiles,
  recommendations,
  hasImportedEvidence,
  history,
  onRestoreSnapshot,
}: {
  activeProfile: Profile;
  profiles: Profile[];
  recommendations: string[];
  hasImportedEvidence: boolean;
  history: ProfileHistorySnapshot[];
  onRestoreSnapshot: (snapshotId: string) => void;
}) {
  const alternatives = profiles.filter((profile) => profile.id !== activeProfile.id);
  const [compareId, setCompareId] = useState(alternatives[0]?.id ?? "");
  const compared = alternatives.find((profile) => profile.id === compareId) ?? alternatives[0] ?? null;
  const comparison = compared ? compareProfiles(activeProfile, compared) : null;

  return (
    <section className={styles.root} aria-labelledby="keymap-intelligence-title" data-testid="keymap-intelligence-panel">
      <header className={styles.heading}>
        <div><span>Keymap intelligence</span><h3 id="keymap-intelligence-title">Plan changes before committing them</h3></div>
        <p>Recommendations use only the active imported profile as occupancy evidence. “Not found” never means Neverwinter guarantees a key is free.</p>
      </header>

      <div className={styles.grid}>
        <section className={styles.card} aria-labelledby="unused-key-title">
          <h4 id="unused-key-title">Keys not found in this import</h4>
          {hasImportedEvidence ? (
            recommendations.length ? <div className={styles.tokens}>{recommendations.map((key) => <code key={key}>{key}</code>)}</div>
              : <p>No candidate keys passed the imported-profile and active-customization checks.</p>
          ) : <p>Import this profile’s current binds first. BindForge will not call a key unused without profile evidence.</p>}
        </section>

        <section className={styles.card} aria-labelledby="compare-profile-title">
          <h4 id="compare-profile-title">Compare profiles</h4>
          {compared && comparison ? (
            <>
              <label>Compare with
                <select aria-label="Profile to compare" onChange={(event) => setCompareId(event.target.value)} value={compared.id}>
                  {alternatives.map((profile) => <option key={profile.id} value={profile.id}>{profile.characterName} · {profile.name}</option>)}
                </select>
              </label>
              <p><strong>{comparison.changeCount}</strong> differences: {comparison.keyChanges.length} key assignments and {comparison.importedChanges.length} imported binds.</p>
              {comparison.keyChanges.length ? <details><summary>Key assignment changes ({comparison.keyChanges.length})</summary><ul>{comparison.keyChanges.slice(0,24).map((change) => <li key={change.presetId}><code>{change.presetId}</code><span>{change.left || "—"} → {change.right || "—"}</span></li>)}</ul></details> : null}
              {comparison.importedChanges.length ? <details><summary>Imported keymap changes ({comparison.importedChanges.length})</summary><ul>{comparison.importedChanges.slice(0,24).map((change) => <li key={change.key}><code>{change.key}</code><span>{change.left || "—"} → {change.right || "—"}</span></li>)}</ul></details> : null}
            </>
          ) : <p>Create or clone another profile to compare ST/AoE/Tank/Heal/custom setups side by side.</p>}
        </section>

        <section className={styles.card} aria-labelledby="history-title">
          <h4 id="history-title">Recent local history</h4>
          {history.length ? <ol className={styles.history}>{history.map((snapshot) => (
            <li key={snapshot.id}>
              <span><strong>{snapshot.reason}</strong><small>{new Date(snapshot.createdAt).toLocaleString()}</small></span>
              <button onClick={() => onRestoreSnapshot(snapshot.id)} type="button">Restore</button>
            </li>
          ))}</ol> : <p>Snapshots appear automatically before key edits, imports, clears, and reassignment.</p>}
        </section>
      </div>
    </section>
  );
}
