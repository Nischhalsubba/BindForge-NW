"use client";

import { useEffect } from "react";
import { useBindForge } from "../BindForgeProvider";
import { keybindPresets } from "../data/keybindPresets";

export function UrlStateBridge() {
  const {
    setActionType,
    setClassName,
    setDifficulty,
    setSearch,
  } = useBindForge();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("q");
      const className = params.get("class");
      const actionType = params.get("type");
      const difficulty = params.get("difficulty");
      const presetId = params.get("preset");

      if (query !== null) setSearch(query);
      if (className && ["Any Class", "Bard", "Paladin", "Ranger", "Fighter / Cleric"].includes(className)) {
        setClassName(className as Parameters<typeof setClassName>[0]);
      }
      if (actionType && keybindPresets.some((preset) => preset.type === actionType)) {
        setActionType(actionType as Parameters<typeof setActionType>[0]);
      }
      if (difficulty && ["Easy", "Advanced", "Risky"].includes(difficulty)) {
        setDifficulty(difficulty as Parameters<typeof setDifficulty>[0]);
      }

      if (presetId && keybindPresets.some((preset) => preset.id === presetId)) {
        window.setTimeout(() => {
          document.querySelector<HTMLElement>(`[data-preset-id="${CSS.escape(presetId)}"]`)?.scrollIntoView({ block: "center" });
        }, 300);
      }
    });

    return () => window.cancelAnimationFrame(frame);
    // URL parameters are intentionally consumed once. Reapplying them after every
    // provider update would overwrite the user's changes during the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
