"use client";

import { useBindForge } from "./BindForgeProvider";

export default function ThemeSwitcher() {
  const { state, setTheme } = useBindForge();

  return (
    <fieldset className="theme-switcher" aria-label="Appearance">
      <legend>Appearance</legend>
      <div>
        {(["system", "light", "dark"] as const).map((item) => (
          <button aria-pressed={state.theme === item} key={item} onClick={() => setTheme(item)} type="button">
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
