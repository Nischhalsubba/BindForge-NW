"use client";

import { useMemo, useState } from "react";
import { consoleCommands } from "./data/commands";
import { keyCombos } from "./data/keyCombos";
import { keybindPresets } from "./data/keybindPresets";
import type { ConsoleCommand } from "./data/commands";
import type { KeyCombo } from "./data/keyCombos";
import type { KeybindClass, KeybindPreset, KeybindType } from "./data/keybindPresets";

const typeOrder: KeybindType[] = ["Invocation / Character", "Targeting", "VIP Services", "Bard Songs", "Animation Cancel", "Combat", "Companion", "Inventory / Buffs", "Loot / Interact", "Utility", "Camera / Screenshot", "Risky / Testing", "Social"];
const classFilters = ["All", ...Array.from(new Set(keybindPresets.map((preset) => preset.className)))] as Array<KeybindClass | "All">;
const typeFilters = ["All", ...typeOrder.filter((type) => keybindPresets.some((preset) => preset.type === type))] as Array<KeybindType | "All">;
const commandCategories = ["All", ...Array.from(new Set(consoleCommands.map((command) => command.category)))];
const comboCategories = ["All", ...Array.from(new Set(keyCombos.map((combo) => combo.category)))];
const statusLabels: Record<KeyCombo["status"], string> = { core: "Recommended", candidate: "Test first", avoid: "Risky" };
const keyWarnings: Array<{ keys: string[]; message: string; level: "info" | "warn" | "danger" }> = [
  { keys: ["w", "a", "s", "d", "space"], message: "This key is commonly used for movement or jumping.", level: "danger" },
  { keys: ["tab"], message: "Tab is often used for targeting or Bard perform mode.", level: "warn" },
  { keys: ["f", "g"], message: "This key is often used for interact, loot, or nearby prompts.", level: "warn" },
  { keys: ["i", "c", "m", "p", "j", "k", "l"], message: "This key may open a menu, inventory, map, journal, or character window.", level: "warn" },
  { keys: ["enter", "r"], message: "This key may be used for chat or replying to messages.", level: "warn" },
  { keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"], message: "Number keys are often used for powers, items, or potion slots.", level: "info" },
  { keys: ["lbutton", "rbutton", "mbutton"], message: "Mouse buttons are usually used for attacks or camera control.", level: "danger" },
  { keys: ["escape"], message: "Escape is normally used to close menus.", level: "danger" },
  { keys: ["alt+f4", "alt+tab", "ctrl+alt+delete"], message: "This combination is reserved by Windows. Avoid using it.", level: "danger" },
];
const modifierAliases: Record<string, "ctrl" | "alt" | "shift"> = {
  ctrl: "ctrl", control: "ctrl", lctrl: "ctrl", leftctrl: "ctrl", leftcontrol: "ctrl", rctrl: "ctrl", rightctrl: "ctrl", rightcontrol: "ctrl",
  alt: "alt", lalt: "alt", leftalt: "alt", ralt: "alt", rightalt: "alt",
  shift: "shift", lshift: "shift", leftshift: "shift", rshift: "shift", rightshift: "shift",
};

function normalizeText(value: string) { return value.trim().toLowerCase(); }
function normalizeCombo(value: string) {
  const parts = value.split("+").map((part) => part.trim().toLowerCase().replace(/\s+/g, "")).filter(Boolean);
  const modifiers: Array<"ctrl" | "alt" | "shift"> = [];
  const keys: string[] = [];
  for (const part of parts) {
    const modifier = modifierAliases[part];
    if (modifier) { if (!modifiers.includes(modifier)) modifiers.push(modifier); } else keys.push(part);
  }
  const ordered = (["ctrl", "alt", "shift"] as const).filter((modifier) => modifiers.includes(modifier));
  return [...ordered, ...keys].join("+");
}
function baseKey(value: string) { const combo = normalizeCombo(value); return combo.split("+").pop() ?? combo; }
function warningForKey(value: string) {
  const combo = normalizeCombo(value);
  const key = baseKey(value);
  return keyWarnings.find((warning) => warning.keys.includes(combo) || warning.keys.includes(key));
}
function presetLine(preset: KeybindPreset, keyValue: string, mode: "bind" | "unbind") {
  const key = normalizeCombo(keyValue) || preset.defaultKey;
  return mode === "bind" ? `/bind ${key} ${preset.command}` : `/unbind ${key}`;
}
function customLine(keyValue: string, command: ConsoleCommand, customArgs: string, mode: "bind" | "unbind") {
  const key = normalizeCombo(keyValue) || "<key>";
  if (mode === "unbind") return `/unbind ${key}`;
  return `/bind ${key} ${command.bindCommand}${customArgs.trim() ? ` ${customArgs.trim()}` : ""}`;
}
function commandLabel(command: ConsoleCommand) { return `${command.command}${command.params ? ` ${command.params}` : ""}`; }
function groupedPresets(presets: KeybindPreset[]) {
  return presets.reduce<Record<string, KeybindPreset[]>>((groups, preset) => {
    const key = `${preset.type} · ${preset.className}`;
    groups[key] = [...(groups[key] ?? []), preset];
    return groups;
  }, {});
}
function Icon({ name }: { name: "forge" | "search" | "keyboard" | "code" | "shield" | "copy" | "reset" | "filter" | "spark" }) {
  const paths = {
    forge: <path d="M12 2 9 7l3 3 3-3-3-5Zm-5.5 9.5L3 15l6 6h6l6-6-3.5-3.5L15 14h-6l-2.5-2.5Z" />,
    search: <path d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />,
    keyboard: <path d="M3 6h18v12H3V6Zm4 4h.01M10 10h.01M13 10h.01M16 10h.01M7 13h.01M10 13h.01M13 13h4M7 16h10" />,
    code: <path d="m8 9-4 3 4 3m8-6 4 3-4 3m-2-8-4 10" />,
    shield: <path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6l-7-3Zm-3 9 2 2 4-4" />,
    copy: <path d="M8 8h11v11H8V8Zm-3 8H4V5h11v1" />,
    reset: <path d="M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7" />,
    filter: <path d="M4 6h16M7 12h10m-7 6h4" />,
    spark: <path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Zm6 11 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z" />,
  };
  return <svg aria-hidden="true" className="ui-icon" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">{paths[name]}</svg>;
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeClass, setActiveClass] = useState<KeybindClass | "All">("All");
  const [activeType, setActiveType] = useState<KeybindType | "All">("All");
  const [safetyFilter, setSafetyFilter] = useState<"All" | "Easy" | "Advanced" | "Risky">("All");
  const [customKeys, setCustomKeys] = useState<Record<string, string>>(() => Object.fromEntries(keybindPresets.map((preset) => [preset.id, preset.defaultKey])));
  const [copied, setCopied] = useState("");
  const [copyMode, setCopyMode] = useState<"bind" | "unbind">("bind");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");
  const [commandCategory, setCommandCategory] = useState("All");
  const [comboSearch, setComboSearch] = useState("");
  const [comboCategory, setComboCategory] = useState("All");
  const [showAdvancedCombos, setShowAdvancedCombos] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState("ctrl+b");
  const [selectedCommandId, setSelectedCommandId] = useState("gensendmessage");
  const [customArgs, setCustomArgs] = useState("Vipaction_Bankvendor activate");

  const selectedCommand = consoleCommands.find((command) => command.id === selectedCommandId) ?? consoleCommands[0];
  const advancedBind = customLine(selectedCombo, selectedCommand, customArgs, copyMode);
  const filteredPresets = useMemo(() => {
    const query = normalizeText(search);
    return keybindPresets.filter((preset) => {
      const haystack = normalizeText(`${preset.title} ${preset.type} ${preset.className} ${preset.plainEnglish} ${preset.command} ${preset.searchTerms.join(" ")}`);
      return (activeClass === "All" || preset.className === activeClass) && (activeType === "All" || preset.type === activeType) && (safetyFilter === "All" || preset.difficulty === safetyFilter) && (!query || haystack.includes(query));
    }).sort((left, right) => typeOrder.indexOf(left.type) - typeOrder.indexOf(right.type));
  }, [activeClass, activeType, safetyFilter, search]);
  const grouped = useMemo(() => groupedPresets(filteredPresets), [filteredPresets]);
  const filteredCommands = useMemo(() => {
    const query = normalizeText(commandSearch);
    return consoleCommands.filter((command) => {
      const haystack = normalizeText(`${command.command} ${command.bindCommand} ${command.params} ${command.aliases.join(" ")} ${command.category}`);
      return (commandCategory === "All" || command.category === commandCategory) && (!query || haystack.includes(query));
    });
  }, [commandCategory, commandSearch]);
  const filteredCombos = useMemo(() => {
    const query = normalizeText(comboSearch);
    return keyCombos.filter((combo) => {
      const haystack = normalizeText(`${combo.combo} ${combo.baseKey} ${combo.modifiers.join(" ")} ${combo.category} ${combo.status} ${combo.note ?? ""}`);
      return (comboCategory === "All" || combo.category === comboCategory) && (showAdvancedCombos || combo.status === "core") && (!query || haystack.includes(query));
    });
  }, [comboCategory, comboSearch, showAdvancedCombos]);

  async function copyText(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1800);
  }
  function clearFilters() { setSearch(""); setActiveClass("All"); setActiveType("All"); setSafetyFilter("All"); }
  function chooseCommand(command: ConsoleCommand) {
    setSelectedCommandId(command.id);
    setCustomArgs(command.params && !/[<>]| or | to /i.test(command.params) ? command.params : "");
  }

  return (
    <main className="app-shell">
      <a className="skip-link" href="#keybind-library">Skip to keybind library</a>
      <header className="app-header">
        <div className="brand-lockup"><div className="brand-mark"><Icon name="forge" /></div><div><p className="eyebrow">Neverwinter utility</p><h1>BindForge NW</h1><p className="brand-subtitle">Find, test, and copy safer keybind commands.</p></div></div>
        <div className="header-stats" aria-label="Catalog summary">
          <div className="stat-card"><Icon name="spark" /><span><strong>{keybindPresets.length}</strong> keybinds</span></div>
          <div className="stat-card"><Icon name="keyboard" /><span><strong>{keyCombos.length}</strong> possible keys</span></div>
          <div className="stat-card"><Icon name="code" /><span><strong>{consoleCommands.length}</strong> wiki commands</span></div>
        </div>
        <div className="ready-state" role="status" aria-live="polite"><Icon name="shield" /><span><strong>{copied ? `Copied ${copied}` : "Ready to copy"}</strong><small>Review warnings before testing</small></span></div>
      </header>

      <section className="workspace">
        <button aria-expanded={filtersOpen} aria-controls="filter-panel" className="mobile-filter-button" onClick={() => setFiltersOpen((open) => !open)} type="button"><Icon name="filter" /> Filters</button>
        <aside className={`filter-panel ${filtersOpen ? "filter-panel-open" : ""}`} id="filter-panel">
          <div className="filter-panel-head"><div><p className="eyebrow">Refine results</p><h2>Filters</h2></div><button className="text-button" onClick={clearFilters} type="button">Reset all</button></div>
          <fieldset className="filter-section"><legend>Class</legend><div className="filter-options">{classFilters.map((className) => <button aria-pressed={activeClass === className} className="filter-option" key={className} onClick={() => setActiveClass(className)} type="button"><span>{className === "All" ? "All classes" : className}</span>{activeClass === className ? <span aria-hidden="true">✓</span> : null}</button>)}</div></fieldset>
          <fieldset className="filter-section"><legend>Action type</legend><div className="filter-options compact-options">{typeFilters.map((type) => <button aria-pressed={activeType === type} className="filter-option" key={type} onClick={() => setActiveType(type)} type="button"><span>{type === "All" ? "All actions" : type}</span>{activeType === type ? <span aria-hidden="true">✓</span> : null}</button>)}</div></fieldset>
          <fieldset className="filter-section"><legend>Difficulty</legend><div className="difficulty-options">{(["All", "Easy", "Advanced", "Risky"] as const).map((item) => <button aria-pressed={safetyFilter === item} className={`difficulty-chip difficulty-${item.toLowerCase()}`} key={item} onClick={() => setSafetyFilter(item)} type="button">{item}</button>)}</div></fieldset>
          <div className="filter-tip"><Icon name="shield" /><p><strong>Back up first.</strong> Save your current binds before testing unfamiliar commands.</p></div>
        </aside>

        <section className="library" id="keybind-library">
          <div className="library-toolbar">
            <div><p className="eyebrow">Keybind library</p><h2>{filteredPresets.length} keybinds found</h2><p>Commands remain editable. The preview updates as you type.</p></div>
            <div className="toolbar-controls">
              <label className="search-control"><span className="sr-only">Search keybinds</span><Icon name="search" /><input autoComplete="off" onChange={(event) => setSearch(event.target.value)} placeholder="Search invoke, Bard, companion…" type="search" value={search} /></label>
              <div className="segmented-control" aria-label="Choose output mode"><button aria-pressed={copyMode === "bind"} onClick={() => setCopyMode("bind")} type="button">Bind</button><button aria-pressed={copyMode === "unbind"} onClick={() => setCopyMode("unbind")} type="button">Unbind</button></div>
            </div>
          </div>
          <div className="active-filter-row" aria-label="Active filters"><span>{activeClass === "All" ? "All classes" : activeClass}</span><span>{activeType === "All" ? "All actions" : activeType}</span><span>{safetyFilter === "All" ? "All difficulty levels" : safetyFilter}</span></div>

          {filteredPresets.length ? <div className="group-stack">{Object.entries(grouped).map(([groupName, presets]) => <section className="bind-group" key={groupName}>
            <div className="group-heading"><div><h3>{groupName}</h3><p>Copy-ready presets with editable keys</p></div><span>{presets.length} {presets.length === 1 ? "bind" : "binds"}</span></div>
            <div className="bind-grid">{presets.map((preset) => {
              const keyValue = customKeys[preset.id] ?? preset.defaultKey;
              const bind = presetLine(preset, keyValue, copyMode);
              const warning = warningForKey(keyValue);
              return <article className="bind-card" key={preset.id}>
                <div className="card-header"><div className="card-meta"><span className={`level-pill level-${preset.difficulty.toLowerCase()}`}>{preset.difficulty}</span><span>{preset.className}</span></div><span className="card-type">{preset.type}</span></div>
                <div className="card-copy"><h4>{preset.title}</h4><p>{preset.plainEnglish}</p></div>
                <div className="card-editor"><label className="key-field"><span>Key combination</span><input aria-describedby={`${preset.id}-key-help`} onChange={(event) => setCustomKeys((current) => ({ ...current, [preset.id]: event.target.value }))} spellCheck={false} value={keyValue} /><small id={`${preset.id}-key-help`}>Examples: F3, Ctrl+R, Left Ctrl+Shift+R</small></label><div className={`key-status ${warning ? `status-${warning.level}` : "status-safe"}`}><Icon name="shield" /><span>{warning?.message ?? "No common conflict found for this key."}</span></div></div>
                <div className="command-preview"><div className="command-label"><span>Command preview</span><span>{copyMode}</span></div><code>{bind}</code></div>
                <div className="card-actions"><button className="primary-button" onClick={() => copyText(bind, preset.title)} type="button"><Icon name="copy" /> Copy command</button><button className="secondary-button" onClick={() => setCustomKeys((current) => ({ ...current, [preset.id]: preset.defaultKey }))} type="button"><Icon name="reset" /> Reset</button></div>
              </article>;
            })}</div>
          </section>)}</div> : <div className="empty-state"><div className="empty-icon"><Icon name="search" /></div><h3>No matching keybinds</h3><p>Try a broader search or clear one of the active filters.</p><button className="primary-button" onClick={clearFilters} type="button">Clear filters</button></div>}
        </section>
      </section>

      <section className="command-lab" aria-labelledby="command-lab-title">
        <div className="command-lab-intro"><p className="eyebrow">Advanced workspace</p><h2 id="command-lab-title">Build your own command</h2><p>Combine a supported key with any catalog command. Test carefully; community commands may change after patches.</p><div className="lab-preview"><span>Generated command</span><code>{advancedBind}</code><button className="primary-button" onClick={() => copyText(advancedBind, "custom command")} type="button"><Icon name="copy" /> Copy custom command</button></div></div>
        <div className="lab-builder">
          <div className="lab-fields"><label className="key-field"><span>Key combination</span><input onChange={(event) => setSelectedCombo(event.target.value)} value={selectedCombo} /></label><label className="key-field"><span>Extra command text</span><input onChange={(event) => setCustomArgs(event.target.value)} placeholder={selectedCommand.params || "Optional arguments"} value={customArgs} /></label></div>
          <div className="reference-grid">
            <section className="reference-panel"><div className="reference-heading"><div><h3>Key combinations</h3><p>{filteredCombos.length} shown</p></div><label className="checkbox-label"><input checked={showAdvancedCombos} onChange={(event) => setShowAdvancedCombos(event.target.checked)} type="checkbox" /> Show risky</label></div><div className="reference-controls"><input onChange={(event) => setComboSearch(event.target.value)} placeholder="Search keys" value={comboSearch} /><select aria-label="Filter key combinations by category" onChange={(event) => setComboCategory(event.target.value)} value={comboCategory}>{comboCategories.map((category) => <option key={category}>{category}</option>)}</select></div><div className="reference-list">{filteredCombos.map((combo) => <button className="reference-row" key={combo.combo} onClick={() => setSelectedCombo(combo.combo)} type="button"><span>{combo.combo}</span><strong data-status={combo.status}>{statusLabels[combo.status]}</strong></button>)}</div></section>
            <section className="reference-panel"><div className="reference-heading"><div><h3>Wiki commands</h3><p>{filteredCommands.length} shown</p></div></div><div className="reference-controls"><input onChange={(event) => setCommandSearch(event.target.value)} placeholder="Search commands" value={commandSearch} /><select aria-label="Filter commands by category" onChange={(event) => setCommandCategory(event.target.value)} value={commandCategory}>{commandCategories.map((category) => <option key={category}>{category}</option>)}</select></div><div className="reference-list">{filteredCommands.map((command) => <button className="reference-row command-row" key={`${command.id}-${command.category}-${command.params}`} onClick={() => chooseCommand(command)} type="button"><span>{command.command}</span><small>{commandLabel(command)}</small></button>)}</div></section>
          </div>
        </div>
      </section>
      <footer className="app-footer"><p>BindForge NW is a community utility. Commands may change between Neverwinter patches.</p><a href="https://github.com/Nischhalsubba/BindForge-NW">View source on GitHub</a></footer>
    </main>
  );
}
