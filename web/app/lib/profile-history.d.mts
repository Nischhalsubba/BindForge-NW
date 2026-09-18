export type ProfileHistoryBind = Record<string, unknown>;
export type ProfileHistorySource = {
  keyValues?: Record<string, string>;
  personalBinds?: ProfileHistoryBind[];
  personalSourceName?: string;
  personalImportedAt?: string;
};
export type ProfileHistorySnapshot = {
  id: string; createdAt: string; reason: string; keyValues: Record<string,string>;
  personalBinds: ProfileHistoryBind[]; personalSourceName: string; personalImportedAt: string;
};
export function makeProfileSnapshot(profile?: ProfileHistorySource, reason?: string, createdAt?: string): ProfileHistorySnapshot;
export function pushProfileSnapshot(history?: ProfileHistorySnapshot[], snapshot?: ProfileHistorySnapshot | null, limit?: number): ProfileHistorySnapshot[];
export function restoreSnapshotProfile<T extends ProfileHistorySource>(profile: T, snapshot?: Partial<ProfileHistorySnapshot>): T;
