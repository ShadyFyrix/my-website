import { BASELINE_LIVE_FEED, collectLiveFeed } from './scripts/live-sync-core.mjs';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/live-sync') {
      if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      }

      const force = url.searchParams.get('force') === '1';
      const payload = await collectLiveFeed(BASELINE_LIVE_FEED, env);

      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': force
            ? 'no-store'
            : 'public, max-age=120, stale-while-revalidate=300',
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
