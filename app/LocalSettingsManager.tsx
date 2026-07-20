"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const STORAGE_KEY = "bindforge-nw:settings:v1";

type SavedSettings = {
  version: 1;
  savedAt: string;
  keys: Record<string, string>;
  filters: {
    className: string;
    actionType: string;
    difficulty: string;
    search: string;
    mode: "bind" | "unbind";
  };
  commandLab: {
    key: string;
    extraText: string;
    keySearch: string;
    keyCategory: string;
    commandSearch: string;
    commandCategory: string;
    showRisky: boolean;
  };
};

const emptySettings: SavedSettings = {
  version: 1,
  savedAt: new Date(0).toISOString(),
  keys: {},
  filters: {
    className: "All classes",
    actionType: "All actions",
    difficulty: "All",
    search: "",
    mode: "bind",
  },
  commandLab: {
    key: "",
    extraText: "",
    keySearch: "",
    keyCategory: "All",
    commandSearch: "",
    commandCategory: "All",
    showRisky: false,
  },
};

function readSettings(): SavedSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySettings;
    const parsed = JSON.parse(raw) as Partial<SavedSettings>;
    if (parsed.version !== 1) return emptySettings;
    return {
      ...emptySettings,
      ...parsed,
      keys: parsed.keys ?? {},
      filters: { ...emptySettings.filters, ...(parsed.filters ?? {}) },
      commandLab: { ...emptySettings.commandLab, ...(parsed.commandLab ?? {}) },
    };
  } catch {
    return emptySettings;
  }
}

function dispatchValue(element: HTMLInputElement | HTMLSelectElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(
    element instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLSelectElement.prototype,
    "value",
  );
  descriptor?.set?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function clickButtonByText(container: ParentNode, text: string) {
  const button = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
    (item) => item.textContent?.trim().toLowerCase() === text.trim().toLowerCase(),
  );
  button?.click();
}

function keyId(input: HTMLInputElement) {
  return input.getAttribute("aria-describedby")?.replace(/-key-help$/, "") ?? "";
}

function visibleText(element: Element | null) {
  return element?.textContent?.trim() ?? "";
}

function collectSettings(previous: SavedSettings): SavedSettings {
  const keys = { ...previous.keys };
  document.querySelectorAll<HTMLInputElement>(".bind-card .key-field input[aria-describedby]").forEach((input) => {
    const id = keyId(input);
    if (id) keys[id] = input.value;
  });

  const filterSections = Array.from(document.querySelectorAll<HTMLElement>(".filter-section"));
  const selectedIn = (label: string, fallback: string) => {
    const section = filterSections.find((item) => visibleText(item.querySelector("legend")) === label);
    return visibleText(section?.querySelector('button[aria-pressed="true"]')) || fallback;
  };

  const search = document.querySelector<HTMLInputElement>(".library-toolbar input[type='search']")?.value ?? "";
  const mode = visibleText(document.querySelector(".segmented-control button[aria-pressed='true']")).toLowerCase() === "unbind" ? "unbind" : "bind";
  const labInputs = Array.from(document.querySelectorAll<HTMLInputElement>(".lab-fields .key-field input"));
  const referencePanels = Array.from(document.querySelectorAll<HTMLElement>(".reference-panel"));
  const keyPanel = referencePanels[0];
  const commandPanel = referencePanels[1];

  return {
    version: 1,
    savedAt: new Date().toISOString(),
    keys,
    filters: {
      className: selectedIn("Class", previous.filters.className),
      actionType: selectedIn("Action type", previous.filters.actionType),
      difficulty: selectedIn("Difficulty", previous.filters.difficulty),
      search,
      mode,
    },
    commandLab: {
      key: labInputs[0]?.value ?? previous.commandLab.key,
      extraText: labInputs[1]?.value ?? previous.commandLab.extraText,
      keySearch: keyPanel?.querySelector<HTMLInputElement>(".reference-controls input")?.value ?? "",
      keyCategory: keyPanel?.querySelector<HTMLSelectElement>(".reference-controls select")?.value ?? "All",
      commandSearch: commandPanel?.querySelector<HTMLInputElement>(".reference-controls input")?.value ?? "",
      commandCategory: commandPanel?.querySelector<HTMLSelectElement>(".reference-controls select")?.value ?? "All",
      showRisky: keyPanel?.querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked ?? false,
    },
  };
}

function restoreCards(settings: SavedSettings) {
  document.querySelectorAll<HTMLInputElement>(".bind-card .key-field input[aria-describedby]").forEach((input) => {
    const id = keyId(input);
    const saved = settings.keys[id];
    if (saved !== undefined && input.value !== saved) dispatchValue(input, saved);
  });
}

