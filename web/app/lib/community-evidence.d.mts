import type { KeybindPreset } from "../data/keybindTypes";
export type CommunityOutcome = "works" | "does-not-work" | "needs-update";
export function buildCommunityReport(input: {
  preset: Partial<KeybindPreset> & { id: string; title: string };
  outcome: CommunityOutcome;
  gameVersion?: string;
  className?: string;
  paragon?: string;
  note?: string;
  reportedAt?: string;
}): Record<string, unknown> | null;
export function buildCommunityPack(input: {
  name: string;
  gameVersion?: string;
  presetIds: string[];
  source?: string;
  createdAt?: string;
}): Record<string, unknown> | null;
export function canPromoteCommunityEvidence(report: unknown): false;
