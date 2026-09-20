"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import LocalSettingsManager from "../LocalSettingsManager";
import ThemeSwitcher from "../ThemeSwitcher";
import { AccessibilityPreferences } from "../AccessibilityPreferences";
import { CatalogueTrustPanel } from "./CatalogueTrustPanel";
import { RecoveryDataPanel } from "./RecoveryDataPanel";
import { PrivacyAnalyticsPanel } from "./PrivacyAnalyticsPanel";
import styles from "./SettingsPanel.module.css";

function focusableElements(root: HTMLElement | null) {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
  )).filter((element) => !element.hasAttribute("hidden"));
}

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const shell = document.querySelector<HTMLElement>(".app-shell");
    const shellHadInert = shell?.hasAttribute("inert") ?? false;
    const previousAriaHidden = shell?.getAttribute("aria-hidden") ?? null;

    document.body.style.overflow = "hidden";
    shell?.setAttribute("inert", "");
    shell?.setAttribute("aria-hidden", "true");
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        window.requestAnimationFrame(() => triggerRef.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = focusableElements(panelRef.current);
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
      document.body.style.overflow = previousOverflow;
      if (shell) {
        if (!shellHadInert) shell.removeAttribute("inert");
        if (previousAriaHidden === null) shell.removeAttribute("aria-hidden");
        else shell.setAttribute("aria-hidden", previousAriaHidden);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function closePanel() {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  const layer = open && typeof document !== "undefined"
    ? createPortal(
      <div className={styles.layer} data-testid="settings-layer">
        <button aria-label="Dismiss settings" className={styles.backdrop} onClick={closePanel} tabIndex={-1} type="button" />
        <section aria-labelledby="settings-title" aria-modal="true" className={styles.panel} id="app-settings-panel" ref={panelRef} role="dialog">
          <header className={styles.header}>
            <div><p>Experience, trust &amp; local data</p><h2 id="settings-title">Settings</h2></div>
            <button aria-label="Close settings" className={styles.close} onClick={closePanel} ref={closeRef} type="button">×</button>
          </header>
          <div className={styles.content}>
            <section aria-labelledby="experience-settings-title" className={styles.group}>
              <header className={styles.groupHeading}>
                <p>01</p>
                <div><h3 id="experience-settings-title">Experience</h3><span>Appearance, reading comfort, motion, and interface complexity.</span></div>
              </header>
              <section className={styles.section} aria-labelledby="appearance-settings-title">
                <div className={styles.sectionHeading}><h4 id="appearance-settings-title">Appearance</h4><p>Choose the light, dark, or system theme used by this browser.</p></div>
                <ThemeSwitcher />
              </section>
              <section className={styles.section} aria-labelledby="accessibility-settings-title">
                <div className={styles.sectionHeading}><h4 id="accessibility-settings-title">Accessibility &amp; experience</h4><p>Adjust reading size, spacing, motion, assistance, and how much technical detail BindForge shows.</p></div>
                <AccessibilityPreferences />
              </section>
            </section>

            <section aria-labelledby="trust-settings-title" className={styles.group}>
              <header className={styles.groupHeading}>
                <p>02</p>
                <div><h3 id="trust-settings-title">Trust &amp; diagnostics</h3><span>Verification health, local workflow diagnostics, and recovery evidence.</span></div>
              </header>
              <section className={styles.section} aria-labelledby="catalogue-trust-settings-title">
                <div className={styles.sectionHeading}><h4 id="catalogue-trust-settings-title">Catalogue trust</h4><p>See verification debt and compare a live Neverwinter command list against the local reference catalogue.</p></div>
                <CatalogueTrustPanel />
              </section>
              <section className={styles.section} aria-labelledby="analytics-settings-title">
                <div className={styles.sectionHeading}><h4 id="analytics-settings-title">Privacy-conscious usage insights</h4><p>Review coarse, device-local workflow events without exposing your keymaps, identity, or free-text searches.</p></div>
                <PrivacyAnalyticsPanel />
              </section>
              <section className={styles.section} aria-labelledby="recovery-settings-title">
                <div className={styles.sectionHeading}><h4 id="recovery-settings-title">Recovery archive</h4><p>When locally saved JSON is invalid, BindForge preserves the raw value here before using a safe fallback.</p></div>
                <RecoveryDataPanel />
              </section>
            </section>

            <section aria-labelledby="data-settings-title" className={styles.group}>
              <header className={styles.groupHeading}>
                <p>03</p>
                <div><h3 id="data-settings-title">Data</h3><span>Export, restore, or clear the setup stored in this browser.</span></div>
              </header>
              <section className={styles.section} aria-labelledby="backup-settings-title">
                <div className={styles.sectionHeading}><h4 id="backup-settings-title">Backup &amp; reset</h4><p>Export, restore, or clear your locally saved setup and preferences.</p></div>
                <LocalSettingsManager />
              </section>
            </section>
          </div>
        </section>
      </div>,
      document.body,
    )
    : null;

  return (
    <div className={styles.root}>
      <button aria-controls="app-settings-panel" aria-expanded={open} className={styles.trigger} onClick={() => setOpen(true)} ref={triggerRef} type="button">
        Settings
      </button>
      {layer}
    </div>
  );
}
