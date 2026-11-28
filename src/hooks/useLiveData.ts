import { useCallback, useEffect, useSyncExternalStore } from 'react';
import type { LiveFeedSnapshot } from '../data/types';

const AUTO_REFRESH_SECONDS = 180;
const GH_CACHE_KEY = 'lvs-live-gh-v1';
const GH_CACHE_TTL_MS = 180_000;

export const INITIAL_LIVE_FEED: LiveFeedSnapshot = {
  syncedAt: '2026-11-26T03:53:37.697Z',
  sources: {
    github: 'snapshot',
    youtube: 'snapshot',
    steam: 'snapshot',
  },
  github: {
    login: 'ShadyFyrix',
    name: 'LucVanSon',
    url: 'https://github.com/ShadyFyrix',
    avatarUrl: '/images/portrait/shadyfyrix-avatar.png',
    publicRepos: 16,
    followers: 0,
    following: 0,
    updatedAt: '2026-11-25T08:37:50Z',
    repos: [
      {
        name: 'K23CNT3-LucVanSon-2310900087-DATN',
        description: 'ExamGuard AI, Zero-Trust Online Exam & Face Proctoring Platform',
        language: 'TypeScript',
        stars: 0,
        forks: 0,
        updatedAt: '2026-11-10T09:52:56Z',
        url: 'https://github.com/ShadyFyrix/K23CNT3-LucVanSon-2310900087-DATN',
      },
      {
        name: 'TTTN-UngDungDeepLearning',
        description: 'University Face Attendance and Monitoring System',
        language: 'Python',
        stars: 0,
        forks: 0,
        updatedAt: '2026-09-07T05:53:11Z',
        url: 'https://github.com/ShadyFyrix/TTTN-UngDungDeepLearning',
      },
      {
        name: 'Ma-at-Zessou',
        description: 'Solo Dev Hybrid Action-Rhythm & Platformer 2D',
        language: 'Game Dev',
        stars: 0,
        forks: 0,
        updatedAt: '2026-06-09T16:58:27Z',
        url: 'https://github.com/ShadyFyrix/Ma-at-Zessou',
      },
      {
        name: 'NGIENCUUKHOAHOC.QLCSVC-AI',
        description: 'Facility Management System with Gemini Vision AI',
        language: 'Python',
        stars: 0,
        forks: 0,
        updatedAt: '2026-03-09T16:17:21Z',
        url: 'https://github.com/ShadyFyrix/NGIENCUUKHOAHOC.QLCSVC-AI',
      },
    ],
  },
  youtube: {
    channelId: 'UCuVY4mCTkFOJye1hIoLr6Jg',
    handle: '@BetterCallShady',
    name: 'ShadyFyrix',
    url: 'https://www.youtube.com/@BetterCallShady',
    subscribers: 752,
    subscribersText: '752',
    videoCount: 104,
    joinedYear: 2019,
    featuredVideo: {
      title: "PULLING MUELSYSE AND HO'OLHEYAK | Arknights",
      views: 8533,
      url: 'https://www.youtube.com/@BetterCallShady',
    },
    videos: [
      {
        videoId: 'VFC8b5MUwGU',
        title: 'Tai nạn ở bình nguyên vô vọng',
        url: 'https://www.youtube.com/watch?v=VFC8b5MUwGU',
        thumbnail: 'https://i3.ytimg.com/vi/VFC8b5MUwGU/hqdefault.jpg',
        publishedAt: '2026-09-06T20:28:49+00:00',
        views: 62,
      },
      {
        videoId: 'YTc1n1audQU',
        title: 'Raul Double Jumpuaaa Sever',
        url: 'https://www.youtube.com/watch?v=YTc1n1audQU',
        thumbnail: 'https://i2.ytimg.com/vi/YTc1n1audQU/hqdefault.jpg',
        publishedAt: '2025-12-06T23:13:13+00:00',
        views: 2433,
      },
      {
        videoId: 'LIeknrWCPWs',
        title: "The weirdest event I've ever played in Wuthering Waves",
        url: 'https://www.youtube.com/watch?v=LIeknrWCPWs',
        thumbnail: 'https://i1.ytimg.com/vi/LIeknrWCPWs/hqdefault.jpg',
        publishedAt: '2025-09-23T18:39:23+00:00',
        views: 115,
      },
      {
        videoId: 'FB5GJ1oj1lY',
        title: 'How my cute little Mon3tr played with my originium',
        url: 'https://www.youtube.com/watch?v=FB5GJ1oj1lY',
        thumbnail: 'https://i3.ytimg.com/vi/FB5GJ1oj1lY/hqdefault.jpg',
        publishedAt: '2025-09-17T05:20:39+00:00',
        views: 1362,
      },
    ],
  },
  steam: {
    profileName: 'ShadyFyrixVN',
    realName: 'Lục Văn Sơn',
    url: 'https://steamcommunity.com/id/BetterCallShady/',
    onlineState: 'Verified profile',
    onlineCode: 0,
    currentGame: null,
    level: 9,
    yearsOfService: 7,
    xp: 968,
    gamesCount: 56,
    badgesCount: 6,
    profileAwards: 8,
    friendsCount: 17,
    recentHours2Weeks: 1.8,
    recentGames: [
      { name: 'The Spike Cross', hoursTotal: 91.7, hours2Weeks: 1.5, lastPlayed: 'Recent' },
      { name: 'OBS Studio', hoursTotal: 18.6, hours2Weeks: 0.2, lastPlayed: 'Recent' },
      { name: 'AnimaEngine', hoursTotal: 0.2, hours2Weeks: 0.2, lastPlayed: 'Recent' },
    ],
  },
  facebook: {
    name: 'Lục Văn Sơn (ShadyFyrix)',
    handle: 'ShadyFyrix00',
    url: 'https://www.facebook.com/ShadyFyrix00',
    friendsCount: 600,
    hometown: 'Hương Bá Thước, Thanh Hóa',
  },
};

