"use client";

import { useMemo, useState } from "react";
import { consoleCommands } from "./data/commands";
import { keyCombos } from "./data/keyCombos";
import { keybindPresets } from "./data/keybindPresets";
import type { ConsoleCommand } from "./data/commands";
import type { KeyCombo } from "./data/keyCombos";
import type { KeybindClass, KeybindPreset, KeybindType } from "./data/keybindPresets";

const bindTypes = [
  "All",
  ...Array.from(new Set(keybindPresets.map((preset) => preset.type))),
] as Array<KeybindType | "All">;

const bindClasses = [
  "All",
  ...Array.from(new Set(keybindPresets.map((preset) => preset.className))),
] as Array<KeybindClass | "All">;

const commandCategories = [
  "All",
  ...Array.from(new Set(consoleCommands.map((command) => command.category))),
];

const comboCategories = [
  "All",
  ...Array.from(new Set(keyCombos.map((combo) => combo.category))),
];

const statusLabels: Record<KeyCombo["status"], string> = {
  core: "Safe",
  candidate: "Test first",
  avoid: "Risky",
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

function presetBind(preset: KeybindPreset, keyValue: string) {
  return `/bind ${normalizeCombo(keyValue) || preset.defaultKey} ${preset.command}`;
}

function commandLabel(command: ConsoleCommand) {
  return `${command.command}${command.params ? ` ${command.params}` : ""}`;
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<KeybindType | "All">("All");
  const [activeClass, setActiveClass] = useState<KeybindClass | "All">("All");
  const [customKeys, setCustomKeys] = useState<Record<string, string>>(() =>
    Object.fromEntries(keybindPresets.map((preset) => [preset.id, preset.defaultKey])),
  );
  const [copied, setCopied] = useState("");

  const [commandSearch, setCommandSearch] = useState("");
  const [commandCategory, setCommandCategory] = useState("All");
  const [comboSearch, setComboSearch] = useState("");
  const [comboCategory, setComboCategory] = useState("All");
  const [showAdvancedCombos, setShowAdvancedCombos] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState("ctrl+b");
  const [selectedCommandId, setSelectedCommandId] = useState("gensendmessage");
  const [customArgs, setCustomArgs] = useState("Vipaction_Bankvendor activate");

  const selectedCommand =
    consoleCommands.find((command) => command.id === selectedCommandId) ?? consoleCommands[0];

  const advancedBind = `/bind ${selectedCombo || "<key>"} ${selectedCommand.bindCommand}${
    customArgs.trim() ? ` ${customArgs.trim()}` : ""
  }`;

  const filteredPresets = useMemo(() => {
    const query = normalizeText(search);

    return keybindPresets.filter((preset) => {
      const matchesType = activeType === "All" || preset.type === activeType;
      const matchesClass = activeClass === "All" || preset.className === activeClass;
      const haystack = normalizeText(
        `${preset.title} ${preset.type} ${preset.className} ${preset.plainEnglish} ${
          preset.command
        } ${preset.searchTerms.join(" ")}`,
      );

      return matchesType && matchesClass && (!query || haystack.includes(query));
    });
  }, [activeClass, activeType, search]);

  const typeCounts = useMemo(
    () =>
      bindTypes.reduce<Record<string, number>>((counts, type) => {
        counts[type] =
          type === "All"
            ? keybindPresets.length
            : keybindPresets.filter((preset) => preset.type === type).length;
        return counts;
      }, {}),
    [],
  );

  const classCounts = useMemo(
    () =>
      bindClasses.reduce<Record<string, number>>((counts, className) => {
        counts[className] =
          className === "All"
            ? keybindPresets.length
            : keybindPresets.filter((preset) => preset.className === className).length;
        return counts;
      }, {}),
    [],
  );

  const filteredCommands = useMemo(() => {
    const query = normalizeText(commandSearch);

    return consoleCommands.filter((command) => {
      const matchesCategory =
        commandCategory === "All" || command.category === commandCategory;
      const haystack = normalizeText(
        `${command.command} ${command.bindCommand} ${command.params} ${command.aliases.join(
          " ",
        )} ${command.category}`,
      );

      return matchesCategory && (!query || haystack.includes(query));
    });
  }, [commandCategory, commandSearch]);

  const filteredCombos = useMemo(() => {
    const query = normalizeText(comboSearch);

    return keyCombos.filter((combo) => {
      const matchesCategory = comboCategory === "All" || combo.category === comboCategory;
      const visibleStatus = showAdvancedCombos || combo.status === "core";
      const haystack = normalizeText(
        `${combo.combo} ${combo.baseKey} ${combo.modifiers.join(" ")} ${combo.category} ${
          combo.status
        } ${combo.note ?? ""}`,
      );

      return matchesCategory && visibleStatus && (!query || haystack.includes(query));
    });
  }, [comboCategory, comboSearch, showAdvancedCombos]);

  async function copyText(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1800);
  }

  function setPresetKey(id: string, value: string) {
    setCustomKeys((current) => ({ ...current, [id]: value }));
  }

  function chooseCommand(command: ConsoleCommand) {
    setSelectedCommandId(command.id);
    setCustomArgs(command.params && !/[<>]| or | to /i.test(command.params) ? command.params : "");
  }

  return (
    <main className="min-h-dvh bg-[var(--app-bg)] text-[var(--text-main)]">
      <section className="hero-shell">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
            <div>
              <div className="eyebrow">Neverwinter keybind builder</div>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal sm:text-5xl lg:text-6xl">
                Search what you want. Copy the keybind.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-soft)]">
                Built for players who do not want to learn console commands. Type words like
                invoke, bank, loot, animation cancel, fps, or screenshot.
              </p>
            </div>

            <div className="hero-card">
              <div className="text-sm font-semibold text-[var(--text-muted)]">Start here</div>
              <label className="search-field mt-3">
                <span className="sr-only">Search keybinds</span>
                <input
                  autoComplete="off"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search invoke, animation cancel, loot..."
                  value={search}
                />
              </label>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="metric">
                  <strong>{keybindPresets.length}</strong>
                  <span>Ready binds</span>
                </div>
                <div className="metric">
                  <strong>{bindTypes.length - 1}</strong>
                  <span>Types</span>
                </div>
                <div className="metric">
                  <strong>{bindClasses.length - 1}</strong>
                  <span>Classes</span>
                </div>
              </div>
              <div className="mt-3 min-h-5 text-sm font-semibold text-[var(--success)]" role="status">
                {copied ? `Copied ${copied}.` : ""}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--app-bg)]/92 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            {bindClasses.map((className) => (
              <button
                className={`type-tab ${activeClass === className ? "type-tab-active" : ""}`}
                key={className}
                onClick={() => setActiveClass(className)}
                type="button"
              >
                <span>{className}</span>
                <strong>{classCounts[className]}</strong>
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {bindTypes.map((type) => (
              <button
                className={`type-tab type-tab-soft ${
                  activeType === type ? "type-tab-active" : ""
                }`}
                key={type}
                onClick={() => setActiveType(type)}
                type="button"
              >
                <span>{type}</span>
                <strong>{typeCounts[type]}</strong>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {filteredPresets.map((preset) => {
            const keyValue = customKeys[preset.id] ?? preset.defaultKey;
            const bind = presetBind(preset, keyValue);

            return (
              <article className="bind-card" key={preset.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="type-label">{preset.type}</div>
                    <h2 className="mt-2 text-xl font-semibold">{preset.title}</h2>
                    <div className="mt-2 text-sm font-bold text-[var(--text-muted)]">
                      {preset.className}
                    </div>
                  </div>
                  <span className={preset.difficulty === "Easy" ? "pill-good" : "pill-warn"}>
                    {preset.difficulty}
                  </span>
                </div>
                <p className="mt-3 min-h-12 text-sm leading-6 text-[var(--text-soft)]">
                  {preset.plainEnglish}
                </p>

                <label className="control-field mt-5">
                  <span>Your key or combo</span>
                  <input
                    onChange={(event) => setPresetKey(preset.id, event.target.value)}
                    value={keyValue}
                  />
                </label>

                <code className="bind-code mt-4">{bind}</code>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    className="primary-action"
                    onClick={() => copyText(bind, preset.title)}
                    type="button"
                  >
                    Copy keybind
                  </button>
                  <button
                    className="quiet-action"
                    onClick={() => setPresetKey(preset.id, preset.defaultKey)}
                    type="button"
                  >
                    Reset key
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {filteredPresets.length === 0 ? (
          <div className="empty-state">
            <h2>No keybinds found</h2>
            <p>Try searching for invoke, utility, loot, combat, animation cancel, fps, or screenshot.</p>
            <button
              className="primary-action mt-4"
              onClick={() => {
                setSearch("");
                setActiveType("All");
                setActiveClass("All");
              }}
              type="button"
            >
              Show all keybinds
            </button>
          </div>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="advanced-shell">
          <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
            <div>
              <div className="eyebrow-dark">Advanced builder</div>
              <h2 className="mt-2 text-2xl font-semibold">Make a custom command bind</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
                Use this only when the ready-made cards do not cover what you need.
              </p>

              <label className="control-field mt-5">
                <span>Selected key</span>
                <input
                  onChange={(event) => setSelectedCombo(normalizeCombo(event.target.value))}
                  value={selectedCombo}
                />
              </label>
              <label className="control-field mt-4">
                <span>Extra command values</span>
                <input
                  onChange={(event) => setCustomArgs(event.target.value)}
                  placeholder={selectedCommand.params || "optional"}
                  value={customArgs}
                />
              </label>
              <code className="bind-code mt-4">{advancedBind}</code>
              <button
                className="primary-action mt-4 w-full"
                onClick={() => copyText(advancedBind, "custom command")}
                type="button"
              >
                Copy custom bind
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">Key combos</h3>
                  <label className="mini-toggle">
                    <input
                      checked={showAdvancedCombos}
                      onChange={(event) => setShowAdvancedCombos(event.target.checked)}
                      type="checkbox"
                    />
                    Advanced
                  </label>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_160px]">
                  <input
                    className="compact-input"
                    onChange={(event) => setComboSearch(event.target.value)}
                    placeholder="Search combos"
                    value={comboSearch}
                  />
                  <select
                    className="compact-input"
                    onChange={(event) => setComboCategory(event.target.value)}
                    value={comboCategory}
                  >
                    {comboCategories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-3 grid max-h-80 gap-2 overflow-y-auto pr-1">
                  {filteredCombos.slice(0, 80).map((combo) => (
                    <button
                      className="combo-row"
                      key={combo.combo}
                      onClick={() => setSelectedCombo(combo.combo)}
                      type="button"
                    >
                      <span>{combo.combo}</span>
                      <strong>{statusLabels[combo.status]}</strong>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Raw commands</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_160px]">
                  <input
                    className="compact-input"
                    onChange={(event) => setCommandSearch(event.target.value)}
                    placeholder="Search commands"
                    value={commandSearch}
                  />
                  <select
                    className="compact-input"
                    onChange={(event) => setCommandCategory(event.target.value)}
                    value={commandCategory}
                  >
                    {commandCategories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-3 grid max-h-80 gap-2 overflow-y-auto pr-1">
                  {filteredCommands.slice(0, 80).map((command) => (
                    <button
                      className="command-choice"
                      key={`${command.id}-${command.category}-${command.params}`}
                      onClick={() => chooseCommand(command)}
                      type="button"
                    >
                      <span>{command.command}</span>
                      <small>{commandLabel(command)}</small>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
