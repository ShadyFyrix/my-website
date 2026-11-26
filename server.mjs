import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { loadLocalEnv } from './scripts/load-env.mjs';
import { BASELINE_LIVE_FEED, collectLiveFeed } from './scripts/live-sync-core.mjs';

loadLocalEnv();

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = resolve(process.cwd(), 'dist');
const CACHE_TTL_MS = 120_000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

let cache = null;
let inflight = null;

function readFallbackSnapshot() {
  const file = join(DIST_DIR, 'live-data.json');
  if (existsSync(file)) {
    try {
      return JSON.parse(readFileSync(file, 'utf8'));
    } catch {
      return BASELINE_LIVE_FEED;
    }
  }
  return BASELINE_LIVE_FEED;
}

const server = createServer(async (req, res) => {
  const reqUrl = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);

  if (reqUrl.pathname === '/api/live-sync' && req.method === 'GET') {
    const force = reqUrl.searchParams.get('force') === '1';
    const now = Date.now();
    if (!force && cache && now - cache.ts < CACHE_TTL_MS) {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(JSON.stringify(cache.payload));
      return;
    }

    try {
      if (!inflight || force) {
        inflight = collectLiveFeed(readFallbackSnapshot(), process.env);
      }
      const payload = await inflight;
      cache = { ts: Date.now(), payload };
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(JSON.stringify(payload));
    } catch {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(JSON.stringify(readFallbackSnapshot()));
    } finally {
      inflight = null;
    }
    return;
  }

  // Serve static files from dist/ with path-traversal protection
  const cleanPath = normalize(decodeURIComponent(reqUrl.pathname)).replace(/^(\.\.[/\\])+/, '');
  let filePath = join(DIST_DIR, cleanPath === '/' ? 'index.html' : cleanPath);

  if (!filePath.startsWith(DIST_DIR) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(DIST_DIR, 'index.html');
  }

  if (!existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('dist/ not found. Run npm run build first.');
    return;
  }

  const ext = extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
  });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
