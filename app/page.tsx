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
import { SettingsPanel } from "./components/SettingsPanel";
import { UrlStateBridge } from "./components/UrlStateBridge";
import { Icon } from "./components/Icon";

export type CopyResultState = "copied" | "fallback" | "error";

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
      <a className="skip-link" href="#keybind-library">Skip to keybind library</a>
      <UrlStateBridge />
      <AppHeader feedback={feedback} />
      <SettingsPanel />

      <section className="workbench-intro" aria-labelledby="workbench-title">
        <div className="workbench-intro-index" aria-hidden="true">
          <span>01</span>
          <span>The workbench</span>
        </div>
        <div className="workbench-intro-copy">
          <p className="section-kicker">Catalog · planner · generator</p>
          <h2 id="workbench-title">Find the command. Shape the key. Ship the bind<span>.</span></h2>
        </div>
        <p className="workbench-intro-note">
          Saved keys, filters, favourites, and collections remain in this browser unless you export or share them.
        </p>
      </section>

      <section className="workspace" aria-label="Keybind workbench">
        <FilterSidebar />
        <KeybindLibrary onCopy={copyText} />
      </section>

      <PortableSharePanel onCopy={copyText} />
      <CommandLab onCopy={copyText} />
      <CustomSayBuilder />

      <footer className="app-footer">
        <div className="footer-grid">
          <section>
            <span>Independent utility</span>
            <p>BindForge NW is a community-made tool for preparing Neverwinter keybind commands.</p>
          </section>
          <section>
            <span>Use responsibly</span>
            <p>Commands can change after game updates. Back up existing binds before testing unfamiliar setups.</p>
          </section>
          <section>
            <span>Studio</span>
            <p>Designed and developed by <strong>Archew</strong>.</p>
          </section>
        </div>
        <p className="footer-signoff">Forge carefully. Copy confidently.</p>
      </footer>

      <div
        aria-atomic="true"
        aria-live="polite"
        className={`copy-toast copy-toast-${feedback.state}`}
        role="status"
      >
        {feedback.state !== "idle" ? (
          <>
            <span className="copy-toast-icon"><Icon name={feedback.state === "error" ? "warning" : "shield"} /></span>
            <span><strong>{toastTitle}</strong><small>{feedback.label}</small></span>
          </>
        ) : null}
      </div>
    </main>
  );
}
