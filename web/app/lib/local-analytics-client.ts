import { appendAnalyticsEvent, sanitizeAnalyticsEvent, type AnalyticsEvent } from "./privacy-analytics.mjs";

export const ANALYTICS_STORAGE_KEY = "bindforge-nw:analytics:v1";

export function readLocalAnalyticsEvents(): AnalyticsEvent[] {
  try {
    const raw = window.localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.flatMap((entry) => {
      const event = sanitizeAnalyticsEvent(entry);
      return event ? [event] : [];
    }) : [];
  } catch {
    return [];
  }
}

export function recordLocalAnalyticsEvent(input: unknown) {
  if (typeof window === "undefined") return;
  try {
    const next = appendAnalyticsEvent(readLocalAnalyticsEvents(), input, 200);
    window.localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("bindforge:analytics"));
  } catch {
    // Analytics is optional and must never block the user's workflow.
  }
}

export function clearLocalAnalyticsEvents() {
  try {
    window.localStorage.removeItem(ANALYTICS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("bindforge:analytics"));
  } catch {
    // Local storage may be unavailable.
  }
}
