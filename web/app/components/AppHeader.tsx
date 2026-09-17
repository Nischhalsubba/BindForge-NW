import Image from "next/image";
import { consoleCommands } from "../data/commands";
import { keyCombos } from "../data/keyCombos";
import { keybindPresets } from "../data/keybindPresets";
import styles from "./AppHeader.module.css";
import { Icon } from "./Icon";
import { SettingsPanel } from "./SettingsPanel";

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
      ? "Browse keybinds, review your setup, or build something new."
      : "The generated bind is now on your clipboard.";

  return (
    <header className="app-header" id="top">
      <div className="topbar">
        <span><b>Vol. 01</b> / Issue Nº 26</span>
        <span>Filed under <b>Neverwinter systems</b></span>
        <span><i className="pulse" /> Live catalogue · EN</span>
      </div>

      <nav className={`site-nav ${styles.primaryNav}`} aria-label="Primary navigation">
        <a className="site-brand" href="#top" aria-label="Neverwinter Keybind home">
          <span className="brand-mark">
            <Image
              src="/neverwinter-keybind-logo.svg"
              alt=""
              width={56}
              height={56}
              aria-hidden="true"
              priority
              unoptimized
            />
          </span>
          <span className="brand-copy"><b>Neverwinter Keybind</b><small>Command field manual</small></span>
        </a>
        <div className={`site-nav-links ${styles.primaryLinks}`}>
          <a href="#search-keybinds">Keybinds <span>01</span></a>
          <a href="#my-setup">My Setup <span>02</span></a>
          <a href="#compose-keybind">Build <span>03</span></a>
        </div>
      </nav>

      <section className={`hero ${styles.primaryHero}`} aria-labelledby="neverwinter-keybind-title" data-reveal>
        <div className="hero-copy">
          <p className="label">I. Neverwinter command utility</p>
          <h1 className="display" id="neverwinter-keybind-title">
            <span className="display-phrase">Find it.</span>{" "}
            <span className="display-phrase">Build it.</span>{" "}
            <span className="display-phrase"><em>Bind it</em><span className="dot">.</span></span>
          </h1>
          <p className="lead">
            Find proven keybinds, understand your current setup, or build exactly what you need without learning Neverwinter command syntax first.
          </p>
          <div className="hero-actions" aria-label="Start using Neverwinter Keybind">
            <a className="btn btn-primary" href="#search-keybinds">Browse keybinds ↗</a>
            <a className="btn btn-ghost" href="#my-setup">Review my setup</a>
          </div>
          <div className="hero-stats" aria-label="Catalogue summary">
            <span><i>01</i><strong>{keybindPresets.length}</strong><small>Curated presets</small></span>
            <span><i>02</i><strong>{keyCombos.length}</strong><small>Key combinations</small></span>
            <span><i>03</i><strong>{consoleCommands.length}</strong><small>Command references</small></span>
          </div>
        </div>

        <div className="hero-plate" aria-label="Primary Neverwinter Keybind destinations">
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
          <ol className={`hero-index ${styles.heroIndex}`} aria-label="Primary Neverwinter Keybind destinations">
            <li><span>01</span><b>Keybinds</b><small>Browse presets and class packs.</small></li>
            <li><span>02</span><b>My Setup</b><small>Import binds and review conflicts.</small></li>
            <li><span>03</span><b>Build</b><small>Compose keybinds, commands, and chat binds.</small></li>
          </ol>
          <div className={`ready-state ready-state-${feedback.state}`} aria-live="polite">
            <Icon name="shield" />
            <span><strong>{statusTitle}</strong><small>{statusDetail}</small></span>
          </div>
          <SettingsPanel />
        </div>
      </section>
    </header>
  );
}
