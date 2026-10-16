"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import styles from "./ConfirmDialog.module.css";

export type Confirmation = {
  title: string;
  description: string;
  actionLabel: string;
  onConfirm: () => void;
};

export function ConfirmDialog({ confirmation, onCancel }: {
  confirmation: Confirmation;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    lastFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      const previous = lastFocus.current;
      if (previous?.isConnected) window.requestAnimationFrame(() => previous.focus());
    };
  }, []);

  return createPortal(
    <dialog
      aria-describedby="confirmation-description"
      aria-labelledby="confirmation-title"
      className={styles.dialog}
      onCancel={(event) => { event.preventDefault(); onCancel(); }}
      ref={ref}
    >
      <form method="dialog" onSubmit={(event) => event.preventDefault()}>
        <p className={styles.eyebrow}>Review required</p>
        <h2 id="confirmation-title">{confirmation.title}</h2>
        <p id="confirmation-description">{confirmation.description}</p>
        <div className={styles.actions}>
          <button autoFocus onClick={onCancel} type="button">Cancel</button>
          <button className={styles.destructive} onClick={confirmation.onConfirm} type="button">{confirmation.actionLabel}</button>
        </div>
      </form>
    </dialog>,
    document.body,
  );
}
