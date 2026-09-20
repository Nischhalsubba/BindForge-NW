"use client";

import { useEffect, useRef, useState } from "react";
import { useBindForge } from "../BindForgeProvider";
import { analyzeRawKeymap, compareProfiles } from "../lib/keymap-intelligence.mjs";
import type { ProfileHistorySnapshot } from "../lib/profile-history.mjs";
import type { PresetConfidence, PresetSourceType } from "../data/keybindTypes";
import { recordLocalAnalyticsEvent } from "../lib/local-analytics-client";
import { ProfileWorkspaceManager } from "./ProfileWorkspaceManager";
import { VisualKeyboardMap } from "./VisualKeyboardMap";
import { KeymapIntelligencePanel } from "./KeymapIntelligencePanel";
import styles from "./WorkspaceControls.module.css";

type ViewMode = "cards" | "compact";
type SortMode = "recommended" | "title" | "difficulty" | "class";
type ProvenanceFilter = "all" | PresetSourceType | PresetConfidence;
type ProfilePersonalBind = {
  mode: "bind";
  key: string;
  command: string;
  raw: string;
  lineNumber: number;
};
type ProfileSummary = {
  id: string;
  name: string;
  keyValues: Record<string, string>;
  personalBinds: ProfilePersonalBind[];
};
type CharacterSummary = {
  id: string;
  name: string;
  className: string;
  paragon: string;
  role: string;
  profiles: ProfileSummary[];
};

export type PackReviewItem = {
  id: string;
  title: string;
  keyValue: string;
  line: string;
  currentEvidence: string;
  rollbackLine: string;
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
  characters: CharacterSummary[];
  activeCharacterId: string;
  activeProfileId: string;
  activeCharacter: CharacterSummary;
  activeProfile: ProfileSummary;
  profileStatus: string;
  canDeleteCharacter: boolean;
  canDeleteProfile: boolean;
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
  nativeFilename: string;
  nativePackStatus: string;
  onDownloadNativePack: () => void;
  onCopyNativeLoadCommand: () => void;
  onDownloadNativeRestore: () => void;
  onDownloadCommunityPack: (gameVersion: string) => void;
  onExportActiveProfile: () => void;
  hasImportedEvidence: boolean;
  unusedKeyRecommendations: string[];
  profileHistory: ProfileHistorySnapshot[];
  onRestoreProfileSnapshot: (snapshotId: string) => void;
  onImportPersonalText: (value: string) => void;
  onImportPersonalFile: (file: File) => void;
  onClearPersonalBinds: () => void;
  onActiveCharacterChange: (id: string) => void;
  onActiveProfileChange: (id: string) => void;
  onAddCharacter: () => void;
  onAddProfile: () => void;
  onCharacterNameChange: (value: string) => void;
  onCharacterClassChange: (value: string) => void;
  onCharacterParagonChange: (value: string) => void;
  onCharacterRoleChange: (value: string) => void;
  onProfileNameChange: (value: string) => void;
  onDeleteCharacter: () => void;
  onDeleteProfile: () => void;
  onExportProfiles: () => void;
  onImportProfiles: (file: File) => void;
};

