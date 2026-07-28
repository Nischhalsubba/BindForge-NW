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
      <div className="publication-strip" aria-hidden="true">
        <span>Field guide 01</span>
        <span>Neverwinter command utility</span>
        <span>Browser edition · 2026</span>
      </div>

      <nav className="site-nav" aria-label="Primary navigation">
        <a className="site-brand" href="#top" aria-label="BindForge NW home">
          <span className="brand-mark"><Icon name="forge" /></span>
          <span>BindForge NW</span>
        </a>
        <div className="site-nav-links">
          <a href="#keybind-library"><span className="nav-index">01</span>Keybinds</a>
          <a href="#command-lab-title"><span className="nav-index">02</span>Command Lab</a>
          <a href="#custom-say-title"><span className="nav-index">03</span>Chat bind</a>
        </div>
        <span className="nav-source-link" aria-label="Designed and developed by Archew">By Archew</span>
      </nav>

      <section className="hero" aria-labelledby="bindforge-title">
        <div className="hero-copy">
          <p className="hero-kicker">Free Neverwinter utility</p>
          <h1 id="bindforge-title">
            <span className="sr-only">BindForge NW: </span>
            Build <span className="hero-headline-emphasis">keybinds</span> without the guesswork<span className="hero-terminal">.</span>
          </h1>
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

      <ol className="hero-index" aria-label="How BindForge works">
        <li><span>01</span><strong>Find</strong><small>Search presets and commands.</small></li>
        <li><span>02</span><strong>Adjust</strong><small>Choose your preferred key.</small></li>
        <li><span>03</span><strong>Review</strong><small>Check conflicts and safety.</small></li>
        <li><span>04</span><strong>Copy</strong><small>Paste the generated bind in game.</small></li>
      </ol>

      <section className="hero-meta" aria-label="Catalog summary and copy status">
        <div className="hero-stats">
          <span><strong>{keybindPresets.length}</strong> presets</span>
          <span><strong>{keyCombos.length}</strong> key combinations</span>
          <span><strong>{consoleCommands.length}</strong> command references</span>
        </div>
        <div className={`ready-state ready-state-${feedback.state}`} role="status" aria-live="polite">
          <Icon name="shield" />
          <span><strong>{statusTitle}</strong><small>{statusDetail}</small></span>
        </div>
      </section>
    </header>
  );
}