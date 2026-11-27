import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowDownRight,
  FlipHorizontal2,
  Footprints,
  Grid,
  Move3d,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { PROFILE } from '../data/profile';
import { PRODUCTS } from '../data/products';
import { EYJA_ACTIONS, EYJA_SKINS, getEyjaClipSrc } from '../data/eyja';
import { NOTGUNGUN_AUDIO } from '../lib/bedrockModel';
import { useSpatial } from './SpatialContext';
import type { HeroStageMode } from './SpatialContext';
import { DepthSurface, LiveFFTCanvas, MagneticWrap } from './SpatialFX';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function HeroStage() {
  const { locale, t } = useLanguage();
  const {
    heroMode,
    setHeroMode,
    eyjaSkin,
    setEyjaSkin,
    eyjaAction,
    setEyjaAction,
    eyjaRoamerEnabled,
    toggleEyjaRoamer,
    wireframe,
    toggleWireframe,
    autoSpin,
    toggleAutoSpin,
    playingAudio,
    playAudioSample,
    triggerCubeBounce,
    resetCamera,
    nudgeOrbit,
    setDragging,
  } = useSpatial();

  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dragOriginRef = useRef({ active: false, x: 0, y: 0, moved: 0 });
  const showcaseVideoRef = useRef<HTMLVideoElement | null>(null);
  const [eyjaFlipped, setEyjaFlipped] = useState(false);

  const vibeProduct = PRODUCTS.find((p) => p.id === 'vibe-gif-studio')!;
  const examguardProduct = PRODUCTS.find((p) => p.id === 'examguard-ai')!;

  const headlineLines = ['BETTER CALL SHADY', 'SHADYFYRIX'];

  const tabs: Array<{ key: HeroStageMode; label: string }> = [
    { key: 'shady-cube', label: 'Shady Cube 3D' },
    { key: 'notgungun-3d', label: 'NotGunGun 3D' },
    { key: 'vibe-gif-studio', label: 'Vibe GIF FFT' },
    { key: 'examguard-ai', label: 'ExamGuard AI' },
    { key: 'eyja-chibi', label: 'Eyja Chibi' },
  ];

  const is3DStage = heroMode === 'shady-cube' || heroMode === 'notgungun-3d';
  const showSfxControls = heroMode === 'notgungun-3d' || heroMode === 'vibe-gif-studio';
  const currentSkinMeta = EYJA_SKINS.find((s) => s.id === eyjaSkin) ?? EYJA_SKINS[0];
  const currentActionMeta = EYJA_ACTIONS.find((a) => a.id === eyjaAction) ?? EYJA_ACTIONS[0];

  useEffect(() => {
    if (heroMode !== 'eyja-chibi') return;
    const v = showcaseVideoRef.current;
    if (v) void v.play().catch(() => undefined);
  }, [heroMode, eyjaSkin, eyjaAction]);

  const handleTabKeyDown = (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const nextIndex =
      event.key === 'ArrowRight'
        ? (index + 1) % tabs.length
        : (index - 1 + tabs.length) % tabs.length;
    setHeroMode(tabs[nextIndex].key);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <section className="hero-space" aria-labelledby="hero-heading">
      {/* Open interactive WebGL 3D drag + click-to-bounce stage */}
      {is3DStage && (
        <div
          className="hero-space__orbit-layer"
          data-cursor="orbit"
          role="img"
          aria-label={
            heroMode === 'shady-cube'
              ? locale === 'vi'
                ? 'Khối lập phương 3D ShadyFyrix — kéo để xoay, bấm để nhảy 3D'
                : 'ShadyFyrix 3D identity cube — drag to orbit, click to bounce'
              : locale === 'vi'
                ? 'Sân khấu WebGL 3D NotGunGun Ultimatum toàn màn hình — kéo để xoay mô hình 3D'
                : 'Full-viewport NotGunGun Ultimatum WebGL 3D stage — drag to orbit'
          }
          onPointerDown={(e) => {
            dragOriginRef.current = { active: true, x: e.clientX, y: e.clientY, moved: 0 };
            setDragging(true);
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!dragOriginRef.current.active) return;
            const dx = e.clientX - dragOriginRef.current.x;
            const dy = e.clientY - dragOriginRef.current.y;
            dragOriginRef.current.x = e.clientX;
            dragOriginRef.current.y = e.clientY;
            dragOriginRef.current.moved += Math.hypot(dx, dy);
            nudgeOrbit(dx, dy);
          }}
          onPointerUp={(e) => {
            const wasClick = dragOriginRef.current.moved < 8;
            dragOriginRef.current.active = false;
            setDragging(false);
            if (wasClick && heroMode === 'shady-cube') {
              triggerCubeBounce();
            }
            try {
              (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            } catch {
              // ignore released capture
            }
          }}
          onPointerCancel={() => {
            dragOriginRef.current.active = false;
            setDragging(false);
          }}
        />
      )}

      <div className="container hero-space__layout">
        <AnimatePresence mode="wait">
          {heroMode === 'vibe-gif-studio' && (
            <motion.div
              key="panel-vibe"
              id="hero-panel-vibe"
              role="tabpanel"
              aria-labelledby="hero-tab-vibe"
              className="hero-space__portal"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.42, ease: EASE_OUT }}
            >
              <DepthSurface className="portal-card" maxTilt={3.5}>
                <div className="portal-card__media">
                  <img
                    src={vibeProduct.image}
                    width={vibeProduct.imageWidth}
                    height={vibeProduct.imageHeight}
                    alt={t(vibeProduct.imageAlt)}
                    fetchPriority="high"
                  />
                </div>
                <div className="portal-card__fft">
                  <div className="portal-card__fft-head">
                    <span>WASAPI 1024-FFT · ONNX 5-STEM</span>
                    <span className="mono-num">60 FPS</span>
                  </div>
                  <LiveFFTCanvas />
                </div>
              </DepthSurface>
            </motion.div>
          )}

          {heroMode === 'examguard-ai' && (
            <motion.div
              key="panel-examguard"
              id="hero-panel-examguard"
              role="tabpanel"
              aria-labelledby="hero-tab-examguard"
              className="hero-space__portal"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.42, ease: EASE_OUT }}
            >
              <DepthSurface className="portal-card portal-card--examguard" maxTilt={3.5}>
                <div className="portal-exam__head">
                  <span className="portal-exam__title">{examguardProduct.title}</span>
                  <span className="mono-num portal-exam__year">{examguardProduct.year}</span>
                </div>
                <p className="portal-exam__summary">{t(examguardProduct.summary)}</p>
                <dl className="portal-exam__grid">
                  {examguardProduct.architectureSpecs.map((spec) => (
                    <div className="portal-exam__cell" key={spec.label.en}>
                      <dt>{t(spec.label)}</dt>
                      <dd>{t(spec.value)}</dd>
                    </div>
                  ))}
                </dl>
                <div className="portal-exam__foot">
                  <span>{t(examguardProduct.role)}</span>
                  <span className="mono-num">Zero-Trust · CPU-First</span>
                </div>
              </DepthSurface>
            </motion.div>
          )}

          {heroMode === 'eyja-chibi' && (
            <motion.div
              key="panel-eyja"
              id="hero-panel-eyja"
              role="tabpanel"
              aria-labelledby="hero-tab-eyja"
              className="hero-space__portal"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.42, ease: EASE_OUT }}
            >
              <DepthSurface className="portal-card portal-card--eyja" maxTilt={2.5}>
                <div className="eyja-stage__head">
                  <div className="eyja-stage__title-group">
                    <span
                      className="eyja-stage__dot"
                      style={{ background: currentSkinMeta.accent }}
                      aria-hidden="true"
                    />
                    <span className="eyja-stage__name">{t(currentSkinMeta.name)}</span>
                  </div>
                  <div className="eyja-stage__util">
                    <button
                      type="button"
                      className="dock-btn"
                      onClick={() => setEyjaFlipped((f) => !f)}
                      aria-pressed={eyjaFlipped}
                    >
                      <FlipHorizontal2 size={13} aria-hidden="true" />
                      <span>{locale === 'vi' ? 'Quay mặt' : 'Flip'}</span>
                    </button>
                    <button
                      type="button"
                      className="dock-btn"
                      onClick={toggleEyjaRoamer}
                      aria-pressed={eyjaRoamerEnabled}
                    >
                      <Footprints size={13} aria-hidden="true" />
                      <span>
                        {eyjaRoamerEnabled
                          ? locale === 'vi'
                            ? 'Đang đi dạo'
                            : 'Roaming ON'
                          : locale === 'vi'
                            ? 'Bật đi dạo'
                            : 'Roaming OFF'}
                      </span>
                    </button>
                  </div>
                </div>

                <div
                  className="eyja-stage__viewport"
                  onClick={() => setEyjaAction(eyjaAction === 'interact' ? 'skill' : 'interact')}
                  title={locale === 'vi' ? 'Bấm vào Eyja để tương tác' : 'Click Eyja to interact'}
                >
                  <div
                    className={`eyja-stage__sprite eyja-stage__sprite--${eyjaAction}`}
                    style={{ transform: `scaleX(${eyjaFlipped ? -1 : 1})` }}
                  >
                    <video
                      ref={showcaseVideoRef}
                      src={getEyjaClipSrc(eyjaSkin, eyjaAction)}
                      className="eyja-stage__video is-current"
                      preload="auto"
                      autoPlay
                      muted
                      playsInline
                      loop={currentActionMeta.loop}
                      onEnded={() => {
                        if (!currentActionMeta.loop) setEyjaAction('relax');
                      }}
                    />
                  </div>
                  <span className="eyja-stage__floor" aria-hidden="true" />
                </div>

                <div className="eyja-stage__picker">
                  <div className="eyja-stage__row">
                    {EYJA_SKINS.map((skin) => (
                      <button
                        key={skin.id}
                        type="button"
                        className={`eyja-chip ${eyjaSkin === skin.id ? 'is-active' : ''}`}
                        onClick={() => setEyjaSkin(skin.id)}
                      >
                        <span
                          className="eyja-chip__dot"
                          style={{ background: skin.accent }}
                          aria-hidden="true"
                        />
                        {skin.shortLabel}
                      </button>
                    ))}
                  </div>
                  <div className="eyja-stage__row">
                    {EYJA_ACTIONS.map((act) => (
                      <button
                        key={act.id}
                        type="button"
                        className={`eyja-chip ${eyjaAction === act.id ? 'is-active' : ''}`}
                        onClick={() => setEyjaAction(act.id)}
                      >
                        {t(act.label)}
                      </button>
                    ))}
                  </div>
                </div>
              </DepthSurface>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hero-space__bottom">
          <div className="hero-space__identity">
            <h1 className="hero-space__headline" id="hero-heading">
              {headlineLines.map((line, idx) => (
                <span className="hero-space__line-mask" key={line}>
                  <motion.span
                    className={`hero-space__line ${idx === 1 ? 'hero-space__line--accent' : ''}`}
                    initial={{ y: '108%', opacity: 0.2 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ duration: 0.56, delay: 0.08 + idx * 0.13, ease: EASE_OUT }}
                  >
                    {line}
                  </motion.span>
                  <motion.span
                    className={`hero-space__wipe ${idx === 1 ? 'hero-space__wipe--solar' : ''}`}
                    aria-hidden="true"
                    initial={{ x: '-105%' }}
                    animate={{ x: '115%' }}
                    transition={{ duration: 0.68, delay: idx * 0.13, ease: [0.65, 0, 0.35, 1] }}
                  />
                </span>
              ))}
            </h1>

            <p className="hero-space__lead">{t(PROFILE.heroLead)}</p>

            <div className="hero-space__actions">
              <MagneticWrap>
                <a className="btn btn--primary" href="#products">
                  <span>{locale === 'vi' ? 'Xem sản phẩm của mình' : 'Explore my builds'}</span>
                  <ArrowDownRight size={18} aria-hidden="true" />
                </a>
              </MagneticWrap>
              <MagneticWrap>
                <a className="btn btn--ghost" href="#live">
                  <span>{locale === 'vi' ? 'Hoạt động live' : 'Live activity'}</span>
                </a>
              </MagneticWrap>
            </div>
          </div>

          <aside
            className="spatial-dock"
            aria-label={locale === 'vi' ? 'Điều khiển sân khấu Hero' : 'Hero stage controls'}
          >
            <div className="spatial-dock__hint">
              <Move3d size={15} aria-hidden="true" />
              <span>
                {heroMode === 'shady-cube'
                  ? locale === 'vi'
                    ? 'Kéo xoay khối 3D · Click Eyja để xoa đầu · Chuột phải Eyja mở menu'
                    : 'Drag to orbit 3D cube · Left-click Eyja to pat · Right-click for menu'
                  : heroMode === 'notgungun-3d'
                    ? locale === 'vi'
                      ? 'Kéo xoay NotGunGun 3D · Bấm SFX để bắn & Eyja tung Skill'
                      : 'Drag to orbit NotGunGun 3D · Trigger SFX for recoil & Eyja Skill'
                    : heroMode === 'vibe-gif-studio'
                      ? locale === 'vi'
                        ? 'Di chuột hoặc phát mẫu SFX để xem phổ FFT phản hồi thật'
                        : 'Move pointer or trigger SFX to drive live FFT bars'
                      : heroMode === 'eyja-chibi'
                        ? locale === 'vi'
                          ? '6 trang phục & 7 động tác 60 FPS — đồng bộ trực tiếp với Eyja đi dạo'
                          : '6 outfits & 7 60-FPS animations — synced with the roaming chibi'
                        : locale === 'vi'
                          ? 'Kiến trúc Đồ án Tốt nghiệp Zero-Trust Face AI'
                          : 'Graduation thesis Zero-Trust Face AI architecture'}
              </span>
            </div>

            {/* Section 1: Stage Selector */}
            <div className="spatial-dock__block">
              <span className="spatial-dock__label">
                {locale === 'vi' ? 'Sân khấu' : 'Stage'}
              </span>
              <div
                className="spatial-dock__tabs"
                role="tablist"
                aria-label={locale === 'vi' ? 'Chuyển sân khấu tiêu biểu' : 'Switch showcase stage'}
              >
                {tabs.map((tab, index) => {
                  const isActive = heroMode === tab.key;
                  const id =
                    tab.key === 'shady-cube'
                      ? 'hero-tab-cube'
                      : tab.key === 'notgungun-3d'
                        ? 'hero-tab-notgungun'
                        : tab.key === 'vibe-gif-studio'
                          ? 'hero-tab-vibe'
                          : tab.key === 'eyja-chibi'
                            ? 'hero-tab-eyja'
                            : 'hero-tab-examguard';
                  return (
                    <button
                      key={tab.key}
                      ref={(el) => {
                        tabRefs.current[index] = el;
                      }}
                      id={id}
                      type="button"
                      role="tab"
                      className="dock-tab"
                      aria-selected={isActive}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setHeroMode(tab.key)}
                      onKeyDown={(e) => handleTabKeyDown(index, e)}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="spatial-hero-tab"
                          className="dock-tab__bg"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="dock-tab__label">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Context-Aware Controls (Only shows controls matching active tab) */}
            {(is3DStage || showSfxControls) && (
              <div className="spatial-dock__controls">
                {showSfxControls && (
                  <div className="spatial-dock__block spatial-dock__block--inline">
                    <span className="spatial-dock__label">
                      {locale === 'vi' ? 'Âm thanh SFX' : 'SFX Audio'}
                    </span>
                    <div className="spatial-dock__group">
                      {NOTGUNGUN_AUDIO.map((sample) => (
                        <button
                          key={sample.id}
                          type="button"
                          className="dock-btn"
                          data-cursor="play"
                          aria-pressed={playingAudio === sample.id}
                          onClick={() => playAudioSample(sample.id, sample.src, sample.impulse)}
                        >
                          <Volume2 size={14} aria-hidden="true" />
                          <span>{locale === 'vi' ? sample.vi : sample.en}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {is3DStage && (
                  <div className="spatial-dock__block spatial-dock__block--inline">
                    <span className="spatial-dock__label">
                      {locale === 'vi' ? 'Điều khiển 3D' : '3D Controls'}
                    </span>
                    <div className="spatial-dock__group">
                      {heroMode === 'shady-cube' && (
                        <button
                          type="button"
                          className="dock-btn dock-btn--highlight"
                          onClick={triggerCubeBounce}
                        >
                          <Zap size={14} aria-hidden="true" />
                          <span>{locale === 'vi' ? 'Nhảy 3D' : 'Bounce'}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="dock-btn"
                        aria-pressed={autoSpin}
                        onClick={toggleAutoSpin}
                      >
                        {autoSpin ? (
                          <Pause size={14} aria-hidden="true" />
                        ) : (
                          <Play size={14} aria-hidden="true" />
                        )}
                        <span>{locale === 'vi' ? 'Xoay' : 'Spin'}</span>
                      </button>
                      <button
                        type="button"
                        className="dock-btn"
                        aria-pressed={wireframe}
                        onClick={toggleWireframe}
                      >
                        <Grid size={14} aria-hidden="true" />
                        <span>Wire</span>
                      </button>
                      <button
                        type="button"
                        className="dock-btn"
                        onClick={resetCamera}
                        aria-label={locale === 'vi' ? 'Đặt lại góc nhìn 3D' : 'Reset 3D camera'}
                      >
                        <RotateCcw size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
