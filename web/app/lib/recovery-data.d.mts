export const RECOVERY_STORAGE_KEY: string;
export type RecoveryRecord = { id: string; storageKey: string; raw: string; reason: string; createdAt: string };
export function makeRecoveryRecord(storageKey: string, raw: string, reason: string, createdAt?: string): RecoveryRecord;
export function parseRecoveryRecords(raw?: string | null): RecoveryRecord[];
export function appendRecoveryRecord(records?: RecoveryRecord[], record?: RecoveryRecord | null, limit?: number): RecoveryRecord[];
