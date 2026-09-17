"use client";

import { useState } from "react";
import type { PresetConfidence, PresetSourceType } from "../data/keybindTypes";
import styles from "./WorkspaceControls.module.css";

type ViewMode = "cards" | "compact";
type SortMode = "recommended" | "title" | "difficulty" | "class";
type ProvenanceFilter = "all" | PresetSourceType | PresetConfidence;

export type PackReviewItem = {
  id: string;
  title: string;
  keyValue: string;
  line: string;
  statusLevel: "safe" | "info" | "warn" | "danger";
  statusMessage: string;
  confidence: string;
};

type WorkspaceControlsProps = {
  resultCount: number;
  conflictCount: number;
  viewMode: ViewMode;
  sortMode: SortMode;
  provenanceFilter: ProvenanceFilter;
  safeOnly: boolean;
  selectedCount: number;
  selectedReviewCount: number;
  reviewItems: PackReviewItem[];
  visibleCount: number;
  activeCollection: string;
  favouritesCount: number;
  collections: Record<string, string[]>;
  collectionName: string;
  personalBindCount: number;
  personalSourceName: string;
  personalImportMessage: string;
  onViewModeChange: (value: ViewMode) => void;
  onSortModeChange: (value: SortMode) => void;
  onProvenanceFilterChange: (value: ProvenanceFilter) => void;
  onSafeOnlyChange: (value: boolean) => void;
  onActiveCollectionChange: (value: string) => void;
  onCollectionNameChange: (value: string) => void;
  onAddCollection: () => void;
  onRemoveCollection: () => void;
  onShareView: () => void;
  onSelectVisible: () => void;
  onClearSelection: () => void;
  onRemoveSelected: (id: string) => void;
  onCopyPack: (mode: "bind" | "unbind") => void;
  onDownloadPack: (mode: "bind" | "unbind") => void;
  onImportPersonalText: (value: string) => void;
  onImportPersonalFile: (file: File) => void;
  onClearPersonalBinds: () => void;
};

