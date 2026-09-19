import { LATEST_IMPORTANT_GAME_UPDATE, verificationNeedsGameUpdateReview } from "./game-version.mjs";
import { latestVerificationForPreset } from "./verification-history.mjs";

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? "")) ? String(value) : null;
}

export function catalogFreshnessSummary(presets = [], now = new Date(), staleDays = 180) {
  const rows = Array.isArray(presets) ? presets : [];
  const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const maxAgeMs = Math.max(1, Number(staleDays) || 180) * 24 * 60 * 60 * 1000;
  let recent = 0;
  let stale = 0;
  let undated = 0;
  let needsGameUpdateReview = 0;
  const dates = [];

  for (const preset of rows) {
    const latest = latestVerificationForPreset(preset);
    const date = validDate(latest?.date ?? preset?.verifiedAt);
    if (!date) {
      undated += 1;
      needsGameUpdateReview += 1;
      continue;
    }
    dates.push(date);
    if (verificationNeedsGameUpdateReview(date)) needsGameUpdateReview += 1;
    const age = nowMs - new Date(`${date}T00:00:00Z`).getTime();
    if (Number.isFinite(age) && age >= 0 && age <= maxAgeMs) recent += 1;
    else stale += 1;
  }

  const total = rows.length;
  const dated = recent + stale;
  return {
    total,
    dated,
    recent,
    stale,
    undated,
    needReview: stale + undated,
    datedPercent: total ? Math.round((dated / total) * 100) : 0,
    recentPercent: total ? Math.round((recent / total) * 100) : 0,
    newestDate: dates.sort().at(-1) ?? null,
    needsGameUpdateReview,
    latestImportantUpdate: { ...LATEST_IMPORTANT_GAME_UPDATE },
  };
}
