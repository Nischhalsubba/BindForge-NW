"use client";

import { memo, useRef, useState } from "react";
import type { KeybindPreset } from "../data/keybindPresets";
import { buildPresetLine } from "../lib/keybind-core.mjs";
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
  duplicate: boolean;
  selected: boolean;
  favourite: boolean;
  status: KeybindSafetyStatus;
  canReplace: boolean;
  query: string;
  onKeyChange: (value: string) => void;
  onCopy: CopyHandler;
  onSelect: () => void;
  onFavourite: () => void;
  onReplace: () => void;
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

function copyLabel(state: CopyState, idle: string) {
  if (state === "copying") return "Copying…";
  if (state === "copied" || state === "fallback") return "Copied";
  if (state === "error") return "Try again";
  return idle;
}

function KeybindCardComponent(props: KeybindCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [bindCopyState, setBindCopyState] = useState<CopyState>("idle");
  const [unbindCopyState, setUnbindCopyState] = useState<CopyState>("idle");
  const preview = useRef<HTMLElement>(null);
  const timer = useRef<number | null>(null);
  const bindLine = buildPresetLine(props.preset, props.keyValue, "bind");
  const unbindLine = buildPresetLine(props.preset, props.keyValue, "unbind");
  const detailsId = `${props.preset.id}-details`;

  function resetCopyStateAfter(result: CopyResultState) {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setBindCopyState("idle");
      setUnbindCopyState("idle");
    }, result === "error" ? 4200 : 2200);
  }

  async function handleBindCopy() {
    setBindCopyState("copying");
    setUnbindCopyState("idle");
    const result = await props.onCopy(bindLine, `${props.preset.title} full bind`, preview.current);
    setBindCopyState(result);
    resetCopyStateAfter(result);
  }

  async function handleUnbindCopy() {
    setUnbindCopyState("copying");
    setBindCopyState("idle");
    const result = await props.onCopy(unbindLine, `${props.preset.title} unbind key`, preview.current);
    setUnbindCopyState(result);
    resetCopyStateAfter(result);
  }

  const bindLabel = copyLabel(bindCopyState, "Copy full command");
  const unbindLabel = copyLabel(unbindCopyState, "Copy unbind key");
  const copied = bindCopyState === "copied" || bindCopyState === "fallback" || unbindCopyState === "copied" || unbindCopyState === "fallback";
  const copyError = bindCopyState === "error" || unbindCopyState === "error";

  return (
    <article className={`bind-card ${props.selected ? "is-selected" : ""} ${copied ? "is-copied" : ""}`} data-gsap-enter data-preset-id={props.preset.id}>
      <header className="card-header">
        <div className="card-meta">
          <span className={`level-pill level-${props.preset.difficulty.toLowerCase()}`}>{props.preset.difficulty}</span>
          <span>{props.preset.className}</span>
        </div>
        <div className="card-header-actions">
          <button aria-label={`${props.favourite ? "Remove" : "Add"} ${props.preset.title} ${props.favourite ? "from" : "to"} favourites`} aria-pressed={props.favourite} className="icon-text-button" onClick={props.onFavourite} type="button">{props.favourite ? "★" : "☆"}</button>
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

      <div className="card-actions card-primary-actions has-unbind-copy">
        <button aria-label={`${bindLabel}: ${props.preset.title}`} className={`primary-button copy-action copy-action-${bindCopyState}`} disabled={props.duplicate || bindCopyState === "copying" || unbindCopyState === "copying"} onClick={() => { void handleBindCopy(); }} type="button">
          <Icon name={bindCopyState === "error" ? "warning" : bindCopyState === "copied" || bindCopyState === "fallback" ? "shield" : "copy"} /> {bindLabel}
        </button>
        <button aria-label={`${unbindLabel}: ${props.preset.title}`} className="secondary-button original-bind-copy" disabled={unbindCopyState === "copying" || bindCopyState === "copying"} onClick={() => { void handleUnbindCopy(); }} type="button">
          <Icon name={unbindCopyState === "error" ? "warning" : unbindCopyState === "copied" || unbindCopyState === "fallback" ? "shield" : "copy"} /> {unbindLabel}
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
            <div className="command-label"><span>Full bind command</span><span>Primary</span></div>
            <code data-testid="command-preview-output" ref={preview} tabIndex={0}>{bindLine}</code>
            <div className="unbind-context">
              <span>Unbind this key only</span>
              <code data-testid="unbind-command-output">{unbindLine}</code>
            </div>
          </div>
          <div className="card-actions card-detail-actions">
            {props.canReplace ? <button className="replacement-button" onClick={props.onReplace} type="button">Use next safer key</button> : null}
            <button className="secondary-button" onClick={props.onReset} type="button"><Icon name="reset" /> Reset suggestion</button>
          </div>
        </div>
      ) : null}

      <p aria-live="polite" className="sr-only">{copied ? `${props.preset.title} copied.` : copyError ? `Copy failed for ${props.preset.title}.` : ""}</p>
    </article>
  );
}

export const KeybindCard = memo(KeybindCardComponent);