async function fetchDirectGithub(force: boolean): Promise<LiveFeedSnapshot['github'] | null> {
  if (!force) {
    try {
      const cachedRaw = window.localStorage.getItem(GH_CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as { ts: number; github: LiveFeedSnapshot['github'] };
        if (Date.now() - cached.ts < GH_CACHE_TTL_MS && cached.github?.repos?.length) {
          return cached.github;
        }
      }
    } catch {
      // Ignore storage read errors.
    }
  }

  try {
    const [uRes, rRes] = await Promise.all([
      fetch('https://api.github.com/users/ShadyFyrix'),
      fetch('https://api.github.com/users/ShadyFyrix/repos?sort=updated&per_page=8'),
    ]);
    if (!uRes.ok || !rRes.ok) return null;
    const user = await uRes.json();
    const repos = await rRes.json();
    if (!Array.isArray(repos)) return null;

    const mapped: LiveFeedSnapshot['github'] = {
      login: user.login || 'ShadyFyrix',
      name: user.name || 'LucVanSon',
      url: user.html_url || 'https://github.com/ShadyFyrix',
      avatarUrl: user.avatar_url || '/images/portrait/shadyfyrix-avatar.png',
      publicRepos: typeof user.public_repos === 'number' ? user.public_repos : 15,
      followers: typeof user.followers === 'number' ? user.followers : 0,
      following: typeof user.following === 'number' ? user.following : 0,
      updatedAt: user.updated_at || new Date().toISOString(),
      repos: repos.slice(0, 8).map((r: Record<string, unknown>) => ({
        name: String(r.name || ''),
        description: String(r.description || ''),
        language: String(r.language || 'Code'),
        stars: Number(r.stargazers_count || 0),
        forks: Number(r.forks_count || 0),
        updatedAt: String(r.updated_at || ''),
        url: String(r.html_url || ''),
      })),
    };

    try {
      window.localStorage.setItem(GH_CACHE_KEY, JSON.stringify({ ts: Date.now(), github: mapped }));
    } catch {
      // Ignore storage write errors.
    }

    return mapped;
  } catch {
    return null;
  }
}

interface LiveStoreState {
  data: LiveFeedSnapshot;
  isSyncing: boolean;
  cycleStartMs: number;
  mode: 'api' | 'hybrid' | 'snapshot';
}

let storeState: LiveStoreState = {
  data: INITIAL_LIVE_FEED,
  isSyncing: false,
  cycleStartMs: Date.now(),
  mode: 'snapshot',
};

let inflight = false;
let initialized = false;
let pollTimer: number | null = null;
const listeners = new Set<() => void>();

function setStoreState(patch: Partial<LiveStoreState>) {
  storeState = { ...storeState, ...patch };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return storeState;
}

async function runSharedSync(force = false) {
  if (inflight) return;
  inflight = true;
  setStoreState({ isSyncing: true });

  try {
    // Tier 2: Edge / Vite live proxy (/api/live-sync)
    const apiUrl = force ? '/api/live-sync?force=1' : '/api/live-sync';
    try {
      const apiRes = await fetch(apiUrl, { cache: 'no-store' });
      const contentType = apiRes.headers.get('content-type') || '';
      if (apiRes.ok && contentType.includes('application/json')) {
        const payload = (await apiRes.json()) as LiveFeedSnapshot;
        if (payload?.github && payload?.youtube && payload?.steam) {
          setStoreState({
            data: payload,
            mode: 'api',
            cycleStartMs: Date.now(),
          });
          return;
        }
      }
    } catch {
      // Fallback to static snapshot + direct CORS GitHub API.
    }

    // Tier 3 + Tier 1: static /live-data.json + browser-side live GitHub API
    let nextData: LiveFeedSnapshot = INITIAL_LIVE_FEED;
    try {
      const snapRes = await fetch('/live-data.json', { cache: 'no-store' });
      if (snapRes.ok) {
        const snapJson = (await snapRes.json()) as LiveFeedSnapshot;
        if (snapJson?.github && snapJson?.youtube) {
          nextData = snapJson;
        }
      }
    } catch {
      // Keep initial constant fallback.
    }

    const liveGh = await fetchDirectGithub(force);
    if (liveGh) {
      nextData = {
        ...nextData,
        syncedAt: new Date().toISOString(),
        sources: { ...nextData.sources, github: 'live' },
        github: liveGh,
      };
      setStoreState({
        data: nextData,
        mode: 'hybrid',
        cycleStartMs: Date.now(),
      });
    } else {
      setStoreState({
        data: nextData,
        mode: 'snapshot',
        cycleStartMs: Date.now(),
      });
    }
  } finally {
    inflight = false;
    setStoreState({ isSyncing: false });
  }
}

export function useLiveData() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!initialized) {
      initialized = true;
      void runSharedSync(false);
    }
    if (pollTimer === null) {
      pollTimer = window.setInterval(() => {
        if (!document.hidden && listeners.size > 0) {
          void runSharedSync(true);
        }
      }, AUTO_REFRESH_SECONDS * 1000);
    }
  }, []);

  const refreshNow = useCallback(() => {
    void runSharedSync(true);
  }, []);

  return {
    data: snap.data,
    isSyncing: snap.isSyncing,
    lastSyncedAt: snap.data.syncedAt,
    cycleStartMs: snap.cycleStartMs,
    cycleSeconds: AUTO_REFRESH_SECONDS,
    mode: snap.mode,
    refreshNow,
  };
}
