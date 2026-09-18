"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useBindForge } from "../BindForgeProvider";
import styles from "./FirstVisitHelp.module.css";

const FIRST_VISIT_KEY = "bindforge-nw:first-visit:v2";
const FIRST_VISIT_SESSION_KEY = "bindforge-nw:first-visit-presented:v2";
const TOUR_EVENT = "bindforge:open-guided-tour";

const steps = [
  {
    eyebrow: "Start here",
    title: "Welcome to BindForge",
    intro: "BindForge helps you find, understand, and prepare Neverwinter keybinds without needing to learn command syntax first.",
    points: [
      "Nothing is applied to Neverwinter automatically. BindForge prepares commands for you to copy or save.",
      "Begin with Keybinds if you only want something proven and ready to use.",
      "Use My Setup when you want BindForge to understand your character’s existing keys.",
    ],
  },
  {
    eyebrow: "01 · Keybinds",
    title: "Find a keybind",
    intro: "Search in normal player language, choose your class when useful, then inspect the safety message before copying.",
    points: [
      "Search things like “fighter cancel”, “mount quickly”, or “hide HUD”.",
      "Beginner View keeps only the most useful filtering visible.",
      "Copy the command, apply it in Neverwinter, and test it before depending on it.",
    ],
  },
  {
    eyebrow: "02 · My Setup",
    title: "Review My Setup",
    intro: "My Setup keeps different characters and keymap profiles separate, so Tank, DPS, Heal, AoE, or ST setups do not overwrite each other.",
    points: [
      "Choose or add a character and profile.",
      "Paste or import your current Neverwinter binds. Analysis stays in your browser.",
      "The keyboard map shows Unknown, Available, Imported, Customized, and Conflict states.",
      "A conflict means you should inspect the key before replacing anything.",
    ],
  },
  {
    eyebrow: "03 · Build",
    title: "Build without command syntax",
    intro: "Compose is the beginner-friendly builder. Choose a key, add supported actions, and BindForge assembles the command structure.",
    points: [
      "Use Compose when an existing preset does not match what you need.",
      "Direct command building and Say-message tools are hidden in Beginner View to reduce noise.",
      "Those technical tools are still available whenever you switch to Standard or Advanced.",
    ],
  },
  {
    eyebrow: "Safety & confidence",
    title: "Stay safe and reveal more when ready",
    intro: "Beginner View hides secondary controls, technical filters, command-pack tools, and portable utilities until you ask for them.",
    points: [
      "Back up your current binds before testing unfamiliar commands.",
      "Verified, Community tested, and Experimental labels describe the strength of the available evidence.",
      "Use rollback or unbind output when you need to reverse a change.",
      "Choose “Show more tools” when you are ready; nothing is deleted when Beginner View hides it.",
    ],
  },
] as const;

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

export function FirstVisitOrientation() {
  const { updatePreferences } = useBindForge();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const dialogRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let frame = 0;
    let shouldShow = false;
    try {
      const permanentlySeen = window.localStorage.getItem(FIRST_VISIT_KEY) === "seen";
      const presentedThisSession = window.sessionStorage.getItem(FIRST_VISIT_SESSION_KEY) === "seen";
      shouldShow = !permanentlySeen && !presentedThisSession;
      if (permanentlySeen || shouldShow) window.sessionStorage.setItem(FIRST_VISIT_SESSION_KEY, "seen");
    } catch {
      shouldShow = true;
    }
    if (shouldShow) frame = window.requestAnimationFrame(() => {
      setStep(0);
      setVisible(true);
    });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

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

    const previousOverflow = document.body.style.overflow;
    const shell = document.querySelector<HTMLElement>(".app-shell");
    const shellHadInert = shell?.hasAttribute("inert") ?? false;
    const previousAriaHidden = shell?.getAttribute("aria-hidden") ?? null;

    document.body.style.overflow = "hidden";
    shell?.setAttribute("inert", "");
    shell?.setAttribute("aria-hidden", "true");

    const focusFrame = window.requestAnimationFrame(() => headingRef.current?.focus());

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
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      if (shell) {
        if (!shellHadInert) shell.removeAttribute("inert");
        if (previousAriaHidden === null) shell.removeAttribute("aria-hidden");
        else shell.setAttribute("aria-hidden", previousAriaHidden);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, step]);

  function closeTour() {
    markSeen();
    setVisible(false);
    window.requestAnimationFrame(() => restoreFocusRef.current?.focus());
  }

  function finishBeginner() {
    updatePreferences({ experience: "simple" });
    closeTour();
  }

  if (!visible || typeof document === "undefined") return null;

  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  return createPortal(
    <div className={styles.tourLayer}>
      <button aria-label="Skip guided tour" className={styles.tourBackdrop} onClick={closeTour} type="button" />
      <section
        aria-labelledby="guided-tour-title"
        aria-modal="true"
        className={styles.tourDialog}
        data-testid="first-visit-orientation"
        ref={dialogRef}
        role="dialog"
      >
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
            <button className={styles.primaryAction} onClick={finishBeginner} type="button">Start in Beginner View</button>
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
    <details className={styles.help} id="bindforge-help">
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
