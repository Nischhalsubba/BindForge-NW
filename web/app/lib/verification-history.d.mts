import type { KeybindPreset, VerificationHistoryRecord } from "../data/keybindTypes";

export function verificationHistoryForPreset(preset?: Partial<KeybindPreset>): VerificationHistoryRecord[];
export function latestVerificationForPreset(preset?: Partial<KeybindPreset>): VerificationHistoryRecord | null;
