/* eslint-disable @next/next/no-html-link-for-pages */
import styles from "./FirstVisitHelp.module.css";
export function ContextualHelpGlossary() {
  return (
    <details className={styles.help} data-tour="help" id="bindforge-help">
      <summary>Help, terms & confidence labels</summary>
      <div className={styles.helpBody}>
        <div className={styles.helpIntro}>
          <h2>Read the tool without learning the jargon first.</h2>
          <p>
            BindForge keeps command details available for experienced players,
            but the core actions can be understood in plain language.
            Verification labels describe evidence, not a guarantee that a
            command will keep working after every Neverwinter update.
          </p>
          <a className={styles.replayButton} href="/#help">
            Open the workbench guide
          </a>
        </div>
        <dl className={styles.glossary}>
          <div className={styles.term}>
            <dt>Bind</dt>
            <dd>Assign a key or key combination to a Neverwinter command.</dd>
          </div>
          <div className={styles.term}>
            <dt>Unbind / rollback</dt>
            <dd>
              Remove or reverse a key assignment. Pack review can prepare
              rollback output for the keys you selected.
            </dd>
          </div>
          <div className={styles.term}>
            <dt>
              <code>$$</code>
            </dt>
            <dd>
              Neverwinter command chaining syntax used when multiple supported
              actions are combined into one bind.
            </dd>
          </div>
          <div className={styles.term}>
            <dt>Conflict</dt>
            <dd>
              The chosen key is already used by another selected preset, your
              imported keymap, or a commonly important native control.
            </dd>
          </div>
          <div className={styles.term}>
            <dt>Verified</dt>
            <dd>
              BindForge has documented or direct evidence for the preset. Test
              again after major game updates.
            </dd>
          </div>
          <div className={styles.term}>
            <dt>Community tested</dt>
            <dd>
              Community evidence reports the preset working, but you should test
              it on your own character.
            </dd>
          </div>
          <div className={styles.term}>
            <dt>Experimental</dt>
            <dd>
              The preset is user-submitted, risky, or otherwise needs careful
              in-game testing and a rollback plan.
            </dd>
          </div>
          <div className={styles.term}>
            <dt>Personal keymap</dt>
            <dd>
              Your pasted or imported bind text, analyzed locally so BindForge
              can warn about conflicts with your actual saved keys.
            </dd>
          </div>
        </dl>
      </div>
    </details>
  );
}