export function WorkspaceControls(props: WorkspaceControlsProps) {
  const [packToolsOpen, setPackToolsOpen] = useState(false);
  const [keymapOpen, setKeymapOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const panelId = "collections-command-packs";
  const keymapPanelId = "personal-keymap-import";
  const reviewPanelId = "selected-pack-review";

  function clearSelection() {
    setReviewOpen(false);
    props.onClearSelection();
  }

  function removeSelected(id: string) {
    if (props.selectedCount <= 1) setReviewOpen(false);
    props.onRemoveSelected(id);
  }

  return (
    <div className={styles.workspace}>
      <section className={styles.secondary} aria-label="Library display and safety options" data-testid="secondary-controls">
        <div className={styles.summary}>
          <strong>{props.resultCount} keybinds found</strong>
          <span>{props.conflictCount} need review</span>
        </div>
        <label>View<select aria-label="Library view" onChange={(event) => props.onViewModeChange(event.target.value as ViewMode)} value={props.viewMode}><option value="cards">Cards</option><option value="compact">Compact</option></select></label>
        <label>Sort<select aria-label="Sort keybinds" onChange={(event) => props.onSortModeChange(event.target.value as SortMode)} value={props.sortMode}><option value="recommended">Recommended</option><option value="title">Title</option><option value="difficulty">Difficulty</option><option value="class">Class</option></select></label>
        <label>Source<select aria-label="Filter by provenance" onChange={(event) => props.onProvenanceFilterChange(event.target.value as ProvenanceFilter)} value={props.provenanceFilter}><option value="all">All sources</option><option value="official">Official</option><option value="wiki">Wiki</option><option value="community">Community</option><option value="user-submitted">User submitted</option><option value="verified">Verified</option><option value="community-tested">Community tested</option><option value="experimental">Experimental</option></select></label>
        <label className={styles.safeToggle}><input checked={props.safeOnly} onChange={(event) => props.onSafeOnlyChange(event.target.checked)} type="checkbox" />Safe or intentional only</label>
      </section>

      <section className={styles.keymapPanel} aria-labelledby="personal-keymap-title" id="my-setup">
        <button aria-controls={keymapPanelId} aria-expanded={keymapOpen} className={styles.keymapSummary} onClick={() => setKeymapOpen((value) => !value)} type="button">
          <span>
            <strong id="personal-keymap-title">Personal keymap</strong>
            <small>{props.personalBindCount ? `${props.personalBindCount} active binds analyzed locally` : "Import current binds for real conflict detection"}</small>
          </span>
          <span className={props.personalBindCount ? styles.readyBadge : styles.emptyBadge}>{props.personalBindCount ? "Connected" : "Not imported"}</span>
          <span aria-hidden="true">{keymapOpen ? "−" : "+"}</span>
        </button>
        {keymapOpen ? (
          <div className={styles.keymapBody} id={keymapPanelId} data-testid="personal-keymap-panel">
            <div className={styles.keymapCopy}>
              <strong>Analyze your current Neverwinter binds</strong>
              <p>Paste <code>/bind</code> and <code>/unbind</code> lines or choose a text file. Analysis happens in this browser; the keymap is not uploaded.</p>
              {props.personalBindCount ? <p className={styles.keymapSource}>Current profile: {props.personalSourceName || "Pasted keymap"}</p> : null}
            </div>
            <textarea aria-label="Paste personal Neverwinter binds" onChange={(event) => setImportText(event.target.value)} placeholder={'/bind r gensendmessage Chat_Reply activate\n/bind ctrl+5 invoke'} rows={5} value={importText} />
            <div className={styles.keymapActions}>
              <button className={styles.primary} disabled={!importText.trim()} onClick={() => props.onImportPersonalText(importText)} type="button">Analyze pasted binds</button>
              <label className={styles.fileButton}>Choose bind .txt<input accept=".txt,.cfg,text/plain" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) props.onImportPersonalFile(file); event.currentTarget.value = ""; }} type="file" /></label>
              <button disabled={!props.personalBindCount} onClick={props.onClearPersonalBinds} type="button">Clear personal keymap</button>
            </div>
            <p aria-live="polite" className={styles.importStatus} role="status">{props.personalImportMessage || (props.personalBindCount ? "Personal conflict detection is active." : "No personal keymap has been analyzed yet.")}</p>
          </div>
        ) : null}
      </section>

      <section className={styles.packPanel} aria-labelledby="pack-tools-title" id="collections">
        <button aria-controls={panelId} aria-expanded={packToolsOpen} className={styles.packSummary} data-gsap-nav onClick={() => setPackToolsOpen((value) => !value)} type="button">
          <span><strong id="pack-tools-title">Collections &amp; command packs</strong><small>Save, share, copy, or download selected presets</small></span>
          <span className={styles.selectionBadge}>{props.selectedCount} selected</span>
          <span aria-hidden="true">{packToolsOpen ? "−" : "+"}</span>
        </button>
        {packToolsOpen ? (
          <div className={styles.packBody} id={panelId} data-testid="pack-tools-panel" data-gsap-enter>
            <div className={styles.collectionRow}>
              <label>Collection<select aria-label="Browse collection" onChange={(event) => props.onActiveCollectionChange(event.target.value)} value={props.activeCollection}><option value="all">All presets</option><option value="favourites">Favourites ({props.favouritesCount})</option>{Object.keys(props.collections).sort().map((name) => <option key={name} value={name}>{name} ({props.collections[name].length})</option>)}</select></label>
              <input aria-label="New collection name" onChange={(event) => props.onCollectionNameChange(event.target.value)} placeholder="New collection name" value={props.collectionName} />
              <button disabled={!props.selectedCount || !props.collectionName.trim()} onClick={props.onAddCollection} type="button">Save selected</button>
              <button disabled={props.activeCollection === "all" || props.activeCollection === "favourites"} onClick={props.onRemoveCollection} type="button">Delete collection</button>
              <button onClick={props.onShareView} type="button">Copy share link</button>
            </div>
            <div className={styles.packActions} aria-label="Selected bind pack">
              <button disabled={!props.visibleCount} onClick={props.onSelectVisible} type="button">Select visible</button>
              <button disabled={!props.selectedCount} onClick={clearSelection} type="button">Clear selection</button>
              <button className={styles.primary} disabled={!props.selectedCount} onClick={() => { setReviewOpen(true); }} type="button">Review selected pack</button>
              <button disabled={!props.selectedCount} onClick={() => props.onCopyPack("bind")} type="button">Copy bind pack</button>
              <button disabled={!props.selectedCount} onClick={() => props.onCopyPack("unbind")} type="button">Copy unbind pack</button>
              <button disabled={!props.selectedCount} onClick={() => props.onDownloadPack("bind")} type="button">Download bind .txt</button>
              <button disabled={!props.selectedCount} onClick={() => props.onDownloadPack("unbind")} type="button">Download unbind .txt</button>
            </div>
          </div>
        ) : null}
      </section>

      {props.selectedCount ? (
        <aside className={styles.selectionTray} data-testid="selection-tray" aria-label="Selected bind pack review">
          <div className={styles.traySummary}>
            <span><strong>{props.selectedCount} selected</strong><small>{props.selectedReviewCount ? `${props.selectedReviewCount} ${props.selectedReviewCount === 1 ? "item needs" : "items need"} review` : "No conflicts detected in this pack"}</small></span>
            <div className={styles.trayActions}>
              <button aria-controls={reviewPanelId} aria-expanded={reviewOpen} className={styles.primary} onClick={() => setReviewOpen((value) => !value)} type="button">{reviewOpen ? "Close review" : "Review pack"}</button>
              <button onClick={clearSelection} type="button">Clear</button>
            </div>
          </div>

          {reviewOpen ? (
            <div className={styles.reviewPanel} data-testid="pack-review" id={reviewPanelId}>
              <header className={styles.reviewHeading}>
                <div><span>Final command review</span><h3>Check conflicts before copying</h3></div>
                <p>The lines below are exactly what BindForge will copy or download. Remove anything you do not want to apply.</p>
              </header>
              <div className={styles.reviewList}>
                {props.reviewItems.map((item) => (
                  <article className={styles.reviewItem} data-level={item.statusLevel} key={item.id}>
                    <div className={styles.reviewIdentity}>
                      <div><strong>{item.title}</strong><small>{item.confidence}</small></div>
                      <code>{item.keyValue}</code>
                      <button aria-label={`Remove ${item.title} from selected pack`} onClick={() => removeSelected(item.id)} type="button">Remove</button>
                    </div>
                    <p>{item.statusMessage}</p>
                    <code className={styles.reviewCommand}>{item.line}</code>
                  </article>
                ))}
              </div>
              <div className={styles.reviewActions}>
                <button className={styles.primary} onClick={() => props.onCopyPack("bind")} type="button">Copy final bind pack</button>
                <button onClick={() => props.onCopyPack("unbind")} type="button">Copy rollback pack</button>
                <button onClick={() => props.onDownloadPack("bind")} type="button">Download bind .txt</button>
                <button onClick={() => props.onDownloadPack("unbind")} type="button">Download rollback .txt</button>
              </div>
            </div>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}
