"use client";

import { useMemo, useRef, useState } from "react";
import { useBindForge } from "../BindForgeProvider";
import { consoleCommands } from "../data/commands";
import { keyCombos } from "../data/keyCombos";
import type { ConsoleCommand } from "../data/commands";
import type { KeyCombo } from "../data/keyCombos";
import { buildCustomLine } from "../lib/keybind-core.mjs";
import type { CopyResultState } from "../page";
import { Icon } from "./Icon";
import { KeyCaptureInput } from "./KeyCaptureInput";

const commandCategories = ["All", ...Array.from(new Set(consoleCommands.map((command) => command.category)))];
const comboCategories = ["All", ...Array.from(new Set(keyCombos.map((combo) => combo.category)))];
const statusLabels: Record<KeyCombo["status"], string> = { core: "Recommended", candidate: "Test first", avoid: "Risky" };
type CopyHandler = (text: string, label: string, target: HTMLElement | null) => Promise<CopyResultState>;
type CopyState = "idle" | "copying" | CopyResultState;

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function commandLabel(command: ConsoleCommand) {
  return `${command.command}${command.params ? ` ${command.params}` : ""}`;
}

export function CommandLab({ onCopy }: { onCopy: CopyHandler }) {
  const { state, updateCommandLab } = useBindForge();
  const preview = useRef<HTMLElement>(null);
  const resetTimer = useRef<number | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const selectedCommand = consoleCommands.find((command) => command.id === state.commandLab.commandId) ?? consoleCommands[0];
  const line = buildCustomLine(state.commandLab.key, selectedCommand.bindCommand, state.commandLab.extraText, state.mode);

  const filteredCommands = useMemo(() => {
    const query = normalizeText(state.commandLab.commandSearch);
    return consoleCommands.filter((command) => {
      const haystack = normalizeText(`${command.command} ${command.bindCommand} ${command.params} ${command.aliases.join(" ")} ${command.category}`);
      return (state.commandLab.commandCategory === "All" || command.category === state.commandLab.commandCategory) && (!query || haystack.includes(query));
    });
  }, [state.commandLab.commandCategory, state.commandLab.commandSearch]);

  const filteredCombos = useMemo(() => {
    const query = normalizeText(state.commandLab.keySearch);
    return keyCombos.filter((combo) => {
      const haystack = normalizeText(`${combo.combo} ${combo.baseKey} ${combo.modifiers.join(" ")} ${combo.category} ${combo.status} ${combo.note ?? ""}`);
      return (state.commandLab.keyCategory === "All" || combo.category === state.commandLab.keyCategory) && (state.commandLab.showRisky || combo.status === "core") && (!query || haystack.includes(query));
    });
  }, [state.commandLab.keyCategory, state.commandLab.keySearch, state.commandLab.showRisky]);

  function chooseCommand(command: ConsoleCommand) {
    updateCommandLab({
      commandId: command.id,
      extraText: command.params && !/[<>]| or | to /i.test(command.params) ? command.params : "",
    });
    setCopyState("idle");
  }

  async function handleCopy() {
    setCopyState("copying");
    const result = await onCopy(line, "command bind", preview.current);
    setCopyState(result);
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyState("idle"), result === "error" ? 4200 : 2200);
  }

  const copyLabel = copyState === "copying"
    ? "Copying…"
    : copyState === "copied" || copyState === "fallback"
      ? "Copied"
      : copyState === "error"
        ? "Try again"
        : "Copy bind";

  return (
    <section className="command-lab" aria-labelledby="command-lab-title" id="command-lab">
      <div className="command-lab-intro">
        <p className="eyebrow">Advanced command builder</p>
        <h2 id="command-lab-title">Build your own command</h2>
        <p>Bind a key to a supported Neverwinter command. Choose from the reference lists below and add arguments only when the selected command needs them.</p>
        <div className={`lab-preview ${copyState === "copied" || copyState === "fallback" ? "is-copied" : ""}`}>
          <span>Generated bind</span>
          <code aria-label="Generated custom command" ref={preview} tabIndex={0}>{line}</code>
          <div className="lab-copy-actions">
            <button className={`primary-button copy-action copy-action-${copyState}`} disabled={copyState === "copying"} onClick={() => { void handleCopy(); }} type="button">
              <Icon name={copyState === "error" ? "warning" : copyState === "copied" || copyState === "fallback" ? "shield" : "copy"} /> {copyLabel}
            </button>
          </div>
          <p aria-live="polite" className="sr-only">{copyState === "copied" || copyState === "fallback" ? "Command bind copied." : copyState === "error" ? "Copy failed for the command bind." : ""}</p>
        </div>
      </div>

      <div className="lab-builder">
        <div className="lab-fields">
          <label className="key-field">
            <span>Choose a key</span>
            <KeyCaptureInput aria-label="Command Lab key combination" autoComplete="off" onValueChange={(value) => { updateCommandLab({ key: value }); setCopyState("idle"); }} value={state.commandLab.key} />
          </label>
          <label className="key-field">
            <span>Command arguments</span>
            <input aria-label="Command Lab extra command text" autoComplete="off" onChange={(event) => { updateCommandLab({ extraText: event.target.value }); setCopyState("idle"); }} placeholder={selectedCommand.params || "Optional arguments"} value={state.commandLab.extraText} />
          </label>
        </div>

        <div className="reference-grid">
          <section className="reference-panel" aria-labelledby="key-combinations-title">
            <div className="reference-heading">
              <div>
                <h3 id="key-combinations-title">Known key combinations</h3>
                <p aria-live="polite">{filteredCombos.length} shown</p>
              </div>
              <label className="checkbox-label">
                <input checked={state.commandLab.showRisky} onChange={(event) => updateCommandLab({ showRisky: event.target.checked })} type="checkbox" /> Include risky
              </label>
            </div>
            <div className="reference-controls">
              <input aria-label="Search key combinations" autoComplete="off" onChange={(event) => updateCommandLab({ keySearch: event.target.value })} placeholder="Search keys" type="search" value={state.commandLab.keySearch} />
              <select aria-label="Filter key combinations by category" onChange={(event) => updateCommandLab({ keyCategory: event.target.value })} value={state.commandLab.keyCategory}>
                {comboCategories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>
            <div className="reference-list">
              {filteredCombos.length ? filteredCombos.map((combo) => (
                <button aria-pressed={state.commandLab.key === combo.combo} className="reference-row" key={combo.combo} onClick={() => { updateCommandLab({ key: combo.combo }); setCopyState("idle"); }} type="button">
                  <span>{combo.combo}</span>
                  <strong data-status={combo.status}>{statusLabels[combo.status]}</strong>
                </button>
              )) : <p className="reference-empty" role="status">No key combinations match these filters.</p>}
            </div>
          </section>

          <section className="reference-panel" aria-labelledby="wiki-commands-title">
            <div className="reference-heading">
              <div>
                <h3 id="wiki-commands-title">Supported commands</h3>
                <p aria-live="polite">{filteredCommands.length} shown</p>
              </div>
            </div>
            <div className="reference-controls">
              <input aria-label="Search wiki commands" autoComplete="off" onChange={(event) => updateCommandLab({ commandSearch: event.target.value })} placeholder="Search commands" type="search" value={state.commandLab.commandSearch} />
              <select aria-label="Filter commands by category" onChange={(event) => updateCommandLab({ commandCategory: event.target.value })} value={state.commandLab.commandCategory}>
                {commandCategories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>
            <div className="reference-list">
              {filteredCommands.length ? filteredCommands.map((command) => (
                <button aria-pressed={selectedCommand.id === command.id} className="reference-row command-row" key={`${command.id}-${command.category}-${command.params}`} onClick={() => chooseCommand(command)} type="button">
                  <span>{command.command}</span>
                  <small>{commandLabel(command)}</small>
                </button>
              )) : <p className="reference-empty" role="status">No supported commands match these filters.</p>}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
