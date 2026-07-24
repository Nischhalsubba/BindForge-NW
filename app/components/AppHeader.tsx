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
        : "Ready when you are";

  const statusDetail = feedback.state === "error"
    ? "The command is focused. Press Ctrl+C to copy it manually."
    : feedback.state === "idle"
      ? "Choose a preset, check the key, then copy the command."
      : "The command is now on your clipboard.";

  return (
    <header className="app-header" id="top">
      <nav className="site-nav" aria-label="Primary navigation">
        <a className="site-brand" href="#top" aria-label="BindForge NW home">
          <span className="brand-mark"><Icon name="forge" /></span>
          <span>BindForge NW</span>
        </a>
        <div className="site-nav-links">
          <a href="#keybind-library">Keybinds</a>
          <a href="#command-lab-title">Command Lab</a>
          <a href="#custom-say-title">Chat bind</a>
        </div>
        <a className="nav-source-link" href="https://github.com/Nischhalsubba/BindForge-NW">GitHub</a>
      </nav>

      <section className="hero" aria-labelledby="bindforge-title">
        <div className="hero-copy">
          <p className="hero-kicker">Free Neverwinter utility</p>
          <h1 id="bindforge-title">Build keybinds without the guesswork.</h1>
          <p className="brand-subtitle">
            Search curated presets, edit the key, review conflicts, and copy a clean command in seconds.
          </p>
          <div className="hero-links" aria-label="Start using BindForge">
            <a className="hero-primary-link" href="#keybind-library">Browse keybinds</a>
            <a className="hero-secondary-link" href="#command-lab-title">Build a custom command</a>
          </div>
        </div>

        <div className="hero-demo" aria-label="Example generated command">
          <div className="hero-demo-head">
            <span>Generated command</span>
            <span className="hero-demo-status">Ready to copy</span>
          </div>
          <code>/bind ctrl+b &quot;gensendmessage Vipaction_Bankvendor activate&quot;</code>
          <p>Edit the key. BindForge handles the command format.</p>
        </div>
      </section>

      <section className="hero-meta" aria-label="Catalog summary and copy status">
        <div className="hero-stats">
          <span><strong>{keybindPresets.length}</strong> presets</span>
          <span><strong>{keyCombos.length}</strong> key combinations</span>
          <span><strong>{consoleCommands.length}</strong> command references</span>
        </div>
        <div className={`ready-state ready-state-${feedback.state}`} role="status" aria-live="polite">
          <Icon name={feedback.state === "error" ? "warning" : "shield"} />
          <span><strong>{statusTitle}</strong><small>{statusDetail}</small></span>
        </div>
      </section>
    </header>
  );
}
