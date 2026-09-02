"use client";

import { memo, useRef, useState } from "react";
import type { KeybindPreset } from "../data/keybindPresets";
import { buildPresetLine, normalizeCombo } from "../lib/keybind-core.mjs";
import { SAFE_KEY_SUGGESTIONS } from "../lib/safe-key-suggestions";
import type { CopyResultState } from "../page";
import { Icon } from "./Icon";
import { KeyCaptureInput } from "./KeyCaptureInput";

export type KeybindSafetyStatus = {
  level: "safe" | "info" | "warn" | "danger";
  message: string;
};

type CopyHandler = (text: string, label: string, target: HTMLElement | null) => Promise<CopyResultState>;
type CopyState = "idle" | "copying" | CopyResultState;

type KeybindCardProps = {
  preset: KeybindPreset;
  keyValue: string;
  mode: "bind" | "unbind";
  duplicate: boolean;
  selected: boolean;
  favourite: boolean;
  status: KeybindSafetyStatus;
  canReplace: boolean;
  replacementKey?: string | null;
  query: string;
  onKeyChange: (value: string) => void;
  onCopy: CopyHandler;
  onSelect: () => void;
  onFavourite: () => void;
  onReset: () => void;
};

function highlight(value: string, query: string) {
  const needle = query.trim();
  if (!needle) return value;
  const expression = new RegExp(`(${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  return value.split(expression).map((part, index) =>
    part.toLowerCase() === needle.toLowerCase() ? <mark key={`${part}-${index}`}>{part}</mark> : part,
  );
}

function provenanceLabel(preset: KeybindPreset) {
  const source = preset.sourceType ? preset.sourceType.replace("-", " ") : "community";
  const confidence = preset.confidence ? preset.confidence.replace("-", " ") : "unverified";
  return `${source} · ${confidence}`;
}

function KeybindCardComponent(props: KeybindCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const preview = useRef<HTMLElement>(null);
  const timer = useRef<number | null>(null);
  const line = buildPresetLine(props.preset, props.keyValue, props.mode);
  const detailsId = `${props.preset.id}-details`;
  const currentKey = normalizeCombo(props.keyValue);
  const directReplacement = props.replacementKey && normalizeCombo(props.replacementKey) !== currentKey
    ? props.replacementKey
    : SAFE_KEY_SUGGESTIONS.find((candidate) => normalizeCombo(candidate) !== currentKey) ?? null;

  async function handleCopy() {
    setCopyState("copying");
    const result = await props.onCopy(line, props.preset.title, preview.current);
    setCopyState(result);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopyState("idle"), result === "error" ? 4200 : 2200);
  }

  const copyLabel = copyState === "copying"
    ? "Copying…"
    : copyState === "copied" || copyState === "fallback"
      ? "Copied"
      : copyState === "error"
        ? "Try again"
        : "Copy command";

  return (
    <article className={`bind-card ${props.selected ? "is-selected" : ""} ${copyState === "copied" || copyState === "fallback" ? "is-copied" : ""}`} data-gsap-enter data-preset-id={props.preset.id}>
      <header className="card-header">
        <div className="card-meta">
          <span className={`level-pill level-${props.preset.difficulty.toLowerCase()}`}>{props.preset.difficulty}</span>
          <span>{props.preset.className}</span>
        </div>
        <div className="card-header-actions">
          <button aria-label={`${props.favourite ? "Remove" : "Add"} ${props.preset.title} ${props.favourite ? "from" : "to"} favourites`} aria-pressed={props.favourite} className="icon-text-button favourite-button" onClick={props.onFavourite} type="button"><Icon filled={props.favourite} name="star" /></button>
          <label className="select-preset"><input checked={props.selected} onChange={props.onSelect} type="checkbox" /><span>Select</span></label>
        </div>
      </header>

      <div className="card-copy">
        <h4>{highlight(props.preset.title, props.query)}</h4>
        <p>{highlight(props.preset.plainEnglish, props.query)}</p>
      </div>

      <label className="key-field">
        <span>Key combination</span>
        <KeyCaptureInput aria-label={`Key combination for ${props.preset.title}`} onValueChange={props.onKeyChange} value={props.keyValue} />
      </label>

      <div className={`key-status status-${props.status.level}`}>
        <Icon name="shield" />
        <span>{props.status.message}</span>
      </div>

      <div className="card-actions card-primary-actions">
        <button aria-label={`${copyLabel}: ${props.preset.title}`} className={`primary-button copy-action copy-action-${copyState}`} disabled={props.duplicate || copyState === "copying"} onClick={() => { void handleCopy(); }} type="button">
          <Icon name={copyState === "error" ? "warning" : copyState === "copied" || copyState === "fallback" ? "shield" : "copy"} /> {copyLabel}
        </button>
        <button aria-controls={detailsId} aria-expanded={detailsOpen} className="secondary-button" onClick={() => setDetailsOpen((value) => !value)} type="button">
          {detailsOpen ? "Hide details" : "Details"}
        </button>
      </div>

      {detailsOpen ? (
        <div className="card-details" data-gsap-enter id={detailsId}>
          <div className="provenance-row" aria-label="Preset provenance">
            <span>{provenanceLabel(props.preset)}</span>
            {props.preset.verifiedAt ? <span>Checked {props.preset.verifiedAt}</span> : <span>Verification date pending</span>}
            {props.preset.sourceUrl ? <a href={props.preset.sourceUrl} rel="noreferrer" target="_blank">Source</a> : <span>Community source</span>}
          </div>
          <div className="command-preview">
            <div className="command-label"><span>Command preview</span><span>{props.mode}</span></div>
            <code data-testid="command-preview-output" ref={preview} tabIndex={0}>{line}</code>
          </div>
          <div className="card-actions card-detail-actions">
            {props.canReplace && directReplacement ? <button className="replacement-button" data-replacement-key={directReplacement} onClick={() => props.onKeyChange(directReplacement)} type="button">Use next safer key</button> : null}
            <button className="secondary-button" onClick={props.onReset} type="button"><Icon name="reset" /> Reset suggestion</button>
          </div>
        </div>
      ) : null}

      <p aria-live="polite" className="sr-only">{copyState === "copied" || copyState === "fallback" ? `${props.preset.title} copied.` : copyState === "error" ? `Copy failed for ${props.preset.title}.` : ""}</p>
    </article>
  );
}

export const KeybindCard = memo(KeybindCardComponent);
