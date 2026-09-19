export const LATEST_IMPORTANT_GAME_UPDATE = {
  date: "2026-09-17",
  label: "September 17, 2026 live patch",
  sourceUrl: "https://www.playneverwinter.com/en/news-details/11557773",
};

export function verificationNeedsGameUpdateReview(verifiedAt, update = LATEST_IMPORTANT_GAME_UPDATE) {
  const value = String(verifiedAt ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return true;
  return value < update.date;
}
