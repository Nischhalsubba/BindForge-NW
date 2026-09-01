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

function labelFor(state: CopyState, idle: string) {
  if (state === "copying") return "Copying…";
  if (state === "copied" || state === "fallback") return "Copied";
  if (state === "error") return "Try again";
  return idle;
}

export function CommandLab({ onCopy }: { onCopy: CopyHandler }) {
  const { state, updateCommandLab } = useBindForge();
  const preview = useRef<HTMLElement>(null);
  const resetTimer = useRef<number | null>(null);
  const [bindCopyState, setBindCopyState] = useState<CopyState>("idle");
  const [unbindCopyState, setUnbindCopyState] = useState<CopyState>("idle");
  const selectedCommand = consoleCommands.find((command) => command.id === state.commandLab.commandId) ?? consoleCommands[0];
  const bindLine = buildCustomLine(state.commandLab.key, selectedCommand.bindCommand, state.commandLab.extraText, "bind");
  const unbindLine = buildCustomLine(state.commandLab.key, selectedCommand.bindCommand, state.commandLab.extraText, "unbind");

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
    setBindCopyState("idle");
    setUnbindCopyState("idle");
  }

  function resetCopyStateAfter(result: CopyResultState) {
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => {
      setBindCopyState("idle");
      setUnbindCopyState("idle");
    }, result === "error" ? 4200 : 2200);
  }

  async function handleBindCopy() {
    setBindCopyState("copying");
    setUnbindCopyState("idle");
    const result = await onCopy(bindLine, "custom full bind", preview.current);
    setBindCopyState(result);
    resetCopyStateAfter(result);
  }

  async function handleUnbindCopy() {
    setUnbindCopyState("copying");
    setBindCopyState("idle");
    const result = await onCopy(unbindLine, "custom unbind key", preview.current);
    setUnbindCopyState(result);
    resetCopyStateAfter(result);
  }

  const bindLabel = labelFor(bindCopyState, "Copy full command");
  const unbindLabel = labelFor(unbindCopyState, "Copy unbind key");
  const copied = bindCopyState === "copied" || bindCopyState === "fallback" || unbindCopyState === "copied" || unbindCopyState === "fallback";

  return (
    <section className="command-lab" aria-labelledby="command-lab-title" id="command-lab">
      <div className="command-lab-intro">
        <p className="eyebrow">Advanced workspace</p>
        <h2 id="command-lab-title">Build your own command</h2>
        <p>Combine a supported key with any catalog command. Test carefully; community commands may change after patches.</p>
        <div className={`lab-preview ${copied ? "is-copied" : ""}`}>
          <span>Generated full bind</span>
          <code aria-label="Generated custom command" ref={preview} tabIndex={0}>{bindLine}</code>
          <div className="unbind-context"><span>Unbind this key only</span><code>{unbindLine}</code></div>
          <div className="lab-copy-actions">
            <button className={`primary-button copy-action copy-action-${bindCopyState}`} disabled={bindCopyState === "copying" || unbindCopyState === "copying"} onClick={() => { void handleBindCopy(); }} type="button">
              <Icon name={bindCopyState === "error" ? "warning" : bindCopyState === "copied" || bindCopyState === "fallback" ? "shield" : "copy"} /> {bindLabel}
            </button>
            <button className="secondary-button" disabled={unbindCopyState === "copying" || bindCopyState === "copying"} onClick={() => { void handleUnbindCopy(); }} type="button"><Icon name={unbindCopyState === "error" ? "warning" : unbindCopyState === "copied" || unbindCopyState === "fallback" ? "shield" : "copy"} /> {unbindLabel}</button>
          </div>
          <p aria-live="polite" className="sr-only">{copied ? "Custom command copied." : bindCopyState === "error" || unbindCopyState === "error" ? "Copy failed for the custom command." : ""}</p>
        </div>
      </div>

      <div className="lab-builder">
        <div className="lab-fields">
          <label className="key-field">
            <span>Key combination</span>
            <KeyCaptureInput aria-label="Command Lab key combination" autoComplete="off" onValueChange={(value) => { updateCommandLab({ key: value }); setBindCopyState("idle"); setUnbindCopyState("idle"); }} value={state.commandLab.key} />
          </label>
          <label className="key-field">
            <span>Extra command text</span>
            <input aria-label="Command Lab extra command text" autoComplete="off" onChange={(event) => { updateCommandLab({ extraText: event.target.value }); setBindCopyState("idle"); setUnbindCopyState("idle"); }} placeholder={selectedCommand.params || "Optional arguments"} value={state.commandLab.extraText} />
          </label>
        </div>

        <div className="reference-grid">
          <section className="reference-panel" aria-labelledby="key-combinations-title">
            <div className="reference-heading">
              <div>
                <h3 id="key-combinations-title">Key combinations</h3>
                <p aria-live="polite">{filteredCombos.length} shown</p>
              </div>
              <label className="checkbox-label">
                <input checked={state.commandLab.showRisky} onChange={(event) => updateCommandLab({ showRisky: event.target.checked })} type="checkbox" /> Show risky
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
                <button aria-pressed={state.commandLab.key === combo.combo} className="reference-row" key={combo.combo} onClick={() => { updateCommandLab({ key: combo.combo }); setBindCopyState("idle"); setUnbindCopyState("idle"); }} type="button">
                  <span>{combo.combo}</span>
                  <strong data-status={combo.status}>{statusLabels[combo.status]}</strong>
                </button>
              )) : <p className="reference-empty" role="status">No key combinations match these filters.</p>}
            </div>
          </section>

          <section className="reference-panel" aria-labelledby="wiki-commands-title">
            <div className="reference-heading">
              <div>
                <h3 id="wiki-commands-title">Wiki commands</h3>
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
              )) : <p className="reference-empty" role="status">No commands match these filters.</p>}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
