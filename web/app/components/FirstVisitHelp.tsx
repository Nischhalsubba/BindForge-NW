"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useBindForge } from "../BindForgeProvider";
import styles from "./FirstVisitHelp.module.css";

const FIRST_VISIT_KEY = "bindforge-nw:first-visit:v2";
const FIRST_VISIT_SESSION_KEY = "bindforge-nw:first-visit-presented:v2";
const TOUR_EVENT = "bindforge:open-guided-tour";

type TourStep = {
  eyebrow: string;
  title: string;
  intro: string;
  points: readonly string[];
  selector: string;
};

type TargetRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

const steps: readonly TourStep[] = [
  {
    eyebrow: "01 · Navigation",
    title: "Know where you are",
    intro: "BindForge has only three primary destinations. Everything else lives inside one of them.",
    points: [
      "Keybinds is for finding proven presets.",
      "My Setup is for your characters, profiles, imports, and conflicts.",
      "Build is for creating something when a preset is not enough.",
    ],
    selector: '[data-tour="primary-nav"]',
  },
  {
    eyebrow: "02 · Beginner View",
    title: "Start simple, reveal more when ready",
    intro: "Beginner View intentionally hides technical controls so the first screen stays understandable.",
    points: [
      "Search and Compose stay prominent.",
      "Use “Show more tools” whenever you want the Standard workspace. Nothing is deleted.",
    ],
    selector: '[data-tour="beginner-view"]',
  },
  {
    eyebrow: "03 · Search",
    title: "Search without learning commands",
    intro: "Describe what you want in normal player language. BindForge searches titles, common wording, abbreviations, and command text.",
    points: [
      "Class filtering can narrow the catalogue without exposing technical filters.",
      "The result count updates as you search.",
    ],
    selector: '[data-tour="keybind-search"]',
  },
  {
    eyebrow: "04 · Keybind cards",
    title: "Read a keybind card",
    intro: "Each card explains what the bind does, lets you choose a key, shows safety/conflict information, and gives you a copy-ready command.",
    points: [
      "Copy command is the main action.",
      "Details reveals evidence and the raw command only when you need it.",
    ],
    selector: '[data-tour="keybind-card"]',
  },
  {
    eyebrow: "05 · My Setup",
    title: "Keep characters and profiles separate",
    intro: "My Setup is where BindForge learns your real keyboard state without mixing one character or loadout into another.",
    points: [
      "Create separate profiles for Tank, DPS, Heal, AoE, ST, or experiments.",
      "Import current Neverwinter binds to reveal occupied keys and real conflicts.",
    ],
    selector: '[data-tour="my-setup"]',
  },
  {
    eyebrow: "06 · Build",
    title: "Build when a preset is not enough",
    intro: "Compose is the beginner-friendly builder. You choose the key and supported actions; BindForge assembles the command structure.",
    points: [
      "Direct Command and Say tools remain available in Standard and Advanced.",
      "Nothing is sent to the game automatically—you still review, copy, and test it.",
    ],
    selector: '[data-tour="build"]',
  },
  {
    eyebrow: "07 · Help",
    title: "Help stays available after the tour",
    intro: "You can reopen this walkthrough later and use the glossary when BindForge or Neverwinter terminology is unfamiliar.",
    points: [
      "Verification labels describe evidence strength, not permanent guarantees.",
      "Back up current binds and keep rollback output before testing unfamiliar commands.",
    ],
    selector: '[data-tour="help"]',
  },
];

function markSeen() {
  try { window.localStorage.setItem(FIRST_VISIT_KEY, "seen"); } catch { /* session only */ }
  try { window.sessionStorage.setItem(FIRST_VISIT_SESSION_KEY, "seen"); } catch { /* no-op */ }
}

function focusableElements(root: HTMLElement | null) {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((element) => !element.hasAttribute("hidden"));
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function rectFromElement(element: HTMLElement): TargetRect {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  };
}

