import { BASELINE_LIVE_FEED, collectLiveFeed } from '../scripts/live-sync-core.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const force = req.query?.force === '1';
  const payload = await collectLiveFeed(BASELINE_LIVE_FEED, process.env);

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    force ? 'no-store' : 'public, s-maxage=120, stale-while-revalidate=300'
  );
  res.status(200).json(payload);
}
