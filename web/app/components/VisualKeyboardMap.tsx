"use client";

import { useMemo, useState } from "react";
import { keybindPresets } from "../data/keybindPresets";
import {
  buildVisualKeyboardState,
  VISUAL_KEYBOARD_ROWS,
  type VisualKeyboardKeyState,
} from "../lib/visual-keyboard.mjs";
import styles from "./VisualKeyboardMap.module.css";

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
  const model = useMemo(
    () => buildVisualKeyboardState({ presets: keybindPresets, keyValues, personalBinds }),
    [keyValues, personalBinds],
  );

  const selectedKeyId = selection?.profileId === profileId ? selection.keyId : null;
  const selected = selectedKeyId ? model.byKey.get(selectedKeyId) ?? null : null;

  return (
    <section className={styles.section} aria-labelledby="visual-keyboard-title" data-testid="visual-keyboard-map">
      <header className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Visual keymap</span>
          <h3 id="visual-keyboard-title">Keyboard map</h3>
          <p>{characterName} · {profileName}</p>
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
        tabIndex={0}
      >
        <div className={styles.keyboard}>
          {VISUAL_KEYBOARD_ROWS.map((row, rowIndex) => (
            <div className={styles.row} key={rowIndex} role="group" aria-label={`Keyboard row ${rowIndex + 1}`}>
              {row.map((definition) => {
                const key = model.byKey.get(definition.id) as VisualKeyboardKeyState;
                return (
                  <button
                    aria-label={key.accessibleLabel}
                    aria-pressed={selectedKeyId === definition.id}
                    className={styles.key}
                    data-state={key.state}
                    data-testid={`keyboard-key-${definition.id}`}
                    key={definition.id}
                    onClick={() => setSelection({ profileId, keyId: definition.id })}
                    style={{ flexBasis: `${Math.max(44, (definition.width ?? 1) * 46)}px` }}
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
