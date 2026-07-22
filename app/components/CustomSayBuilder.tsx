"use client";

import { useMemo, useRef, useState } from "react";
import { buildSayLine, normalizeCombo, normalizeMessage } from "../lib/keybind-core.mjs";
import { copyTextSafely } from "../lib/clipboard";
import styles from "./CustomSayBuilder.module.css";

type CopyState = "idle" | "copied" | "fallback" | "error";

export function CustomSayBuilder() {
  const [keyValue, setKeyValue] = useState("f1");
  const [message, setMessage] = useState("ARTIFACTS NOW");
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimer = useRef<number | null>(null);

  const cleanKey = normalizeCombo(keyValue);
  const cleanMessage = normalizeMessage(message);
  const command = useMemo(() => buildSayLine(keyValue, message), [keyValue, message]);

  const canCopy = Boolean(cleanKey && cleanMessage);
  const messageChanged = message !== cleanMessage;

  async function copyCommand() {
    if (!canCopy) return;

    const result = await copyTextSafely(command);
    setCopyState(result.ok ? (result.method === "fallback" ? "fallback" : "copied") : "error");

    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyState("idle"), 2400);
  }

  const copyLabel =
    copyState === "copied"
      ? "Copied custom bind"
      : copyState === "fallback"
        ? "Copied with browser fallback"
        : copyState === "error"
          ? "Copy failed — select the command manually"
          : "Copy custom message bind";

  return (
    <section className={styles.builder} aria-labelledby="custom-say-title">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Custom chat keybind</p>
        <h2 id="custom-say-title">Create your own say message</h2>
        <p>
          Choose a key and type any message. BindForge keeps the required command
          syntax intact and updates the preview immediately.
        </p>
      </div>

      <div className={styles.panel}>
        <div className={styles.fields}>
          <label>
            <span>Key combination</span>
            <input
              autoComplete="off"
              data-bindforge-custom-say="key"
              onChange={(event) => setKeyValue(event.target.value)}
              placeholder="F1, Numpad7, Ctrl+R"
              spellCheck={false}
              value={keyValue}
            />
            <small>Use a key that is not already important to your controls.</small>
          </label>

          <label>
            <span>Message</span>
            <textarea
              data-bindforge-custom-say="message"
              maxLength={240}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type the message you want Neverwinter to send"
              rows={4}
              value={message}
            />
            <small>{message.length}/240 characters</small>
          </label>
        </div>

        {messageChanged ? (
          <p className={styles.notice} role="status">
            Line breaks were converted to spaces and double quotes were replaced
            with apostrophes so the keybind remains valid.
          </p>
        ) : null}

        <div className={styles.preview}>
          <span>Generated command</span>
          <code tabIndex={copyState === "error" ? 0 : undefined}>{command}</code>
        </div>

        <div className={styles.actions}>
          <button
            className="primary-button"
            disabled={!canCopy}
            onClick={copyCommand}
            type="button"
          >
            {copyLabel}
          </button>
          <button
            className="secondary-button"
            onClick={() => {
              setKeyValue("f1");
              setMessage("ARTIFACTS NOW");
              setCopyState("idle");
            }}
            type="button"
          >
            Reset example
          </button>
        </div>
        <p aria-live="polite" className="sr-only">
          {copyState === "error" ? "Copy failed. Select the generated command manually." : copyState === "idle" ? "" : copyLabel}
        </p>
      </div>
    </section>
  );
}
