"use client";

import { useEffect, useState } from "react";
import styles from "./FirstVisitHelp.module.css";

const FIRST_VISIT_KEY = "bindforge-nw:first-visit:v1";
const FIRST_VISIT_SESSION_KEY = "bindforge-nw:first-visit-presented:v1";

function markSeen() {
  try { window.localStorage.setItem(FIRST_VISIT_KEY, "seen"); } catch { /* session only */ }
  try { window.sessionStorage.setItem(FIRST_VISIT_SESSION_KEY, "seen"); } catch { /* no-op */ }
}

export function FirstVisitOrientation() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    let shouldShow = false;
    try {
      const permanentlySeen = window.localStorage.getItem(FIRST_VISIT_KEY) === "seen";
      const presentedThisSession = window.sessionStorage.getItem(FIRST_VISIT_SESSION_KEY) === "seen";
      shouldShow = !permanentlySeen && !presentedThisSession;
      if (shouldShow) window.sessionStorage.setItem(FIRST_VISIT_SESSION_KEY, "seen");
    } catch {
      shouldShow = true;
    }
    if (shouldShow) frame = window.requestAnimationFrame(() => setVisible(true));
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  if (!visible) return null;

  function dismiss() {
    markSeen();
    setVisible(false);
  }

  return (
    <aside aria-label="First visit guide" className={styles.orientation} data-testid="first-visit-orientation">
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>New to BindForge?</p>
          <h2 className={styles.title}>Start with the job you came to do.</h2>
        </div>
        <button aria-label="Dismiss first visit guide" className={styles.close} onClick={dismiss} type="button">×</button>
      </div>
      <p className={styles.intro}>You do not need to know Neverwinter command syntax. Pick a path; advanced details stay available when you want them.</p>
      <div className={styles.paths}>
        <a className={styles.path} href="#search-keybinds" onClick={dismiss}>
          <strong>Find a keybind</strong>
          <small>Search existing presets in normal player language.</small>
        </a>
        <a className={styles.path} href="#compose-keybind" onClick={dismiss}>
          <strong>Build a keybind</strong>
          <small>Choose a key and combine supported actions visually.</small>
        </a>
        <a className={styles.path} href="#build-command" onClick={dismiss}>
          <strong>Advanced tools</strong>
          <small>Work directly with supported commands and technical options.</small>
        </a>
      </div>
      <a className={styles.footerLink} href="#bindforge-help" onClick={dismiss}>What do the terms and trust labels mean?</a>
    </aside>
  );
}

export function ContextualHelpGlossary() {
  return (
    <details className={styles.help} id="bindforge-help">
      <summary>Help, terms & confidence labels</summary>
      <div className={styles.helpBody}>
        <div className={styles.helpIntro}>
          <h2>Read the tool without learning the jargon first.</h2>
          <p>BindForge keeps command details available for experienced players, but the core actions can be understood in plain language. Verification labels describe evidence, not a guarantee that a command will keep working after every Neverwinter update.</p>
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
