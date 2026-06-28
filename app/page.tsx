"use client";

import { useMemo, useState } from "react";
import { consoleCommands } from "./data/commands";
import { keyCombos } from "./data/keyCombos";
import type { ConsoleCommand } from "./data/commands";
import type { KeyCombo } from "./data/keyCombos";

const commandCategories = [
  "All",
  ...Array.from(new Set(consoleCommands.map((command) => command.category))),
];

const comboCategories = [
  "All",
  ...Array.from(new Set(keyCombos.map((combo) => combo.category))),
];

const statusLabels: Record<KeyCombo["status"], string> = {
  core: "Core",
  candidate: "Test",
  avoid: "Risk",
};

const statusClasses: Record<KeyCombo["status"], string> = {
  core: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
  candidate: "border-amber-300/40 bg-amber-300/10 text-amber-100",
  avoid: "border-red-400/50 bg-red-400/10 text-red-100",
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function normalizeCombo(value: string) {
  const parts = value
    .toLowerCase()
    .replace(/\s+/g, "")
    .split("+")
    .filter(Boolean);
  const modifierOrder = ["ctrl", "alt", "shift"];
  const modifiers = modifierOrder.filter((modifier) => parts.includes(modifier));
  const key = parts.find((part) => !modifierOrder.includes(part));

  return [...modifiers, key].filter(Boolean).join("+");
}

function commandLabel(command: ConsoleCommand) {
  return `${command.command}${command.params ? ` ${command.params}` : ""}`;
}

export default function Home() {
  const [commandSearch, setCommandSearch] = useState("");
  const [commandCategory, setCommandCategory] = useState("All");
  const [comboSearch, setComboSearch] = useState("");
  const [comboCategory, setComboCategory] = useState("All");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState("ctrl+b");
  const [customCombo, setCustomCombo] = useState("ctrl+b");
  const [selectedCommandId, setSelectedCommandId] = useState("gensendmessage");
  const [customArgs, setCustomArgs] = useState("Vipaction_Bankvendor activate");
  const [copied, setCopied] = useState("");

  const selectedCommand =
    consoleCommands.find((command) => command.id === selectedCommandId) ?? consoleCommands[0];

  const activeCombo = normalizeCombo(customCombo || selectedCombo);
  const selectedComboData = keyCombos.find((combo) => combo.combo === activeCombo);
  const bindPreview = `/bind ${activeCombo || "<key>"} ${selectedCommand.bindCommand}${
    customArgs.trim() ? ` ${customArgs.trim()}` : ""
  }`;

  const filteredCommands = useMemo(() => {
    const search = normalizeText(commandSearch);

    return consoleCommands.filter((command) => {
      const matchesCategory =
        commandCategory === "All" || command.category === commandCategory;
      const haystack = normalizeText(
        `${command.command} ${command.bindCommand} ${command.params} ${command.aliases.join(
          " ",
        )} ${command.category}`,
      );

      return matchesCategory && (!search || haystack.includes(search));
    });
  }, [commandCategory, commandSearch]);

  const filteredCombos = useMemo(() => {
    const search = normalizeText(comboSearch);

    return keyCombos.filter((combo) => {
      const matchesCategory = comboCategory === "All" || combo.category === comboCategory;
      const visibleStatus = showAdvanced || combo.status === "core";
      const haystack = normalizeText(
        `${combo.combo} ${combo.baseKey} ${combo.modifiers.join(" ")} ${combo.category} ${
          combo.status
        } ${combo.note ?? ""}`,
      );

      return matchesCategory && visibleStatus && (!search || haystack.includes(search));
    });
  }, [comboCategory, comboSearch, showAdvanced]);

  async function copyText(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1800);
  }

  function chooseCommand(command: ConsoleCommand) {
    setSelectedCommandId(command.id);
    setCustomArgs(command.params && !/[<>]| or | to /i.test(command.params) ? command.params : "");
  }

  function chooseCombo(combo: KeyCombo) {
    setSelectedCombo(combo.combo);
    setCustomCombo(combo.combo);
  }

  return (
    <main className="min-h-dvh bg-[var(--surface-0)] text-[var(--text-primary)]">
      <section className="border-b border-white/10 bg-[linear-gradient(135deg,#141514_0%,#251717_48%,#18231c_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-normal">
                <span className="chip chip-red">Neverwinter</span>
                <span className="chip chip-amber">{consoleCommands.length} commands</span>
                <span className="chip chip-green">{keyCombos.length} combos</span>
              </div>
              <div className="max-w-3xl">
                <h1 className="text-4xl font-semibold tracking-normal text-white sm:text-5xl lg:text-6xl">
                  BindForge NW
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-stone-200">
                  Build clean Neverwinter bind lines from a full command table and generated key
                  combo catalog.
                </p>
              </div>
            </div>

            <div className="panel-dark p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase text-stone-400">Ready to paste</div>
                  <div className="mt-1 text-sm text-stone-300">
                    Copy this line into Neverwinter chat.
                  </div>
                </div>
                <div className="status-dot" aria-hidden="true" />
              </div>
              <code className="mt-4 block max-h-24 overflow-auto rounded-md border border-white/10 bg-black/35 px-3 py-3 font-mono text-sm leading-6 text-amber-100">
                {bindPreview}
              </code>
              <button
                className="button-primary mt-4 w-full"
                onClick={() => copyText(bindPreview, "bind command")}
                type="button"
              >
                Copy bind
              </button>
              <div className="mt-3 min-h-5 text-sm text-emerald-200" role="status">
                {copied ? `Copied ${copied}.` : ""}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-20 border-b border-white/10 bg-[#171918]/95 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <code className="min-w-0 overflow-x-auto rounded-md border border-white/10 bg-black/30 px-3 py-3 font-mono text-sm text-stone-100">
            {bindPreview}
          </code>
          <button
            className="button-secondary min-h-11"
            onClick={() => copyText(bindPreview, "bind command")}
            type="button"
          >
            Copy current bind
          </button>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="panel p-4">
            <div className="section-label">Builder</div>
            <h2 className="mt-1 text-xl font-semibold">Shape the command</h2>

            <label className="field mt-5">
              <span>Key or combo</span>
              <input
                onChange={(event) => setCustomCombo(event.target.value)}
                placeholder="ctrl+b, f5, numpad1"
                value={customCombo}
              />
            </label>

            <label className="field mt-4">
              <span>Command arguments</span>
              <input
                onChange={(event) => setCustomArgs(event.target.value)}
                placeholder={selectedCommand.params || "optional values"}
                value={customArgs}
              />
            </label>

            <div className="mt-4 rounded-md border border-stone-700/70 bg-stone-950/60 p-3">
              <div className="text-xs font-bold uppercase text-stone-400">Selected command</div>
              <div className="mt-2 break-words font-mono text-sm text-stone-100">
                {commandLabel(selectedCommand)}
              </div>
              {selectedComboData?.status && selectedComboData.status !== "core" ? (
                <div className="mt-3 rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100">
                  {statusLabels[selectedComboData.status]} combo. Test it in-game before relying
                  on it.
                </div>
              ) : null}
            </div>
          </div>

          <div className="panel p-4">
            <div className="section-label">Command search</div>
            <label className="field mt-3">
              <span>Find command</span>
              <input
                onChange={(event) => setCommandSearch(event.target.value)}
                placeholder="showfps, bind, team"
                value={commandSearch}
              />
            </label>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {commandCategories.map((category) => (
                <button
                  className={`filter-button ${
                    commandCategory === category ? "filter-button-active" : ""
                  }`}
                  key={category}
                  onClick={() => setCommandCategory(category)}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <section className="panel p-4 sm:p-5">
            <div className="grid gap-4 xl:grid-cols-[1fr_280px] xl:items-end">
              <div>
                <div className="section-label">Key matrix</div>
                <h2 className="mt-1 text-2xl font-semibold">Pick a combo</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-300">
                  Core combos stay visible by default. Advanced mode includes punctuation,
                  extended keys, and reserved shortcuts.
                </p>
              </div>
              <label className="toggle-card">
                <input
                  checked={showAdvanced}
                  onChange={(event) => setShowAdvanced(event.target.checked)}
                  type="checkbox"
                />
                <span>
                  <strong>Advanced combos</strong>
                  <small>Show test and risk keys</small>
                </span>
              </label>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_240px]">
              <label className="field">
                <span>Search combos</span>
                <input
                  onChange={(event) => setComboSearch(event.target.value)}
                  placeholder="ctrl+shift, numpad, f12"
                  value={comboSearch}
                />
              </label>
              <label className="field">
                <span>Combo group</span>
                <select
                  onChange={(event) => setComboCategory(event.target.value)}
                  value={comboCategory}
                >
                  {comboCategories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 grid max-h-[380px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCombos.map((combo) => (
                <button
                  className={`combo-button ${activeCombo === combo.combo ? "combo-active" : ""}`}
                  key={combo.combo}
                  onClick={() => chooseCombo(combo)}
                  type="button"
                >
                  <span className="font-mono font-semibold">{combo.combo}</span>
                  <span className={`status-pill ${statusClasses[combo.status]}`}>
                    {statusLabels[combo.status]}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="panel p-4 sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="section-label">Command archive</div>
                <h2 className="mt-1 text-2xl font-semibold">Console commands</h2>
                <p className="mt-2 text-sm text-stone-300">
                  {filteredCommands.length} matching commands.
                </p>
              </div>
              <button
                className="button-secondary"
                onClick={() => copyText(selectedCommand.command, "slash command")}
                type="button"
              >
                Copy selected command
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {filteredCommands.map((command) => (
                <article
                  className={`command-row ${
                    selectedCommand.id === command.id ? "command-row-active" : ""
                  }`}
                  key={`${command.id}-${command.category}-${command.params}`}
                >
                  <button
                    className="min-w-0 text-left"
                    onClick={() => chooseCommand(command)}
                    type="button"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-base font-semibold text-stone-50">
                        {command.command}
                      </span>
                      <span className="rounded border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-bold uppercase text-amber-100">
                        {command.category}
                      </span>
                    </div>
                    <div className="mt-2 overflow-x-auto font-mono text-sm text-stone-300">
                      {command.params || "No arguments"}
                    </div>
                    {command.aliases.length > 0 ? (
                      <div className="mt-2 text-sm text-stone-400">
                        Aliases: {command.aliases.join(", ")}
                      </div>
                    ) : null}
                  </button>
                  <button
                    className="button-row"
                    onClick={() => {
                      chooseCommand(command);
                      copyText(
                        `/bind ${activeCombo || "<key>"} ${command.bindCommand}${
                          customArgs.trim() ? ` ${customArgs.trim()}` : ""
                        }`,
                        command.command,
                      );
                    }}
                    type="button"
                  >
                    Copy bind
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
