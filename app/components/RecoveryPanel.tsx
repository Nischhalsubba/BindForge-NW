import type { ReactNode } from "react";
import styles from "../recovery.module.css";

type RecoveryPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  busy?: boolean;
  reference?: string | null;
};

export function RecoveryPanel({
  eyebrow,
  title,
  description,
  children,
  busy = false,
  reference = null,
}: RecoveryPanelProps) {
  return (
    <main className={styles.shell}>
      <section
        aria-busy={busy || undefined}
        aria-labelledby="recovery-title"
        className={styles.panel}
      >
        <div aria-hidden="true" className={styles.mark}>
          <span />
          <span />
          <span />
        </div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 id="recovery-title">{title}</h1>
        <p className={styles.description}>{description}</p>
        {reference ? <p className={styles.reference}>Reference: {reference}</p> : null}
        {children ? <div className={styles.actions}>{children}</div> : null}
        <p className={styles.note}>
          Browser-saved BindForge settings remain on this device unless site data is cleared.
        </p>
      </section>
    </main>
  );
}
