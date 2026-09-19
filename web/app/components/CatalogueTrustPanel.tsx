"use client";

import { useMemo, useState } from "react";
import { consoleCommands } from "../data/commands";
import { keybindPresets } from "../data/keybindPresets";
import { catalogFreshnessSummary } from "../lib/catalog-freshness.mjs";
import { reconcileCmdlist } from "../lib/cmdlist-reconcile.mjs";
import styles from "./CatalogueTrustPanel.module.css";

export function CatalogueTrustPanel() {
  const [cmdlistText, setCmdlistText] = useState("");
  const [result, setResult] = useState<ReturnType<typeof reconcileCmdlist> | null>(null);
  const freshness = useMemo(() => catalogFreshnessSummary(keybindPresets, new Date(), 180), []);

  return (
    <div className={styles.root}>
      <div className={styles.freshness} aria-label="Catalogue verification freshness">
        <span><strong>{freshness.recentPercent}%</strong><small>recently verified</small></span>
        <span><strong>{freshness.needsGameUpdateReview}</strong><small>recheck after latest patch</small></span>
        <span><strong>{freshness.newestDate ?? "—"}</strong><small>newest evidence date</small></span>
      </div>
      <p className={styles.note}>“Recently verified” means a recorded verification within 180 days. {freshness.needsGameUpdateReview} presets have missing or pre-{freshness.latestImportantUpdate.date} evidence and are explicitly flagged for re-verification after <a href={freshness.latestImportantUpdate.sourceUrl} rel="noreferrer" target="_blank">{freshness.latestImportantUpdate.label}</a>.</p>

      <section className={styles.cmdlist} aria-labelledby="cmdlist-audit-title">
        <div>
          <h4 id="cmdlist-audit-title">Compare a live /cmdlist</h4>
          <p>Run <code>/cmdlist</code> in Neverwinter, copy the output, and paste it here. Comparison stays in your browser and does not automatically promote any command to verified.</p>
        </div>
        <textarea aria-label="Paste Neverwinter cmdlist output" onChange={(event) => setCmdlistText(event.target.value)} placeholder={"/bind Bind a key to a command\n/bind_load_file Load entity keybinds from a file"} rows={6} value={cmdlistText} />
        <button disabled={!cmdlistText.trim()} onClick={() => setResult(reconcileCmdlist(cmdlistText, consoleCommands))} type="button">Compare with BindForge</button>
        {result ? (
          <div className={styles.results} aria-live="polite" role="status">
            <p><strong>{result.matched.length}</strong> pasted commands matched. <strong>{result.missingFromBindForge.length}</strong> are research candidates. <strong>{result.notSeenInPastedList.length}</strong> catalogue commands were not seen in this pasted list.</p>
            {result.missingFromBindForge.length ? <details><summary>Research candidates ({result.missingFromBindForge.length})</summary><code>{result.missingFromBindForge.map((command) => `/${command}`).join("\n")}</code></details> : null}
            {result.notSeenInPastedList.length ? <details><summary>Not seen in pasted list ({result.notSeenInPastedList.length})</summary><p>Absence here is not proof a command was removed; cmdlist output can vary by client or context.</p><code>{result.notSeenInPastedList.slice(0, 80).map((command) => `/${command}`).join("\n")}{result.notSeenInPastedList.length > 80 ? "\n…" : ""}</code></details> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
