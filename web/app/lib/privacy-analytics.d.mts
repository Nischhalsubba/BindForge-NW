export type AnalyticsEventName =
  | "search_performed"
  | "zero_result_search"
  | "preset_copied"
  | "preset_selected"
  | "profile_switched"
  | "import_previewed"
  | "import_confirmed"
  | "workflow_error";

export type AnalyticsContext = {
  route?: string;
  className?: string;
  actionType?: string;
  presetType?: string;
  outcome?: string;
};

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  context: AnalyticsContext;
  occurredAt: string;
};

export const ANALYTICS_EVENTS: readonly AnalyticsEventName[];
export function sanitizeAnalyticsEvent(input?: unknown): AnalyticsEvent | null;
export function appendAnalyticsEvent(current: unknown, input: unknown, limit?: number): AnalyticsEvent[];
export function summarizeAnalyticsEvents(events?: unknown): {
  total: number;
  byName: Record<string, number>;
  byRoute: Record<string, number>;
  byClassName: Record<string, number>;
  byActionType: Record<string, number>;
  byPresetType: Record<string, number>;
  importPreviewReady: number;
  importConfirmed: number;
  importDropoff: number;
};
