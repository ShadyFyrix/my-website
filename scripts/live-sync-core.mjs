export const BASELINE_LIVE_FEED = {
  syncedAt: new Date().toISOString(),
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
    publicRepos: 15,
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

const STEAM_PERSONA_STATES = [
  'Offline',
  'Online',
  'Busy',
  'Away',
  'Snooze',
  'Looking to trade',
  'Looking to play',
];

async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function decodeXmlEntities(text = '') {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseCompactCount(str) {
  if (!str) return null;
  const clean = str.trim().replace(/,/g, '');
  const mult = clean.endsWith('K') ? 1000 : clean.endsWith('M') ? 1000000 : 1;
  const num = parseFloat(clean.replace(/[KM]$/i, ''));
  return Number.isFinite(num) ? Math.round(num * mult) : null;
}

async function fetchGithubLive(githubToken = '') {
  const headers = {
    'User-Agent': 'LucVanSon-Personal-Website',
    Accept: 'application/vnd.github+json',
  };
  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }

  const [userRes, reposRes] = await Promise.all([
    fetchWithTimeout('https://api.github.com/users/ShadyFyrix', { headers }, 5500),
    fetchWithTimeout(
      'https://api.github.com/users/ShadyFyrix/repos?sort=updated&per_page=8',
      { headers },
      5500
    ),
  ]);
  if (!userRes.ok || !reposRes.ok) {
    throw new Error(`GitHub status ${userRes.status}/${reposRes.status}`);
  }
  const user = await userRes.json();
  const repos = await reposRes.json();
  if (!user || !Array.isArray(repos)) {
    throw new Error('Unexpected GitHub payload');
  }

  return {
    login: user.login || 'ShadyFyrix',
    name: user.name || 'LucVanSon',
    url: user.html_url || 'https://github.com/ShadyFyrix',
    avatarUrl: user.avatar_url || BASELINE_LIVE_FEED.github.avatarUrl,
    publicRepos: typeof user.public_repos === 'number' ? user.public_repos : 15,
    followers: typeof user.followers === 'number' ? user.followers : 0,
    following: typeof user.following === 'number' ? user.following : 0,
    updatedAt: user.updated_at || new Date().toISOString(),
    repos: repos.slice(0, 8).map((r) => ({
      name: r.name,
      description: r.description || '',
      language: r.language || 'Code',
      stars: r.stargazers_count ?? 0,
      forks: r.forks_count ?? 0,
      updatedAt: r.updated_at,
      url: r.html_url,
    })),
  };
}

async function fetchYoutubeLive() {
  const channelId = BASELINE_LIVE_FEED.youtube.channelId;
  const [rssRes, pageRes] = await Promise.allSettled([
    fetchWithTimeout(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
      5500
    ),
    fetchWithTimeout(
      'https://www.youtube.com/@BetterCallShady',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
      5500
    ),
  ]);

  let videos = BASELINE_LIVE_FEED.youtube.videos;
  let rssOk = false;

  if (rssRes.status === 'fulfilled' && rssRes.value.ok) {
    const xml = await rssRes.value.text();
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, 6);
    const parsed = entries
      .map((match) => {
        const block = match[1];
        const videoId = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]?.trim();
        const title = decodeXmlEntities(
          block.match(/<title>([^<]+)<\/title>/)?.[1]?.trim() || ''
        );
        const publishedAt = block.match(/<published>([^<]+)<\/published>/)?.[1]?.trim() || '';
        const viewsStr = block.match(/<media:statistics[^>]+views="(\d+)"/)?.[1];
        const thumb = block.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1];
        if (!videoId || !title) return null;
        return {
          videoId,
          title,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnail: thumb || `https://i3.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          publishedAt,
          views: viewsStr ? Number(viewsStr) : 0,
        };
      })
      .filter(Boolean);

    if (parsed.length > 0) {
      videos = parsed;
      rssOk = true;
    }
  }

  let subscribers = BASELINE_LIVE_FEED.youtube.subscribers;
  let subscribersText = BASELINE_LIVE_FEED.youtube.subscribersText;
  let videoCount = BASELINE_LIVE_FEED.youtube.videoCount;
  let pageOk = false;

  if (pageRes.status === 'fulfilled' && pageRes.value.ok) {
    const html = await pageRes.value.text();
    const subMatch = html.match(/"(\d[\d.,]*[KM]?)\s+subscribers"/);
    const vidMatch = html.match(/"(\d[\d.,]*)\s+videos"/);
    if (subMatch?.[1]) {
      const parsedSub = parseCompactCount(subMatch[1]);
      if (parsedSub !== null) {
        subscribers = parsedSub;
        subscribersText = subMatch[1];
        pageOk = true;
      }
    }
    if (vidMatch?.[1]) {
      const parsedVid = parseCompactCount(vidMatch[1]);
      if (parsedVid !== null) {
        videoCount = parsedVid;
        pageOk = true;
      }
    }
  }

  if (!rssOk && !pageOk) {
    throw new Error('YouTube feeds unavailable');
  }

  return {
    ...BASELINE_LIVE_FEED.youtube,
    subscribers,
    subscribersText,
    videoCount,
    videos,
  };
}

async function fetchSteamJson(endpoint, params) {
  const query = new URLSearchParams(params).toString();
  const res = await fetchWithTimeout(
    `https://api.steampowered.com/${endpoint}?${query}`,
    { headers: { 'User-Agent': 'LucVanSon-Portfolio' } },
    5000
  );
  if (!res.ok) {
    throw new Error(`Steam API ${endpoint} HTTP ${res.status}`);
  }
  return res.json();
}

async function fetchSteamLive(steamApiKey = '', steamId64 = '76561198904940621') {
  if (steamApiKey) {
    const [sumRes, lvlRes, ownedRes, recentRes, badgesRes, friendsRes] = await Promise.allSettled([
      fetchSteamJson('ISteamUser/GetPlayerSummaries/v0002/', {
        key: steamApiKey,
        steamids: steamId64,
      }),
      fetchSteamJson('IPlayerService/GetSteamLevel/v1/', {
        key: steamApiKey,
        steamid: steamId64,
      }),
      fetchSteamJson('IPlayerService/GetOwnedGames/v0001/', {
        key: steamApiKey,
        steamid: steamId64,
        include_appinfo: '1',
        include_played_free_games: '1',
      }),
      fetchSteamJson('IPlayerService/GetRecentlyPlayedGames/v0001/', {
        key: steamApiKey,
        steamid: steamId64,
      }),
      fetchSteamJson('IPlayerService/GetBadges/v1/', {
        key: steamApiKey,
        steamid: steamId64,
      }),
      fetchSteamJson('ISteamUser/GetFriendList/v0001/', {
        key: steamApiKey,
        steamid: steamId64,
        relationship: 'friend',
      }),
    ]);

    const player =
      sumRes.status === 'fulfilled' ? sumRes.value?.response?.players?.[0] : null;
    const level =
      lvlRes.status === 'fulfilled' && typeof lvlRes.value?.response?.player_level === 'number'
        ? lvlRes.value.response.player_level
        : BASELINE_LIVE_FEED.steam.level;
    const gamesCount =
      ownedRes.status === 'fulfilled' && typeof ownedRes.value?.response?.game_count === 'number'
        ? ownedRes.value.response.game_count
        : BASELINE_LIVE_FEED.steam.gamesCount;
    const recentList =
      recentRes.status === 'fulfilled' && Array.isArray(recentRes.value?.response?.games)
        ? recentRes.value.response.games
        : null;
    const badgesPayload = badgesRes.status === 'fulfilled' ? badgesRes.value?.response : null;
    const friendsList =
      friendsRes.status === 'fulfilled' && Array.isArray(friendsRes.value?.friendslist?.friends)
        ? friendsRes.value.friendslist.friends
        : null;

    if (!player && typeof gamesCount !== 'number') {
      throw new Error('Steam Web API returned no data');
    }

    const onlineCode = typeof player?.personastate === 'number' ? player.personastate : 0;
    const currentGame = player?.gameextrainfo || null;
    const onlineState = currentGame
      ? `Playing ${currentGame}`
      : STEAM_PERSONA_STATES[onlineCode] || 'Offline';

    const yearsOfService =
      typeof player?.timecreated === 'number'
        ? Math.max(1, Math.floor((Date.now() / 1000 - player.timecreated) / 31556952))
        : BASELINE_LIVE_FEED.steam.yearsOfService;

    const recentGames =
      recentList && recentList.length > 0
        ? recentList.slice(0, 4).map((g) => ({
            name: g.name,
            hoursTotal: Number(((g.playtime_forever || 0) / 60).toFixed(1)),
            hours2Weeks: Number(((g.playtime_2weeks || 0) / 60).toFixed(1)),
            lastPlayed: 'Recent',
          }))
        : BASELINE_LIVE_FEED.steam.recentGames;

    const recentHours2Weeks = recentList
      ? Number(
          recentList
            .reduce((acc, g) => acc + (g.playtime_2weeks || 0) / 60, 0)
            .toFixed(1)
        )
      : BASELINE_LIVE_FEED.steam.recentHours2Weeks;

    return {
      ...BASELINE_LIVE_FEED.steam,
      profileName: player?.personaname || BASELINE_LIVE_FEED.steam.profileName,
      url: player?.profileurl || BASELINE_LIVE_FEED.steam.url,
      onlineState,
      onlineCode,
      currentGame,
      level,
      yearsOfService,
      xp:
        typeof badgesPayload?.player_xp === 'number'
          ? badgesPayload.player_xp
          : BASELINE_LIVE_FEED.steam.xp,
      gamesCount,
      badgesCount: Array.isArray(badgesPayload?.badges)
        ? badgesPayload.badges.length
        : BASELINE_LIVE_FEED.steam.badgesCount,
      friendsCount: friendsList ? friendsList.length : BASELINE_LIVE_FEED.steam.friendsCount,
      recentHours2Weeks,
      recentGames,
    };
  }

  // Fallback to Steam Community XML when no API key is configured
  const res = await fetchWithTimeout(
    'https://steamcommunity.com/id/BetterCallShady/?xml=1',
    { headers: { 'User-Agent': 'Mozilla/5.0' } },
    3500
  );
  if (!res.ok) {
    throw new Error(`Steam XML status ${res.status}`);
  }
  const xml = await res.text();
  if (!xml.includes('<profile>')) {
    throw new Error('Unexpected Steam XML');
  }

  const steamID = decodeXmlEntities(
    xml.match(/<steamID><!\[CDATA\[([\s\S]*?)\]\]><\/steamID>/)?.[1] ||
      BASELINE_LIVE_FEED.steam.profileName
  );
  const onlineState =
    xml.match(/<onlineState>([^<]+)<\/onlineState>/)?.[1] ||
    BASELINE_LIVE_FEED.steam.onlineState;
  const hoursMatch = xml.match(/<hoursPlayed2Wk>([\d.]+)<\/hoursPlayed2Wk>/)?.[1];
  const hours2Weeks = hoursMatch ? Number(hoursMatch) : BASELINE_LIVE_FEED.steam.recentHours2Weeks;

  const gameMatches = [...xml.matchAll(/<mostPlayedGame>([\s\S]*?)<\/mostPlayedGame>/g)].slice(0, 4);
  const parsedGames = gameMatches
    .map((m) => {
      const block = m[1];
      const name = decodeXmlEntities(
        block.match(/<gameName><!\[CDATA\[([\s\S]*?)\]\]><\/gameName>/)?.[1] || ''
      );
      const hoursOnRecord = Number(block.match(/<hoursOnRecord>([\d.]+)<\/hoursOnRecord>/)?.[1] || 0);
      if (!name) return null;
      return { name, hoursTotal: hoursOnRecord, lastPlayed: 'Recent' };
    })
    .filter(Boolean);

  return {
    ...BASELINE_LIVE_FEED.steam,
    profileName: steamID,
    onlineState,
    recentHours2Weeks: Number.isFinite(hours2Weeks)
      ? hours2Weeks
      : BASELINE_LIVE_FEED.steam.recentHours2Weeks,
    recentGames: parsedGames.length > 0 ? parsedGames : BASELINE_LIVE_FEED.steam.recentGames,
  };
}

export async function collectLiveFeed(existingFallback = BASELINE_LIVE_FEED, env = {}) {
  const [ghResult, ytResult, steamResult] = await Promise.allSettled([
    fetchGithubLive(env.GITHUB_TOKEN || ''),
    fetchYoutubeLive(),
    fetchSteamLive(env.STEAM_API_KEY || '', env.STEAM_ID64 || '76561198904940621'),
  ]);

  const sources = {
    github: ghResult.status === 'fulfilled' ? 'live' : 'snapshot',
    youtube: ytResult.status === 'fulfilled' ? 'live' : 'snapshot',
    steam: steamResult.status === 'fulfilled' ? 'live' : 'snapshot',
  };

  return {
    syncedAt: new Date().toISOString(),
    sources,
    github: ghResult.status === 'fulfilled' ? ghResult.value : existingFallback.github,
    youtube: ytResult.status === 'fulfilled' ? ytResult.value : existingFallback.youtube,
    steam: steamResult.status === 'fulfilled' ? steamResult.value : existingFallback.steam,
    facebook: existingFallback.facebook,
  };
}
