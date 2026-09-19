import type { KeybindPreset } from "../data/keybindPresets";
import { academyLinksForPreset } from "../lib/academy-links.mjs";

export function AcademyLinks({ preset }: { preset: KeybindPreset }) {
  const links = academyLinksForPreset(preset);
  return (
    <div className="academy-context-links" aria-label="Neverwinter Academy references">
      <span>Learn the class context:</span>
      {links.map((link) => <a href={link.url} key={link.url} rel="noreferrer" target="_blank">{link.label} ↗</a>)}
    </div>
  );
}
