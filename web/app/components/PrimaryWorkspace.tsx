"use client";

import { useEffect, useMemo, useState } from "react";
import type { CopyResultState } from "../page";
import { CommandLab } from "./CommandLab";
import { CustomSayBuilder } from "./CustomSayBuilder";
import { FilterSidebar } from "./FilterSidebar";
import { Icon, type IconName } from "./Icon";
import { KeybindLibrary } from "./KeybindLibrary";
import { PortableSharePanel } from "./PortableSharePanel";
import { VerifiedBindBuilder } from "./VerifiedBindBuilder";
import styles from "./PrimaryWorkspace.module.css";

type CopyHandler = (text: string, label: string, target: HTMLElement | null) => Promise<CopyResultState>;
type WorkspaceView = "search" | "compose" | "command" | "say";

type WorkspaceTool = {
  view: WorkspaceView;
  hash: string;
  index: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: IconName;
};

const tools: WorkspaceTool[] = [
  {
    view: "search",
    hash: "search-keybinds",
    index: "01",
    title: "Search existing keybinds",
    shortTitle: "Search keybinds",
    description: "Browse, filter, edit, copy, favourite, and collect the existing keybind catalogue.",
    icon: "search",
  },
  {
    view: "compose",
    hash: "compose-keybind",
    index: "02",
    title: "Compose your own keybind",
    shortTitle: "Compose keybind",
    description: "Assign a key and combine screenshot-verified Neverwinter actions with the observed $$ chain syntax.",
    icon: "keyboard",
  },
  {
    view: "command",
    hash: "build-command",
    index: "03",
    title: "Build your own command",
    shortTitle: "Build command",
    description: "Choose a command, key, and arguments from the command reference and generate the bind form.",
    icon: "code",
  },
  {
    view: "say",
    hash: "say-message",
    index: "04",
    title: "Create your own say message",
    shortTitle: "Say message",
    description: "Turn a custom chat message into a copy-ready Neverwinter say keybind.",
    icon: "spark",
  },
];

const hashToView = new Map(tools.map((tool) => [tool.hash, tool.view]));

function viewFromHash(hash: string): WorkspaceView {
  return hashToView.get(hash.replace(/^#/, "")) ?? "search";
}

export function PrimaryWorkspace({ onCopy }: { onCopy: CopyHandler }) {
  const [activeView, setActiveView] = useState<WorkspaceView>("search");
  const activeTool = useMemo(() => tools.find((tool) => tool.view === activeView) ?? tools[0], [activeView]);

  useEffect(() => {
    function syncFromHash() {
      setActiveView(viewFromHash(window.location.hash));
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
    };
  }, []);

  return (
    <section className={styles.shell} id="primary-workspace" aria-labelledby="primary-workspace-title">
      <div className="section-rule" aria-hidden="true">
        <span className="roman">II.</span>
        <span>Primary tools / one workspace</span>
        <span>002 / 003</span>
      </div>

      <header className={styles.intro}>
        <div>
          <p className="label">The workbench</p>
          <h2 className={styles.title} id="primary-workspace-title">Choose what you want to do<span className="dot">.</span></h2>
        </div>
        <p>Search, compose, build, or create a chat bind without scrolling through every other tool first. Only the selected workspace stays open.</p>
      </header>

      <nav className={styles.tabs} aria-label="Primary keybind tools" role="tablist">
        {tools.map((tool) => (
          <a
            aria-controls="primary-workspace-panel"
            aria-label={tool.title}
            aria-selected={activeView === tool.view}
            className={`${styles.tab} ${activeView === tool.view ? styles.active : ""}`}
            href={`#${tool.hash}`}
            id={tool.hash}
            key={tool.view}
            role="tab"
          >
            <span className={styles.tabIndex}>{tool.index}</span>
            <span className={styles.tabIcon}><Icon name={tool.icon} /></span>
            <span className={styles.tabCopy}><strong>{tool.shortTitle}</strong><small>{tool.description}</small></span>
          </a>
        ))}
      </nav>

      <div
        aria-label={activeTool.title}
        className={styles.panel}
        id="primary-workspace-panel"
        role="tabpanel"
        tabIndex={-1}
      >
        {activeView === "search" ? (
          <>
            <section className={styles.searchHeading} aria-labelledby="search-workspace-title">
              <div><span>01</span><h2 id="search-workspace-title">Search existing keybinds</h2></div>
              <p>Use the catalogue filters and search field below. Existing collection, conflict, copy, and pack tools remain unchanged.</p>
            </section>
            <section className={`workspace ${styles.searchView}`} aria-label="Search existing keybinds">
              <FilterSidebar />
              <KeybindLibrary onCopy={onCopy} />
            </section>
            <details className={styles.utilityDrawer}>
              <summary>Share and portable tools</summary>
              <div className={styles.utilityBody}><PortableSharePanel onCopy={onCopy} /></div>
            </details>
          </>
        ) : null}

        {activeView === "compose" ? <VerifiedBindBuilder onCopy={onCopy} /> : null}
        {activeView === "command" ? <CommandLab onCopy={onCopy} /> : null}
        {activeView === "say" ? <CustomSayBuilder /> : null}
      </div>
    </section>
  );
}
