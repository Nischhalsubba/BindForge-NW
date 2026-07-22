"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MAX_BACKUP_BYTES,
  createDefaultBackup,
  parseBackupJson,
  parseBackupValue,
} from "./lib/backup-schema.mjs";
import type { SavedSettingsV2 } from "./lib/backup-schema.mjs";

const STORAGE_KEY = "bindforge-nw:settings:v2";
const LEGACY_STORAGE_KEY = "bindforge-nw:settings:v1";
const defaults = createDefaultBackup(new Date(0).toISOString());

type ControlledField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function persistSettings(settings: SavedSettingsV2) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function readSettings(): SavedSettingsV2 {
  const currentRaw = window.localStorage.getItem(STORAGE_KEY);
  if (currentRaw) {
    const parsed = parseBackupJson(currentRaw);
    if (parsed.ok) return parsed.value;
  }

  const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacyRaw) {
    const parsed = parseBackupJson(legacyRaw);
    if (parsed.ok) {
      persistSettings(parsed.value);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return parsed.value;
    }
  }

  return defaults;
}

function setControlledValue(element: ControlledField, value: string) {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : element instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  setter?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function textOf(element: Element | null | undefined) {
  return element?.textContent?.trim() ?? "";
}

function clickByText(container: ParentNode, label: string) {
  const button = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
    (item) => textOf(item).toLowerCase() === label.trim().toLowerCase(),
  );
  button?.click();
}

function presetId(input: HTMLInputElement) {
  return input.getAttribute("aria-describedby")?.replace(/-key-help$/, "") ?? "";
}

function customSayFields() {
  return {
    key: document.querySelector<HTMLInputElement>('[data-bindforge-custom-say="key"]'),
    message: document.querySelector<HTMLTextAreaElement>('[data-bindforge-custom-say="message"]'),
  };
}

