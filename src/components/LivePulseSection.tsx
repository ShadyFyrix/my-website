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
import { useSpatial } from './SpatialContext';
import {
  AnimatedCounter,
  AnimatedRule,
  DepthSurface,
  RevealBlock,
} from './SpatialFX';

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

function formatPublicRepoName(name: string): string {
  return name.replace(/[-_]?2310900087/g, '').replace(/--+/g, '-').replace(/__+/g, '_');
}

export function LivePulseSection({
  data,
  isSyncing,
  nextSyncIn,
  mode,
  onRefresh,
}: LivePulseSectionProps) {
  const { locale } = useLanguage();
  const { triggerShockwave } = useSpatial();
  const [marqueePaused, setMarqueePaused] = useState(false);

  const marqueeItems = [
    ...data.github.repos
      .slice(0, 3)
      .map((repo) => `GitHub · ${formatPublicRepoName(repo.name)} (${repo.language})`),
    ...data.youtube.videos.slice(0, 3).map((vid) => `YouTube · ${vid.title}`),
    ...data.steam.recentGames.map((g) => `Steam · ${g.name} (${g.hoursTotal}h)`),
  ];

  const sourceChip = (state: 'live' | 'snapshot', label: string) => (
    <span className={`signal-chip ${state === 'live' ? 'signal-chip--live' : ''}`}>
      <span className="signal-chip__dot" aria-hidden="true" />
      <span>
        {label}: {state === 'live' ? 'Live' : 'Synced'}
      </span>
    </span>
  );

  return (
    <section
      className="section section--band-a"
      id="live"
      aria-labelledby="live-heading"
    >
      <div className="container">
        <AnimatedRule
          sectionIndex="01"
          sectionLabel={locale === 'vi' ? 'HOẠT ĐỘNG LIVE' : 'LIVE ACTIVITY'}
        />
        <div className="section__head live-head">
          <div>
            <h2 id="live-heading">
              {locale === 'vi' ? 'DỮ LIỆU THỰC & HOẠT ĐỘNG' : 'LIVE TELEMETRY & ACTIVITY'}
            </h2>
          </div>

          <div className="live-toolbar">
            <div className="live-toolbar__meta">
              <span className="live-pill">
                <span className="live-pill__dot" aria-hidden="true" />
                <span className="mono-num">
                  {locale === 'vi' ? 'Đồng bộ' : 'Synced'} {formatTime(data.syncedAt, locale)}
                </span>
              </span>
              <span className="mono-num live-countdown">
                {locale === 'vi' ? 'Chu kỳ tiếp' : 'Next cycle'} · {formatCountdown(nextSyncIn)}
              </span>
            </div>

            <button
              type="button"
              className="btn btn--ghost btn--compact"
              onClick={() => {
                triggerShockwave(0.95, 0);
                onRefresh();
              }}
              disabled={isSyncing}
              aria-busy={isSyncing}
            >
              <RefreshCw
                size={15}
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
          {sourceChip(data.sources.github, 'GitHub')}
          {sourceChip(data.sources.youtube, 'YouTube')}
          {sourceChip(data.sources.steam, 'Steam')}
          <span className="signal-chip mono-num">
            {mode === 'api'
              ? locale === 'vi'
                ? 'Edge Live'
                : 'Edge Live'
              : mode === 'hybrid'
                ? 'Hybrid Live'
                : 'Snapshot'}
          </span>
        </div>

        {/* Unified Telemetry Ribbon — replaces repetitive separate stat boxes */}
        <RevealBlock>
          <div className="telemetry-ribbon">
            <div className="telemetry-cell">
              <AnimatedCounter value={data.github.publicRepos} className="telemetry-cell__num" />
              <p className="telemetry-cell__label">
                {locale === 'vi' ? 'Kho GitHub công khai' : 'Public GitHub repos'}
              </p>
            </div>
            <div className="telemetry-cell">
              <AnimatedCounter
                value={data.youtube.subscribers}
                suffix="+"
                className="telemetry-cell__num"
              />
              <p className="telemetry-cell__label">
                {locale === 'vi' ? 'Đăng ký @BetterCallShady' : 'YouTube subscribers'}
              </p>
            </div>
            <div className="telemetry-cell">
              <AnimatedCounter value={data.youtube.videoCount} className="telemetry-cell__num" />
              <p className="telemetry-cell__label">
                {locale === 'vi' ? 'Video xuất bản từ 2019' : 'Published videos since 2019'}
              </p>
            </div>
            <div className="telemetry-cell">
              <AnimatedCounter value={data.steam.gamesCount} className="telemetry-cell__num" />
              <p className="telemetry-cell__label">
                {locale === 'vi'
                  ? `Game Steam (Lv.${data.steam.level} · ${data.steam.yearsOfService} năm)`
                  : `Steam library (Lv.${data.steam.level} · ${data.steam.yearsOfService} yrs)`}
              </p>
            </div>
          </div>
        </RevealBlock>

        {/* Accessible Kinetic Ticker */}
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
            className="dock-btn marquee-toggle"
            aria-pressed={marqueePaused}
            onClick={() => setMarqueePaused((prev) => !prev)}
          >
            {marqueePaused ? (
              <Play size={14} aria-hidden="true" />
            ) : (
              <Pause size={14} aria-hidden="true" />
            )}
            <span>
              {marqueePaused
                ? locale === 'vi'
                  ? 'Chạy'
                  : 'Play'
                : locale === 'vi'
                  ? 'Dừng'
                  : 'Pause'}
            </span>
          </button>
        </div>

        {/* Asymmetric Spatial Live Feeds */}
        <div className="live-panels">
          <DepthSurface className="live-panel live-panel--youtube" maxTilt={2.2}>
            <div className="live-panel__head">
              <div className="live-panel__title-wrap">
                <Video size={18} aria-hidden="true" />
                <h3>YouTube @BetterCallShady</h3>
              </div>
              <a
                className="inline-link"
                href={data.youtube.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{locale === 'vi' ? 'Mở kênh' : 'Channel'}</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>

            <div className="yt-grid">
              {data.youtube.videos.slice(0, 4).map((video) => (
                <a
                  key={video.videoId}
                  className="yt-card"
                  data-cursor="play"
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
                      <Play size={15} />
                    </span>
                  </div>
                  <div className="yt-card__body">
                    <p className="yt-card__title">{video.title}</p>
                    <p className="yt-card__meta mono-num">
                      {video.views.toLocaleString('en-US')}{' '}
                      {locale === 'vi' ? 'lượt xem' : 'views'} ·{' '}
                      {formatDateShort(video.publishedAt, locale)}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </DepthSurface>

          <DepthSurface className="live-panel" maxTilt={2.6}>
            <div className="live-panel__head">
              <div className="live-panel__title-wrap">
                <Code2 size={18} aria-hidden="true" />
                <h3>GitHub @ShadyFyrix</h3>
              </div>
              <a
                className="inline-link"
                href={data.github.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>GitHub</span>
                <ArrowUpRight size={15} aria-hidden="true" />
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
                      <p className="repo-list__name">{formatPublicRepoName(repo.name)}</p>
                      <p className="repo-list__meta mono-num">
                        {repo.language} · {formatDateShort(repo.updatedAt, locale)}
                      </p>
                    </div>
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </DepthSurface>

          <DepthSurface className="live-panel" maxTilt={2.6}>
            <div className="live-panel__head">
              <div className="live-panel__title-wrap">
                <Gamepad2 size={18} aria-hidden="true" />
                <h3>Steam {data.steam.profileName}</h3>
              </div>
              <a
                className="inline-link"
                href={data.steam.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Steam</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>

            <div className="steam-badges">
              <span className="steam-tag mono-num">{data.steam.onlineState}</span>
              <span className="steam-tag mono-num">Level {data.steam.level}</span>
              <span className="steam-tag mono-num">
                {data.steam.yearsOfService} {locale === 'vi' ? 'năm' : 'yrs'}
              </span>
              <span className="steam-tag mono-num">
                {data.steam.gamesCount} {locale === 'vi' ? 'game' : 'games'}
              </span>
              <span className="steam-tag mono-num">
                {data.steam.badgesCount} {locale === 'vi' ? 'huy hiệu' : 'badges'}
              </span>
              <span className="steam-tag mono-num">
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
                      <span className="mono-num steam-game__hours">{game.hoursTotal}h</span>
                    </div>
                    <div className="steam-game__track" aria-hidden="true">
                      <div className="steam-game__bar" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </DepthSurface>
        </div>
      </div>
    </section>
  );
}
