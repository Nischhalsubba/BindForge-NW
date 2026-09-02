"use client";

import { useEffect, useRef, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import type { CopyFeedback } from "./components/AppHeader";
import { GsapMotionEnhancer } from "./components/GsapMotionEnhancer";
import { Icon } from "./components/Icon";
import { PrimaryWorkspace } from "./components/PrimaryWorkspace";
import { RevealController } from "./components/RevealController";
import { SettingsPanel } from "./components/SettingsPanel";
import { UrlStateBridge } from "./components/UrlStateBridge";
import { copyTextSafely } from "./lib/clipboard";

export type CopyResultState = "copied" | "fallback" | "error";

function SectionRule({ roman, meta, page }: { roman: string; meta: string; page: string }) {
  return (
    <div className="section-rule" aria-hidden="true">
      <span className="roman">{roman}.</span>
      <span>{meta}</span>
      <span>{page} / 003</span>
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
      <GsapMotionEnhancer />
      <RevealController />
      <a className="skip-link" href="#primary-workspace">Skip to primary tools</a>
      <div className="side-rail left" aria-hidden="true"><span>Neverwinter Keybind · Field Manual</span></div>
      <div className="side-rail right" aria-hidden="true"><span>Neverwinter Command Systems · MMXXVI</span></div>
      <UrlStateBridge />
      <AppHeader feedback={feedback} />
      <SettingsPanel />

      <PrimaryWorkspace onCopy={copyText} />

      <footer className="app-footer" data-reveal>
        <SectionRule roman="III" meta="Notes / provenance / studio" page="003" />
        <div className="footer-grid">
          <section><span>Independent utility</span><p>Neverwinter Keybind is a community-made tool for preparing Neverwinter keybind commands.</p></section>
          <section><span>Use responsibly</span><p>Commands can change after game updates. Back up existing binds before testing unfamiliar setups.</p></section>
          <section><span>Local by default</span><p>Preferences and collections stay in your browser unless you export or share them.</p></section>
          <section><span>Studio</span><p>Designed and developed by <strong>Archew</strong>.</p></section>
        </div>
        <p className="footer-mega">Neverwinter <em>Keybind</em><span>.</span></p>
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
