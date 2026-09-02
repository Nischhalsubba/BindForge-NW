"use client";

import { useRef, useState } from "react";
import type { KeybindPreset } from "../data/keybindPresets";
import type { CopyResultState } from "../page";
import { Icon } from "./Icon";
import { KeyCaptureInput } from "./KeyCaptureInput";
import styles from "./CompactKeybindRow.module.css";

type CopyHandler = (text: string, label: string, target: HTMLElement | null) => Promise<CopyResultState>;
type CopyState = "idle" | "copying" | CopyResultState;

type SafetyStatus = {
  level: "safe" | "info" | "warn" | "danger";
  message: string;
};

type CompactKeybindRowProps = {
  preset: KeybindPreset;
  selected: boolean;
  favourite: boolean;
  keyValue: string;
  line: string;
  mode: "bind" | "unbind";
  status: SafetyStatus;
  copyDisabled: boolean;
  canReplace: boolean;
  replacementKey: string | null;
  onKeyChange: (value: string) => void;
  onCopy: CopyHandler;
  onSelect: () => void;
  onFavourite: () => void;
  onReset: () => void;
};

function shortSafetyLabel(status: SafetyStatus) {
  if (status.level === "safe") return "No common conflict";
  if (status.level === "danger") return "Conflict detected";
  return "Review this key";
}

export function CompactKeybindRow({
  preset,
  selected,
  favourite,
  keyValue,
  line,
  mode,
  status,
  copyDisabled,
  canReplace,
  replacementKey,
  onKeyChange,
  onCopy,
  onSelect,
  onFavourite,
  onReset,
}: CompactKeybindRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const copyButton = useRef<HTMLButtonElement>(null);
  const detailsId = `${preset.id}-compact-details`;

  async function handleCopy() {
    setCopyState("copying");
    const result = await onCopy(line, preset.title, copyButton.current);
    setCopyState(result);
    window.setTimeout(() => setCopyState("idle"), result === "error" ? 4200 : 2200);
  }

  const copyLabel = copyState === "copying"
    ? "Copying…"
    : copyState === "copied" || copyState === "fallback"
      ? "Copied"
      : copyState === "error"
        ? "Try again"
        : "Copy";

  return (
    <article
      className={`${styles.row} ${selected ? styles.selected : ""} ${copyState === "copied" || copyState === "fallback" ? styles.copied : ""}`}
      data-gsap-enter
      data-preset-id={preset.id}
      data-testid="compact-bind-row"
    >
      <div className={styles.summary}>
        <div className={styles.identity}>
          <div className={styles.meta}>
            <span className={`level-pill level-${preset.difficulty.toLowerCase()}`}>{preset.difficulty}</span>
            <span>{preset.className}</span>
          </div>
          <h4 data-testid="compact-title">{preset.title}</h4>
        </div>

        <label className={styles.keyField}>
          <span>Key combination</span>
          <KeyCaptureInput aria-label={`Key combination for ${preset.title}`} onValueChange={onKeyChange} value={keyValue} />
        </label>

        <div className={`${styles.safety} ${styles[status.level]}`} data-level={status.level}>
          <Icon name="shield" />
          <span>{shortSafetyLabel(status)}</span>
        </div>

        <div className={styles.actions}>
          <button
            aria-label={`${favourite ? "Remove" : "Add"} ${preset.title} ${favourite ? "from" : "to"} favourites`}
            aria-pressed={favourite}
            className={styles.iconButton}
            onClick={onFavourite}
            type="button"
          >
            <Icon name="star" />
          </button>
          <label className={styles.selectControl}>
            <input checked={selected} onChange={onSelect} type="checkbox" />
            <span>Select</span>
          </label>
          <button
            aria-label={`${copyLabel}: ${preset.title}`}
            className={styles.copyButton}
            disabled={copyDisabled || copyState === "copying"}
            onClick={() => { void handleCopy(); }}
            ref={copyButton}
            type="button"
          >
            <Icon name={copyState === "error" ? "warning" : copyState === "copied" || copyState === "fallback" ? "shield" : "copy"} />
            {copyLabel}
          </button>
          <button
            aria-controls={detailsId}
            aria-expanded={expanded}
            className={styles.detailsButton}
            onClick={() => setExpanded((value) => !value)}
            type="button"
          >
            {expanded ? "Hide details" : "Expand details"}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className={styles.details} data-gsap-enter id={detailsId}>
          <div className={styles.description}>
            <p>{preset.plainEnglish}</p>
            <div className={styles.provenance} aria-label="Preset provenance">
              <span>{preset.sourceType ? preset.sourceType.replace("-", " ") : "community"}</span>
              <span>{preset.confidence ? preset.confidence.replace("-", " ") : "unverified"}</span>
              {preset.verifiedAt ? <span>Checked {preset.verifiedAt}</span> : <span>Verification date pending</span>}
              {preset.sourceUrl ? <a href={preset.sourceUrl} rel="noreferrer" target="_blank">Source</a> : null}
            </div>
          </div>

          <div className={styles.commandBlock}>
            <div className={styles.commandLabel}><span>Command preview</span><span>{mode}</span></div>
            <code data-testid="compact-command-preview-output" tabIndex={0}>{line}</code>
          </div>

          <div className={`${styles.fullSafety} ${styles[status.level]}`}>
            <Icon name="shield" />
            <span>{status.message}</span>
          </div>

          <div className={styles.detailActions}>
            {canReplace && replacementKey ? <button data-replacement-key={replacementKey} onClick={() => onKeyChange(replacementKey)} type="button">Use next safer key</button> : null}
            <button onClick={onReset} type="button"><Icon name="reset" /> Reset suggestion</button>
          </div>
        </div>
      ) : null}

      <p aria-live="polite" className="sr-only">
        {copyState === "copied" || copyState === "fallback" ? `${preset.title} copied.` : copyState === "error" ? `Copy failed for ${preset.title}.` : ""}
      </p>
    </article>
  );
}
