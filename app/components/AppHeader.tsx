import { consoleCommands } from "../data/commands";
import { keyCombos } from "../data/keyCombos";
import { keybindPresets } from "../data/keybindPresets";
import { Icon } from "./Icon";

export type CopyFeedback = { state: "idle" | "copied" | "fallback" | "error"; label: string };

export function AppHeader({ feedback }: { feedback: CopyFeedback }) {
  const title = feedback.state === "copied"
    ? `Copied ${feedback.label}`
    : feedback.state === "fallback"
      ? `Copied ${feedback.label} with browser fallback`
      : feedback.state === "error"
        ? `Copy failed for ${feedback.label}`
        : "Forge ready";
  const detail = feedback.state === "error"
    ? "The command is focused. Press Ctrl+C to copy it manually."
    : "Choose a preset, review the warning, and copy the generated line.";

  return (
    <header className="app-header">
      <div className="brand-lockup">
        <div className="brand-mark"><Icon name="forge" /></div>
        <div>
          <p className="eyebrow">Neverwinter command workspace</p>
          <h1>BindForge NW</h1>
          <p className="brand-subtitle">
            Build safer keybinds without digging through old forum posts, scattered wiki entries, or someone&apos;s heroic spreadsheet from 2014.
          </p>
          <nav className="hero-links" aria-label="Workspace sections">
            <a className="hero-primary-link" href="#keybind-library">Browse keybinds</a>
            <a className="hero-secondary-link" href="#command-lab-title">Open Command Lab</a>
            <a className="hero-secondary-link" href="#custom-say-title">Create chat bind</a>
          </nav>
        </div>
      </div>

      <div className="header-stats" aria-label="Catalog summary">
        <div className="stat-card"><Icon name="spark" /><span><strong>{keybindPresets.length}</strong> curated keybinds</span></div>
        <div className="stat-card"><Icon name="keyboard" /><span><strong>{keyCombos.length}</strong> key combinations</span></div>
        <div className="stat-card"><Icon name="code" /><span><strong>{consoleCommands.length}</strong> command references</span></div>
      </div>

      <div className="ready-state" role="status" aria-live="polite">
        <Icon name="shield" />
        <span><strong>{title}</strong><small>{detail}</small></span>
      </div>
    </header>
  );
}
