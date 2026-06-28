"use client";

import { useMemo, useState } from "react";
import { consoleCommands } from "./data/commands";
import { keyCombos } from "./data/keyCombos";
import { keybindPresets } from "./data/keybindPresets";
import type { ConsoleCommand } from "./data/commands";
import type { KeyCombo } from "./data/keyCombos";
import type { KeybindClass, KeybindPreset, KeybindType } from "./data/keybindPresets";

const classFilters = [
  "All",
  ...Array.from(new Set(keybindPresets.map((preset) => preset.className))),
] as Array<KeybindClass | "All">;

const typeFilters = [
  "All",
  ...Array.from(new Set(keybindPresets.map((preset) => preset.type))),
] as Array<KeybindType | "All">;

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

const keyWarnings: Array<{ keys: string[]; message: string; level: "info" | "warn" | "danger" }> = [
  {
    keys: ["w", "a", "s", "d", "space"],
    message: "This key is commonly used for movement or jumping.",
    level: "danger",
  },
  {
    keys: ["tab"],
    message: "Tab is often used for targeting or Bard perform mode.",
    level: "warn",
  },
  {
    keys: ["f", "g"],
    message: "This key is often used for interact, loot, or nearby prompts.",
    level: "warn",
  },
  {
    keys: ["i", "c", "m", "p", "j", "k", "l"],
    message: "This key may open a menu, inventory, map, journal, or character window.",
    level: "warn",
  },
  {
    keys: ["enter", "r"],
    message: "This key may be used for chat or replying to messages.",
    level: "warn",
  },
  {
    keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    message: "Number keys are often used for powers, items, or potion slots.",
    level: "info",
  },
  {
    keys: ["lbutton", "rbutton", "mbutton"],
    message: "Mouse buttons are usually used for attacks or camera control.",
    level: "danger",
  },
  {
    keys: ["escape"],
    message: "Escape is usually used to close menus.",
    level: "danger",
  },
  {
    keys: ["alt+f4", "alt+tab", "ctrl+alt+delete"],
    message: "This is a Windows shortcut. Avoid using it.",
    level: "danger",
  },
];

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

function baseKey(value: string) {
  const combo = normalizeCombo(value);
  return combo.split("+").pop() ?? combo;
}

function warningForKey(value: string) {
  const combo = normalizeCombo(value);
  const key = baseKey(value);

  return keyWarnings.find((warning) => warning.keys.includes(combo) || warning.keys.includes(key));
}

function presetLine(preset: KeybindPreset, keyValue: string, mode: "bind" | "unbind") {
  const key = normalizeCombo(keyValue) || preset.defaultKey;
  return mode === "bind" ? `/bind ${key} ${preset.command}` : `/unbind ${key}`;
}

function customLine(
  keyValue: string,
  command: ConsoleCommand,
  customArgs: string,
  mode: "bind" | "unbind",
) {
  const key = normalizeCombo(keyValue) || "<key>";
  if (mode === "unbind") {
    return `/unbind ${key}`;
  }

  return `/bind ${key} ${command.bindCommand}${customArgs.trim() ? ` ${customArgs.trim()}` : ""}`;
}

function commandLabel(command: ConsoleCommand) {
  return `${command.command}${command.params ? ` ${command.params}` : ""}`;
}

