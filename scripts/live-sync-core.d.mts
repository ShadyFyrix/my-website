export const BASELINE_LIVE_FEED: Record<string, unknown>;
export function collectLiveFeed(
  existingFallback?: Record<string, unknown>,
  env?: Record<string, string | undefined>
): Promise<Record<string, unknown>>;
