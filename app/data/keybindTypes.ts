export type KeybindType =
  | "VIP Services"
  | "Invocation / Character"
  | "Targeting"
  | "Bard Songs"
  | "Combat"
  | "Animation Cancel"
  | "Utility"
  | "Inventory / Buffs"
  | "Companion"
  | "Loot / Interact"
  | "Camera / Screenshot"
  | "Risky / Testing"
  | "Social";

export type KeybindClass = "Any Class" | "Bard" | "Paladin" | "Ranger" | "Fighter / Cleric";
export type PresetSourceType = "official" | "wiki" | "community" | "user-submitted";
export type PresetConfidence = "verified" | "community-tested" | "experimental";

export type KeybindPreset = {
  id: string;
  type: KeybindType;
  className: KeybindClass;
  title: string;
  plainEnglish: string;
  defaultKey: string;
  command: string;
  searchTerms: string[];
  difficulty: "Easy" | "Advanced" | "Risky";
  preserveDefaultKey?: boolean;
  intentionalNativeOverride?: boolean;
  sourceType?: PresetSourceType;
  sourceUrl?: string;
  verifiedAt?: string;
  gameVersion?: string;
  confidence?: PresetConfidence;
  notes?: string;
};