function collectSettings(previous: SavedSettingsV2): SavedSettingsV2 {
  const keys = { ...previous.keys };
  document.querySelectorAll<HTMLInputElement>(".bind-card .key-field input[aria-describedby]").forEach((input) => {
    const id = presetId(input);
    if (id) keys[id] = input.value;
  });

  const sections = Array.from(document.querySelectorAll<HTMLElement>(".filter-section"));
  const selected = (legend: string, fallback: string) => {
    const section = sections.find((item) => textOf(item.querySelector("legend")) === legend);
    return textOf(section?.querySelector('button[aria-pressed="true"]')) || fallback;
  };

  const panels = Array.from(document.querySelectorAll<HTMLElement>(".reference-panel"));
  const labInputs = Array.from(document.querySelectorAll<HTMLInputElement>(".lab-fields .key-field input"));
  const keyPanel = panels[0];
  const commandPanel = panels[1];
  const customSay = customSayFields();

  const candidate = {
    version: 2,
    savedAt: new Date().toISOString(),
    keys,
    filters: {
      className: selected("Class", previous.filters.className),
      actionType: selected("Action type", previous.filters.actionType),
      difficulty: selected("Difficulty", previous.filters.difficulty),
      search: document.querySelector<HTMLInputElement>(".library-toolbar input[type='search']")?.value ?? "",
      mode: textOf(document.querySelector(".segmented-control button[aria-pressed='true']")).toLowerCase() === "unbind" ? "unbind" : "bind",
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
    customSay: {
      key: customSay.key?.value ?? previous.customSay.key,
      message: customSay.message?.value ?? previous.customSay.message,
    },
  };

  const parsed = parseBackupValue(candidate);
  return parsed.ok ? parsed.value : previous;
}

function restoreCards(settings: SavedSettingsV2) {
  document.querySelectorAll<HTMLInputElement>(".bind-card .key-field input[aria-describedby]").forEach((input) => {
    const saved = settings.keys[presetId(input)];
    if (saved !== undefined && input.value !== saved) setControlledValue(input, saved);
  });
}

function restoreCustomSay(settings: SavedSettingsV2) {
  const fields = customSayFields();
  if (fields.key && fields.key.value !== settings.customSay.key) {
    setControlledValue(fields.key, settings.customSay.key);
  }
  if (fields.message && fields.message.value !== settings.customSay.message) {
    setControlledValue(fields.message, settings.customSay.message);
  }
}

function restoreInterface(settings: SavedSettingsV2) {
  const filterPanel = document.querySelector(".filter-panel");
  if (filterPanel) {
    clickByText(filterPanel, settings.filters.className);
    clickByText(filterPanel, settings.filters.actionType);
    clickByText(filterPanel, settings.filters.difficulty);
  }

  const search = document.querySelector<HTMLInputElement>(".library-toolbar input[type='search']");
  if (search) setControlledValue(search, settings.filters.search);
  clickByText(document.querySelector(".segmented-control") ?? document, settings.filters.mode);

  const panels = Array.from(document.querySelectorAll<HTMLElement>(".reference-panel"));
  const labInputs = Array.from(document.querySelectorAll<HTMLInputElement>(".lab-fields .key-field input"));
  const keyPanel = panels[0];
  const commandPanel = panels[1];

  if (labInputs[0]) setControlledValue(labInputs[0], settings.commandLab.key);
  if (labInputs[1]) setControlledValue(labInputs[1], settings.commandLab.extraText);

  const keySearch = keyPanel?.querySelector<HTMLInputElement>(".reference-controls input");
  const keyCategory = keyPanel?.querySelector<HTMLSelectElement>(".reference-controls select");
  const showRisky = keyPanel?.querySelector<HTMLInputElement>('input[type="checkbox"]');
  const commandSearch = commandPanel?.querySelector<HTMLInputElement>(".reference-controls input");
  const commandCategory = commandPanel?.querySelector<HTMLSelectElement>(".reference-controls select");

  if (keySearch) setControlledValue(keySearch, settings.commandLab.keySearch);
  if (keyCategory) setControlledValue(keyCategory, settings.commandLab.keyCategory);
  if (showRisky && showRisky.checked !== settings.commandLab.showRisky) showRisky.click();
  if (commandSearch) setControlledValue(commandSearch, settings.commandLab.commandSearch);
  if (commandCategory) setControlledValue(commandCategory, settings.commandLab.commandCategory);

  restoreCustomSay(settings);
  window.setTimeout(() => {
    restoreCards(settings);
    restoreCustomSay(settings);
  }, 50);
}

export default function LocalSettingsManager() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [status, setStatus] = useState("Ready to save customizations");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const restoring = useRef(true);

  useEffect(() => {
    setPortalTarget(document.querySelector<HTMLElement>(".filter-panel"));
    const settings = readSettings();
    setSavedAt(settings.savedAt === defaults.savedAt ? null : settings.savedAt);

    const restoreTimer = window.setTimeout(() => {
      restoreInterface(settings);
      restoring.current = false;
      setStatus(settings.savedAt === defaults.savedAt ? "Ready to save customizations" : "Previous settings restored");
    }, 120);

    let saveTimer = 0;
    const scheduleSave = () => {
      if (restoring.current) return;
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        const next = collectSettings(readSettings());
        persistSettings(next);
        setSavedAt(next.savedAt);
        setStatus("Saved automatically");
      }, 220);
    };

    const observer = new MutationObserver(() => {
      const latest = readSettings();
      restoreCards(latest);
      restoreCustomSay(latest);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("input", scheduleSave, true);
    document.addEventListener("change", scheduleSave, true);
    document.addEventListener("click", scheduleSave, true);

    return () => {
      window.clearTimeout(restoreTimer);
      window.clearTimeout(saveTimer);
      observer.disconnect();
      document.removeEventListener("input", scheduleSave, true);
      document.removeEventListener("change", scheduleSave, true);
      document.removeEventListener("click", scheduleSave, true);
    };
  }, []);

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
    persistSettings(settings);
    const url = URL.createObjectURL(new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `bindforge-backup-v2-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSavedAt(settings.savedAt);
    setStatus("Version 2 backup exported");
  }

  async function importBackup(file: File) {
    if (file.size > MAX_BACKUP_BYTES) {
      setStatus("Backup file is larger than 256 KB");
      return;
    }

    const parsed = parseBackupJson(await file.text());
    if (!parsed.ok) {
      setStatus(parsed.error);
      return;
    }

    persistSettings(parsed.value);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    restoring.current = true;
    restoreInterface(parsed.value);
    window.setTimeout(() => {
      restoring.current = false;
      setSavedAt(parsed.value.savedAt);
      setStatus(parsed.migratedFrom === 1 ? "Version 1 backup migrated and restored" : "Backup validated and restored");
    }, 250);
  }

  function clearLocalData() {
    if (!window.confirm("Clear all saved BindForge settings from this browser?")) return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    window.location.reload();
  }

  if (!portalTarget) return null;

  return createPortal(
    <section className="local-backup-card" aria-labelledby="local-backup-title">
      <div className="local-backup-heading">
        <div><p className="eyebrow">Browser backup</p><h3 id="local-backup-title">Your setup stays here</h3></div>
        <span className="local-save-dot" aria-hidden="true" />
      </div>
      <p className="local-backup-copy">Custom keys, filters, output mode, command-lab settings, and custom chat messages are saved automatically on this device.</p>
      <div className="local-save-status" role="status" aria-live="polite"><strong>{status}</strong><span>{savedLabel}</span></div>
      <div className="local-backup-actions">
        <button className="local-primary-action" onClick={exportBackup} type="button">Export backup</button>
        <button className="local-secondary-action" onClick={() => fileInput.current?.click()} type="button">Import backup</button>
        <button className="local-danger-action" onClick={clearLocalData} type="button">Clear saved data</button>
      </div>
      <input
        accept="application/json,.json"
        aria-label="Import a BindForge backup file"
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