export function WorkspaceControls(props: WorkspaceControlsProps) {
  const { state } = useBindForge();
  const beginner = state.preferences.experience === "simple";
  const [packToolsOpen, setPackToolsOpen] = useState(false);
  const [keymapOpen, setKeymapOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importPreview, setImportPreview] = useState<ReturnType<typeof analyzeRawKeymap> | null>(null);
  const [importPreviewMessage, setImportPreviewMessage] = useState("");
  const [communityPackVersion, setCommunityPackVersion] = useState("");
  const importRef = useRef<HTMLTextAreaElement>(null);
  const panelId = "collections-command-packs";
  const keymapPanelId = "personal-keymap-import";
  const reviewPanelId = "selected-pack-review";
  const importComparison = importPreview ? compareProfiles(
    { id: props.activeProfile.id, name: props.activeProfile.name, keyValues: {}, personalBinds: props.activeProfile.personalBinds },
    { id: "preview", name: "Preview", keyValues: {}, personalBinds: importPreview.activeBinds },
  ) : null;

  useEffect(() => {
    const syncHash = () => {
      if (window.location.hash === "#my-setup") setKeymapOpen(true);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  function clearSelection() {
    setReviewOpen(false);
    props.onClearSelection();
  }

  function removeSelected(id: string) {
    if (props.selectedCount <= 1) setReviewOpen(false);
    props.onRemoveSelected(id);
  }

  function previewImport(text: string) {
    const analysis = analyzeRawKeymap(text);
    setImportPreview(analysis);
    recordLocalAnalyticsEvent({ name: "import_previewed", context: { route: "my-setup", actionType: "import", outcome: analysis.hasBlockingErrors ? "blocked" : "ready" } });
    if (analysis.hasBlockingErrors) {
      recordLocalAnalyticsEvent({ name: "workflow_error", context: { route: "my-setup", actionType: "import", outcome: "validation-blocked" } });
    }
    setImportPreviewMessage(
      analysis.hasBlockingErrors
        ? "No valid bind operations were found. Review the ignored lines before importing."
        : `${analysis.activeBinds.length} active binds will remain after applying the file. ${analysis.overwrites.length} overwrite${analysis.overwrites.length === 1 ? "" : "s"}, ${analysis.orphanUnbinds.length} orphan unbind${analysis.orphanUnbinds.length === 1 ? "" : "s"}, and ${analysis.ignored.length} ignored line${analysis.ignored.length === 1 ? "" : "s"} detected.`,
    );
  }

  async function previewImportFile(file: File) {
    if (file.size > 512 * 1024) {
      setImportPreview(null);
      recordLocalAnalyticsEvent({ name: "workflow_error", context: { route: "my-setup", actionType: "import", outcome: "file-too-large" } });
      setImportPreviewMessage("That bind file is larger than 512 KB. Choose a smaller text export.");
      return;
    }
    try {
      const text = await file.text();
      setImportText(text);
      previewImport(text);
    } catch {
      setImportPreview(null);
      recordLocalAnalyticsEvent({ name: "workflow_error", context: { route: "my-setup", actionType: "import", outcome: "file-read-failed" } });
      setImportPreviewMessage("Unable to read this bind file. Choose a plain-text Neverwinter bind export and try again.");
    }
  }

  function confirmImport() {
    if (!importPreview || importPreview.hasBlockingErrors) return;
    props.onImportPersonalText(importText);
    recordLocalAnalyticsEvent({ name: "import_confirmed", context: { route: "my-setup", actionType: "import", outcome: "confirmed" } });
    setImportPreview(null);
    setImportPreviewMessage("");
  }

  return (
    <div className={styles.workspace}>
      {!beginner ? <section className={styles.secondary} aria-label="Library display and safety options" data-testid="secondary-controls">
        <div className={styles.summary}>
          <strong>{props.resultCount} keybinds found</strong>
          <span>{props.conflictCount} need review</span>
        </div>
        <label>View<select aria-label="Library view" onChange={(event) => props.onViewModeChange(event.target.value as ViewMode)} value={props.viewMode}><option value="cards">Cards</option><option value="compact">Compact</option></select></label>
        <label>Sort<select aria-label="Sort keybinds" onChange={(event) => props.onSortModeChange(event.target.value as SortMode)} value={props.sortMode}><option value="recommended">Recommended</option><option value="title">Title</option><option value="difficulty">Difficulty</option><option value="class">Class</option></select></label>
        <label>Source<select aria-label="Filter by provenance" onChange={(event) => props.onProvenanceFilterChange(event.target.value as ProvenanceFilter)} value={props.provenanceFilter}><option value="all">All sources</option><option value="official">Official</option><option value="wiki">Wiki</option><option value="community">Community</option><option value="user-submitted">User submitted</option><option value="verified">Verified</option><option value="community-tested">Community tested</option><option value="experimental">Experimental</option></select></label>
        <label className={styles.safeToggle}><input checked={props.safeOnly} onChange={(event) => props.onSafeOnlyChange(event.target.checked)} type="checkbox" />Safe or intentional only</label>
      </section> : null}

      <section className={styles.keymapPanel} aria-labelledby="personal-keymap-title" data-tour="my-setup" id="my-setup">
        <button aria-controls={keymapPanelId} aria-expanded={keymapOpen} className={styles.keymapSummary} onClick={() => setKeymapOpen((value) => !value)} type="button">
          <span>
            <strong id="personal-keymap-title">My Setup</strong>
            <small>{props.activeCharacter.name} · {props.activeProfile.name}{props.personalBindCount ? ` · ${props.personalBindCount} imported binds` : ""}</small>
          </span>
          <span className={props.personalBindCount ? styles.readyBadge : styles.emptyBadge}>{props.personalBindCount ? "Profile ready" : "Local only"}</span>
          <span aria-hidden="true">{keymapOpen ? "−" : "+"}</span>
        </button>
        {keymapOpen ? (
          <div className={styles.keymapBody} id={keymapPanelId} data-testid="personal-keymap-panel">
            <ProfileWorkspaceManager
              characters={props.characters}
              activeCharacterId={props.activeCharacterId}
              activeProfileId={props.activeProfileId}
              activeCharacter={props.activeCharacter}
              activeProfile={props.activeProfile}
              canDeleteCharacter={props.canDeleteCharacter}
              canDeleteProfile={props.canDeleteProfile}
              status={props.profileStatus}
              onActiveCharacterChange={props.onActiveCharacterChange}
              onActiveProfileChange={props.onActiveProfileChange}
              onAddCharacter={props.onAddCharacter}
              onAddProfile={props.onAddProfile}
              onCharacterNameChange={props.onCharacterNameChange}
              onCharacterClassChange={props.onCharacterClassChange}
              onCharacterParagonChange={props.onCharacterParagonChange}
              onCharacterRoleChange={props.onCharacterRoleChange}
              onProfileNameChange={props.onProfileNameChange}
              onDeleteCharacter={props.onDeleteCharacter}
              onDeleteProfile={props.onDeleteProfile}
              onExport={props.onExportProfiles}
              onExportActiveProfile={props.onExportActiveProfile}
              onImport={props.onImportProfiles}
            />
            <VisualKeyboardMap
              characterName={props.activeCharacter.name}
              profileId={props.activeProfile.id}
              profileName={props.activeProfile.name}
              keyValues={props.activeProfile.keyValues}
              personalBinds={props.activeProfile.personalBinds}
            />
            <KeymapIntelligencePanel
              activeProfile={{ ...props.activeProfile, characterName: props.activeCharacter.name }}
              profiles={props.characters.flatMap((character) => character.profiles.map((profile) => ({ ...profile, characterName: character.name })))}
              recommendations={props.unusedKeyRecommendations}
              hasImportedEvidence={props.hasImportedEvidence}
              history={props.profileHistory}
              onRestoreSnapshot={props.onRestoreProfileSnapshot}
            />
            <section className={styles.keymapAnalyzer} data-testid="keymap-analyzer" aria-labelledby="keymap-analyzer-title">
              <div className={styles.keymapCopy}>
                <span className={styles.keymapEyebrow}>Profile evidence</span>
                <strong id="keymap-analyzer-title">Analyze this profile’s Neverwinter binds</strong>
                <p>Paste <code>/bind</code> and <code>/unbind</code> lines or choose a text file. Analysis stays local and belongs only to the active profile.</p>
                {props.personalBindCount ? <p className={styles.keymapSource}>Imported source: {props.personalSourceName || "Pasted keymap"}</p> : null}
              </div>
              {!props.personalBindCount ? (
                <div className={styles.keymapEmpty} data-testid="keymap-empty-actions">
                  <div><strong>No imported profile evidence yet</strong><p>Choose how you want to start. BindForge will not label keys unused until you import your current binds.</p></div>
                  <div>
                    <button onClick={() => importRef.current?.focus()} type="button">Import current binds</button>
                    <button onClick={() => setImportPreviewMessage("Started clean. Key availability remains unknown until you import current binds.")} type="button">Start clean</button>
                    <button onClick={props.onAddProfile} type="button">Clone profile</button>
                  </div>
                </div>
              ) : null}
              <textarea aria-label="Paste personal Neverwinter binds" onChange={(event) => { setImportText(event.target.value); setImportPreview(null); setImportPreviewMessage(""); }} placeholder={'/bind r gensendmessage Chat_Reply activate\n/bind ctrl+5 invoke'} ref={importRef} rows={5} value={importText} />
              <div className={styles.keymapActions}>
                <button className={styles.primary} disabled={!importText.trim()} onClick={() => previewImport(importText)} type="button">Preview import</button>
                <label className={styles.fileButton}>Choose bind .txt<input accept=".txt,.cfg,text/plain" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void previewImportFile(file); event.currentTarget.value = ""; }} type="file" /></label>
                <button disabled={!props.personalBindCount} onClick={props.onClearPersonalBinds} type="button">Clear personal keymap</button>
              </div>
              {importPreview ? (
                <div className={styles.importPreview} data-testid="keymap-import-preview">
                  <div className={styles.importPreviewSummary}>
                    <strong>Validation & migration preview</strong>
                    <span>{importPreview.activeBinds.length} active · {importPreview.overwrites.length} overwrites · {importPreview.orphanUnbinds.length} orphan unbinds · {importPreview.ignored.length} ignored</span>
                  </div>
                  {importComparison ? <p>This import would change <strong>{importComparison.importedChanges.length}</strong> active key entries compared with the profile currently stored in My Setup.</p> : null}
                  {importPreview.overwrites.length ? <details><summary>Overwritten earlier binds ({importPreview.overwrites.length})</summary><ul>{importPreview.overwrites.slice(0,20).map((item) => <li key={`${item.key}-${item.next.lineNumber}`}><code>{item.key}</code><span>{item.previous.command} → {item.next.command}</span></li>)}</ul></details> : null}
                  {importPreview.orphanUnbinds.length ? <details><summary>Orphan unbinds ({importPreview.orphanUnbinds.length})</summary><p>These unbind lines did not have a prior bind earlier in this pasted file. They are preserved as cleanup evidence but do not create an active bind.</p></details> : null}
                  {importPreview.ignored.length ? <details><summary>Ignored lines ({importPreview.ignored.length})</summary><code>{importPreview.ignored.slice(0,20).map((item) => `Line ${item.lineNumber}: ${item.raw}`).join("\n")}</code></details> : null}
                  <div className={styles.keymapActions}>
                    <button className={styles.primary} disabled={importPreview.hasBlockingErrors} onClick={confirmImport} type="button">Confirm import</button>
                    <button onClick={() => { setImportPreview(null); setImportPreviewMessage(""); }} type="button">Cancel preview</button>
                  </div>
                </div>
              ) : null}
              <p aria-live="polite" className={styles.importStatus} role="status">{importPreviewMessage || props.personalImportMessage || (props.personalBindCount ? "Personal conflict detection is active." : "No personal keymap has been analyzed for this profile yet.")}</p>
            </section>
          </div>
        ) : null}
      </section>

      {!beginner ? <section className={styles.packPanel} aria-labelledby="pack-tools-title" id="collections">
        <button aria-controls={panelId} aria-expanded={packToolsOpen} className={styles.packSummary} data-gsap-nav onClick={() => setPackToolsOpen((value) => !value)} type="button">
          <span><strong id="pack-tools-title">Selected keybinds</strong><small>Organize selections, review changes, and choose the export format you actually need</small></span>
          <span className={styles.selectionBadge}>{props.selectedCount} selected</span>
          <span aria-hidden="true">{packToolsOpen ? "−" : "+"}</span>
        </button>
        {packToolsOpen ? (
          <div className={styles.packBody} id={panelId} data-testid="pack-tools-panel" data-gsap-enter>
            <div className={styles.packSectionHeading}><span>01</span><div><strong>Collections</strong><p>Save a reusable set or copy a shareable view link.</p></div></div>
            <div className={styles.collectionRow}>
              <label>Collection<select aria-label="Browse collection" onChange={(event) => props.onActiveCollectionChange(event.target.value)} value={props.activeCollection}><option value="all">All presets</option><option value="favourites">Favourites ({props.favouritesCount})</option>{Object.keys(props.collections).sort().map((name) => <option key={name} value={name}>{name} ({props.collections[name].length})</option>)}</select></label>
              <input aria-label="New collection name" onChange={(event) => props.onCollectionNameChange(event.target.value)} placeholder="New collection name" value={props.collectionName} />
              <button disabled={!props.selectedCount || !props.collectionName.trim()} onClick={props.onAddCollection} type="button">Save selected</button>
              <button disabled={props.activeCollection === "all" || props.activeCollection === "favourites"} onClick={props.onRemoveCollection} type="button">Delete collection</button>
              <button onClick={props.onShareView} type="button">Copy share link</button>
            </div>
            <div className={styles.packSectionHeading}><span>02</span><div><strong>Review &amp; export</strong><p>Check conflicts first, then copy or download the exact selected lines.</p></div></div>
            <div className={styles.packActions} aria-label="Selected bind pack">
              <button disabled={!props.visibleCount} onClick={props.onSelectVisible} type="button">Select visible</button>
              <button disabled={!props.selectedCount} onClick={clearSelection} type="button">Clear selection</button>
              <button className={styles.primary} disabled={!props.selectedCount} onClick={() => { setReviewOpen(true); }} type="button">Review selected pack</button>
              <button disabled={!props.selectedCount} onClick={() => props.onCopyPack("bind")} type="button">Copy bind pack</button>
              <button disabled={!props.selectedCount} onClick={() => props.onCopyPack("unbind")} type="button">Copy unbind pack</button>
              <button disabled={!props.selectedCount} onClick={() => props.onDownloadPack("bind")} type="button">Download bind .txt</button>
              <button disabled={!props.selectedCount} onClick={() => props.onDownloadPack("unbind")} type="button">Download unbind .txt</button>
            </div>
            <div className={styles.packSectionHeading}><span>03</span><div><strong>Community sharing</strong><p>Attach a game version before exporting an unverified community artifact.</p></div></div>
            <section className={styles.communityPack} aria-labelledby="community-pack-title">
              <div><strong id="community-pack-title">Versioned community pack</strong><p>Export the selected preset IDs with an explicit Neverwinter version. Nothing is uploaded silently.</p></div>
              <label>Game version / patch<input aria-label="Community pack game version" onChange={(event) => setCommunityPackVersion(event.target.value)} placeholder="Required" value={communityPackVersion} /></label>
              <button disabled={!props.selectedCount || !communityPackVersion.trim()} onClick={() => props.onDownloadCommunityPack(communityPackVersion)} type="button">Download community pack</button>
            </section>
            <div className={styles.packSectionHeading}><span>04</span><div><strong>Neverwinter files</strong><p>Create a loadable file, matching load command, or evidence-based restore.</p></div></div>
            <section className={styles.nativePack} aria-labelledby="native-pack-title">
              <div>
                <strong id="native-pack-title">Neverwinter loadable file</strong>
                <p>Export selected bindings in Cryptic-style keybind-file format, then load the matching filename with <code>/bind_load_file</code>. Saved bind files are associated with the game’s <code>Live</code> install area, but exact paths vary by launcher and installation. Test the file in game because BindForge cannot confirm the client applied it.</p>
                <p><a href="https://neverwinter.fandom.com/wiki/Console_command" rel="noreferrer" target="_blank">Neverwinter command reference</a> · <a href="https://slashmacros.com/macro/neverwinter/save-keybinds" rel="noreferrer" target="_blank">Save/load workflow reference</a></p>
                <code className={styles.nativeFilename}>{props.nativeFilename}</code>
              </div>
              <div className={styles.nativePackActions}>
                <button className={styles.primary} disabled={!props.selectedCount} onClick={props.onDownloadNativePack} type="button">Download Neverwinter file</button>
                <button disabled={!props.selectedCount} onClick={props.onCopyNativeLoadCommand} type="button">Copy /bind_load_file command</button>
                <button disabled={!props.selectedCount || !props.personalBindCount} onClick={props.onDownloadNativeRestore} type="button">Download imported restore</button>
              </div>
              <p aria-live="polite" className={styles.nativeStatus} role="status">{props.nativePackStatus || "Restore export uses only previous bindings found in this profile’s imported keymap; missing history is never guessed."}</p>
            </section>
          </div>
        ) : null}
      </section> : null}

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
                    <div className={styles.changePreview} aria-label={`Current to proposed change for ${item.title}`}>
                      <span><small>Current</small><code>{item.currentEvidence}</code></span>
                      <b aria-hidden="true">→</b>
                      <span><small>Proposed</small><code>{item.line}</code></span>
                    </div>
                    <div className={styles.rollbackPreview}><small>Rollback</small><code>{item.rollbackLine}</code></div>
                  </article>
                ))}
              </div>
              <div className={styles.reviewActions}>
                <button className={styles.primary} onClick={() => props.onCopyPack("bind")} type="button">Copy final bind pack</button>
                <button onClick={() => props.onCopyPack("unbind")} type="button">Copy rollback pack</button>
                <button onClick={() => props.onDownloadPack("bind")} type="button">Download bind .txt</button>
                <button onClick={() => props.onDownloadPack("unbind")} type="button">Download rollback .txt</button>
                <button className={styles.primary} onClick={props.onDownloadNativePack} type="button">Download Neverwinter file</button>
                <button onClick={props.onCopyNativeLoadCommand} type="button">Copy /bind_load_file</button>
                <button disabled={!props.personalBindCount} onClick={props.onDownloadNativeRestore} type="button">Download imported restore</button>
              </div>
              <p aria-live="polite" className={styles.nativeStatus} role="status">{props.nativePackStatus}</p>
            </div>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}
