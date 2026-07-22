"use client";

import { useState } from "react";
import { copyTextSafely } from "./lib/clipboard";
import { AppHeader } from "./components/AppHeader";
import type { CopyFeedback } from "./components/AppHeader";
import { CommandLab } from "./components/CommandLab";
import { CustomSayBuilder } from "./components/CustomSayBuilder";
import { FilterSidebar } from "./components/FilterSidebar";
import { KeybindLibrary } from "./components/KeybindLibrary";

export default function Home() {
  const [feedback, setFeedback] = useState<CopyFeedback>({ state: "idle", label: "" });

  async function copyText(text: string, label: string, target: HTMLElement | null) {
    const result = await copyTextSafely(text);
    setFeedback({ state: result.ok ? (result.method === "fallback" ? "fallback" : "copied") : "error", label });
    if (!result.ok) target?.focus();
    window.setTimeout(() => setFeedback({ state: "idle", label: "" }), result.ok ? 2400 : 5000);
  }

  return (
    <main className="app-shell">
      <a className="skip-link" href="#keybind-library">Skip to keybind library</a>
      <AppHeader feedback={feedback} />
      <section className="workspace">
        <FilterSidebar />
        <KeybindLibrary onCopy={(text, label, target) => { void copyText(text, label, target); }} />
      </section>
      <CommandLab onCopy={(text, label, target) => { void copyText(text, label, target); }} />
      <CustomSayBuilder />
      <footer className="app-footer"><p>BindForge NW is a community utility. Commands may change between Neverwinter patches.</p><a href="https://github.com/Nischhalsubba/BindForge-NW">View source on GitHub</a></footer>
    </main>
  );
}
