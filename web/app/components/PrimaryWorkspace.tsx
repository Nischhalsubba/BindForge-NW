"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent, SyntheticEvent } from "react";
import { useBindForge } from "../BindForgeProvider";
import { keybindPresets } from "../data/keybindPresets";
import type { KeybindClass, KeybindType } from "../data/keybindPresets";
import { buildCatalogPacks } from "../lib/catalog-packs.mjs";
import type { CopyResultState } from "../page";
import { CatalogQuickPacks } from "./CatalogQuickPacks";
import { FilterSidebar } from "./FilterSidebar";
import { Icon, type IconName } from "./Icon";
import { KeybindLibrary } from "./KeybindLibrary";
import styles from "./PrimaryWorkspace.module.css";

type CopyHandler = (text: string, label: string, target: HTMLElement | null) => Promise<CopyResultState>;
type WorkspaceView = "search" | "compose" | "command" | "say";
type ExperienceLevel = "simple" | "standard" | "advanced";

type WorkspaceTool = {
  view: WorkspaceView;
  hash: string;
  index: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: IconName;
};

function ToolLoading({ label }: { label: string }) {
  return (
    <div className={styles.toolLoading} role="status">
      <span aria-hidden="true" className={styles.loadingMark} />
      <span>Loading {label}…</span>
    </div>
  );
}

const VerifiedBindBuilder = dynamic(
  () => import("./VerifiedBindBuilder").then((module) => module.VerifiedBindBuilder),
  { loading: () => <ToolLoading label="Compose keybind" /> },
);
const CommandLab = dynamic(
  () => import("./CommandLab").then((module) => module.CommandLab),
  { loading: () => <ToolLoading label="Command Lab" /> },
);
const CustomSayBuilder = dynamic(
  () => import("./CustomSayBuilder").then((module) => module.CustomSayBuilder),
  { loading: () => <ToolLoading label="Say message" /> },
);
const PortableSharePanel = dynamic(
  () => import("./PortableSharePanel").then((module) => module.PortableSharePanel),
  { loading: () => <ToolLoading label="portable tools" /> },
);

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

const experienceCopy: Record<ExperienceLevel, { label: string; description: string }> = {
  simple: {
    label: "Simple experience",
    description: "Search and Compose are emphasized. Technical tools stay one click away, while safety and plain-language guidance remain visible.",
  },
  standard: {
    label: "Standard experience",
    description: "All everyday tools share equal priority. Portable and technical extras stay collapsed until you request them.",
  },
  advanced: {
    label: "Advanced experience",
    description: "All tools stay prominent and portable/export controls are surfaced directly for faster technical workflows.",
  },
};

const hashToView = new Map(tools.map((tool) => [tool.hash, tool.view]));
const catalogPacks = buildCatalogPacks(keybindPresets);

function viewFromHash(hash: string): WorkspaceView {
  return hashToView.get(hash.replace(/^#/, "")) ?? "search";
}

function isTechnicalTool(view: WorkspaceView) {
  return view === "command" || view === "say";
}

export function PrimaryWorkspace({ onCopy }: { onCopy: CopyHandler }) {
  const [activeView, setActiveView] = useState<WorkspaceView>("search");
  const [portableToolsOpen, setPortableToolsOpen] = useState(false);
  const { state, resetFilters, setActionType, setClassName, setDifficulty, setSearch } = useBindForge();
  const experience = state.preferences.experience;
  const activeTool = useMemo(() => tools.find((tool) => tool.view === activeView) ?? tools[0], [activeView]);
  const activePackId = useMemo(() => catalogPacks.find((pack) => (
    state.className === pack.filters.className
    && state.actionType === pack.filters.actionType
    && state.difficulty === "All"
    && state.search.trim().toLowerCase() === pack.filters.search.trim().toLowerCase()
  ))?.id ?? "", [state.actionType, state.className, state.difficulty, state.search]);

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

  function openCatalogPack(packId: string) {
    const pack = catalogPacks.find((candidate) => candidate.id === packId);
    if (!pack) return;
    resetFilters();
    setClassName(pack.filters.className as KeybindClass | "All");
    setActionType(pack.filters.actionType as KeybindType | "All");
    setDifficulty("All");
    setSearch(pack.filters.search);
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

  function handlePortableToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    setPortableToolsOpen(event.currentTarget.open);
  }

  return (
    <section
      className={styles.shell}
      data-experience-level={experience}
      id="primary-workspace"
      aria-labelledby="primary-workspace-title"
    >
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

      <div className={styles.experienceBar} data-testid="experience-workspace-summary">
        <span className={styles.experienceBadge}>{experienceCopy[experience].label}</span>
        <p>{experienceCopy[experience].description}</p>
        <small>Change this in Local data &amp; backup → Accessibility &amp; experience.</small>
      </div>

      <nav
        className={`${styles.tabs} ${experience === "simple" ? styles.simpleTabs : experience === "advanced" ? styles.advancedTabs : ""}`}
        aria-label="Primary keybind tools"
        data-experience={experience}
        role="tablist"
      >
        {tools.map((tool, index) => (
          <button
            aria-controls="primary-workspace-panel"
            aria-label={tool.title}
            aria-selected={activeView === tool.view}
            className={`${styles.tab} ${activeView === tool.view ? styles.active : ""} ${experience === "simple" && isTechnicalTool(tool.view) ? styles.simpleSecondaryTool : ""}`}
            data-secondary-in-simple={experience === "simple" && isTechnicalTool(tool.view) ? "true" : undefined}
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
            <CatalogQuickPacks activePackId={activePackId} onOpenPack={openCatalogPack} packs={catalogPacks} />
            <section className={`workspace ${styles.searchView}`} aria-label="Search existing keybinds">
              <FilterSidebar />
              <KeybindLibrary onCopy={onCopy} />
            </section>
            {experience === "advanced" ? (
              <section className={styles.advancedUtility} data-testid="advanced-portable-tools" aria-labelledby="advanced-portable-tools-title">
                <div className={styles.advancedUtilityHeading}>
                  <span>Advanced workspace</span>
                  <h3 id="advanced-portable-tools-title">Portable &amp; technical tools</h3>
                  <p>Advanced mode surfaces sharing, backup, and portable workflow controls without an extra disclosure step.</p>
                </div>
                <PortableSharePanel onCopy={onCopy} />
              </section>
            ) : (
              <details className={styles.utilityDrawer} onToggle={handlePortableToggle}>
                <summary>Share, export &amp; portable tools</summary>
                <div className={styles.utilityBody}>{portableToolsOpen ? <PortableSharePanel onCopy={onCopy} /> : null}</div>
              </details>
            )}
          </>
        ) : null}

        {activeView === "compose" ? <VerifiedBindBuilder onCopy={onCopy} /> : null}
        {activeView === "command" ? <CommandLab onCopy={onCopy} /> : null}
        {activeView === "say" ? <CustomSayBuilder /> : null}
      </div>
    </section>
  );
}