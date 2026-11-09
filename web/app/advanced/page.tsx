/* eslint-disable @next/next/no-html-link-for-pages -- The root workbench is a static document, so navigation must reload the document. */
"use client";

import {SettingsPanel} from "../components/SettingsPanel";
import { BindForgeProvider } from "../BindForgeProvider";
import { useEffect, useRef, useState } from "react";

import { CommandPalette } from "../components/CommandPalette";
import type { CopyFeedback } from "../lib/copy-types";
import { ContextualHelpGlossary } from "../components/FirstVisitHelp";

import { Icon } from "../components/Icon";
import { PrimaryWorkspace } from "../components/PrimaryWorkspace";

import { UrlStateBridge } from "../components/UrlStateBridge";
import { UseInNeverwinterGuide } from "../components/UseInNeverwinterGuide";
import { FastCopyPanel } from "../components/FastCopyPanel";
import { COPY_HISTORY_KEY, parseCopyHistory, recordCopy } from "../lib/copy-workflow.mjs";
import { copyTextSafely } from "../lib/clipboard";
import { isNeverwinterBindPayload } from "../lib/in-game-guidance.mjs";

export type CopyResultState = "copied" | "fallback" | "error";

type InGameGuideState = {
  command: string;
  label: string;
} | null;


function AdvancedWorkbench() {
  const [feedback, setFeedback] = useState<CopyFeedback>({ state: "idle", label: "" });
  const [inGameGuide, setInGameGuide] = useState<InGameGuideState>(null);
  const feedbackTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
  }, []);

  async function copyText(text: string, label: string, target: HTMLElement | null): Promise<CopyResultState> {
    const result = await copyTextSafely(text);
    const nextState: CopyResultState = result.ok ? (result.method === "fallback" ? "fallback" : "copied") : "error";
    setFeedback({ state: nextState, label });
    if (result.ok) { try { const history = parseCopyHistory(window.localStorage.getItem(COPY_HISTORY_KEY)); window.localStorage.setItem(COPY_HISTORY_KEY, JSON.stringify(recordCopy(history, { text, label }))); window.dispatchEvent(new Event("bindforge:copy-history-change")); } catch { /* Copying stays available if history storage is blocked. */ } }
    if (result.ok && isNeverwinterBindPayload(text)) {
      try {
        if (window.localStorage.getItem("bindforge-nw:hide-in-game-guide") !== "true") setInGameGuide({ command: text, label });
      } catch { setInGameGuide({ command: text, label }); }
    }
    else if (!result.ok) target?.focus();
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setFeedback({ state: "idle", label: "" }), result.ok ? 2600 : 5200);
    return nextState;
  }

  async function copyGuideAgain() {
    if (!inGameGuide) return false;
    const result = await copyTextSafely(inGameGuide.command);
    setFeedback({ state: result.ok ? (result.method === "fallback" ? "fallback" : "copied") : "error", label: inGameGuide.label });
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setFeedback({ state: "idle", label: "" }), result.ok ? 2600 : 5200);
    return result.ok;
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


      <a className="skip-link" href="#primary-workspace">Skip to primary tools</a>
      <UrlStateBridge />
      <header className="site-header"><a className="identity" href="/"><span className="brand-name">BindForge <small>NEVERWINTER WORKBENCH</small></span></a><nav className="advanced-nav" aria-label="Primary navigation"><span className="site-nav-links"><a href="#search-keybinds">Keybinds</a><a href="#my-setup">My Setup</a><a href="#compose-keybind">Build</a></span><SettingsPanel placement="nav"/><a href="/">Copy workbench</a><a href="/account">Account &amp; cloud save</a><a href="/#help">Help &amp; guide</a></nav></header><div className="advanced-intro"><h1>Characters &amp; advanced setups</h1><p>Manage characters, profiles, assigned keys, imports and recovery in one workspace.</p></div>


      <PrimaryWorkspace onCopy={copyText} />
      <FastCopyPanel />
      <ContextualHelpGlossary />
      <CommandPalette />

      {inGameGuide ? (
        <UseInNeverwinterGuide
          command={inGameGuide.command}
          label={inGameGuide.label}
          onClose={() => setInGameGuide(null)}
          onDontShowAgain={() => {
            try { window.localStorage.setItem("bindforge-nw:hide-in-game-guide", "true"); } catch { /* current session only */ }
            setInGameGuide(null);
          }}
          onCopyAgain={copyGuideAgain}
        />
      ) : null}

      <div aria-atomic="true" aria-live="polite" className={`copy-toast copy-toast-${feedback.state}`} role="status">
        {feedback.state !== "idle" ? (
          <><span className="copy-toast-icon"><Icon name={feedback.state === "error" ? "warning" : "shield"} /></span><span><strong>{toastTitle}</strong><small>{feedback.label}</small></span></>
        ) : null}
      </div>
    </main>
  );
}

export default function AdvancedPage(){return <BindForgeProvider><AdvancedWorkbench /></BindForgeProvider>;}
