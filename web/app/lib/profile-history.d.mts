export type ProfileHistorySnapshot = {
  id: string; createdAt: string; reason: string; keyValues: Record<string,string>;
  personalBinds: Array<Record<string, unknown>>; personalSourceName: string; personalImportedAt: string;
};
export function makeProfileSnapshot(profile?: Record<string, any>, reason?: string, createdAt?: string): ProfileHistorySnapshot;
export function pushProfileSnapshot(history?: ProfileHistorySnapshot[], snapshot?: ProfileHistorySnapshot | null, limit?: number): ProfileHistorySnapshot[];
export function restoreSnapshotProfile<T extends Record<string, any>>(profile?: T, snapshot?: Partial<ProfileHistorySnapshot>): T;
