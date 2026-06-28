export type KeybindType =
  | "Invoke / VIP"
  | "Combat"
  | "Animation Cancel"
  | "Utility"
  | "Loot / Interact"
  | "Camera / Screenshot"
  | "Social";

export type KeybindPreset = {
  id: string;
  type: KeybindType;
  title: string;
  plainEnglish: string;
  defaultKey: string;
  command: string;
  searchTerms: string[];
  difficulty: "Easy" | "Advanced";
};

export const keybindPresets = [
  {
    id: "vip-bank",
    type: "Invoke / VIP",
    title: "Open VIP bank",
    plainEnglish: "Opens the VIP bank vendor from one key.",
    defaultKey: "ctrl+b",
    command: "GenSendMessage Vipaction_Bankvendor activate",
    searchTerms: ["vip", "bank", "invoke", "invoking", "utility", "vendor"],
    difficulty: "Easy",
  },
  {
    id: "vip-mailbox",
    type: "Invoke / VIP",
    title: "Open VIP mailbox",
    plainEnglish: "Opens the VIP mailbox if your account has access.",
    defaultKey: "ctrl+m",
    command: "GenSendMessage Vipaction_Mailbox activate",
    searchTerms: ["vip", "mail", "mailbox", "invoke", "invoking", "utility"],
    difficulty: "Easy",
  },
  {
    id: "vip-salvage",
    type: "Invoke / VIP",
    title: "Open VIP salvage",
    plainEnglish: "Opens the VIP salvage anvil from a keybind.",
    defaultKey: "ctrl+shift+s",
    command: "GenSendMessage Vipaction_Salvager activate",
    searchTerms: ["vip", "salvage", "invoke", "invoking", "utility"],
    difficulty: "Easy",
  },
  {
    id: "encounter-one",
    type: "Combat",
    title: "Use encounter power 1",
    plainEnglish: "Triggers a power tray slot. Change the slot number if needed.",
    defaultKey: "q",
    command: "+PowerTrayExec 2",
    searchTerms: ["combat", "power", "encounter", "skill", "attack", "rotation"],
    difficulty: "Advanced",
  },
  {
    id: "encounter-two",
    type: "Combat",
    title: "Use encounter power 2",
    plainEnglish: "Another example power tray bind for combat rotations.",
    defaultKey: "e",
    command: "+PowerTrayExec 3",
    searchTerms: ["combat", "power", "encounter", "skill", "attack", "rotation"],
    difficulty: "Advanced",
  },
  {
    id: "daily-one",
    type: "Combat",
    title: "Use daily power 1",
    plainEnglish: "Triggers a daily power slot from a chosen key.",
    defaultKey: "1",
    command: "+PowerTrayExec 6",
    searchTerms: ["combat", "daily", "power", "ultimate", "rotation"],
    difficulty: "Advanced",
  },
  {
    id: "cancel-ui",
    type: "Animation Cancel",
    title: "Cancel current UI/action",
    plainEnglish: "A safe cancel bind people can test for cancel timing and menus.",
    defaultKey: "shift+space",
    command: "uiCancel",
    searchTerms: ["animation cancel", "cancel", "animation", "ui cancel", "stop", "combat"],
    difficulty: "Advanced",
  },
  {
    id: "clear-target-menu",
    type: "Animation Cancel",
    title: "Clear target or menu",
    plainEnglish: "Clears target/menu state and is useful for testing cancel-style workflows.",
    defaultKey: "ctrl+space",
    command: "ClearTargetOrBringUpMenu",
    searchTerms: ["animation cancel", "cancel", "target", "clear", "menu", "combat"],
    difficulty: "Advanced",
  },
  {
    id: "interact-loot",
    type: "Loot / Interact",
    title: "Interact and loot",
    plainEnglish: "Uses one key for interaction and looting.",
    defaultKey: "f",
    command: "Interactandloot",
    searchTerms: ["loot", "interact", "pick up", "open", "object", "npc"],
    difficulty: "Easy",
  },
  {
    id: "interact",
    type: "Loot / Interact",
    title: "Interact",
    plainEnglish: "Basic interaction key for objects, NPCs, and prompts.",
    defaultKey: "g",
    command: "interact",
    searchTerms: ["interact", "talk", "npc", "object", "prompt"],
    difficulty: "Easy",
  },
  {
    id: "inventory",
    type: "Utility",
    title: "Open inventory",
    plainEnglish: "Opens your bags.",
    defaultKey: "i",
    command: "Inventory",
    searchTerms: ["inventory", "bag", "bags", "items", "utility"],
    difficulty: "Easy",
  },
  {
    id: "show-fps",
    type: "Utility",
    title: "Show FPS",
    plainEnglish: "Shows your frame rate for performance checks.",
    defaultKey: "ctrl+f",
    command: "showfps 1",
    searchTerms: ["fps", "performance", "lag", "utility", "show fps"],
    difficulty: "Easy",
  },
  {
    id: "hide-fps",
    type: "Utility",
    title: "Hide FPS",
    plainEnglish: "Turns off the FPS display.",
    defaultKey: "ctrl+shift+f",
    command: "showfps 0",
    searchTerms: ["fps", "performance", "hide fps", "utility"],
    difficulty: "Easy",
  },
  {
    id: "screenshot-ui",
    type: "Camera / Screenshot",
    title: "Screenshot with UI",
    plainEnglish: "Takes a screenshot with the interface visible.",
    defaultKey: "f12",
    command: "screenshot_ui_jpg",
    searchTerms: ["screenshot", "photo", "ui", "camera", "image"],
    difficulty: "Easy",
  },
  {
    id: "screenshot-clean",
    type: "Camera / Screenshot",
    title: "Clean screenshot",
    plainEnglish: "Takes a cleaner screenshot command if supported by your client.",
    defaultKey: "shift+f12",
    command: "screenshot_jpg",
    searchTerms: ["screenshot", "photo", "clean", "camera", "image"],
    difficulty: "Easy",
  },
  {
    id: "target-near",
    type: "Combat",
    title: "Target nearest enemy",
    plainEnglish: "Targets the nearest available enemy.",
    defaultKey: "tab",
    command: "targetCursorOrAutoAttack",
    searchTerms: ["target", "enemy", "combat", "tab", "auto attack"],
    difficulty: "Easy",
  },
  {
    id: "follow",
    type: "Social",
    title: "Follow target",
    plainEnglish: "Starts following your selected target.",
    defaultKey: "ctrl+shift+f",
    command: "follow",
    searchTerms: ["follow", "party", "friend", "social", "group"],
    difficulty: "Easy",
  },
  {
    id: "stop-follow",
    type: "Social",
    title: "Stop following",
    plainEnglish: "Cancels follow mode.",
    defaultKey: "ctrl+alt+f",
    command: "Follow_Cancel",
    searchTerms: ["follow", "cancel follow", "stop follow", "social", "group"],
    difficulty: "Easy",
  },
] satisfies KeybindPreset[];
