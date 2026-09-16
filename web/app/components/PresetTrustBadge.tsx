import type { KeybindPreset } from "../data/keybindPresets";
import { presetTrustInfo } from "../lib/preset-trust.mjs";

export function PresetTrustBadge({ preset, compact = false }: { preset: KeybindPreset; compact?: boolean }) {
  const trust = presetTrustInfo(preset);
  return (
    <span
      aria-label={`Verification: ${trust.label}. ${trust.description} ${trust.sourceLabel}. ${trust.checkedLabel}.`}
      className={`trust-pill trust-${trust.tone}${compact ? " trust-pill-compact" : ""}`}
      data-trust={trust.confidence}
      title={`${trust.description} ${trust.sourceLabel}. ${trust.checkedLabel}.`}
    >
      <span aria-hidden="true" className="trust-dot" />
      {trust.label}
    </span>
  );
}
