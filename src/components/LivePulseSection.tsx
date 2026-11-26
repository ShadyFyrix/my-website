import { useState } from 'react';
import {
  ArrowUpRight,
  Code2,
  Gamepad2,
  Pause,
  Play,
  RefreshCw,
  Video,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { LiveFeedSnapshot } from '../data/types';
import {
  AnimatedCounter,
  AnimatedRule,
  RevealBlock,
  TiltPlate,
} from './MotionPrimitives';

interface LivePulseSectionProps {
  data: LiveFeedSnapshot;
  isSyncing: boolean;
  nextSyncIn: number;
  mode: 'api' | 'hybrid' | 'snapshot';
  onRefresh: () => void;
}

function formatTime(iso: string, locale: 'vi' | 'en'): string {
  try {
    return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatDateShort(iso: string, locale: 'vi' | 'en'): string {
  try {
    return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function formatCountdown(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function LivePulseSection({
  data,
  isSyncing,
  nextSyncIn,
  mode,
  onRefresh,
}: LivePulseSectionProps) {
  const { locale } = useLanguage();
  const [marqueePaused, setMarqueePaused] = useState(false);

  const marqueeItems = [
    ...data.github.repos.slice(0, 3).map((repo) => `GitHub: ${repo.name} (${repo.language})`),
    ...data.youtube.videos.slice(0, 3).map((vid) => `YouTube: ${vid.title}`),
    ...data.steam.recentGames.map((g) => `Steam: ${g.name} (${g.hoursTotal}h)`),
  ];

  const sourceBadge = (state: 'live' | 'snapshot', label: string) => (
    <span className={`source-chip ${state === 'live' ? 'source-chip--live' : ''}`}>
      <span className="source-chip__dot" aria-hidden="true" />
      <span>
        {label}: {state === 'live' ? 'Live' : 'Synced'}
      </span>
    </span>
  );

  return (
    <section
      className="section section--cast"
      id="live"
      aria-labelledby="live-heading"
    >
      <div className="container">
        <AnimatedRule />
        <div className="section__head section__head--plain live-head">
          <div>
            <h2 id="live-heading">
              {locale === 'vi' ? 'DỮ LIỆU THỰC VÀ HOẠT ĐỘNG' : 'LIVE DATA AND ACTIVITY'}
            </h2>
          </div>

          <div className="live-toolbar">
            <div className="live-toolbar__meta">
              <span className="live-pill">
                <span className="live-pill__dot" aria-hidden="true" />
                <span>
                  {locale === 'vi' ? 'Cập nhật lúc' : 'Synced'}: {formatTime(data.syncedAt, locale)}
                </span>
              </span>
              <span className="num-year live-countdown">
                {locale === 'vi' ? 'Tự đồng bộ' : 'Auto sync'}: {formatCountdown(nextSyncIn)}
              </span>
            </div>

            <button
              type="button"
              className="btn btn--secondary btn--compact"
              onClick={onRefresh}
              disabled={isSyncing}
              aria-busy={isSyncing}
            >
              <RefreshCw
                size={16}
                className={isSyncing ? 'spin-icon' : ''}
                aria-hidden="true"
              />
              <span>
                {isSyncing
                  ? locale === 'vi'
                    ? 'Đang đồng bộ…'
                    : 'Syncing…'
                  : locale === 'vi'
                    ? 'Cập nhật ngay'
                    : 'Sync now'}
              </span>
            </button>
          </div>
        </div>

        <div className="live-sources" aria-label="Sync sources">
          {sourceBadge(data.sources.github, 'GitHub')}
          {sourceBadge(data.sources.youtube, 'YouTube')}
          {sourceBadge(data.sources.steam, 'Steam')}
          <span className="source-chip">
            <span>Mode: {mode}</span>
          </span>
        </div>

        {/* Kinetic Marquee with accessible pause/play control */}
        <div className="marquee-bar">
          <div className={`marquee-track-wrap ${marqueePaused ? 'is-paused' : ''}`}>
            <div className="marquee-track">
              {[...marqueeItems, ...marqueeItems].map((text, idx) => (
                <span className="marquee-item" key={idx}>
                  {text}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="viewer3d__btn marquee-toggle"
            aria-pressed={marqueePaused}
            onClick={() => setMarqueePaused((prev) => !prev)}
          >
            {marqueePaused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
            <span>{marqueePaused ? (locale === 'vi' ? 'Chạy' : 'Play') : locale === 'vi' ? 'Dừng' : 'Pause'}</span>
          </button>
        </div>

        {/* 4 Live Animated Stat Counters */}
        <RevealBlock>
          <div className="live-stats">
            <div className="live-stat">
              <AnimatedCounter value={data.github.publicRepos} className="live-stat__num" />
              <p className="live-stat__label">
                {locale === 'vi' ? 'Kho mã nguồn GitHub công khai' : 'Public GitHub repositories'}
              </p>
            </div>
            <div className="live-stat">
              <AnimatedCounter value={data.youtube.subscribers} suffix="+" className="live-stat__num" />
              <p className="live-stat__label">
                {locale === 'vi' ? 'Người đăng ký YouTube @BetterCallShady' : 'YouTube subscribers'}
              </p>
            </div>
            <div className="live-stat">
              <AnimatedCounter value={data.youtube.videoCount} className="live-stat__num" />
              <p className="live-stat__label">
                {locale === 'vi' ? 'Video đã đăng tải từ 2019' : 'Published videos since 2019'}
              </p>
            </div>
            <div className="live-stat">
              <AnimatedCounter value={data.steam.gamesCount} className="live-stat__num" />
              <p className="live-stat__label">
                {locale === 'vi'
                  ? `Game Steam (Level ${data.steam.level}, ${data.steam.yearsOfService} năm)`
                  : `Steam library (Level ${data.steam.level}, ${data.steam.yearsOfService} yrs)`}
              </p>
            </div>
          </div>
        </RevealBlock>

        {/* 3 Live Channel Panels */}
        <div className="live-panels">
          {/* YouTube Channel & Videos */}
          <TiltPlate className="live-panel live-panel--youtube" maxTilt={2.5}>
            <div className="live-panel__head">
              <div className="live-panel__title-wrap">
                <Video size={20} aria-hidden="true" />
                <h3>YouTube @BetterCallShady</h3>
              </div>
              <a
                className="inline-link"
                href={data.youtube.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{locale === 'vi' ? 'Mở kênh' : 'Channel'}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>

            <div className="yt-grid">
              {data.youtube.videos.slice(0, 4).map((video) => (
                <a
                  key={video.videoId}
                  className="yt-card"
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="yt-card__thumb">
                    <img
                      src={video.thumbnail}
                      width={480}
                      height={360}
                      loading="lazy"
                      alt={video.title}
                    />
                    <span className="yt-card__play" aria-hidden="true">
                      <Play size={16} />
                    </span>
                  </div>
                  <div className="yt-card__body">
                    <p className="yt-card__title">{video.title}</p>
                    <p className="yt-card__meta num-year">
                      {video.views.toLocaleString('en-US')}{' '}
                      {locale === 'vi' ? 'lượt xem' : 'views'} /{' '}
                      {formatDateShort(video.publishedAt, locale)}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </TiltPlate>

          {/* GitHub Live Repositories */}
          <TiltPlate className="live-panel" maxTilt={2.8}>
            <div className="live-panel__head">
              <div className="live-panel__title-wrap">
                <Code2 size={20} aria-hidden="true" />
                <h3>GitHub @ShadyFyrix</h3>
              </div>
              <a
                className="inline-link"
                href={data.github.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>GitHub</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>

            <ul className="repo-list">
              {data.github.repos.slice(0, 5).map((repo) => (
                <li className="repo-list__item" key={repo.name}>
                  <a
                    className="repo-list__link"
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div>
                      <p className="repo-list__name">{repo.name}</p>
                      <p className="repo-list__meta">
                        {repo.language} / {formatDateShort(repo.updatedAt, locale)}
                      </p>
                    </div>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </TiltPlate>

          {/* Steam Profile & Activity */}
          <TiltPlate className="live-panel" maxTilt={2.8}>
            <div className="live-panel__head">
              <div className="live-panel__title-wrap">
                <Gamepad2 size={20} aria-hidden="true" />
                <h3>Steam {data.steam.profileName}</h3>
              </div>
              <a
                className="inline-link"
                href={data.steam.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Steam</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>

            <div className="steam-badges">
              <span className="steam-tag num-year">{data.steam.onlineState}</span>
              <span className="steam-tag num-year">Level {data.steam.level}</span>
              <span className="steam-tag num-year">
                {data.steam.yearsOfService} {locale === 'vi' ? 'năm' : 'yrs'}
              </span>
              <span className="steam-tag num-year">
                {data.steam.gamesCount} {locale === 'vi' ? 'game' : 'games'}
              </span>
              <span className="steam-tag num-year">
                {data.steam.badgesCount} {locale === 'vi' ? 'huy hiệu' : 'badges'}
              </span>
              <span className="steam-tag num-year">
                {data.steam.friendsCount} {locale === 'vi' ? 'bạn bè' : 'friends'}
              </span>
            </div>

            <ul className="steam-games">
              {data.steam.recentGames.map((game) => {
                const maxHours = Math.max(...data.steam.recentGames.map((g) => g.hoursTotal), 1);
                const pct = Math.max(6, Math.round((game.hoursTotal / maxHours) * 100));
                return (
                  <li className="steam-game" key={game.name}>
                    <div className="steam-game__top">
                      <span className="steam-game__name">{game.name}</span>
                      <span className="num-year steam-game__hours">{game.hoursTotal}h</span>
                    </div>
                    <div className="steam-game__track" aria-hidden="true">
                      <div className="steam-game__bar" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </TiltPlate>
        </div>
      </div>
    </section>
  );
}
