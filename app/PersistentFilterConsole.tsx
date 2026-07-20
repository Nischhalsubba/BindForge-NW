"use client";

import { useEffect, useMemo, useState } from "react";

type ConsoleState = {
  className: string;
  actionType: string;
  difficulty: string;
  search: string;
  mode: "Bind" | "Unbind";
};

type ConsoleOptions = {
  classNames: string[];
  actionTypes: string[];
  difficulties: string[];
};

const initialState: ConsoleState = {
  className: "All classes",
  actionType: "All actions",
  difficulty: "All",
  search: "",
  mode: "Bind",
};

const initialOptions: ConsoleOptions = {
  classNames: ["All classes"],
  actionTypes: ["All actions"],
  difficulties: ["All", "Easy", "Advanced", "Risky"],
};

function textOf(element: Element | null | undefined) {
  return element?.textContent?.trim() ?? "";
}

function findSection(label: string) {
  return Array.from(document.querySelectorAll<HTMLElement>(".filter-section")).find(
    (section) => textOf(section.querySelector("legend")).toLowerCase() === label.toLowerCase(),
  );
}

function sectionButtons(label: string) {
  const section = findSection(label);
  return section ? Array.from(section.querySelectorAll<HTMLButtonElement>("button")) : [];
}

function selectedLabel(label: string, fallback: string) {
  const selected = sectionButtons(label).find((button) => button.getAttribute("aria-pressed") === "true");
  return textOf(selected) || fallback;
}

function setControlledValue(element: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function clickFilter(sectionLabel: string, optionLabel: string) {
  const button = sectionButtons(sectionLabel).find(
    (item) => textOf(item).toLowerCase() === optionLabel.toLowerCase(),
  );
  button?.click();
}

export default function PersistentFilterConsole() {
  const [state, setState] = useState<ConsoleState>(initialState);
  const [options, setOptions] = useState<ConsoleOptions>(initialOptions);

  useEffect(() => {
    let frame = 0;

    const refresh = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const classNames = sectionButtons("Class").map(textOf).filter(Boolean);
        const actionTypes = sectionButtons("Action type").map(textOf).filter(Boolean);
        const difficulties = sectionButtons("Difficulty").map(textOf).filter(Boolean);
        const search = document.querySelector<HTMLInputElement>(".library-toolbar input[type='search']")?.value ?? "";
        const activeMode = textOf(document.querySelector(".segmented-control button[aria-pressed='true']"));

        setOptions({
          classNames: classNames.length ? classNames : initialOptions.classNames,
          actionTypes: actionTypes.length ? actionTypes : initialOptions.actionTypes,
          difficulties: difficulties.length ? difficulties : initialOptions.difficulties,
        });
        setState({
          className: selectedLabel("Class", initialState.className),
          actionType: selectedLabel("Action type", initialState.actionType),
          difficulty: selectedLabel("Difficulty", initialState.difficulty),
          search,
          mode: activeMode.toLowerCase() === "unbind" ? "Unbind" : "Bind",
        });
      });
    };

    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-pressed"] });
    document.addEventListener("input", refresh, true);
    document.addEventListener("click", refresh, true);
    refresh();

    return () => {
      observer.disconnect();
      document.removeEventListener("input", refresh, true);
      document.removeEventListener("click", refresh, true);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const activeCount = useMemo(
    () =>
      Number(state.className !== "All classes") +
      Number(state.actionType !== "All actions") +
      Number(state.difficulty !== "All") +
      Number(Boolean(state.search)),
    [state],
  );

  function updateSearch(value: string) {
    const input = document.querySelector<HTMLInputElement>(".library-toolbar input[type='search']");
    if (input) setControlledValue(input, value);
    setState((current) => ({ ...current, search: value }));
  }

  function setMode(mode: "Bind" | "Unbind") {
    const button = Array.from(document.querySelectorAll<HTMLButtonElement>(".segmented-control button")).find(
      (item) => textOf(item).toLowerCase() === mode.toLowerCase(),
    );
    button?.click();
  }

  function resetAll() {
    document.querySelector<HTMLButtonElement>(".filter-panel-head .text-button")?.click();
  }

  return (
    <aside className="persistent-filter-console" aria-label="Persistent keybind filters">
      <div className="persistent-filter-heading">
        <div>
          <span>Keybind filters</span>
          <strong>{activeCount ? `${activeCount} active` : "All keybinds"}</strong>
        </div>
        <button onClick={resetAll} type="button">Reset</button>
      </div>

      <label className="persistent-filter-search">
        <span>Search</span>
        <input
          autoComplete="off"
          onChange={(event) => updateSearch(event.target.value)}
          placeholder="Invoke, Bard, companion…"
          type="search"
          value={state.search}
        />
      </label>

      <div className="persistent-filter-fields">
        <label>
          <span>Class</span>
          <select value={state.className} onChange={(event) => clickFilter("Class", event.target.value)}>
            {options.classNames.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Action type</span>
          <select value={state.actionType} onChange={(event) => clickFilter("Action type", event.target.value)}>
            {options.actionTypes.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Difficulty</span>
          <select value={state.difficulty} onChange={(event) => clickFilter("Difficulty", event.target.value)}>
            {options.difficulties.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <fieldset className="persistent-mode-control">
        <legend>Output mode</legend>
        <div>
          {(["Bind", "Unbind"] as const).map((mode) => (
            <button
              aria-pressed={state.mode === mode}
              key={mode}
              onClick={() => setMode(mode)}
              type="button"
            >
              {mode}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="filter-console-backup-slot" />
    </aside>
  );
}
