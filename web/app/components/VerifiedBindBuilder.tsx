"use client";

import { useMemo, useRef, useState } from "react";
import { observedWorkingBindFragments, verifiedActionCategories, verifiedKeybindActions } from "../data/verifiedKeybindActions";
import { buildCommandChain, sanitizeBindFragment, validateCustomFragment } from "../lib/command-chain.mjs";
import type { CopyResultState } from "../page";
import { Icon } from "./Icon";
import { KeyCaptureInput } from "./KeyCaptureInput";
import styles from "./VerifiedBindBuilder.module.css";

type CopyHandler = (text: string, label: string, target: HTMLElement | null) => Promise<CopyResultState>;
type ChainItem = {
  instanceId: number;
  label: string;
  fragment: string;
  source: "settings-screenshot" | "user-provided-working-bind" | "custom";
};

export function VerifiedBindBuilder({ onCopy }: { onCopy: CopyHandler }) {
  const [keyValue, setKeyValue] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [chain, setChain] = useState<ChainItem[]>([]);
  const [customFragment, setCustomFragment] = useState("");
  const [customError, setCustomError] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copying" | CopyResultState>("idle");
  const nextId = useRef(1);
  const preview = useRef<HTMLElement>(null);

  const filteredActions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return verifiedKeybindActions.filter((action) => {
      const matchesCategory = category === "All" || action.category === category;
      const haystack = `${action.label} ${action.manualCommand} ${action.bindFragment} ${action.category}`.toLowerCase();
      return matchesCategory && (!query || haystack.includes(query));
    });
  }, [category, search]);

  const line = buildCommandChain(keyValue, chain.map((item) => item.fragment));
  const canCopy = Boolean(keyValue.trim() && chain.length);

  function addItem(label: string, fragment: string, source: ChainItem["source"]) {
    setChain((current) => [...current, { instanceId: nextId.current++, label, fragment, source }]);
    setCopyState("idle");
  }

  function moveItem(index: number, direction: -1 | 1) {
    setChain((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setCopyState("idle");
  }

  function removeItem(instanceId: number) {
    setChain((current) => current.filter((item) => item.instanceId !== instanceId));
    setCopyState("idle");
  }

  function addCustom() {
    const validation = validateCustomFragment(customFragment);
    if (!validation.ok) {
      setCustomError(validation.message);
      return;
    }
    const fragment = sanitizeBindFragment(customFragment);
    addItem("Custom fragment", fragment, "custom");
    setCustomFragment("");
    setCustomError("");
  }

  function reset() {
    setKeyValue("");
    setSearch("");
    setCategory("All");
    setChain([]);
    setCustomFragment("");
    setCustomError("");
    setCopyState("idle");
  }

  async function copyLine() {
    if (!canCopy) return;
    setCopyState("copying");
    const result = await onCopy(line, "combined keybind", preview.current);
    setCopyState(result);
  }

  const copyLabel = copyState === "copying"
    ? "Copying…"
    : copyState === "copied" || copyState === "fallback"
      ? "Copied"
      : copyState === "error"
        ? "Try again"
        : "Copy keybind";

  return (
    <section className={styles.builder} id="verified-bind-builder" aria-labelledby="verified-bind-builder-title">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Verified custom builder</p>
          <h2 id="verified-bind-builder-title">Compose your own keybind</h2>
          <p className={styles.intro}>Choose a key, stack screenshot-verified Neverwinter actions in the order you want, and the builder inserts the <code>$$</code> chain syntax for you.</p>
        </div>
        <div className={styles.verificationBadge}><Icon name="shield" /><span><strong>{verifiedKeybindActions.length}</strong> screenshot-verified actions</span></div>
      </header>

      <div className={styles.keyAndPreview}>
        <section className={styles.keyPanel} aria-labelledby="bind-key-title">
          <div className={styles.panelHeading}>
            <span>01</span>
            <div><h3 id="bind-key-title">Assign a key</h3><p>Press a keyboard key or type the exact Neverwinter key token.</p></div>
          </div>
          <KeyCaptureInput
            aria-label="Key for combined Neverwinter bind"
            autoComplete="off"
            hint="Keyboard capture is available. For mouse or uncommon keys, enter the exact Neverwinter token; no token is guessed."
            onValueChange={(value) => { setKeyValue(value); setCopyState("idle"); }}
            placeholder="Press a key or enter a Neverwinter token"
            value={keyValue}
          />
          <div className={styles.quickKeys}>
            <button onClick={() => { setKeyValue("lbutton"); setCopyState("idle"); }} type="button">Left mouse <code>lbutton</code></button>
            <small><Icon name="check" /> <code>lbutton</code> is directly observed in the working bind supplied for this project.</small>
          </div>
        </section>

        <section className={styles.previewPanel} aria-labelledby="bind-preview-title">
          <div className={styles.panelHeading}>
            <span>03</span>
            <div><h3 id="bind-preview-title">Generated bind</h3><p>Nothing is emitted until both a key and at least one command are present.</p></div>
          </div>
          <code className={styles.preview} ref={preview} tabIndex={0}>{line}</code>
          <div className={styles.previewActions}>
            <button className={styles.copyButton} disabled={!canCopy || copyState === "copying"} onClick={() => { void copyLine(); }} type="button"><Icon name="copy" /> {copyLabel}</button>
            <button className={styles.resetButton} onClick={reset} type="button"><Icon name="reset" /> Reset builder</button>
          </div>
          <p className={styles.syntaxNote}>One action uses the normal single-command bind form. Two or more actions are quoted and joined with <code>$$</code>.</p>
        </section>
      </div>

      <div className={styles.composeGrid}>
        <section className={styles.catalogPanel} aria-labelledby="verified-actions-title">
          <div className={styles.panelHeading}>
            <span>02</span>
            <div><h3 id="verified-actions-title">Add verified actions</h3><p>Only mappings captured directly from the in-game Settings tooltips appear here.</p></div>
          </div>
          <div className={styles.filters}>
            <label><span>Search</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Action or command" /></label>
            <label><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{verifiedActionCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          <div className={styles.resultMeta}><span>{filteredActions.length} actions shown</span><span>Duplicates allowed</span></div>
          <div className={styles.actionList}>
            {filteredActions.map((action) => (
              <button className={styles.actionRow} key={action.id} onClick={() => addItem(action.label, action.bindFragment, "settings-screenshot")} type="button">
                <span><strong>{action.label}</strong><small>{action.category}</small></span>
                <code>{action.bindFragment}</code>
                <b aria-hidden="true">+</b>
              </button>
            ))}
            {!filteredActions.length ? <p className={styles.empty}>No verified action matches these filters.</p> : null}
          </div>
        </section>

        <section className={styles.chainPanel} aria-labelledby="command-chain-title">
          <div className={styles.panelHeading}>
            <span>→</span>
            <div><h3 id="command-chain-title">Command chain</h3><p>Execution order runs from top to bottom.</p></div>
          </div>
          <ol className={styles.chainList}>
            {chain.map((item, index) => (
              <li key={item.instanceId}>
                <span className={styles.order}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.chainIdentity}><strong>{item.label}</strong><code>{item.fragment}</code><small data-source={item.source}>{item.source === "settings-screenshot" ? "Screenshot verified" : item.source === "user-provided-working-bind" ? "Observed working bind" : "Custom / unverified"}</small></span>
                <span className={styles.chainActions}>
                  <button aria-label={`Move ${item.label} up`} disabled={index === 0} onClick={() => moveItem(index, -1)} type="button">↑</button>
                  <button aria-label={`Move ${item.label} down`} disabled={index === chain.length - 1} onClick={() => moveItem(index, 1)} type="button">↓</button>
                  <button aria-label={`Remove ${item.label}`} onClick={() => removeItem(item.instanceId)} type="button"><Icon name="close" /></button>
                </span>
              </li>
            ))}
          </ol>
          {!chain.length ? <div className={styles.chainEmpty}><Icon name="code" /><strong>No actions added yet</strong><span>Choose commands from the verified catalogue on the left.</span></div> : null}

          <details className={styles.advanced}>
            <summary>Advanced exact fragment</summary>
            <p>Use this only when you already know the exact fragment. Custom values are kept separate from screenshot-verified actions and are never presented as verified.</p>
            <div className={styles.customRow}>
              <input aria-label="Exact custom bind fragment" value={customFragment} onChange={(event) => { setCustomFragment(event.target.value); setCustomError(""); }} placeholder="Example: ++actionleft" />
              <button onClick={addCustom} type="button">Add exact fragment</button>
            </div>
            {customError ? <p className={styles.error} role="alert">{customError}</p> : null}
            <div className={styles.observed}>
              <span>Observed in supplied working bind:</span>
              {observedWorkingBindFragments.map((item) => <button key={item.id} onClick={() => addItem(item.label, item.fragment, "user-provided-working-bind")} type="button"><code>{item.fragment}</code></button>)}
            </div>
          </details>
        </section>
      </div>
    </section>
  );
}
