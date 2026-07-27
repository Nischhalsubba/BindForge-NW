// Generated from the uploaded Neverwinter practical keybind guide.
// The previous hand-written preset catalog has been fully replaced.

import type { KeybindPreset, PresetSourceType } from "./keybindTypes";
import { inventoryAndConsumables } from "./keybindPresetSections/inventoryAndConsumables";
import { vipAndRewardFunctions } from "./keybindPresetSections/vipAndRewardFunctions";
import { characterInstanceAndAccount } from "./keybindPresetSections/characterInstanceAndAccount";
import { companion } from "./keybindPresetSections/companion";
import { combatTargetingFollowAndInteraction } from "./keybindPresetSections/combatTargetingFollowAndInteraction";
import { classSpecificCombos } from "./keybindPresetSections/classSpecificCombos";
import { artifactCombos } from "./keybindPresetSections/artifactCombos";
import { performanceAndDisplay } from "./keybindPresetSections/performanceAndDisplay";
import { screenshotsAndRecording } from "./keybindPresetSections/screenshotsAndRecording";
import { onlineStatus } from "./keybindPresetSections/onlineStatus";
import { teamManagement } from "./keybindPresetSections/teamManagement";
import { windowsAndMenus } from "./keybindPresetSections/windowsAndMenus";
import { movementAndCamera } from "./keybindPresetSections/movementAndCamera";
import { emotes } from "./keybindPresetSections/emotes";
import { customChatMessages } from "./keybindPresetSections/customChatMessages";
import { bardSongs } from "./keybindPresetSections/bardSongs";
import { suggestedKeyForIndex } from "../lib/safe-key-suggestions";

export type { KeybindType, KeybindClass, KeybindPreset } from "./keybindTypes";

const rawKeybindPresets: KeybindPreset[] = [
  ...inventoryAndConsumables,
  ...vipAndRewardFunctions,
  ...characterInstanceAndAccount,
  ...companion,
  ...combatTargetingFollowAndInteraction,
  ...classSpecificCombos,
  ...artifactCombos,
  ...performanceAndDisplay,
  ...screenshotsAndRecording,
  ...onlineStatus,
  ...teamManagement,
  ...windowsAndMenus,
  ...movementAndCamera,
  ...emotes,
  ...customChatMessages,
  ...bardSongs,
];

const consoleCommandSource = "https://neverwinter.fandom.com/wiki/Console_command";
const hotkeySource = "https://neverwinter.fandom.com/wiki/Hotkeys";

function inferredSource(preset: KeybindPreset): { sourceType: PresetSourceType; sourceUrl?: string } {
  if (preset.sourceType) return { sourceType: preset.sourceType, sourceUrl: preset.sourceUrl };
  const evidence = `${preset.plainEnglish} ${preset.notes ?? ""}`.toLowerCase();
  if (evidence.includes("wiki supplied") || evidence.includes("wiki-supplied")) {
    return {
      sourceType: "wiki",
      sourceUrl: preset.type === "Camera / Screenshot" || preset.type === "Utility" ? hotkeySource : consoleCommandSource,
    };
  }
  if (evidence.includes("user supplied") || evidence.includes("user-submitted")) {
    return { sourceType: "user-submitted" };
  }
  return { sourceType: "community", sourceUrl: preset.sourceUrl };
}

export const keybindPresets: KeybindPreset[] = rawKeybindPresets.map((preset, index) => {
  const provenance = inferredSource(preset);
  return {
    sourceType: provenance.sourceType,
    sourceUrl: provenance.sourceUrl,
    confidence: preset.difficulty === "Risky" ? "experimental" : "community-tested",
    gameVersion: "Current behavior should be rechecked after Neverwinter patches",
    ...preset,
    defaultKey: preset.preserveDefaultKey ? preset.defaultKey : suggestedKeyForIndex(index),
  };
});
