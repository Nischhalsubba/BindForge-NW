export type RecentAssignmentChange = {
  presetId: string;
  from: string;
  to: string;
  changedAt: string;
};
export function appendRecentPreset(current: unknown, presetId: string, limit?: number): string[];
export function appendRecentChange(current: unknown, change: Partial<RecentAssignmentChange>, limit?: number): RecentAssignmentChange[];