function coachmarkPosition(rect: TargetRect) {
  const gutter = 16;
  const gap = 18;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const cardWidth = Math.min(390, viewportWidth - gutter * 2);
  const estimatedHeight = Math.min(360, viewportHeight - gutter * 2);

  if (viewportWidth <= 720) {
    const targetMiddle = rect.top + rect.height / 2;
    if (targetMiddle > viewportHeight * 0.5) {
      return {
        placement: "mobile-top",
        style: { top: gutter, left: gutter, right: gutter } satisfies CSSProperties,
      };
    }
    return {
      placement: "mobile-bottom",
      style: { bottom: gutter, left: gutter, right: gutter } satisfies CSSProperties,
    };
  }

  if (viewportWidth - rect.right >= cardWidth + gap + gutter) {
    return {
      placement: "right",
      style: {
        left: rect.right + gap,
        top: clamp(rect.top, gutter, Math.max(gutter, viewportHeight - estimatedHeight - gutter)),
      } satisfies CSSProperties,
    };
  }

  if (rect.left >= cardWidth + gap + gutter) {
    return {
      placement: "left",
      style: {
        right: viewportWidth - rect.left + gap,
        top: clamp(rect.top, gutter, Math.max(gutter, viewportHeight - estimatedHeight - gutter)),
      } satisfies CSSProperties,
    };
  }

  const left = clamp(rect.left, gutter, Math.max(gutter, viewportWidth - cardWidth - gutter));
  if (viewportHeight - rect.bottom >= estimatedHeight + gap + gutter) {
    return {
      placement: "below",
      style: { left, top: rect.bottom + gap } satisfies CSSProperties,
    };
  }

  return {
    placement: "above",
    style: { left, bottom: viewportHeight - rect.top + gap } satisfies CSSProperties,
  };
}

export function FirstVisitOrientation() {
  const { hydrated, updatePreferences } = useBindForge();
  const [visible, setVisible] = useState(false);
  const [autoRequested, setAutoRequested] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let shouldShow = false;
    try {
      const permanentlySeen = window.localStorage.getItem(FIRST_VISIT_KEY) === "seen";
      const presentedThisSession = window.sessionStorage.getItem(FIRST_VISIT_SESSION_KEY) === "seen";
      shouldShow = !permanentlySeen && !presentedThisSession;
      if (permanentlySeen || shouldShow) window.sessionStorage.setItem(FIRST_VISIT_SESSION_KEY, "seen");
    } catch {
      shouldShow = true;
    }
    if (!shouldShow) return;
    const frame = window.requestAnimationFrame(() => setAutoRequested(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!autoRequested || !hydrated) return;
    const frame = window.requestAnimationFrame(() => {
      setStep(0);
      setVisible(true);
      setAutoRequested(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [autoRequested, hydrated]);

  useEffect(() => {
    function replay() {
      restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setStep(0);
      setVisible(true);
    }
    window.addEventListener(TOUR_EVENT, replay);
    return () => window.removeEventListener(TOUR_EVENT, replay);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const shell = document.querySelector<HTMLElement>(".app-shell");
    const shellHadInert = shell?.hasAttribute("inert") ?? false;
    const previousAriaHidden = shell?.getAttribute("aria-hidden") ?? null;
    shell?.setAttribute("inert", "");
    shell?.setAttribute("aria-hidden", "true");

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeTour();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = focusableElements(dialogRef.current);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      if (shell) {
        if (!shellHadInert) shell.removeAttribute("inert");
        if (previousAriaHidden === null) shell.removeAttribute("aria-hidden");
        else shell.setAttribute("aria-hidden", previousAriaHidden);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const current = steps[step];
    const target = document.querySelector<HTMLElement>(current.selector);
    if (!target) {
      const missingFrame = window.requestAnimationFrame(() => setTargetRect(null));
      return () => window.cancelAnimationFrame(missingFrame);
    }

    const targetElement = target;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    targetElement.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "center",
      inline: "nearest",
    });

    let frame = 0;
    function updateTarget() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setTargetRect(rectFromElement(targetElement));
      });
    }

    updateTarget();
    window.addEventListener("resize", updateTarget);
    window.addEventListener("scroll", updateTarget, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget, true);
    };
  }, [step, visible]);

  useEffect(() => {
    if (!visible) return;
    const frame = window.requestAnimationFrame(() => headingRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [step, visible]);

  function closeTour() {
    markSeen();
    setVisible(false);
    setTargetRect(null);
    window.requestAnimationFrame(() => {
      const fallback = document.querySelector<HTMLElement>(".site-nav-links a");
      (restoreFocusRef.current ?? fallback)?.focus();
    });
  }

  function finishBeginner() {
    updatePreferences({ experience: "simple" });
    closeTour();
  }

  if (!visible || typeof document === "undefined") return null;

  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;
  const position = targetRect ? coachmarkPosition(targetRect) : {
    placement: "mobile-bottom",
    style: { bottom: 16, left: 16, right: 16 } satisfies CSSProperties,
  };

  const spotlightStyle = targetRect ? {
    left: Math.max(6, targetRect.left - 8),
    top: Math.max(6, targetRect.top - 8),
    width: Math.min(window.innerWidth - Math.max(6, targetRect.left - 8) - 6, targetRect.width + 16),
    height: Math.min(window.innerHeight - Math.max(6, targetRect.top - 8) - 6, targetRect.height + 16),
  } satisfies CSSProperties : undefined;

  return createPortal(
    <div className={styles.tourLayer}>
      <div aria-hidden="true" className={styles.interactionShield} />
      {targetRect ? (
        <div
          aria-hidden="true"
          className={styles.spotlight}
          data-testid="tour-spotlight"
          style={spotlightStyle}
        />
      ) : null}
      <section
        aria-labelledby="guided-tour-title"
        aria-modal="true"
        className={styles.coachmark}
        data-placement={position.placement}
        data-testid="first-visit-orientation"
        data-tour-layout="coachmark"
        ref={dialogRef}
        role="dialog"
        style={position.style}
      >
        <span aria-hidden="true" className={styles.pointer} />
        <header className={styles.tourHeader}>
          <div>
            <p className={styles.eyebrow}>{current.eyebrow}</p>
            <p className={styles.progress}>{step + 1} of {steps.length}</p>
          </div>
          <button aria-label="Close guided tour" className={styles.close} onClick={closeTour} type="button">×</button>
        </header>

        <div className={styles.tourBody}>
          <h2 id="guided-tour-title" ref={headingRef} tabIndex={-1}>{current.title}</h2>
          <p className={styles.intro}>{current.intro}</p>
          <ul className={styles.tourPoints}>
            {current.points.map((point) => <li key={point}>{point}</li>)}
          </ul>
        </div>

        <div className={styles.stepRail} aria-label="Guided tour progress">
          {steps.map((item, index) => (
            <span aria-current={index === step ? "step" : undefined} className={styles.stepDot} key={item.title}>
              <span className="sr-only">Step {index + 1}: {item.title}</span>
            </span>
          ))}
        </div>

        <footer className={styles.tourFooter}>
          <button className={styles.secondaryAction} disabled={isFirst} onClick={() => setStep((value) => Math.max(0, value - 1))} type="button">Back</button>
          <button className={styles.skipAction} onClick={closeTour} type="button">Skip tour</button>
          {isLast ? (
            <button className={styles.primaryAction} disabled={!hydrated} onClick={finishBeginner} type="button">Start in Beginner View</button>
          ) : (
            <button className={styles.primaryAction} onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))} type="button">Next</button>
          )}
        </footer>
      </section>
    </div>,
    document.body,
  );
}

