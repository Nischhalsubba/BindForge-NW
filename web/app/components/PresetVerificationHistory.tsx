import type { KeybindPreset } from "../data/keybindPresets";
import { verificationHistoryForPreset } from "../lib/verification-history.mjs";

const resultLabels: Record<string, string> = {
  working: "Working",
  "needs-retest": "Needs retest",
  changed: "Changed",
  unknown: "Outcome not recorded",
};

export function PresetVerificationHistory({ preset }: { preset: KeybindPreset }) {
  const history = verificationHistoryForPreset(preset);
  if (!history.length) return null;

  return (
    <details className="verification-history">
      <summary>Verification history ({history.length})</summary>
      <ol>
        {history.map((entry, index) => (
          <li key={`${entry.date}-${entry.result}-${index}`}>
            <span><strong>{entry.date}</strong> · {resultLabels[entry.result] ?? entry.result}{entry.gameVersion ? ` · ${entry.gameVersion}` : ""}</span>
            {entry.note ? <small>{entry.note}</small> : null}
            {entry.sourceUrl ? <a href={entry.sourceUrl} rel="noreferrer" target="_blank">Evidence</a> : null}
          </li>
        ))}
      </ol>
    </details>
  );
}
