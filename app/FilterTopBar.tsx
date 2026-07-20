"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { keybindPresets } from "./data/keybindPresets";

const actionTypes = ["All", ...Array.from(new Set(keybindPresets.map((preset) => preset.type)))];

function textOf(element: Element | null | undefined) {
  return element?.textContent?.trim() ?? "";
}

function setControlledInput(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function clickButtonByText(container: ParentNode, label: string) {
  const target = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
    (button) => textOf(button).toLowerCase() === label.toLowerCase(),
  );
  target?.click();
}

function selectedActionType() {
  const sections = Array.from(document.querySelectorAll<HTMLElement>(".filter-section"));
  const section = sections.find((item) => textOf(item.querySelector("legend")) === "Action type");
  return textOf(section?.querySelector('button[aria-pressed="true"]')) || "All actions";
}

function selectedMode() {
  return textOf(document.querySelector('.segmented-control button[aria-pressed="true"]')).toLowerCase() === "unbind"
    ? "unbind"
    : "bind";
}

export default function FilterTopBar() {
  const [ready, setReady] = useState(false);
  const [actionType, setActionType] = useState("All actions");
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"bind" | "unbind">("bind");
  const [resultCount, setResultCount] = useState(keybindPresets.length);

  const actionOptions = useMemo(
    () => actionTypes.map((type) => ({ value: type === "All" ? "All actions" : type, label: type === "All" ? "All actions" : type })),
    [],
  );

  useEffect(() => {
    setReady(true);

    const syncFromPage = () => {
      setActionType(selectedActionType());
      setMode(selectedMode());
      setSearch(document.querySelector<HTMLInputElement>(".library-toolbar input[type='search']")?.value ?? "");
      const heading = textOf(document.querySelector(".library-toolbar h2"));
      const count = Number.parseInt(heading, 10);
      if (Number.isFinite(count)) setResultCount(count);
    };

    const timer = window.setTimeout(syncFromPage, 80);
    const observer = new MutationObserver(syncFromPage);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-pressed"] });
    document.addEventListener("input", syncFromPage, true);
    document.addEventListener("change", syncFromPage, true);
    document.addEventListener("click", syncFromPage, true);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("input", syncFromPage, true);
      document.removeEventListener("change", syncFromPage, true);
      document.removeEventListener("click", syncFromPage, true);
    };
  }, []);

  function chooseAction(value: string) {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".filter-section"));
    const section = sections.find((item) => textOf(item.querySelector("legend")) === "Action type");
    if (section) clickButtonByText(section, value);
    setActionType(value);
  }

  function updateSearch(value: string) {
    const input = document.querySelector<HTMLInputElement>(".library-toolbar input[type='search']");
    if (input) setControlledInput(input, value);
    setSearch(value);
  }

  function chooseMode(nextMode: "bind" | "unbind") {
    const control = document.querySelector(".segmented-control");
    if (control) clickButtonByText(control, nextMode);
    setMode(nextMode);
  }

  function resetAll() {
    const panel = document.querySelector(".filter-panel");
    if (panel) clickButtonByText(panel, "Reset all");
    updateSearch("");
    setActionType("All actions");
    setMode("bind");
  }

  if (!ready) return null;

  return createPortal(
    <section className="filter-top-bar" aria-label="Keybind filters and search">
      <div className="filter-top-summary">
        <span>Keybind library</span>
        <strong>{resultCount} found</strong>
      </div>

      <label className="filter-top-search">
        <span className="sr-only">Search keybinds</span>
        <input
          autoComplete="off"
          onChange={(event) => updateSearch(event.target.value)}
          placeholder="Search keybinds"
          type="search"
          value={search}
        />
      </label>

      <label className="filter-top-select">
        <span>Action type</span>
        <select onChange={(event) => chooseAction(event.target.value)} value={actionType}>
          {actionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>

      <div className="filter-top-mode" aria-label="Output mode">
        <button aria-pressed={mode === "bind"} onClick={() => chooseMode("bind")} type="button">Bind</button>
        <button aria-pressed={mode === "unbind"} onClick={() => chooseMode("unbind")} type="button">Unbind</button>
      </div>

      <button className="filter-top-reset" onClick={resetAll} type="button">Reset</button>
    </section>,
    document.body,
  );
}
