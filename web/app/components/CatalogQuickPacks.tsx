"use client";

import { useState } from "react";
import type { SyntheticEvent } from "react";
import styles from "./CatalogQuickPacks.module.css";

type CatalogPack = {
  id: string;
  title: string;
  className: string;
  role: string;
  description: string;
  presetIds: string[];
  count: number;
  confidence: {
    verified: number;
    "community-tested": number;
    experimental: number;
  };
};

export function CatalogQuickPacks({
  packs,
  activePackId,
  onOpenPack,
}: {
  packs: CatalogPack[];
  activePackId: string;
  onOpenPack: (packId: string) => void;
}) {
  const [open, setOpen] = useState(false);

  function handleToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    setOpen(event.currentTarget.open);
  }

  return (
    <details className={styles.root} data-testid="catalog-quick-packs" onToggle={handleToggle}>
      <summary className={styles.summary}>
        <span className={styles.summaryCopy}>
          <strong>Class & role quick packs</strong>
          <small>Open evidence-backed catalogue sets without inventing new builds.</small>
        </span>
        <span className={styles.count}>{packs.length} packs</span>
        <span aria-hidden="true" className={styles.chevron}>+</span>
      </summary>

      {open ? (
        <div className={styles.body}>
          <p className={styles.intro}>
            These packs only group presets that already carry matching class, role, path, or action metadata in BindForge. They are not automatic build recommendations. Open a pack, review the matching presets, then use the existing <strong>Select visible</strong> and pack-review tools if you want to apply the full set.
          </p>
          <div className={styles.grid}>
            {packs.map((pack) => {
              const active = activePackId === pack.id;
              return (
                <article className={styles.card} key={pack.id} data-pack-id={pack.id}>
                  <div className={styles.cardHeader}>
                    <span className={styles.identity}>
                      <small>{pack.className}</small>
                      <strong>{pack.title}</strong>
                    </span>
                    <span className={styles.role}>{pack.role}</span>
                  </div>
                  <p className={styles.description}>{pack.description}</p>
                  <div className={styles.evidence} aria-label={`${pack.title} evidence summary`}>
                    <span>{pack.count} {pack.count === 1 ? "preset" : "presets"}</span>
                    {pack.confidence.verified ? <span className={styles.verified}>{pack.confidence.verified} verified</span> : null}
                    {pack.confidence["community-tested"] ? <span>{pack.confidence["community-tested"]} community tested</span> : null}
                    {pack.confidence.experimental ? <span className={styles.experimental}>{pack.confidence.experimental} experimental</span> : null}
                  </div>
                  <button
                    aria-pressed={active}
                    className={styles.action}
                    onClick={() => onOpenPack(pack.id)}
                    type="button"
                  >
                    {active ? "Pack open" : `Open ${pack.count}-preset pack`}
                  </button>
                </article>
              );
            })}
          </div>
          <p className={styles.note}>Class/role labels come from the existing catalogue only. Experimental entries remain experimental and keep their current verification labels.</p>
        </div>
      ) : null}
    </details>
  );
}