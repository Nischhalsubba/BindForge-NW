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
        : "Ready to build";
  const detail = feedback.state === "error"
    ? "The command is focused. Press Ctrl+C to copy it manually."
    : "Choose a preset, review the warning, and copy the generated line.";

  return (
    <header className="app-header" id="top">
      <nav className="global-nav" aria-label="Global navigation">
        <div className="global-nav-inner">
          <a className="global-brand" href="#top" aria-label="BindForge NW home">
            <Icon name="forge" />
            <span>BindForge NW</span>
          </a>
          <div className="global-nav-links">
            <a href="#keybind-library">Keybinds</a>
            <a href="#command-lab-title">Command Lab</a>
            <a href="#custom-say-title">Chat bind</a>
          </div>
          <a className="global-nav-github" href="https://github.com/Nischhalsubba/BindForge-NW">GitHub</a>
        </div>
      </nav>

      <div className="sub-nav-frosted">
        <a className="sub-nav-title" href="#top">Neverwinter keybind builder</a>
        <nav className="sub-nav-links" aria-label="Workspace navigation">
          <a href="#keybind-library">Browse presets</a>
          <a href="#command-lab-title">Build a command</a>
        </nav>
        <a className="sub-nav-cta" href="#keybind-library">Start building</a>
      </div>

      <section className="hero-tile" aria-labelledby="bindforge-title">
        <div className="hero-copy">
          <p className="eyebrow">Neverwinter command workspace</p>
          <h1 id="bindforge-title" aria-label="BindForge NW">Build the bind.<br />Skip the guesswork.</h1>
          <p className="brand-subtitle">
            Search curated presets, edit the key, review conflicts, and copy a clean command without digging through old forum posts or scattered wiki pages.
          </p>
          <nav className="hero-links" aria-label="Primary actions">
            <a className="hero-primary-link" href="#keybind-library">Explore presets</a>
            <a className="hero-secondary-link" href="#command-lab-title">Open Command Lab</a>
          </nav>
        </div>

        <figure className="hero-command-demo" aria-label="Example generated keybind">
          <figcaption>Generated command</figcaption>
          <code>/bind ctrl+b &quot;gensendmessage Vipaction_Bankvendor activate&quot;</code>
          <p>Editable, normalized, and ready to copy.</p>
        </figure>
      </section>

      <section className="hero-utility-grid" aria-label="Catalog and application status">
        <div className="stat-card"><Icon name="spark" /><span><strong>{keybindPresets.length}</strong> curated keybinds</span></div>
        <div className="stat-card"><Icon name="keyboard" /><span><strong>{keyCombos.length}</strong> key combinations</span></div>
        <div className="stat-card"><Icon name="code" /><span><strong>{consoleCommands.length}</strong> command references</span></div>
        <div className="ready-state" role="status" aria-live="polite">
          <Icon name="shield" />
          <span><strong>{title}</strong><small>{detail}</small></span>
        </div>
      </section>
    </header>
  );
}