function groupedPresets(presets: KeybindPreset[]) {
  return presets.reduce<Record<string, KeybindPreset[]>>((groups, preset) => {
    const key = `${preset.className} - ${preset.type}`;
    groups[key] = [...(groups[key] ?? []), preset];
    return groups;
  }, {});
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeClass, setActiveClass] = useState<KeybindClass | "All">("All");
  const [activeType, setActiveType] = useState<KeybindType | "All">("All");
  const [safetyFilter, setSafetyFilter] = useState<"All" | "Easy" | "Advanced" | "Risky">("All");
  const [customKeys, setCustomKeys] = useState<Record<string, string>>(() =>
    Object.fromEntries(keybindPresets.map((preset) => [preset.id, preset.defaultKey])),
  );
  const [copied, setCopied] = useState("");
  const [copyMode, setCopyMode] = useState<"bind" | "unbind">("bind");

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

  const advancedBind = customLine(selectedCombo, selectedCommand, customArgs, copyMode);
  const copyModeLabel = copyMode === "bind" ? "Bind" : "Unbind";

  const filteredPresets = useMemo(() => {
    const query = normalizeText(search);

    return keybindPresets.filter((preset) => {
      const matchesClass = activeClass === "All" || preset.className === activeClass;
      const matchesType = activeType === "All" || preset.type === activeType;
      const matchesSafety = safetyFilter === "All" || preset.difficulty === safetyFilter;
      const haystack = normalizeText(
        `${preset.title} ${preset.type} ${preset.className} ${preset.plainEnglish} ${
          preset.command
        } ${preset.searchTerms.join(" ")}`,
      );

      return (
        matchesClass &&
        matchesType &&
        matchesSafety &&
        (!query || haystack.includes(query))
      );
    });
  }, [activeClass, activeType, safetyFilter, search]);

  const grouped = useMemo(() => groupedPresets(filteredPresets), [filteredPresets]);

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

  function clearFilters() {
    setSearch("");
    setActiveClass("All");
    setActiveType("All");
    setSafetyFilter("All");
  }

  return (
    <main className="min-h-dvh bg-[var(--app-bg)] text-[var(--text-main)]">
      <section className="top-band">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <div className="small-label">BindForge NW</div>
              <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-normal sm:text-5xl">
                Find a Neverwinter keybind without learning commands.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-soft)]">
                Pick your class, pick what you want to do, change the key if you want, then copy.
              </p>
            </div>
            <div className="search-panel">
              <label className="big-search">
                <span>Search keybinds</span>
                <input
                  autoComplete="off"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Try bard, invoke, buff, companion, animation cancel..."
                  value={search}
                />
              </label>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="quick-stat">
                  <strong>{keybindPresets.length}</strong>
                  <span>Binds</span>
                </div>
                <div className="quick-stat">
                  <strong>{keyCombos.length}</strong>
                  <span>Keys</span>
                </div>
                <div className="quick-stat">
                  <strong>{consoleCommands.length}</strong>
                  <span>Commands</span>
                </div>
              </div>
              <div className="mode-toggle mt-3" aria-label="Choose copy mode">
                <button
                  className={copyMode === "bind" ? "mode-active" : ""}
                  onClick={() => setCopyMode("bind")}
                  type="button"
                >
                  Bind
                </button>
                <button
                  className={copyMode === "unbind" ? "mode-active" : ""}
                  onClick={() => setCopyMode("unbind")}
                  type="button"
                >
                  Unbind
                </button>
              </div>
              <p className="mode-help">
                {copyMode === "bind"
                  ? "Bind mode adds or changes a keybind."
                  : "Unbind mode removes the chosen keybind from that key."}
              </p>
              <div className="mt-3 min-h-5 text-sm font-semibold text-[var(--success)]" role="status">
                {copied ? `Copied ${copied}.` : ""}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[300px_1fr] lg:px-8">
        <aside className="filter-rail">
          <div className="filter-box">
            <div className="step-title">1. Choose class</div>
            <div className="choice-list">
              {classFilters.map((className) => (
                <button
                  className={`choice-button ${activeClass === className ? "choice-active" : ""}`}
                  key={className}
                  onClick={() => setActiveClass(className)}
                  type="button"
                >
                  {className}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-box">
            <div className="step-title">2. Choose what it does</div>
            <div className="choice-list">
              {typeFilters.map((type) => (
                <button
                  className={`choice-button ${activeType === type ? "choice-active" : ""}`}
                  key={type}
                  onClick={() => setActiveType(type)}
                  type="button"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-box">
            <div className="step-title">3. Choose difficulty</div>
            <div className="choice-list">
              {(["All", "Easy", "Advanced", "Risky"] as const).map((item) => (
                <button
                  className={`choice-button ${safetyFilter === item ? "choice-active" : ""}`}
                  key={item}
                  onClick={() => setSafetyFilter(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button className="clear-button" onClick={clearFilters} type="button">
            Clear all filters
          </button>
        </aside>

        <section className="min-w-0">
          <div className="coverage-strip">
            <div>
              <strong>Ready binds</strong>
              <span>Imported from your Desktop text file and organized by class and use.</span>
            </div>
            <div>
              <strong>Possible keys</strong>
              <span>{keyCombos.length} combos from neverwinter-possible-keybind-combos.md.</span>
            </div>
            <div>
              <strong>Wiki commands</strong>
              <span>{consoleCommands.length} commands from the Neverwinter console command page.</span>
            </div>
          </div>

          <div className="result-header">
            <div>
              <div className="small-label">Ready to copy</div>
              <h2>{filteredPresets.length} keybinds found</h2>
            </div>
            <p>
              Current mode: {copyModeLabel}. Warnings show when your chosen key may already be
              used by the game.
            </p>
          </div>

          <div className="mt-4 space-y-6">
            {Object.entries(grouped).map(([groupName, presets]) => (
              <section className="bind-group" key={groupName}>
                <div className="group-heading">
                  <h3>{groupName}</h3>
                  <span>{presets.length} binds</span>
                </div>
                <div className="bind-grid">
                  {presets.map((preset) => {
                    const keyValue = customKeys[preset.id] ?? preset.defaultKey;
                    const bind = presetLine(preset, keyValue, copyMode);
                    const warning = warningForKey(keyValue);

                    return (
                      <article className="bind-card" key={preset.id}>
                        <div className="card-topline">
                          <span className={`level-pill level-${preset.difficulty.toLowerCase()}`}>
                            {preset.difficulty}
                          </span>
                          <span>{preset.className}</span>
                        </div>
                        <h4>{preset.title}</h4>
                        <p>{preset.plainEnglish}</p>

                        <label className="key-field">
                          <span>Key to press</span>
                          <input
                            onChange={(event) => setPresetKey(preset.id, event.target.value)}
                            value={keyValue}
                          />
                        </label>

                        {warning ? (
                          <div className={`key-warning warning-${warning.level}`}>
                            {warning.message}
                          </div>
                        ) : (
                          <div className="key-warning warning-safe">
                            No common conflict found for this key.
                          </div>
                        )}

                        <code className="bind-output">{bind}</code>

                        <div className="card-actions">
                          <button
                            className="copy-button"
                            onClick={() => copyText(bind, preset.title)}
                            type="button"
                          >
                            Copy {copyModeLabel.toLowerCase()}
                          </button>
                          <button
                            className="reset-button"
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
              </section>
            ))}
          </div>

          {filteredPresets.length === 0 ? (
            <div className="empty-state">
              <h2>No keybinds found</h2>
              <p>Try words like bard, invoke, companion, buff, potion, warlock, or animation cancel.</p>
              <button className="copy-button mt-4" onClick={clearFilters} type="button">
                Show all keybinds
              </button>
            </div>
          ) : null}
        </section>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <details className="advanced-panel">
          <summary>Full lists: build your own command</summary>
          <div className="mt-5 grid gap-6 xl:grid-cols-[360px_1fr]">
            <div>
              <p className="advanced-note">
                Pick any key combo and any wiki command. In Unbind mode, only the key is copied
                because that is what gets removed.
              </p>
              <label className="key-field">
                <span>Key to press</span>
                <input
                  onChange={(event) => setSelectedCombo(normalizeCombo(event.target.value))}
                  value={selectedCombo}
                />
              </label>
              <label className="key-field mt-4">
                <span>Extra command text</span>
                <input
                  onChange={(event) => setCustomArgs(event.target.value)}
                  placeholder={selectedCommand.params || "optional"}
                  value={customArgs}
                />
              </label>
              <code className="bind-output mt-4">{advancedBind}</code>
              <button
                className="copy-button mt-4 w-full"
                onClick={() => copyText(advancedBind, "custom command")}
                type="button"
              >
                Copy custom {copyModeLabel.toLowerCase()}
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <div className="advanced-head">
                  <h3>All key combos ({filteredCombos.length})</h3>
                  <label>
                    <input
                      checked={showAdvancedCombos}
                      onChange={(event) => setShowAdvancedCombos(event.target.checked)}
                      type="checkbox"
                    />
                    Show risky keys
                  </label>
                </div>
                <div className="advanced-controls">
                  <input
                    onChange={(event) => setComboSearch(event.target.value)}
                    placeholder="Search combos"
                    value={comboSearch}
                  />
                  <select
                    onChange={(event) => setComboCategory(event.target.value)}
                    value={comboCategory}
                  >
                    {comboCategories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="scroll-list">
                  {filteredCombos.map((combo) => (
                    <button
                      className="list-row"
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
                <h3>All wiki commands ({filteredCommands.length})</h3>
                <div className="advanced-controls">
                  <input
                    onChange={(event) => setCommandSearch(event.target.value)}
                    placeholder="Search commands"
                    value={commandSearch}
                  />
                  <select
                    onChange={(event) => setCommandCategory(event.target.value)}
                    value={commandCategory}
                  >
                    {commandCategories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="scroll-list">
                  {filteredCommands.map((command) => (
                    <button
                      className="command-row"
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
        </details>
      </section>
    </main>
  );
}
