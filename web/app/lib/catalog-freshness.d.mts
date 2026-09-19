import type { VerificationHistoryRecord } from "../data/keybindTypes";

export type FreshnessPreset = {
  verifiedAt?: string;
  verificationHistory?: VerificationHistoryRecord[];
  gameVersion?: string;
  sourceUrl?: string;
};

export type CatalogFreshnessSummary = {
  total: number;
  dated: number;
  recent: number;
  stale: number;
  undated: number;
  needReview: number;
  datedPercent: number;
  recentPercent: number;
  newestDate: string | null;
  needsGameUpdateReview: number;
  latestImportantUpdate: { date: string; label: string; sourceUrl: string };
};

export function catalogFreshnessSummary(
  presets?: FreshnessPreset[],
  now?: Date | string | number,
  staleDays?: number,
): CatalogFreshnessSummary;
