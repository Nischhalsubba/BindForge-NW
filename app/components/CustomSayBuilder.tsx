"use client";

import { useMemo, useState } from "react";
import styles from "./CustomSayBuilder.module.css";

function normalizeKey(value: string) {
  return value.trim().replace(/\s*\+\s*/g, "+").replace(/\s+/g, "");
}

function normalizeMessage(value: string) {
  return value.replace(/\s+/g, " ").replace(/"/g, "'").trim();
}

export function CustomSayBuilder() {
  const [keyValue, setKeyValue] = useState("f1");
  const [message, setMessage] = useState("ARTIFACTS NOW");
  const [copied, setCopied] = useState(false);

  const cleanKey = normalizeKey(keyValue);
  const cleanMessage = normalizeMessage(message);
  const command = useMemo(
    () => `/bind ${cleanKey || "<key>"} "say ${cleanMessage || "<message>"}"`,
    [cleanKey, cleanMessage],
  );

  const canCopy = Boolean(cleanKey && cleanMessage);
  const messageChanged = message !== cleanMessage;

  async function copyCommand() {
    if (!canCopy) return;
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

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
          <code>{command}</code>
        </div>

        <div className={styles.actions}>
          <button
            className="primary-button"
            disabled={!canCopy}
            onClick={copyCommand}
            type="button"
          >
            {copied ? "Copied custom bind" : "Copy custom message bind"}
          </button>
          <button
            className="secondary-button"
            onClick={() => {
              setKeyValue("f1");
              setMessage("ARTIFACTS NOW");
            }}
            type="button"
          >
            Reset example
          </button>
        </div>
      </div>
    </section>
  );
}
