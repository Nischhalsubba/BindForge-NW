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
    ? "The generated bind is focused. Press Ctrl+C to copy it manually."
    : feedback.state === "idle"
      ? "Search an existing keybind or choose one of the three builders below."
      : "The generated bind is now on your clipboard.";

  return (
    <header className="app-header" id="top">
      <div className="topbar">
        <span><b>Vol. 01</b> / Issue Nº 26</span>
        <span>Filed under <b>Neverwinter systems</b></span>
        <span><i className="pulse" /> Live catalogue · EN</span>
      </div>

      <nav className="site-nav" aria-label="Primary navigation">
        <a className="site-brand" href="#top" aria-label="Neverwinter Keybind home">
          <span className="brand-mark">
            <img src="/neverwinter-keybind-logo.svg" alt="" width="56" height="56" aria-hidden="true" />
          </span>
          <span className="brand-copy"><b>Neverwinter Keybind</b><small>Command field manual</small></span>
        </a>
        <div className="site-nav-links">
          <a href="#search-keybinds">Search <span>01</span></a>
          <a href="#compose-keybind">Compose <span>02</span></a>
          <a href="#build-command">Command <span>03</span></a>
          <a href="#say-message">Say <span>04</span></a>
        </div>
        <a className="nav-cta" href="#compose-keybind">Create keybind</a>
      </nav>

      <section className="hero" aria-labelledby="neverwinter-keybind-title" data-reveal>
        <div className="hero-copy">
          <p className="label">I. Neverwinter command utility</p>
          <h1 className="display" id="neverwinter-keybind-title">
            Find it. Build it. <em>Bind it</em><span className="dot">.</span>
          </h1>
          <p className="lead">
            Search a ready-made keybind or build exactly what you need with the verified composer, command builder, and say-message tool.
          </p>
          <div className="hero-actions" aria-label="Start using Neverwinter Keybind">
            <a className="btn btn-primary" href="#search-keybinds">Search keybinds ↗</a>
            <a className="btn btn-ghost" href="#compose-keybind">Compose a keybind</a>
          </div>
          <div className="hero-stats" aria-label="Catalogue summary">
            <span><i>01</i><strong>{keybindPresets.length}</strong><small>Curated presets</small></span>
            <span><i>02</i><strong>{keyCombos.length}</strong><small>Key combinations</small></span>
            <span><i>03</i><strong>{consoleCommands.length}</strong><small>Command references</small></span>
          </div>
        </div>

        <div className="hero-plate" aria-label="Primary Neverwinter Keybind tools">
          <span className="corner corner-tl" aria-hidden="true" />
          <span className="corner corner-tr" aria-hidden="true" />
          <span className="corner corner-bl" aria-hidden="true" />
          <span className="corner corner-br" aria-hidden="true" />
          <div className="plate-meta"><span>Plate Nº 01</span><span>NWK / 2026</span></div>
          <div className="command-specimen">
            <p>Combined keybind form</p>
            <code>/bind lbutton &quot;+EvaluateLeftClick$$+tacticalSpecial$$+Actionleft$$+Actionright&quot;</code>
            <small>Choose the key and actions. BindForge handles the command structure.</small>
          </div>
          <ol className="hero-index" aria-label="Primary Neverwinter Keybind tools">
            <li><span>01</span><b>Search</b><small>Find existing keybinds.</small></li>
            <li><span>02</span><b>Compose</b><small>Combine verified actions.</small></li>
            <li><span>03</span><b>Command</b><small>Bind a supported command.</small></li>
            <li><span>04</span><b>Say</b><small>Create a chat bind.</small></li>
          </ol>
          <div className={`ready-state ready-state-${feedback.state}`} aria-live="polite">
            <Icon name="shield" />
            <span><strong>{statusTitle}</strong><small>{statusDetail}</small></span>
          </div>
        </div>
      </section>
    </header>
  );
}
