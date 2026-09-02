export type VerifiedActionCategory =
  | "Movement & Camera"
  | "Powers & Targeting"
  | "Performance (Bards Only)"
  | "Windows"
  | "Miscellaneous";

export type VerifiedKeybindAction = {
  id: string;
  category: VerifiedActionCategory;
  label: string;
  manualCommand: string;
  bindFragment: string;
  verification: "settings-screenshot";
};

export const verifiedKeybindActions: VerifiedKeybindAction[] = [
  { id: "backwards", category: "Movement & Camera", label: "Backwards", manualCommand: "/+Actionbackward", bindFragment: "+Actionbackward", verification: "settings-screenshot" },
  { id: "move-forward", category: "Movement & Camera", label: "Move forward", manualCommand: "/+Actionforward", bindFragment: "+Actionforward", verification: "settings-screenshot" },
  { id: "move-left", category: "Movement & Camera", label: "Move left", manualCommand: "/+Actionleft", bindFragment: "+Actionleft", verification: "settings-screenshot" },
  { id: "move-right", category: "Movement & Camera", label: "Move right", manualCommand: "/+Actionright", bindFragment: "+Actionright", verification: "settings-screenshot" },
  { id: "jump", category: "Movement & Camera", label: "Jump", manualCommand: "/+up", bindFragment: "+up", verification: "settings-screenshot" },
  { id: "tactical-power", category: "Movement & Camera", label: "Tactical Power", manualCommand: "/+tacticalSpecial", bindFragment: "+tacticalSpecial", verification: "settings-screenshot" },
  { id: "auto-run", category: "Movement & Camera", label: "Auto-run", manualCommand: "/++autoforward", bindFragment: "++autoforward", verification: "settings-screenshot" },
  { id: "inspect-zoom-out", category: "Movement & Camera", label: "Inspect Mode Zoom Out", manualCommand: "/CamZoomOut", bindFragment: "CamZoomOut", verification: "settings-screenshot" },
  { id: "inspect-zoom-in", category: "Movement & Camera", label: "Inspect Mode Zoom In", manualCommand: "/CamZoomIn", bindFragment: "CamZoomIn", verification: "settings-screenshot" },
  { id: "toggle-inspect-mode", category: "Movement & Camera", label: "Toggle Inspect Mode", manualCommand: "/camTogglePlayerInspect", bindFragment: "camTogglePlayerInspect", verification: "settings-screenshot" },
  { id: "toggle-cursor-mode", category: "Movement & Camera", label: "Toggle cursor mode", manualCommand: "/++suspendForcedMouselookAndStopMoving", bindFragment: "++suspendForcedMouselookAndStopMoving", verification: "settings-screenshot" },

  { id: "at-will-1", category: "Powers & Targeting", label: "At-Will #1", manualCommand: "/+EvaluateLeftClick", bindFragment: "+EvaluateLeftClick", verification: "settings-screenshot" },
  { id: "at-will-2", category: "Powers & Targeting", label: "At-Will #2", manualCommand: "/+PowerTrayExec 1", bindFragment: "+PowerTrayExec 1", verification: "settings-screenshot" },
  { id: "encounter-1", category: "Powers & Targeting", label: "Encounter #1", manualCommand: "/+PowerTrayExec 2", bindFragment: "+PowerTrayExec 2", verification: "settings-screenshot" },
  { id: "encounter-2", category: "Powers & Targeting", label: "Encounter #2", manualCommand: "/+PowerTrayExec 3", bindFragment: "+PowerTrayExec 3", verification: "settings-screenshot" },
  { id: "encounter-3", category: "Powers & Targeting", label: "Encounter #3", manualCommand: "/+PowerTrayExec 4", bindFragment: "+PowerTrayExec 4", verification: "settings-screenshot" },
  { id: "daily-1", category: "Powers & Targeting", label: "Daily #1", manualCommand: "/+PowerTrayExec 5", bindFragment: "+PowerTrayExec 5", verification: "settings-screenshot" },
  { id: "daily-2", category: "Powers & Targeting", label: "Daily #2", manualCommand: "/+PowerTrayExec 6", bindFragment: "+PowerTrayExec 6", verification: "settings-screenshot" },
  { id: "power-set-swap", category: "Powers & Targeting", label: "PowerSetSwap", manualCommand: "/+PowerSetSwapExec", bindFragment: "+PowerSetSwapExec", verification: "settings-screenshot" },
  { id: "special-power", category: "Powers & Targeting", label: "Special Power", manualCommand: "/+specialClassPower", bindFragment: "+specialClassPower", verification: "settings-screenshot" },
  { id: "item-tray-1", category: "Powers & Targeting", label: "Item Tray 1", manualCommand: "/+InventoryExec Potions 0", bindFragment: "+InventoryExec Potions 0", verification: "settings-screenshot" },
  { id: "item-tray-2", category: "Powers & Targeting", label: "Item Tray 2", manualCommand: "/+InventoryExec Potions 1", bindFragment: "+InventoryExec Potions 1", verification: "settings-screenshot" },
  { id: "item-tray-3", category: "Powers & Targeting", label: "Item Tray 3", manualCommand: "/+InventoryExec Potions 2", bindFragment: "+InventoryExec Potions 2", verification: "settings-screenshot" },
  { id: "primary-artifact", category: "Powers & Targeting", label: "Primary Artifact Active Power", manualCommand: "/+InventoryExec ArtifactPrimary 0", bindFragment: "+InventoryExec ArtifactPrimary 0", verification: "settings-screenshot" },
  { id: "invocation", category: "Powers & Targeting", label: "Invocation", manualCommand: "/Invoke", bindFragment: "Invoke", verification: "settings-screenshot" },
  { id: "mount", category: "Powers & Targeting", label: "Mount", manualCommand: "/+Mount", bindFragment: "+Mount", verification: "settings-screenshot" },
  { id: "interact-loot", category: "Powers & Targeting", label: "Interact / Loot", manualCommand: "/+InteractAndLoot", bindFragment: "+InteractAndLoot", verification: "settings-screenshot" },
  { id: "claim-special-reward", category: "Powers & Targeting", label: "Claim Special Reward", manualCommand: "/InteractWithRewardClaim", bindFragment: "InteractWithRewardClaim", verification: "settings-screenshot" },
  { id: "lock-target", category: "Powers & Targeting", label: "Lock Target (hold)", manualCommand: "/+HardTargetLock", bindFragment: "+HardTargetLock", verification: "settings-screenshot" },
  { id: "bard-free-play", category: "Powers & Targeting", label: "Free Play Mode (Bards only)", manualCommand: "/+PowerTrayExec 31", bindFragment: "+PowerTrayExec 31", verification: "settings-screenshot" },

  { id: "bard-song-1", category: "Performance (Bards Only)", label: "Bard Song 1", manualCommand: "/+PowerTrayExec 27", bindFragment: "+PowerTrayExec 27", verification: "settings-screenshot" },
  { id: "bard-song-2", category: "Performance (Bards Only)", label: "Bard Song 2", manualCommand: "/+PowerTrayExec 28", bindFragment: "+PowerTrayExec 28", verification: "settings-screenshot" },
  { id: "bard-note-c", category: "Performance (Bards Only)", label: "Play C Note", manualCommand: "/+PowerMusicNoteExec 7", bindFragment: "+PowerMusicNoteExec 7", verification: "settings-screenshot" },
  { id: "bard-note-d", category: "Performance (Bards Only)", label: "Play D Note", manualCommand: "/+PowerMusicNoteExec 8", bindFragment: "+PowerMusicNoteExec 8", verification: "settings-screenshot" },
  { id: "bard-note-e", category: "Performance (Bards Only)", label: "Play E Note", manualCommand: "/+PowerMusicNoteExec 9", bindFragment: "+PowerMusicNoteExec 9", verification: "settings-screenshot" },
  { id: "bard-note-f", category: "Performance (Bards Only)", label: "Play F Note", manualCommand: "/+PowerMusicNoteExec 10", bindFragment: "+PowerMusicNoteExec 10", verification: "settings-screenshot" },
  { id: "bard-note-g", category: "Performance (Bards Only)", label: "Play G Note", manualCommand: "/+PowerMusicNoteExec 11", bindFragment: "+PowerMusicNoteExec 11", verification: "settings-screenshot" },
  { id: "bard-note-a", category: "Performance (Bards Only)", label: "Play A Note", manualCommand: "/+PowerMusicNoteExec 12", bindFragment: "+PowerMusicNoteExec 12", verification: "settings-screenshot" },
  { id: "bard-note-b", category: "Performance (Bards Only)", label: "Play B Note", manualCommand: "/+PowerMusicNoteExec 13", bindFragment: "+PowerMusicNoteExec 13", verification: "settings-screenshot" },
  { id: "bard-note-c-next", category: "Performance (Bards Only)", label: "Play C Note (Next Octave)", manualCommand: "/+PowerMusicNoteExec 14", bindFragment: "+PowerMusicNoteExec 14", verification: "settings-screenshot" },
  { id: "bard-octave-up", category: "Performance (Bards Only)", label: "Increase Octave (Held)", manualCommand: "/+PowerMusicOctaveExec 1", bindFragment: "+PowerMusicOctaveExec 1", verification: "settings-screenshot" },
  { id: "bard-octave-down", category: "Performance (Bards Only)", label: "Decrease Octave (Held)", manualCommand: "/+PowerMusicOctaveExec -1", bindFragment: "+PowerMusicOctaveExec -1", verification: "settings-screenshot" },
  { id: "bard-halfstep-up", category: "Performance (Bards Only)", label: "Halfstep Up (Held)", manualCommand: "/+PowerMusicAccidentalExec 1", bindFragment: "+PowerMusicAccidentalExec 1", verification: "settings-screenshot" },
  { id: "bard-halfstep-down", category: "Performance (Bards Only)", label: "Halfstep Down (Held)", manualCommand: "/+PowerMusicAccidentalExec -1", bindFragment: "+PowerMusicAccidentalExec -1", verification: "settings-screenshot" },

  { id: "window-button-1", category: "Windows", label: "Press Window Button 1", manualCommand: "/ClickWindowButton_1", bindFragment: "ClickWindowButton_1", verification: "settings-screenshot" },
  { id: "window-button-2", category: "Windows", label: "Press Window Button 2", manualCommand: "/ClickWindowButton_2", bindFragment: "ClickWindowButton_2", verification: "settings-screenshot" },
  { id: "window-button-3", category: "Windows", label: "Press Window Button 3", manualCommand: "/ClickWindowButton_3", bindFragment: "ClickWindowButton_3", verification: "settings-screenshot" },
  { id: "character-sheet", category: "Windows", label: "Character Sheet", manualCommand: "/paperdoll", bindFragment: "paperdoll", verification: "settings-screenshot" },
  { id: "home-page", category: "Windows", label: "Home Page", manualCommand: "/HomePage", bindFragment: "HomePage", verification: "settings-screenshot" },
  { id: "inventory", category: "Windows", label: "Inventory", manualCommand: "/inventory", bindFragment: "inventory", verification: "settings-screenshot" },
  { id: "game-menu", category: "Windows", label: "Game Menu", manualCommand: "/ClearTargetOrBringUpMenuIgnoreMouseLook", bindFragment: "ClearTargetOrBringUpMenuIgnoreMouseLook", verification: "settings-screenshot" },
  { id: "zone-map", category: "Windows", label: "Zone map", manualCommand: "/map", bindFragment: "map", verification: "settings-screenshot" },
  { id: "mission-journal", category: "Windows", label: "Mission journal", manualCommand: "/missions", bindFragment: "missions", verification: "settings-screenshot" },
  { id: "professions", category: "Windows", label: "Professions", manualCommand: "/Crafting", bindFragment: "Crafting", verification: "settings-screenshot" },
  { id: "friends-search", category: "Windows", label: "Friends/Search", manualCommand: "/social", bindFragment: "social", verification: "settings-screenshot" },
  { id: "achievements", category: "Windows", label: "Achievements", manualCommand: "/perks", bindFragment: "perks", verification: "settings-screenshot" },
  { id: "powers-advantages", category: "Windows", label: "Powers & advantages", manualCommand: "/powers", bindFragment: "powers", verification: "settings-screenshot" },
  { id: "feats", category: "Windows", label: "Feats", manualCommand: "/feats", bindFragment: "feats", verification: "settings-screenshot" },
  { id: "boons", category: "Windows", label: "Boons", manualCommand: "/boons", bindFragment: "boons", verification: "settings-screenshot" },
  { id: "teaming-queue", category: "Windows", label: "Teaming Queue", manualCommand: "/queue", bindFragment: "queue", verification: "settings-screenshot" },
  { id: "guild-management", category: "Windows", label: "Guild Management", manualCommand: "/guildmanagement", bindFragment: "guildmanagement", verification: "settings-screenshot" },
  { id: "toggle-ui", category: "Windows", label: "Toggle UI", manualCommand: "/++ShowGameUI", bindFragment: "++ShowGameUI", verification: "settings-screenshot" },
  { id: "ui-rearrange", category: "Windows", label: "UI rearrange mode", manualCommand: "/Rearrange", bindFragment: "Rearrange", verification: "settings-screenshot" },
  { id: "mail", category: "Windows", label: "Mail", manualCommand: "/Mail", bindFragment: "Mail", verification: "settings-screenshot" },
  { id: "zen-market", category: "Windows", label: "ZEN Market", manualCommand: "/zmarket", bindFragment: "zmarket", verification: "settings-screenshot" },
  { id: "options", category: "Windows", label: "Options", manualCommand: "/Options", bindFragment: "Options", verification: "settings-screenshot" },
  { id: "scoreboard", category: "Windows", label: "Scoreboard", manualCommand: "/Scoreboard", bindFragment: "Scoreboard", verification: "settings-screenshot" },
  { id: "help-tickets", category: "Windows", label: "Help/Tickets", manualCommand: "/Help_Tickets", bindFragment: "Help_Tickets", verification: "settings-screenshot" },
  { id: "campaigns", category: "Windows", label: "Adventures and Campaigns", manualCommand: "/Campaigns", bindFragment: "Campaigns", verification: "settings-screenshot" },
  { id: "last-campaign", category: "Windows", label: "Last Viewed Campaign", manualCommand: "/LastCampaign", bindFragment: "LastCampaign", verification: "settings-screenshot" },
  { id: "collections", category: "Windows", label: "Collections", manualCommand: "/Collections", bindFragment: "Collections", verification: "settings-screenshot" },
  { id: "mounts-window", category: "Windows", label: "Mounts", manualCommand: "/Mounts", bindFragment: "Mounts", verification: "settings-screenshot" },
  { id: "dungeon-trials-leaderboard", category: "Windows", label: "Dungeon/Trials Leaderboard", manualCommand: "/LeaderboardDungeonTrial", bindFragment: "LeaderboardDungeonTrial", verification: "settings-screenshot" },

  { id: "start-chatting", category: "Miscellaneous", label: "Start chatting", manualCommand: "/startChat", bindFragment: "startChat", verification: "settings-screenshot" },
  { id: "reply-to-tell", category: "Miscellaneous", label: "Reply to tell", manualCommand: "/startChatReply", bindFragment: "startChatReply", verification: "settings-screenshot" },
  { id: "chat-command", category: "Miscellaneous", label: "Chat command", manualCommand: "/startChatSlash", bindFragment: "startChatSlash", verification: "settings-screenshot" },
  { id: "quest-path", category: "Miscellaneous", label: "Show/Hide the Quest Path", manualCommand: "/ToggleGoldenPath", bindFragment: "ToggleGoldenPath", verification: "settings-screenshot" },
  { id: "push-to-talk", category: "Miscellaneous", label: "Push-to-Talk", manualCommand: "/+svPushToTalk", bindFragment: "+svPushToTalk", verification: "settings-screenshot" },
  { id: "mute-contact-voice", category: "Miscellaneous", label: "Mute Contact Voice", manualCommand: "/MuteContactVO", bindFragment: "MuteContactVO", verification: "settings-screenshot" },
];

export const verifiedActionCategories: VerifiedActionCategory[] = [
  "Movement & Camera",
  "Powers & Targeting",
  "Performance (Bards Only)",
  "Windows",
  "Miscellaneous",
];

export const observedWorkingBindFragments = [
  { id: "observed-double-action-left", label: "Observed ++Actionleft variant", fragment: "++actionleft", verification: "user-provided-working-bind" as const },
  { id: "observed-double-action-right", label: "Observed ++Actionright variant", fragment: "++actionright", verification: "user-provided-working-bind" as const },
];
