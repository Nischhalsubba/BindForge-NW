"use client";

import { useEffect, useRef, useState } from "react";
import { copyTextSafely } from "./lib/clipboard";
import { AppHeader } from "./components/AppHeader";
import type { CopyFeedback } from "./components/AppHeader";
import { CommandLab } from "./components/CommandLab";
import { CustomSayBuilder } from "./components/CustomSayBuilder";
import { FilterSidebar } from "./components/FilterSidebar";
import { KeybindLibrary } from "./components/KeybindLibrary";
import { PortableSharePanel } from "./components/PortableSharePanel";
import { RevealController } from "./components/RevealController";
import { SettingsPanel } from "./components/SettingsPanel";
import { UrlStateBridge } from "./components/UrlStateBridge";
import { Icon } from "./components/Icon";

export type CopyResultState = "copied" | "fallback" | "error";

function SectionRule({ roman, meta, page }: { roman: string; meta: string; page: string }) {
  return (
    <div className="section-rule" aria-hidden="true">
      <span className="roman">{roman}.</span>
      <span>{meta}</span>
      <span>{page} / 004</span>
    </div>
  );
}

export default function Home() {
  const [feedback, setFeedback] = useState<CopyFeedback>({ state: "idle", label: "" });
  const feedbackTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
  }, []);

  async function copyText(text: string, label: string, target: HTMLElement | null): Promise<CopyResultState> {
    const result = await copyTextSafely(text);
    const nextState: CopyResultState = result.ok ? (result.method === "fallback" ? "fallback" : "copied") : "error";
    setFeedback({ state: nextState, label });
    if (!result.ok) target?.focus();
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setFeedback({ state: "idle", label: "" }), result.ok ? 2600 : 5200);
    return nextState;
  }

  const toastTitle = feedback.state === "copied"
    ? "Copied"
    : feedback.state === "fallback"
      ? "Copied with browser fallback"
      : feedback.state === "error"
        ? "Copy failed"
        : "";

  return (
    <main className="app-shell">
      <RevealController />
      <a className="skip-link" href="#keybind-library">Skip to keybind library</a>
      <div className="side-rail left" aria-hidden="true"><span>BindForge NW · Field Manual</span></div>
      <div className="side-rail right" aria-hidden="true"><span>Neverwinter Command Systems · MMXXVI</span></div>
      <UrlStateBridge />
      <AppHeader feedback={feedback} />
      <SettingsPanel />

      <section className="workbench-intro" aria-labelledby="workbench-title" data-reveal>
        <SectionRule roman="II" meta="Catalogue / planner / generator" page="002" />
        <div className="workbench-intro-grid">
          <div>
            <p className="label">The workbench</p>
            <h2 className="display" id="workbench-title">Find the command. Shape the <em>key</em>. Ship the bind<span className="dot">.</span></h2>
          </div>
          <p className="lead">Saved keys, filters, favourites, and collections remain in this browser unless you export or share them. The dense workspace keeps advanced controls close without obscuring the primary copy flow.</p>
        </div>
      </section>

      <section className="workspace" aria-label="Keybind workbench" data-reveal>
        <FilterSidebar />
        <KeybindLibrary onCopy={copyText} />
      </section>

      <section className="tools-chapter" data-reveal>
        <SectionRule roman="III" meta="Portable tools / custom composition" page="003" />
        <PortableSharePanel onCopy={copyText} />
        <CommandLab onCopy={copyText} />
        <CustomSayBuilder />
      </section>

      <footer className="app-footer" data-reveal>
        <SectionRule roman="IV" meta="Notes / provenance / studio" page="004" />
        <div className="footer-grid">
          <section><span>Independent utility</span><p>BindForge NW is a community-made tool for preparing Neverwinter keybind commands.</p></section>
          <section><span>Use responsibly</span><p>Commands can change after game updates. Back up existing binds before testing unfamiliar setups.</p></section>
          <section><span>Local by default</span><p>Preferences and collections stay in your browser unless you export or share them.</p></section>
          <section><span>Studio</span><p>Designed and developed by <strong>Archew</strong>.</p></section>
        </div>
        <p className="footer-mega">Bind <em>Forge</em><span>.</span></p>
        <div className="footer-bottom"><span><i className="pulse" /> Catalogue online</span><span>FIN. · MMXXVI</span></div>
      </footer>

      <div aria-atomic="true" aria-live="polite" className={`copy-toast copy-toast-${feedback.state}`} role="status">
        {feedback.state !== "idle" ? (
          <><span className="copy-toast-icon"><Icon name={feedback.state === "error" ? "warning" : "shield"} /></span><span><strong>{toastTitle}</strong><small>{feedback.label}</small></span></>
        ) : null}
      </div>
    </main>
  );
}
