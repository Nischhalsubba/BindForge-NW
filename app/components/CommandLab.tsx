"use client";

import { useMemo, useRef } from "react";
import { useBindForge } from "../BindForgeProvider";
import { consoleCommands } from "../data/commands";
import { keyCombos } from "../data/keyCombos";
import type { ConsoleCommand } from "../data/commands";
import type { KeyCombo } from "../data/keyCombos";
import { buildCustomLine } from "../lib/keybind-core.mjs";
import { Icon } from "./Icon";

const commandCategories = ["All", ...Array.from(new Set(consoleCommands.map((command) => command.category)))];
const comboCategories = ["All", ...Array.from(new Set(keyCombos.map((combo) => combo.category)))];
const statusLabels: Record<KeyCombo["status"], string> = { core: "Recommended", candidate: "Test first", avoid: "Risky" };
function normalizeText(value: string) { return value.trim().toLowerCase(); }
function commandLabel(command: ConsoleCommand) { return `${command.command}${command.params ? ` ${command.params}` : ""}`; }

export function CommandLab({ onCopy }: { onCopy: (text: string, label: string, target: HTMLElement | null) => void }) {
  const { state, updateCommandLab } = useBindForge();
  const preview = useRef<HTMLElement>(null);
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
    updateCommandLab({ commandId: command.id, extraText: command.params && !/[<>]| or | to /i.test(command.params) ? command.params : "" });
  }

  return (
    <section className="command-lab" aria-labelledby="command-lab-title">
      <div className="command-lab-intro"><p className="eyebrow">Advanced workspace</p><h2 id="command-lab-title">Build your own command</h2><p>Combine a supported key with any catalog command. Test carefully; community commands may change after patches.</p><div className="lab-preview"><span>Generated command</span><code ref={preview} tabIndex={0}>{line}</code><button className="primary-button" onClick={() => onCopy(line, "custom command", preview.current)} type="button"><Icon name="copy" /> Copy custom command</button></div></div>
      <div className="lab-builder">
        <div className="lab-fields"><label className="key-field"><span>Key combination</span><input onChange={(event) => updateCommandLab({ key: event.target.value })} value={state.commandLab.key} /></label><label className="key-field"><span>Extra command text</span><input onChange={(event) => updateCommandLab({ extraText: event.target.value })} placeholder={selectedCommand.params || "Optional arguments"} value={state.commandLab.extraText} /></label></div>
        <div className="reference-grid">
          <section className="reference-panel"><div className="reference-heading"><div><h3>Key combinations</h3><p>{filteredCombos.length} shown</p></div><label className="checkbox-label"><input checked={state.commandLab.showRisky} onChange={(event) => updateCommandLab({ showRisky: event.target.checked })} type="checkbox" /> Show risky</label></div><div className="reference-controls"><input onChange={(event) => updateCommandLab({ keySearch: event.target.value })} placeholder="Search keys" value={state.commandLab.keySearch} /><select aria-label="Filter key combinations by category" onChange={(event) => updateCommandLab({ keyCategory: event.target.value })} value={state.commandLab.keyCategory}>{comboCategories.map((category) => <option key={category}>{category}</option>)}</select></div><div className="reference-list">{filteredCombos.map((combo) => <button className="reference-row" key={combo.combo} onClick={() => updateCommandLab({ key: combo.combo })} type="button"><span>{combo.combo}</span><strong data-status={combo.status}>{statusLabels[combo.status]}</strong></button>)}</div></section>
          <section className="reference-panel"><div className="reference-heading"><div><h3>Wiki commands</h3><p>{filteredCommands.length} shown</p></div></div><div className="reference-controls"><input onChange={(event) => updateCommandLab({ commandSearch: event.target.value })} placeholder="Search commands" value={state.commandLab.commandSearch} /><select aria-label="Filter commands by category" onChange={(event) => updateCommandLab({ commandCategory: event.target.value })} value={state.commandLab.commandCategory}>{commandCategories.map((category) => <option key={category}>{category}</option>)}</select></div><div className="reference-list">{filteredCommands.map((command) => <button className="reference-row command-row" key={`${command.id}-${command.category}-${command.params}`} onClick={() => chooseCommand(command)} type="button"><span>{command.command}</span><small>{commandLabel(command)}</small></button>)}</div></section>
        </div>
      </div>
    </section>
  );
}
