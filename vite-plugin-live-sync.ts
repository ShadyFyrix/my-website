import type { Plugin, ViteDevServer, PreviewServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadLocalEnv } from './scripts/load-env.mjs';
import { BASELINE_LIVE_FEED, collectLiveFeed } from './scripts/live-sync-core.mjs';

const CACHE_TTL_MS = 120_000;

interface CachedEntry {
  timestamp: number;
  payload: unknown;
}

function readSnapshotFallback() {
  const file = resolve(process.cwd(), 'public/live-data.json');
  if (existsSync(file)) {
    try {
      return JSON.parse(readFileSync(file, 'utf8'));
    } catch {
      return BASELINE_LIVE_FEED;
    }
  }
  return BASELINE_LIVE_FEED;
}

function attachLiveEndpoint(middlewares: ViteDevServer['middlewares'] | PreviewServer['middlewares']) {
  loadLocalEnv();
  let cache: CachedEntry | null = null;
  let inflight: Promise<unknown> | null = null;

  middlewares.use(
    '/api/live-sync',
    async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      if (req.method !== 'GET') {
        next();
        return;
      }

      const urlObj = new URL(req.url || '/', 'http://127.0.0.1');
      const force = urlObj.searchParams.get('force') === '1';
      const now = Date.now();

      if (!force && cache && now - cache.timestamp < CACHE_TTL_MS) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify(cache.payload));
        return;
      }

      try {
        if (!inflight || force) {
          const fallback = readSnapshotFallback();
          inflight = collectLiveFeed(fallback, process.env);
        }
        const payload = await inflight;
        cache = { timestamp: Date.now(), payload };
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify(payload));
      } catch {
        const fallback = readSnapshotFallback();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify(fallback));
      } finally {
        inflight = null;
      }
    }
  );
}

export function liveSyncPlugin(): Plugin {
  return {
    name: 'live-sync-api',
    configureServer(server) {
      attachLiveEndpoint(server.middlewares);
    },
    configurePreviewServer(server) {
      attachLiveEndpoint(server.middlewares);
    },
  };
}
