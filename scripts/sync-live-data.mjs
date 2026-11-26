import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { loadLocalEnv } from './load-env.mjs';
import { BASELINE_LIVE_FEED, collectLiveFeed } from './live-sync-core.mjs';

loadLocalEnv();

const OUT_PATH = resolve(process.cwd(), 'public/live-data.json');

let fallback = BASELINE_LIVE_FEED;
if (existsSync(OUT_PATH)) {
  try {
    const existing = JSON.parse(readFileSync(OUT_PATH, 'utf8'));
    if (existing && existing.github && existing.youtube && existing.steam) {
      fallback = { ...BASELINE_LIVE_FEED, ...existing };
    }
  } catch {
    // Keep baseline fallback if existing file cannot be parsed.
  }
}

const snapshot = await collectLiveFeed(fallback, process.env);
mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');

console.log(
  `Synced live-data.json at ${snapshot.syncedAt} | github=${snapshot.sources.github} (${snapshot.github.publicRepos} repos) | youtube=${snapshot.sources.youtube} (${snapshot.youtube.subscribers} subs, ${snapshot.youtube.videos.length} videos) | steam=${snapshot.sources.steam} (Lv.${snapshot.steam.level}, ${snapshot.steam.gamesCount} games, ${snapshot.steam.onlineState})`
);
