export type KeymapBind = { key?: string; command?: string; mode?: string; raw?: string; lineNumber?: number };
export type KeyAssignment = { presetId?: string; title?: string; key?: string; command?: string };
export function recommendUnusedKeys(options?: { hasImportedEvidence?: boolean; personalBinds?: KeymapBind[]; currentAssignments?: KeyAssignment[]; candidates?: string[]; limit?: number }): string[];
export function buildChangePreview(options?: { presetId?: string; title?: string; currentKey?: string; proposedKey?: string; proposedCommand?: string; personalBinds?: KeymapBind[]; currentAssignments?: KeyAssignment[] }): {
  presetId: string; title: string; currentKey: string; proposedKey: string; proposedCommand: string;
  overwrittenImportedCommand: string | null; currentImportedCommand: string | null;
  conflicts: Array<{ presetId: string; title: string; command: string }>;
  rollback: { key: string; command: string | null; source: "imported" | "none" };
};
export function compareProfiles(left?: { id?: string; name?: string; keyValues?: Record<string,string>; personalBinds?: KeymapBind[] }, right?: { id?: string; name?: string; keyValues?: Record<string,string>; personalBinds?: KeymapBind[] }): {
  left: { id: string; name: string }; right: { id: string; name: string };
  keyChanges: Array<{ presetId: string; left: string; right: string }>;
  importedChanges: Array<{ key: string; left: string | null; right: string | null }>;
  changeCount: number;
};
export function analyzeRawKeymap(value?: string): {
  entries: Array<{ mode: string; key: string; command: string; raw: string; lineNumber: number }>;
  activeBinds: Array<{ mode: "bind"; key: string; command: string; raw: string; lineNumber: number }>;
  overwrites: Array<{ key: string; previous: KeymapBind; next: KeymapBind }>;
  orphanUnbinds: KeymapBind[];
  ignored: Array<{ lineNumber: number; raw: string }>;
  hasBlockingErrors: boolean;
};
