"use client";

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
  selectedIds,
  onAddPack,
}: {
  packs: CatalogPack[];
  selectedIds: string[];
  onAddPack: (ids: string[]) => void;
}) {
  const selected = new Set(selectedIds);

  return (
    <details className={styles.root} data-testid="catalog-quick-packs">
      <summary className={styles.summary}>
        <span className={styles.summaryCopy}>
          <strong>Class & role quick packs</strong>
          <small>Group existing catalogue presets without inventing new builds.</small>
        </span>
        <span className={styles.count}>{packs.length} packs</span>
        <span aria-hidden="true" className={styles.chevron}>+</span>
      </summary>

      <div className={styles.body}>
        <p className={styles.intro}>
          These packs only group presets that already carry matching class, role, path, or action metadata in BindForge. They are not automatic build recommendations. Add a pack to your selection, then use the existing conflict and pack-review tools before applying anything in game.
        </p>
        <div className={styles.grid}>
          {packs.map((pack) => {
            const selectedCount = pack.presetIds.filter((id) => selected.has(id)).length;
            const complete = selectedCount === pack.count;
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
                  className={styles.action}
                  disabled={complete}
                  onClick={() => onAddPack(pack.presetIds)}
                  type="button"
                >
                  {complete ? "Pack selected" : selectedCount ? `Add remaining ${pack.count - selectedCount}` : `Add ${pack.count} to selection`}
                </button>
              </article>
            );
          })}
        </div>
        <p className={styles.note}>Class/role labels come from the existing catalogue only. Experimental entries remain experimental and keep their current verification labels.</p>
      </div>
    </details>
  );
}
