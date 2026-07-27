"use client";

import { useLayoutEffect } from "react";
import { useBindForge } from "../BindForgeProvider";
import { keybindPresets } from "../data/keybindPresets";
import type { CopyResultState } from "../page";

const LIBRARY_SETTINGS_KEY = "bindforge-nw:library:v1";

type LibraryState = {
  favourites?: string[];
  collections?: Record<string, string[]>;
};

type CopyHandler = (text: string, label: string, target: HTMLElement | null) => Promise<CopyResultState>;

function validPresetIds(value: string | null) {
  const known = new Set(keybindPresets.map((preset) => preset.id));
  return Array.from(new Set((value ?? "").split(",").map((item) => item.trim()).filter((item) => known.has(item))));
}

function readLibraryState(): LibraryState {
  try {
    const value = window.localStorage.getItem(LIBRARY_SETTINGS_KEY);
    return value ? JSON.parse(value) as LibraryState : {};
  } catch {
    return {};
  }
}

function writeSharedCollection(name: string, ids: string[]) {
  try {
    const current = readLibraryState();
    window.localStorage.setItem(LIBRARY_SETTINGS_KEY, JSON.stringify({
      ...current,
      collections: {
        ...(current.collections ?? {}),
        [name]: ids,
      },
    }));
  } catch {
    // The shared selection still appears through the URL even when storage is unavailable.
  }
}

export function PortableSharePanel({ onCopy }: { onCopy: CopyHandler }) {
  const { state } = useBindForge();

  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ids = validPresetIds(params.get("ids"));
    if (!ids.length) return;

    const requestedName = params.get("collection")?.trim();
    const collectionName = requestedName && requestedName !== "all" && requestedName !== "favourites"
      ? requestedName
      : "Shared collection";
    writeSharedCollection(collectionName, ids);

    if (!requestedName) {
      params.set("collection", collectionName);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}${window.location.hash}`);
    }
  }, []);

  async function copyPortableLink() {
    const selectedIds = Array.from(document.querySelectorAll<HTMLElement>("[data-preset-id].is-selected"))
      .map((card) => card.dataset.presetId)
      .filter((id): id is string => Boolean(id));
    const collectionSelect = document.querySelector<HTMLSelectElement>('select[aria-label="Browse collection"]');
    const collectionName = collectionSelect?.value ?? "all";
    const library = readLibraryState();
    const collectionIds = collectionName === "favourites"
      ? library.favourites ?? []
      : collectionName !== "all"
        ? library.collections?.[collectionName] ?? []
        : [];
    const ids = Array.from(new Set(selectedIds.length ? selectedIds : collectionIds));

    const params = new URLSearchParams();
    if (ids.length === 1) params.set("preset", ids[0]);
    if (ids.length) params.set("ids", ids.join(","));
    if (collectionName !== "all") params.set("collection", collectionName);
    if (state.search) params.set("q", state.search);
    if (state.className !== "All") params.set("class", state.className);
    if (state.actionType !== "All") params.set("type", state.actionType);
    if (state.difficulty !== "All") params.set("difficulty", state.difficulty);

    const query = params.toString();
    const url = `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ""}#keybind-library`;
    window.history.replaceState(null, "", url);
    await onCopy(url, ids.length ? `${ids.length} shared presets` : "Shareable filters", null);
  }

  return (
    <section className="portable-share-panel" aria-labelledby="portable-share-title">
      <div>
        <p className="eyebrow">Portable sharing</p>
        <h2 id="portable-share-title">Share the selected pack anywhere</h2>
        <p>The portable link includes preset IDs and active filters, so it works in another browser without relying on local storage.</p>
      </div>
      <button className="primary-button" onClick={() => { void copyPortableLink(); }} type="button">Copy portable link</button>
    </section>
  );
}
