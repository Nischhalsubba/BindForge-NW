"use client";

import { useMemo, useRef, useState } from "react";
import { useBindForge } from "../BindForgeProvider";
import { buildSayLine, normalizeCombo, normalizeMessage } from "../lib/keybind-core.mjs";
import { copyTextSafely } from "../lib/clipboard";
import { KeyCaptureInput } from "./KeyCaptureInput";
import styles from "./CustomSayBuilder.module.css";

type CopyState = "idle" | "copying" | "copied" | "fallback" | "error";

export function CustomSayBuilder() {
  const { state, updateCustomSay } = useBindForge();
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimer = useRef<number | null>(null);
  const preview = useRef<HTMLElement>(null);
  const cleanKey = normalizeCombo(state.customSay.key);
  const cleanMessage = normalizeMessage(state.customSay.message);
  const command = useMemo(() => buildSayLine(state.customSay.key, state.customSay.message), [state.customSay]);
  const canCopy = Boolean(cleanKey && cleanMessage);
  const messageChanged = state.customSay.message !== cleanMessage;

  async function copyCommand() {
    if (!canCopy) return;
    setCopyState("copying");
    const result = await copyTextSafely(command);
    setCopyState(result.ok ? (result.method === "fallback" ? "fallback" : "copied") : "error");
    if (!result.ok) preview.current?.focus();
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyState("idle"), result.ok ? 2400 : 4200);
  }

  const copyLabel = copyState === "copying"
    ? "Copying…"
    : copyState === "copied" || copyState === "fallback"
      ? "Copied"
      : copyState === "error"
        ? "Try again"
        : "Copy custom message bind";

  return (
    <section className={styles.builder} aria-labelledby="custom-say-title" id="custom-say">
      <div className={styles.intro}><p className={styles.eyebrow}>Custom chat keybind</p><h2 id="custom-say-title">Create your own say message</h2><p>Choose a key and type any message. BindForge keeps the required command syntax intact and updates the preview immediately.</p></div>
      <div className={`${styles.panel} ${copyState === "copied" || copyState === "fallback" ? "is-copied" : ""}`}>
        <div className={styles.fields}>
          <label><span>Key combination</span><KeyCaptureInput aria-label="Custom message key combination" autoComplete="off" onValueChange={(value) => { updateCustomSay({ key: value }); setCopyState("idle"); }} placeholder="Press F1, Numpad7, Ctrl+R…" value={state.customSay.key} /><small>Click the field and press the physical key or combo you want to bind.</small></label>
          <label><span>Message</span><textarea aria-label="Custom say message" maxLength={240} onChange={(event) => { updateCustomSay({ message: event.target.value }); setCopyState("idle"); }} placeholder="Type the message you want Neverwinter to send" rows={4} value={state.customSay.message} /><small>{state.customSay.message.length}/240 characters</small></label>
        </div>
        {messageChanged ? <p className={styles.notice} role="status">Line breaks were converted to spaces and double quotes were replaced with apostrophes so the keybind remains valid.</p> : null}
        <div className={styles.preview}><span>Generated command</span><code ref={preview} tabIndex={0}>{command}</code></div>
        <div className={styles.actions}>
          <button aria-busy={copyState === "copying"} className={`primary-button copy-action copy-action-${copyState}`} disabled={!canCopy || copyState === "copying"} onClick={() => { void copyCommand(); }} type="button">{copyLabel}</button>
          <button className="secondary-button" onClick={() => { updateCustomSay({ key: "f1", message: "ARTIFACTS NOW" }); setCopyState("idle"); }} type="button">Reset example</button>
        </div>
        <p aria-live="polite" className="sr-only">{copyState === "error" ? "Copy failed. Select the generated command manually." : copyState === "idle" || copyState === "copying" ? "" : "Custom message bind copied."}</p>
      </div>
    </section>
  );
}
