"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_COMMAND_ACTIONS, filterCommandActions, type CommandAction } from "../lib/command-palette.mjs";
import styles from "./CommandPalette.module.css";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const actions = useMemo(() => filterCommandActions(DEFAULT_COMMAND_ACTIONS, query), [query]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) {
      if (previousFocus.current) window.requestAnimationFrame(() => previousFocus.current?.focus());
      return;
    }
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  function execute(action: CommandAction) {
    setOpen(false);
    setQuery("");
    if (action.action === "settings") {
      window.requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('button[aria-controls="app-settings-panel"]')?.click());
      return;
    }
    if (action.hash) {
      window.history.pushState(null, "", action.hash);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
      if (action.id === "search") {
        window.setTimeout(() => document.querySelector<HTMLInputElement>('input[aria-label="Search keybind library"]')?.focus(), 0);
      }
    }
  }

  const dialog = open && typeof document !== "undefined" ? createPortal(
    <div className={styles.layer}>
      <button aria-label="Close command palette" className={styles.backdrop} onClick={() => setOpen(false)} type="button" />
      <section aria-labelledby="command-palette-title" aria-modal="true" className={styles.panel} role="dialog">
        <header><div><span>Power user shortcut</span><h2 id="command-palette-title">Command palette</h2></div><button aria-label="Close command palette" onClick={() => setOpen(false)} type="button">×</button></header>
        <input aria-label="Search command palette" onChange={(event) => setQuery(event.target.value)} placeholder="Search actions…" ref={inputRef} value={query} />
        <div className={styles.actions}>
          {actions.map((action) => <button key={action.id} onClick={() => execute(action)} type="button"><strong>{action.label}</strong><small>{action.id === "settings" ? "Settings" : action.hash}</small></button>)}
          {!actions.length ? <p>No matching actions.</p> : null}
        </div>
        <footer><span><kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd></span><span><kbd>Esc</kbd> closes</span></footer>
      </section>
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <button aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K" className={styles.trigger} onClick={() => setOpen(true)} type="button">⌘K</button>
      {dialog}
    </>
  );
}
