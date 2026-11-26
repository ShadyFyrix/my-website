import { BASELINE_LIVE_FEED, collectLiveFeed } from '../../scripts/live-sync-core.mjs';

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const force = url.searchParams.get('force') === '1';
  const payload = await collectLiveFeed(BASELINE_LIVE_FEED, context.env);

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': force ? 'no-store' : 'public, max-age=120, stale-while-revalidate=300',
    },
  });
}
