"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const STORAGE_KEY = "bindforge-nw:theme";
type ThemeChoice = "system" | "light" | "dark";

function resolvedTheme(choice: ThemeChoice) {
  if (choice !== "system") return choice;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(choice: ThemeChoice) {
  const resolved = resolvedTheme(choice);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeChoice = choice;
  document.documentElement.style.colorScheme = resolved;
}

export default function ThemeSwitcher() {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial: ThemeChoice = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    applyTheme(initial);

    const setupFrame = window.requestAnimationFrame(() => {
      setTarget(document.querySelector<HTMLElement>(".filter-panel"));
      setChoice(initial);
    });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if ((window.localStorage.getItem(STORAGE_KEY) ?? "system") === "system") applyTheme("system");
    };
    media.addEventListener("change", handleSystemChange);
    return () => {
      window.cancelAnimationFrame(setupFrame);
      media.removeEventListener("change", handleSystemChange);
    };
  }, []);

  function choose(next: ThemeChoice) {
    setChoice(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  if (!target) return null;

  return createPortal(
    <fieldset className="theme-switcher" aria-label="Appearance">
      <legend>Appearance</legend>
      <div>
        {(["system", "light", "dark"] as const).map((item) => (
          <button aria-pressed={choice === item} key={item} onClick={() => choose(item)} type="button">
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>
    </fieldset>,
    target,
  );
}
