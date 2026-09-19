export const ANALYTICS_EVENTS = [
  "search_performed",
  "zero_result_search",
  "preset_copied",
  "preset_selected",
  "profile_switched",
  "import_previewed",
  "import_confirmed",
  "workflow_error",
];

const ALLOWED = new Set(ANALYTICS_EVENTS);
const ALLOWED_CONTEXT = new Set(["route", "className", "actionType", "presetType", "outcome"]);

export function sanitizeAnalyticsEvent(input = {}) {
  const name = String(input?.name ?? "");
  if (!ALLOWED.has(name)) return null;
  const context = {};
  for (const [key, value] of Object.entries(input?.context ?? {})) {
    if (!ALLOWED_CONTEXT.has(key) || typeof value !== "string") continue;
    const clean = value.trim().slice(0, 80);
    if (clean) context[key] = clean;
  }
  return {
    name,
    context,
    occurredAt: typeof input?.occurredAt === "string" && input.occurredAt ? input.occurredAt : new Date().toISOString(),
  };
}

export function appendAnalyticsEvent(current = [], input, limit = 200) {
  const event = sanitizeAnalyticsEvent(input);
  const list = Array.isArray(current) ? current.filter((entry) => sanitizeAnalyticsEvent(entry)) : [];
  if (!event) return list.slice(-limit);
  return [...list, event].slice(-Math.max(1, limit));
}

export function summarizeAnalyticsEvents(events = []) {
  const summary = {
    total: 0,
    byName: {},
    byRoute: {},
    byClassName: {},
    byActionType: {},
    byPresetType: {},
    importPreviewReady: 0,
    importConfirmed: 0,
    importDropoff: 0,
  };
  for (const raw of Array.isArray(events) ? events : []) {
    const event = sanitizeAnalyticsEvent(raw);
    if (!event) continue;
    summary.total += 1;
    summary.byName[event.name] = (summary.byName[event.name] ?? 0) + 1;

    const dimensions = [
      ["byRoute", event.context.route],
      ["byClassName", event.context.className],
      ["byActionType", event.context.actionType],
      ["byPresetType", event.context.presetType],
    ];
    for (const [bucket, value] of dimensions) {
      if (value) summary[bucket][value] = (summary[bucket][value] ?? 0) + 1;
    }

    if (event.name === "import_previewed" && event.context.outcome === "ready") summary.importPreviewReady += 1;
    if (event.name === "import_confirmed") summary.importConfirmed += 1;
  }
  summary.importDropoff = Math.max(0, summary.importPreviewReady - summary.importConfirmed);
  return summary;
}
