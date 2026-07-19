// Generated from the uploaded Neverwinter practical keybind guide.
// The previous hand-written preset catalog has been fully replaced.

import type { KeybindPreset } from "./keybindTypes";
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

export type { KeybindType, KeybindClass, KeybindPreset } from "./keybindTypes";

export const keybindPresets: KeybindPreset[] = [
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