function restoreInterface(settings: SavedSettings) {
  const panel = document.querySelector(".filter-panel");
  if (panel) {
    clickButtonByText(panel, settings.filters.className);
    clickButtonByText(panel, settings.filters.actionType);
    clickButtonByText(panel, settings.filters.difficulty);
  }

  const search = document.querySelector<HTMLInputElement>(".library-toolbar input[type='search']");
  if (search) dispatchValue(search, settings.filters.search);
  clickButtonByText(document.querySelector(".segmented-control") ?? document, settings.filters.mode);

  const labInputs = Array.from(document.querySelectorAll<HTMLInputElement>(".lab-fields .key-field input"));
  if (labInputs[0]) dispatchValue(labInputs[0], settings.commandLab.key);
  if (labInputs[1]) dispatchValue(labInputs[1], settings.commandLab.extraText);

  const referencePanels = Array.from(document.querySelectorAll<HTMLElement>(".reference-panel"));
  const keyPanel = referencePanels[0];
  const commandPanel = referencePanels[1];
  const keySearch = keyPanel?.querySelector<HTMLInputElement>(".reference-controls input");
  const keyCategory = keyPanel?.querySelector<HTMLSelectElement>(".reference-controls select");
  const showRisky = keyPanel?.querySelector<HTMLInputElement>('input[type="checkbox"]');
  const commandSearch = commandPanel?.querySelector<HTMLInputElement>(".reference-controls input");
  const commandCategory = commandPanel?.querySelector<HTMLSelectElement>(".reference-controls select");
  if (keySearch) dispatchValue(keySearch, settings.commandLab.keySearch);
  if (keyCategory) dispatchValue(keyCategory, settings.commandLab.keyCategory);
  if (showRisky && showRisky.checked !== settings.commandLab.showRisky) showRisky.click();
  if (commandSearch) dispatchValue(commandSearch, settings.commandLab.commandSearch);
  if (commandCategory) dispatchValue(commandCategory, settings.commandLab.commandCategory);

  window.setTimeout(() => restoreCards(settings), 50);
}

export default function LocalSettingsManager() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [status, setStatus] = useState("Saved automatically in this browser");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const restoring = useRef(true);

  useEffect(() => {
    setPortalTarget(document.querySelector<HTMLElement>(".filter-panel"));
    const settings = readSettings();
    setSavedAt(settings.savedAt === emptySettings.savedAt ? null : settings.savedAt);

    const restoreTimer = window.setTimeout(() => {
      restoreInterface(settings);
      restoring.current = false;
      setStatus(settings.savedAt === emptySettings.savedAt ? "Ready to save customizations" : "Previous settings restored");
    }, 120);

    let saveTimer = 0;
    const save = () => {
      if (restoring.current) return;
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        const next = collectSettings(readSettings());
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setSavedAt(next.savedAt);
        setStatus("Saved automatically");
      }, 220);
    };

    const observer = new MutationObserver(() => {
      restoreCards(readSettings());
      if (!portalTarget) setPortalTarget(document.querySelector<HTMLElement>(".filter-panel"));
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("input", save, true);
    document.addEventListener("change", save, true);
    document.addEventListener("click", save, true);

    return () => {
      window.clearTimeout(restoreTimer);
      window.clearTimeout(saveTimer);
      observer.disconnect();
      document.removeEventListener("input", save, true);
      document.removeEventListener("change", save, true);
      document.removeEventListener("click", save, true);
    };
  }, [portalTarget]);

  const savedLabel = useMemo(() => {
    if (!savedAt) return "No local backup yet";
    try {
      return `Last saved ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(savedAt))}`;
    } catch {
      return "Local backup available";
    }
  }, [savedAt]);

  function exportBackup() {
    const settings = collectSettings(readSettings());
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bindforge-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSavedAt(settings.savedAt);
    setStatus("Backup file exported");
  }

  async function importBackup(file: File) {
    try {
      const parsed = JSON.parse(await file.text()) as SavedSettings;
      if (parsed.version !== 1 || typeof parsed.keys !== "object") throw new Error("Invalid backup");
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      restoring.current = true;
      restoreInterface(parsed);
      window.setTimeout(() => {
        restoring.current = false;
        setSavedAt(parsed.savedAt ?? new Date().toISOString());
        setStatus("Backup imported and restored");
      }, 250);
    } catch {
      setStatus("That file is not a valid BindForge backup");
    }
  }

  function clearLocalData() {
    if (!window.confirm("Clear all saved BindForge settings from this browser?")) return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  if (!portalTarget) return null;

  return createPortal(
    <section className="local-backup-card" aria-labelledby="local-backup-title">
      <div className="local-backup-heading">
        <div>
          <p className="eyebrow">Browser backup</p>
          <h3 id="local-backup-title">Your setup stays here</h3>
        </div>
        <span className="local-save-dot" aria-hidden="true" />
      </div>
      <p className="local-backup-copy">
        Custom keys, filters, output mode, and command-lab settings are saved automatically on this device.
      </p>
      <div className="local-save-status" role="status" aria-live="polite">
        <strong>{status}</strong>
        <span>{savedLabel}</span>
      </div>
      <div className="local-backup-actions">
        <button className="local-primary-action" onClick={exportBackup} type="button">Export backup</button>
        <button className="local-secondary-action" onClick={() => fileInput.current?.click()} type="button">Import backup</button>
        <button className="local-danger-action" onClick={clearLocalData} type="button">Clear saved data</button>
      </div>
      <input
        accept="application/json,.json"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void importBackup(file);
          event.target.value = "";
        }}
        ref={fileInput}
        type="file"
      />
      <p className="local-privacy-note">Stored only in this browser. Clearing site data removes it unless you export a backup file.</p>
    </section>,
    portalTarget,
  );
}
