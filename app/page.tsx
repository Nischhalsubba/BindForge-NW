"use client";

import { useEffect, useRef, useState } from "react";
import { copyTextSafely } from "./lib/clipboard";
import { AppHeader } from "./components/AppHeader";
import type { CopyFeedback } from "./components/AppHeader";
import { CommandLab } from "./components/CommandLab";
import { CustomSayBuilder } from "./components/CustomSayBuilder";
import { FilterSidebar } from "./components/FilterSidebar";
import { KeybindLibrary } from "./components/KeybindLibrary";
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
      <section className="workspace">
        <FilterSidebar />
        <KeybindLibrary onCopy={copyText} />
      </section>
      <CommandLab onCopy={copyText} />
      <CustomSayBuilder />
      <footer className="app-footer"><p>BindForge NW is a community utility. Commands may change between Neverwinter patches.</p><a href="https://github.com/Nischhalsubba/BindForge-NW">View source on GitHub</a></footer>

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
