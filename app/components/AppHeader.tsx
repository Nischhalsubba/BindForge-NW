import { consoleCommands } from "../data/commands";
import { keyCombos } from "../data/keyCombos";
import { keybindPresets } from "../data/keybindPresets";
import { Icon } from "./Icon";

export type CopyFeedback = { state: "idle" | "copied" | "fallback" | "error"; label: string };

export function AppHeader({ feedback }: { feedback: CopyFeedback }) {
  const title = feedback.state === "copied" ? `Copied ${feedback.label}` : feedback.state === "fallback" ? `Copied ${feedback.label} with browser fallback` : feedback.state === "error" ? `Copy failed for ${feedback.label}` : "Ready to copy";
  const detail = feedback.state === "error" ? "Command focused. Press Ctrl+C to copy it manually." : "Review warnings before testing";

  return (
    <header className="app-header">
      <div className="brand-lockup"><div className="brand-mark"><Icon name="forge" /></div><div><p className="eyebrow">Neverwinter utility</p><h1>BindForge NW</h1><p className="brand-subtitle">Find, test, and copy safer keybind commands.</p></div></div>
      <div className="header-stats" aria-label="Catalog summary">
        <div className="stat-card"><Icon name="spark" /><span><strong>{keybindPresets.length}</strong> keybinds</span></div>
        <div className="stat-card"><Icon name="keyboard" /><span><strong>{keyCombos.length}</strong> possible keys</span></div>
        <div className="stat-card"><Icon name="code" /><span><strong>{consoleCommands.length}</strong> wiki commands</span></div>
      </div>
      <div className="ready-state" role="status" aria-live="polite"><Icon name="shield" /><span><strong>{title}</strong><small>{detail}</small></span></div>
    </header>
  );
}
