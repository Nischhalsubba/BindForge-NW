export const LATEST_IMPORTANT_GAME_UPDATE: { date: string; label: string; sourceUrl: string };
export function verificationNeedsGameUpdateReview(verifiedAt?: string | null, update?: { date: string }): boolean;
