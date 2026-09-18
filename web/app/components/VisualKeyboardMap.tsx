"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { keybindPresets } from "../data/keybindPresets";
import {
  buildVisualKeyboardState,
  VISUAL_KEYBOARD_ROWS,
  type VisualKeyboardKeyState,
} from "../lib/visual-keyboard.mjs";
import { getVisualKeyboardRowsForLayout, KEYBOARD_LAYOUTS } from "../lib/keyboard-layouts.mjs";
import styles from "./VisualKeyboardMap.module.css";

const KEYBOARD_LAYOUT_STORAGE_KEY = "bindforge-nw:keyboard-layout:v1";

type PersonalBind = {
  mode: "bind";
  key: string;
  command: string;
  raw: string;
  lineNumber: number;
};

type VisualKeyboardMapProps = {
  characterName: string;
  profileId: string;
  profileName: string;
  keyValues: Record<string, string>;
  personalBinds: PersonalBind[];
};

const stateTokens = {
  unknown: "?",
  available: "✓",
  imported: "I",
  customized: "C",
  conflict: "!",
} as const;

const stateOrder = ["conflict", "customized", "imported", "available", "unknown"] as const;

export function VisualKeyboardMap({
  characterName,
  profileId,
  profileName,
  keyValues,
  personalBinds,
}: VisualKeyboardMapProps) {
  const [selection, setSelection] = useState<{ profileId: string; keyId: string } | null>(null);
  const [focusKeyId, setFocusKeyId] = useState("escape");
  const [layoutId, setLayoutId] = useState("us-ansi");
  const keyRefs = useRef(new Map<string, HTMLButtonElement>());
  const keyboardRows = useMemo(() => getVisualKeyboardRowsForLayout(VISUAL_KEYBOARD_ROWS, layoutId), [layoutId]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(KEYBOARD_LAYOUT_STORAGE_KEY);
        if (saved && KEYBOARD_LAYOUTS.some((layout) => layout.id === saved)) setLayoutId(saved);
      } catch { /* use US ANSI for this session */ }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function changeLayout(value: string) {
    const next = KEYBOARD_LAYOUTS.some((layout) => layout.id === value) ? value : "us-ansi";
    setLayoutId(next);
    try { window.localStorage.setItem(KEYBOARD_LAYOUT_STORAGE_KEY, next); } catch { /* session only */ }
  }
  const model = useMemo(
    () => buildVisualKeyboardState({ presets: keybindPresets, keyValues, personalBinds }),
    [keyValues, personalBinds],
  );

  const selectedKeyId = selection?.profileId === profileId ? selection.keyId : null;
  const selected = selectedKeyId ? model.byKey.get(selectedKeyId) ?? null : null;

  function moveKeyboardFocus(event: KeyboardEvent<HTMLButtonElement>, currentId: string) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;

    let rowIndex = -1;
    let columnIndex = -1;
    keyboardRows.some((row, candidateRowIndex) => {
      const candidateColumnIndex = row.findIndex((key) => key.id === currentId);
      if (candidateColumnIndex < 0) return false;
      rowIndex = candidateRowIndex;
      columnIndex = candidateColumnIndex;
      return true;
    });
    if (rowIndex < 0 || columnIndex < 0) return;

    let targetRowIndex = rowIndex;
    let targetColumnIndex = columnIndex;
    if (event.key === "ArrowLeft") targetColumnIndex = Math.max(0, columnIndex - 1);
    if (event.key === "ArrowRight") targetColumnIndex = Math.min(keyboardRows[rowIndex].length - 1, columnIndex + 1);
    if (event.key === "ArrowUp") targetRowIndex = Math.max(0, rowIndex - 1);
    if (event.key === "ArrowDown") targetRowIndex = Math.min(keyboardRows.length - 1, rowIndex + 1);
    targetColumnIndex = Math.min(targetColumnIndex, keyboardRows[targetRowIndex].length - 1);

    const target = keyboardRows[targetRowIndex][targetColumnIndex];
    if (!target || target.id === currentId) return;

    event.preventDefault();
    setFocusKeyId(target.id);
    keyRefs.current.get(target.id)?.focus();
  }

  return (
    <section className={styles.section} aria-labelledby="visual-keyboard-title" data-testid="visual-keyboard-map">
      <header className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Visual keymap</span>
          <h3 id="visual-keyboard-title">Keyboard map</h3>
          <p>{characterName} · {profileName}</p>
        </div>
        <div className={styles.headingTools}>
          <label className={styles.layoutControl}>
            Keyboard layout
            <select aria-label="Visual keyboard layout" onChange={(event) => changeLayout(event.target.value)} value={layoutId}>
              {KEYBOARD_LAYOUTS.map((layout) => <option key={layout.id} value={layout.id}>{layout.label}</option>)}
            </select>
          </label>
          <p className={styles.layoutNote}>Letter positions adapt to the selected layout. Neverwinter key tokens and punctuation stay canonical, so verify unusual keys in game.</p>
        </div>
        <p className={styles.guidance}>
          {model.hasPersonalKeymap
            ? "Available means the key was not found in the analyzed profile import. Verify in game before assigning it."
            : "Import this profile’s current Neverwinter binds to distinguish available keys from unknown ones."}
        </p>
      </header>

      <div className={styles.summary} aria-label="Keyboard state summary">
        {stateOrder.map((state) => (
          <div className={styles.summaryItem} data-state={state} key={state}>
            <strong>{model.summary[state]}</strong>
            <span>{state.charAt(0).toUpperCase() + state.slice(1)}</span>
          </div>
        ))}
      </div>

      <div className={styles.legend} aria-label="Keyboard map legend">
        <span><b aria-hidden="true">!</b> Conflict</span>
        <span><b aria-hidden="true">C</b> Customized</span>
        <span><b aria-hidden="true">I</b> Imported</span>
        <span><b aria-hidden="true">✓</b> Available</span>
        <span><b aria-hidden="true">?</b> Unknown</span>
      </div>

      <div
        aria-label="Visual keyboard. Scroll horizontally inside this region on narrow screens."
        className={styles.viewport}
        role="region"
      >
        <div className={styles.keyboard}>
          {keyboardRows.map((row, rowIndex) => (
            <div className={styles.row} key={rowIndex} role="group" aria-label={`Keyboard row ${rowIndex + 1}`}>
              {row.map((definition) => {
                const key = model.byKey.get(definition.id) as VisualKeyboardKeyState;
                return (
                  <button
                    aria-label={key.accessibleLabel}
                    aria-pressed={selectedKeyId === definition.id}
                    className={styles.key}
                    data-keyboard-key="true"
                    data-state={key.state}
                    data-testid={`keyboard-key-${definition.id}`}
                    key={definition.id}
                    onClick={() => {
                      setFocusKeyId(definition.id);
                      setSelection({ profileId, keyId: definition.id });
                    }}
                    onFocus={() => setFocusKeyId(definition.id)}
                    onKeyDown={(event) => moveKeyboardFocus(event, definition.id)}
                    ref={(node) => {
                      if (node) keyRefs.current.set(definition.id, node);
                      else keyRefs.current.delete(definition.id);
                    }}
                    style={{ flexBasis: `${Math.max(44, (definition.width ?? 1) * 46)}px` }}
                    tabIndex={focusKeyId === definition.id ? 0 : -1}
                    type="button"
                  >
                    <span className={styles.keyLabel}>{definition.label}</span>
                    <span aria-hidden="true" className={styles.stateToken}>{stateTokens[key.state]}</span>
                    <span className="sr-only">{key.stateLabel}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {model.unmappedAssignments.length ? (
        <p className={styles.unmapped}>
          {model.unmappedAssignments.length} assignment{model.unmappedAssignments.length === 1 ? "" : "s"} use keys outside this keyboard view. They remain in the active profile.
        </p>
      ) : null}

      <KeyDetails selected={selected} />
    </section>
  );
}

function KeyDetails({ selected }: { selected: VisualKeyboardKeyState | null }) {
  if (!selected) {
    return (
      <aside className={styles.details} data-testid="visual-keyboard-details">
        <strong>Select a key to inspect it</strong>
        <p>Each key exposes its state in text as well as visually. No assignment changes are made from this map yet.</p>
      </aside>
    );
  }

  return (
    <aside className={styles.details} data-testid="visual-keyboard-details" aria-live="polite">
      <div className={styles.detailsHeading}>
        <strong>{selected.label} · {selected.stateLabel}</strong>
        <span>{selected.customAssignments.length + selected.importedAssignments.length} assignment{selected.customAssignments.length + selected.importedAssignments.length === 1 ? "" : "s"}</span>
      </div>

      {selected.conflicts.length ? (
        <div className={styles.conflictNotice}>
          <strong>Review before using this key</strong>
          {selected.conflicts.map((conflict, index) => <p key={`${conflict.combo}-${index}`}>{conflict.message}</p>)}
        </div>
      ) : null}

      {selected.customAssignments.length ? (
        <div className={styles.assignmentGroup}>
          <strong>BindForge</strong>
          <ul>
            {selected.customAssignments.map((assignment) => (
              <li key={`${assignment.presetId}-${assignment.combo}`}>
                <code>{assignment.combo}</code>
                <span>{assignment.title}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {selected.importedAssignments.length ? (
        <div className={styles.assignmentGroup}>
          <strong>Imported</strong>
          <ul>
            {selected.importedAssignments.map((assignment, index) => (
              <li key={`${assignment.combo}-${index}`}>
                <code>{assignment.combo}</code>
                <span>{assignment.command}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!selected.customAssignments.length && !selected.importedAssignments.length ? (
        <p>
          {selected.state === "available"
            ? "No assignment for this key was found in the analyzed profile import."
            : "No imported evidence is available for this key yet."}
        </p>
      ) : null}
    </aside>
  );
}
