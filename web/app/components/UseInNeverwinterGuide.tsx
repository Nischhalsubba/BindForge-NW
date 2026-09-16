"use client";

import { useState } from "react";
import styles from "./UseInNeverwinterGuide.module.css";

type GuideProps = {
  command: string;
  label: string;
  onClose: () => void;
  onCopyAgain: () => Promise<boolean>;
};

export function UseInNeverwinterGuide({ command, label, onClose, onCopyAgain }: GuideProps) {
  const [troubleshooting, setTroubleshooting] = useState(false);
  const [copyAgainState, setCopyAgainState] = useState<"idle" | "copied" | "error">("idle");

  async function copyAgain() {
    const ok = await onCopyAgain();
    setCopyAgainState(ok ? "copied" : "error");
    window.setTimeout(() => setCopyAgainState("idle"), ok ? 2200 : 4200);
  }

  return (
    <aside aria-label="Use this in Neverwinter" className={styles.guide} data-testid="in-game-guide">
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>Copied · next step</p>
          <h2 className={styles.title}>Use this in Neverwinter</h2>
        </div>
        <button aria-label="Close in-game guidance" className={styles.close} onClick={onClose} type="button">×</button>
      </div>

      <p className={styles.note}>You copied <strong>{label}</strong>. BindForge cannot inspect your live game state, so test the result in-game before relying on it.</p>
      <code className={styles.command} tabIndex={0}>{command}</code>

      <ol className={styles.steps}>
        <li><strong>Open Neverwinter chat.</strong> Use the normal chat input you already use in game.</li>
        <li><strong>Paste the copied command.</strong> Keep the command unchanged unless you intentionally edit the key.</li>
        <li><strong>Submit it.</strong> The game should process the bind command through chat.</li>
        <li><strong>Test the key somewhere safe.</strong> Confirm the expected action before using it in combat or an important activity.</li>
      </ol>

      <button className={styles.copyAgain} onClick={() => { void copyAgain(); }} type="button">
        {copyAgainState === "copied" ? "Copied again" : copyAgainState === "error" ? "Copy failed — try again" : "Copy command again"}
      </button>

      <div className={styles.actions}>
        <button className={styles.primary} onClick={onClose} type="button">It worked</button>
        <button aria-expanded={troubleshooting} className={styles.secondary} onClick={() => setTroubleshooting((value) => !value)} type="button">It didn’t work</button>
      </div>

      {troubleshooting ? (
        <section className={styles.troubleshooting} data-testid="in-game-troubleshooting">
          <h3>Check these first</h3>
          <dl>
            <div>
              <dt>The key does nothing</dt>
              <dd>Check the captured key combination and your imported personal keymap for an existing bind. Try a safer key if BindForge reports a conflict.</dd>
            </div>
            <div>
              <dt>The wrong action happens</dt>
              <dd>Undo or replace the bind before testing another command. If you built a pack, use its rollback/unbind output to reverse the keys you changed.</dd>
            </div>
            <div>
              <dt>Neverwinter rejects or ignores the command</dt>
              <dd>Open the preset Details and check its verification label and source. Commands can change after game updates, especially community-tested or experimental entries.</dd>
            </div>
            <div>
              <dt>You are not sure what changed</dt>
              <dd>Stop testing additional binds, restore the affected key, then apply one command at a time so you can identify which change caused the problem.</dd>
            </div>
          </dl>
          <p className={styles.note}>BindForge prepares commands locally; it cannot confirm whether the live Neverwinter client accepted or remapped them.</p>
        </section>
      ) : null}
    </aside>
  );
}
