"use client";

import { useState } from "react";
import type { PresetConfidence, PresetSourceType } from "../data/keybindTypes";
import styles from "./WorkspaceControls.module.css";

type ViewMode = "cards" | "compact";
type SortMode = "recommended" | "title" | "difficulty" | "class";
type ProvenanceFilter = "all" | PresetSourceType | PresetConfidence;

type WorkspaceControlsProps = {
  resultCount: number;
  conflictCount: number;
  viewMode: ViewMode;
  sortMode: SortMode;
  provenanceFilter: ProvenanceFilter;
  safeOnly: boolean;
  selectedCount: number;
  visibleCount: number;
  activeCollection: string;
  favouritesCount: number;
  collections: Record<string, string[]>;
  collectionName: string;
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
  onCopyPack: (mode: "bind" | "unbind") => void;
  onDownloadPack: (mode: "bind" | "unbind") => void;
};

export function WorkspaceControls(props: WorkspaceControlsProps) {
  const [packToolsOpen, setPackToolsOpen] = useState(false);
  const panelId = "collections-command-packs";

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
              <button disabled={!props.selectedCount} onClick={props.onClearSelection} type="button">Clear selection</button>
              <button className={styles.primary} disabled={!props.selectedCount} onClick={() => props.onCopyPack("bind")} type="button">Copy bind pack</button>
              <button disabled={!props.selectedCount} onClick={() => props.onCopyPack("unbind")} type="button">Copy unbind pack</button>
              <button disabled={!props.selectedCount} onClick={() => props.onDownloadPack("bind")} type="button">Download bind .txt</button>
              <button disabled={!props.selectedCount} onClick={() => props.onDownloadPack("unbind")} type="button">Download unbind .txt</button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
