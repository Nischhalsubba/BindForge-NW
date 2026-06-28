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
  candidate: "Needs testing",
  avoid: "Reserved",
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

  const selectedComboData = keyCombos.find((combo) => combo.combo === activeCombo);

  async function copyText(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1500);
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
    <main className="min-h-screen bg-[#f4f6f2] text-[#171918]">
      <section className="border-b border-[#d4dbd1] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2 text-xs font-bold uppercase text-[#7d1f24]">
                <span className="border border-[#c94832] bg-[#fff4ef] px-2 py-1">
                  Neverwinter
                </span>
                <span className="border border-[#d2a03a] bg-[#fff8e7] px-2 py-1">
                  {consoleCommands.length} commands
                </span>
                <span className="border border-[#5d7a61] bg-[#edf5ee] px-2 py-1">
                  {keyCombos.length} key combos
                </span>
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
                BindForge NW
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[#58635b]">
                Pick any key or combo, pick a Neverwinter console command, then copy the finished
                bind line into the game chat.
              </p>
            </div>

            <div className="border border-[#c7d0c5] bg-[#f9fbf7] p-4">
              <div className="text-xs font-bold uppercase text-[#647067]">Current bind</div>
              <code className="mt-3 block overflow-x-auto border border-[#d4dbd1] bg-white px-3 py-3 font-mono text-sm text-[#222724]">
                {bindPreview}
              </code>
              <button
                className="mt-3 h-11 w-full border border-[#171918] bg-[#171918] px-4 text-sm font-bold text-white transition hover:bg-[#343837]"
                onClick={() => copyText(bindPreview, "bind command")}
                type="button"
              >
                Copy bind
              </button>
              <div className="mt-2 min-h-5 text-sm text-[#58635b]" role="status">
                {copied ? `Copied ${copied}.` : ""}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[340px_1fr] lg:px-8">
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="border border-[#c7d0c5] bg-white p-4">
            <h2 className="text-lg font-semibold">Builder</h2>
            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-bold uppercase text-[#647067]">
                Key or combo
              </span>
              <input
                className="h-11 w-full border border-[#bac6b8] bg-[#fbfcfa] px-3 font-mono text-sm outline-none focus:border-[#7d1f24]"
                onChange={(event) => setCustomCombo(event.target.value)}
                placeholder="ctrl+b, f5, numpad1"
                value={customCombo}
              />
            </label>
            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-bold uppercase text-[#647067]">
                Command arguments
              </span>
              <input
                className="h-11 w-full border border-[#bac6b8] bg-[#fbfcfa] px-3 font-mono text-sm outline-none focus:border-[#7d1f24]"
                onChange={(event) => setCustomArgs(event.target.value)}
                placeholder={selectedCommand.params || "optional values"}
                value={customArgs}
              />
            </label>
            <div className="mt-4 border border-[#d4dbd1] bg-[#f4f6f2] p-3 text-sm leading-6 text-[#4f5b52]">
              Selected command:{" "}
              <span className="font-mono font-semibold">{commandLabel(selectedCommand)}</span>
              {selectedComboData?.status && selectedComboData.status !== "core" ? (
                <div className="mt-2 font-semibold text-[#7d1f24]">
                  {statusLabels[selectedComboData.status]} combo. Test it in-game before relying on
                  it.
                </div>
              ) : null}
            </div>
          </div>

          <div className="border border-[#c7d0c5] bg-white p-4">
            <h2 className="text-lg font-semibold">Command filters</h2>
            <input
              className="mt-3 h-11 w-full border border-[#bac6b8] bg-[#fbfcfa] px-3 text-sm outline-none focus:border-[#7d1f24]"
              onChange={(event) => setCommandSearch(event.target.value)}
              placeholder="Search commands"
              value={commandSearch}
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {commandCategories.map((category) => (
                <button
                  className={`h-10 border px-2 text-sm font-semibold transition ${
                    commandCategory === category
                      ? "border-[#171918] bg-[#171918] text-white"
                      : "border-[#d4dbd1] bg-[#fbfcfa] hover:border-[#171918]"
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
          <section className="border border-[#c7d0c5] bg-white p-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_260px] lg:items-end">
              <div>
                <h2 className="text-xl font-semibold">Key combo picker</h2>
                <p className="mt-1 text-sm text-[#58635b]">
                  Core combos show by default. Enable advanced to include candidates and reserved
                  shortcuts.
                </p>
              </div>
              <label className="flex min-h-11 items-center gap-3 border border-[#d4dbd1] bg-[#f9fbf7] px-3 text-sm font-semibold">
                <input
                  checked={showAdvanced}
                  className="h-4 w-4"
                  onChange={(event) => setShowAdvanced(event.target.checked)}
                  type="checkbox"
                />
                Show advanced combos
              </label>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px]">
              <input
                className="h-11 border border-[#bac6b8] bg-[#fbfcfa] px-3 text-sm outline-none focus:border-[#7d1f24]"
                onChange={(event) => setComboSearch(event.target.value)}
                placeholder="Search combos"
                value={comboSearch}
              />
              <select
                className="h-11 border border-[#bac6b8] bg-[#fbfcfa] px-3 text-sm font-semibold outline-none focus:border-[#7d1f24]"
                onChange={(event) => setComboCategory(event.target.value)}
                value={comboCategory}
              >
                {comboCategories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 grid max-h-[330px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCombos.map((combo) => (
                <button
                  className={`flex min-h-12 items-center justify-between border px-3 text-left text-sm transition ${
                    activeCombo === combo.combo
                      ? "border-[#7d1f24] bg-[#7d1f24] text-white"
                      : "border-[#d4dbd1] bg-[#fbfcfa] hover:border-[#7d1f24]"
                  }`}
                  key={combo.combo}
                  onClick={() => chooseCombo(combo)}
                  type="button"
                >
                  <span className="font-mono font-semibold">{combo.combo}</span>
                  <span
                    className={
                      activeCombo === combo.combo
                        ? "text-white"
                        : combo.status === "core"
                          ? "text-[#5d7a61]"
                          : "text-[#7d1f24]"
                    }
                  >
                    {statusLabels[combo.status]}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="border border-[#c7d0c5] bg-white p-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Console commands</h2>
                <p className="mt-1 text-sm text-[#58635b]">
                  {filteredCommands.length} commands shown from the Neverwinter command table.
                </p>
              </div>
              <button
                className="h-10 border border-[#171918] px-4 text-sm font-bold transition hover:bg-[#171918] hover:text-white"
                onClick={() => copyText(selectedCommand.command, "slash command")}
                type="button"
              >
                Copy selected command
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {filteredCommands.map((command) => (
                <article
                  className={`grid gap-3 border p-4 md:grid-cols-[1fr_auto] md:items-center ${
                    selectedCommand.id === command.id
                      ? "border-[#7d1f24] bg-[#fffafa]"
                      : "border-[#d4dbd1] bg-[#fbfcfa]"
                  }`}
                  key={`${command.id}-${command.category}-${command.params}`}
                >
                  <button
                    className="min-w-0 text-left"
                    onClick={() => chooseCommand(command)}
                    type="button"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-base font-semibold text-[#171918]">
                        {command.command}
                      </span>
                      <span className="border border-[#d2a03a] bg-[#fff8e7] px-2 py-1 text-xs font-bold uppercase text-[#6f510e]">
                        {command.category}
                      </span>
                    </div>
                    <div className="mt-2 overflow-x-auto font-mono text-sm text-[#4c564f]">
                      {command.params || "No arguments"}
                    </div>
                    {command.aliases.length > 0 ? (
                      <div className="mt-2 text-sm text-[#58635b]">
                        Aliases: {command.aliases.join(", ")}
                      </div>
                    ) : null}
                  </button>
                  <button
                    className="h-10 border border-[#171918] px-4 text-sm font-bold transition hover:bg-[#171918] hover:text-white"
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