export function ContextualHelpGlossary() {
  function replayTour() {
    window.dispatchEvent(new Event(TOUR_EVENT));
  }

  return (
    <details className={styles.help} data-tour="help" id="bindforge-help">
      <summary>Help, terms & confidence labels</summary>
      <div className={styles.helpBody}>
        <div className={styles.helpIntro}>
          <h2>Read the tool without learning the jargon first.</h2>
          <p>BindForge keeps command details available for experienced players, but the core actions can be understood in plain language. Verification labels describe evidence, not a guarantee that a command will keep working after every Neverwinter update.</p>
          <button className={styles.replayButton} onClick={replayTour} type="button">Replay guided tour</button>
        </div>
        <dl className={styles.glossary}>
          <div className={styles.term}><dt>Bind</dt><dd>Assign a key or key combination to a Neverwinter command.</dd></div>
          <div className={styles.term}><dt>Unbind / rollback</dt><dd>Remove or reverse a key assignment. Pack review can prepare rollback output for the keys you selected.</dd></div>
          <div className={styles.term}><dt><code>$$</code></dt><dd>Neverwinter command chaining syntax used when multiple supported actions are combined into one bind.</dd></div>
          <div className={styles.term}><dt>Conflict</dt><dd>The chosen key is already used by another selected preset, your imported keymap, or a commonly important native control.</dd></div>
          <div className={styles.term}><dt>Verified</dt><dd>BindForge has documented or direct evidence for the preset. Test again after major game updates.</dd></div>
          <div className={styles.term}><dt>Community tested</dt><dd>Community evidence reports the preset working, but you should test it on your own character.</dd></div>
          <div className={styles.term}><dt>Experimental</dt><dd>The preset is user-submitted, risky, or otherwise needs careful in-game testing and a rollback plan.</dd></div>
          <div className={styles.term}><dt>Personal keymap</dt><dd>Your pasted or imported bind text, analyzed locally so BindForge can warn about conflicts with your actual saved keys.</dd></div>
        </dl>
      </div>
    </details>
  );
}
