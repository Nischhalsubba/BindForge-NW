"use client";

import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
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
    description: "Find existing keybinds, copy them instantly, or save useful setups to a collection.",
    icon: "search",
  },
  {
    view: "compose",
    hash: "compose-keybind",
    index: "02",
    title: "Compose your own keybind",
    shortTitle: "Compose keybind",
    description: "Choose a key, add screenshot-verified actions, and build one combined Neverwinter bind.",
    icon: "keyboard",
  },
  {
    view: "command",
    hash: "build-command",
    index: "03",
    title: "Build your own command",
    shortTitle: "Build command",
    description: "Bind a key to a supported command and add optional arguments when the command needs them.",
    icon: "code",
  },
  {
    view: "say",
    hash: "say-message",
    index: "04",
    title: "Create your own say message",
    shortTitle: "Say message",
    description: "Choose a key, write a message, and generate a ready-to-copy Neverwinter say bind.",
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

  function selectTool(tool: WorkspaceTool) {
    setActiveView(tool.view);
    const nextHash = `#${tool.hash}`;
    if (window.location.hash !== nextHash) window.history.replaceState(null, "", nextHash);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const key = event.key;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) return;
    event.preventDefault();
    const nextIndex = key === "Home"
      ? 0
      : key === "End"
        ? tools.length - 1
        : (index + (key === "ArrowRight" ? 1 : -1) + tools.length) % tools.length;
    const nextTool = tools[nextIndex];
    selectTool(nextTool);
    window.requestAnimationFrame(() => {
      document.getElementById(`primary-tab-${nextTool.view}`)?.focus({ preventScroll: true });
    });
  }

  return (
    <section className={styles.shell} id="primary-workspace" aria-labelledby="primary-workspace-title">
      <div className={styles.hashTargets} aria-hidden="true">
        {tools.map((tool) => <span className={styles.hashTarget} id={tool.hash} key={tool.hash} />)}
      </div>

      <div className="section-rule" aria-hidden="true">
        <span className="roman">II.</span>
        <span>Primary tools / one workspace</span>
        <span>002 / 003</span>
      </div>

      <header className={styles.intro}>
        <div>
          <p className="label">The workbench</p>
          <h2 className={styles.title} id="primary-workspace-title">Choose a workflow<span className="dot">.</span></h2>
        </div>
        <p>Start with the job you came to do. Switching tools keeps your place on the page, so the workspace no longer jumps around underneath you.</p>
      </header>

      <nav className={styles.tabs} aria-label="Primary keybind tools" role="tablist">
        {tools.map((tool, index) => (
          <button
            aria-controls="primary-workspace-panel"
            aria-label={tool.title}
            aria-selected={activeView === tool.view}
            className={`${styles.tab} ${activeView === tool.view ? styles.active : ""}`}
            id={`primary-tab-${tool.view}`}
            key={tool.view}
            onClick={() => selectTool(tool)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            role="tab"
            tabIndex={activeView === tool.view ? 0 : -1}
            type="button"
          >
            <span className={styles.tabIndex}>{tool.index}</span>
            <span className={styles.tabIcon}><Icon name={tool.icon} /></span>
            <span className={styles.tabCopy}><strong>{tool.shortTitle}</strong><small>{tool.description}</small></span>
          </button>
        ))}
      </nav>

      <div
        aria-labelledby={`primary-tab-${activeTool.view}`}
        className={styles.panel}
        data-workspace-view={activeView}
        id="primary-workspace-panel"
        role="tabpanel"
        tabIndex={-1}
      >
        {activeView === "search" ? (
          <>
            <section className={styles.searchHeading} aria-labelledby="search-workspace-title">
              <div><span>01</span><h2 id="search-workspace-title">Search keybinds</h2></div>
              <p>Find an existing setup, adjust its key, copy it, favourite it, or keep it in a collection for later.</p>
            </section>
            <section className={`workspace ${styles.searchView}`} aria-label="Search existing keybinds">
              <FilterSidebar />
              <KeybindLibrary onCopy={onCopy} />
            </section>
            <details className={styles.utilityDrawer}>
              <summary>Share, export & portable tools</summary>
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
