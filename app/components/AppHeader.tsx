import { consoleCommands } from "../data/commands";
import { keyCombos } from "../data/keyCombos";
import { keybindPresets } from "../data/keybindPresets";
import { Icon } from "./Icon";

export type CopyFeedback = { state: "idle" | "copied" | "fallback" | "error"; label: string };

export function AppHeader({ feedback }: { feedback: CopyFeedback }) {
  const statusTitle = feedback.state === "copied"
    ? `Copied ${feedback.label}`
    : feedback.state === "fallback"
      ? `Copied ${feedback.label}`
      : feedback.state === "error"
        ? `Copy failed for ${feedback.label}`
        : "Workbench ready";

  const statusDetail = feedback.state === "error"
    ? "The command is focused. Press Ctrl+C to copy it manually."
    : feedback.state === "idle"
      ? "Choose a preset, review the key, then copy the command."
      : "The command is now on your clipboard.";

  return (
    <header className="app-header" id="top">
      <div className="topbar">
        <span><b>Vol. 01</b> / Issue Nº 26</span>
        <span>Filed under <b>Neverwinter systems</b></span>
        <span><i className="pulse" /> Live catalogue · EN</span>
      </div>

      <nav className="site-nav" aria-label="Primary navigation">
        <a className="site-brand" href="#top" aria-label="BindForge NW home">
          <span className="brand-mark"><Icon name="forge" /></span>
          <span className="brand-copy"><b>BindForge NW</b><small>Command field manual</small></span>
        </a>
        <div className="site-nav-links">
          <a href="#keybind-library">Library <span>01</span></a>
          <a href="#command-lab-title">Command lab <span>02</span></a>
          <a href="#custom-say-title">Chat bind <span>03</span></a>
        </div>
        <a className="nav-cta" href="#keybind-library">Open workbench</a>
      </nav>

      <section className="hero" aria-labelledby="bindforge-title" data-reveal>
        <div className="hero-copy">
          <p className="label">I. Neverwinter command utility</p>
          <h1 className="display" id="bindforge-title">
            Build <em>keybinds</em> with clarity<span className="dot">.</span>
          </h1>
          <p className="lead">
            Search the catalogue, shape a safer key combination, review conflicts, and copy a clean bind without memorising arcane console syntax.
          </p>
          <div className="hero-actions" aria-label="Start using BindForge">
            <a className="btn btn-primary" href="#keybind-library">Browse keybinds ↗</a>
            <a className="btn btn-ghost" href="#command-lab-title">Compose a command</a>
          </div>
          <div className="hero-stats" aria-label="Catalogue summary">
            <span><i>01</i><strong>{keybindPresets.length}</strong><small>Curated presets</small></span>
            <span><i>02</i><strong>{keyCombos.length}</strong><small>Key combinations</small></span>
            <span><i>03</i><strong>{consoleCommands.length}</strong><small>Command references</small></span>
          </div>
        </div>

        <div className="hero-plate" aria-label="Example generated command">
          <span className="corner corner-tl" aria-hidden="true" />
          <span className="corner corner-tr" aria-hidden="true" />
          <span className="corner corner-bl" aria-hidden="true" />
          <span className="corner corner-br" aria-hidden="true" />
          <div className="plate-meta"><span>Plate Nº 01</span><span>BF-NW / 2026</span></div>
          <div className="command-specimen">
            <p>Generated command</p>
            <code>/bind ctrl+b &quot;gensendmessage Vipaction_Bankvendor activate&quot;</code>
            <small>Edit the key. BindForge preserves the command format.</small>
          </div>
          <ol className="hero-index" aria-label="How BindForge works">
            <li><span>01</span><b>Find</b><small>Search presets.</small></li>
            <li><span>02</span><b>Adjust</b><small>Choose a key.</small></li>
            <li><span>03</span><b>Review</b><small>Check conflicts.</small></li>
            <li><span>04</span><b>Copy</b><small>Paste in game.</small></li>
          </ol>
          <div className={`ready-state ready-state-${feedback.state}`} role="status" aria-live="polite">
            <Icon name="shield" />
            <span><strong>{statusTitle}</strong><small>{statusDetail}</small></span>
          </div>
        </div>
      </section>
    </header>
  );
}
