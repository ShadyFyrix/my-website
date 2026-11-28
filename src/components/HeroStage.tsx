import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
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
import { DepthSurface, LiveFFTCanvas, MagneticWrap, useBidirectionalReveal } from './SpatialFX';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const HERO_FLIP_VARIANTS = {
  hidden: (cfg: { delay: number; yaw: number }) => ({
    rotateX: -58,
    rotateY: cfg.yaw,
    y: 30,
    scale: 0.9,
    opacity: 0,
    transition: { duration: 0.01 },
  }),
  visible: (cfg: { delay: number; yaw: number }) => ({
    rotateX: 0,
    rotateY: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 23,
      mass: 0.84,
      delay: cfg.delay,
    },
  }),
};

const HERO_SUB_VARIANTS = {
  hidden: {
    rotateX: -28,
    y: 22,
    scale: 0.96,
    opacity: 0,
    transition: { duration: 0.01 },
  },
  visible: (delay: number) => ({
    rotateX: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.58, delay, ease: EASE_OUT },
  }),
};

const HERO_PILL_VARIANTS = {
  hidden: {
    scaleX: 0.2,
    scaleY: 0.72,
    opacity: 0,
    transition: { duration: 0.01 },
  },
  visible: (delay: number) => ({
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 240,
      damping: 20,
      mass: 0.76,
      delay,
    },
  }),
};

const HERO_SWEEP_VARIANTS = {
  hidden: {
    scaleX: 0,
    x: '0%',
    opacity: 0,
    transition: { duration: 0.01 },
  },
  visible: (delay: number) => ({
    scaleX: [0, 1, 1, 0],
    x: ['0%', '0%', '100%', '100%'],
    opacity: [1, 1, 1, 0],
    transition: {
      duration: 0.62,
      delay,
      ease: [0.76, 0, 0.24, 1] as const,
      times: [0, 0.42, 0.54, 1],
    },
  }),
};

const HERO_RULE_VARIANTS = {
  hidden: {
    scaleX: 0,
    opacity: 0,
    transition: { duration: 0.01 },
  },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.66, delay: 0.32, ease: EASE_OUT },
  },
};

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

  const heroRef = useRef<HTMLElement | null>(null);
  const heroHeadlineRef = useRef<HTMLHeadingElement | null>(null);
  const heroTitleVisible = useBidirectionalReveal(heroHeadlineRef, '-48px 0px -8px 0px', 0.08);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dragOriginRef = useRef({ active: false, x: 0, y: 0, moved: 0 });
  const showcaseVideoRef = useRef<HTMLVideoElement | null>(null);
  const [eyjaFlipped, setEyjaFlipped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const identityY = useTransform(heroScroll, [0, 1], [0, -56]);
  const identityRotateX = useTransform(heroScroll, [0, 1], [0, -10]);
  const identityScale = useTransform(heroScroll, [0, 1], [1, 0.94]);
  const identityOpacity = useTransform(heroScroll, [0, 0.55, 0.92, 1], [1, 0.92, 0.28, 0.12]);

  const dockY = useTransform(heroScroll, [0, 1], [0, -26]);
  const dockRotateX = useTransform(heroScroll, [0, 1], [0, 8]);
  const dockRotateY = useTransform(heroScroll, [0, 1], [0, -5]);
  const dockScale = useTransform(heroScroll, [0, 1], [1, 0.95]);

  const vibeProduct = PRODUCTS.find((p) => p.id === 'vibe-gif-studio')!;
  const examguardProduct = PRODUCTS.find((p) => p.id === 'examguard-ai')!;

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
    <section ref={heroRef} className="hero-space" aria-labelledby="hero-heading">
      {/* Broadcast Kinetic Motion-Graphic Stage Reticle & Registration HUD (100% Compositor-Thread SVGs, 0 Layouts) */}
      <div className="hero-mg" data-active={heroTitleVisible ? 'true' : 'false'} aria-hidden="true">
        <div className="hero-mg__reticle">
          <svg className="hero-mg__svg hero-mg__ring-outer" viewBox="0 0 640 640" fill="none">
            <circle cx="320" cy="320" r="292" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" strokeDasharray="3 11" />
            <circle cx="320" cy="320" r="292" stroke="rgba(255,106,43,0.78)" strokeWidth="2" strokeDasharray="62 396" strokeLinecap="round" />
            <line x1="320" y1="14" x2="320" y2="36" stroke="rgba(255,106,43,0.92)" strokeWidth="1.8" />
            <line x1="320" y1="604" x2="320" y2="626" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" />
            <line x1="14" y1="320" x2="36" y2="320" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" />
            <line x1="604" y1="320" x2="626" y2="320" stroke="rgba(255,106,43,0.92)" strokeWidth="1.8" />
          </svg>
          <svg className="hero-mg__svg hero-mg__ring-inner" viewBox="0 0 640 640" fill="none">
            <circle cx="320" cy="320" r="228" stroke="rgba(255,176,128,0.28)" strokeWidth="1.15" strokeDasharray="18 20 4 20" />
            <circle cx="320" cy="320" r="228" stroke="rgba(255,255,255,0.52)" strokeWidth="1.5" strokeDasharray="34 324" strokeLinecap="round" />
          </svg>
          <svg className="hero-mg__svg" viewBox="0 0 640 640" fill="none">
            <path d="M96 126 V96 H126" stroke="rgba(255,255,255,0.44)" strokeWidth="1.5" />
            <path d="M544 126 V96 H514" stroke="rgba(255,106,43,0.78)" strokeWidth="1.5" />
            <path d="M96 514 V544 H126" stroke="rgba(255,106,43,0.78)" strokeWidth="1.5" />
            <path d="M544 514 V544 H514" stroke="rgba(255,255,255,0.44)" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="hero-mg__cross hero-mg__cross--tl">+</div>
        <div className="hero-mg__cross hero-mg__cross--tr">+</div>

        <div className="hero-mg__scroll-cue">
          <span className="hero-mg__scroll-track">
            <span className="hero-mg__scroll-dot" />
          </span>
          <span className="mono-num">SCROLL</span>
        </div>
      </div>

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

        <div className="hero-space__bottom scroll-depth-stage">
          <motion.div
            className="hero-space__identity"
            style={
              reducedMotion
                ? undefined
                : {
                    y: identityY,
                    rotateX: identityRotateX,
                    scale: identityScale,
                    opacity: identityOpacity,
                    transformPerspective: 1200,
                  }
            }
          >
            <h1
              ref={heroHeadlineRef}
              className="hero-space__headline"
              id="hero-heading"
              data-active={heroTitleVisible ? 'true' : 'false'}
            >
              <span className="hero-space__line-row">
                <span className="hero-space__flip-slot hero-space__flip-slot--sweep">
                  <motion.span
                    className="hero-space__line hero-space__line--3d"
                    custom={{ delay: 0.04, yaw: -8 }}
                    variants={HERO_FLIP_VARIANTS}
                    initial={reducedMotion ? false : 'hidden'}
                    animate={heroTitleVisible ? 'visible' : 'hidden'}
                    style={{ transformPerspective: 1100 }}
                  >
                    <span className="chrome-text chrome-text--platinum">
                      <span className="chrome-text__depth" aria-hidden="true">BETTER CALL</span>
                      <span className="chrome-text__face">BETTER CALL</span>
                    </span>
                  </motion.span>
                  <motion.span
                    className="title-block-sweep title-block-sweep--light"
                    aria-hidden="true"
                    custom={0}
                    variants={HERO_SWEEP_VARIANTS}
                    initial={reducedMotion ? false : 'hidden'}
                    animate={heroTitleVisible ? 'visible' : 'hidden'}
                  />
                </span>
              </span>

              <span className="hero-space__line-row hero-space__line-row--mid">
                <span className="hero-space__flip-slot">
                  <motion.span
                    className="hero-space__line hero-space__line--3d"
                    custom={{ delay: 0.14, yaw: 10 }}
                    variants={HERO_FLIP_VARIANTS}
                    initial={reducedMotion ? false : 'hidden'}
                    animate={heroTitleVisible ? 'visible' : 'hidden'}
                    style={{ transformPerspective: 1100 }}
                  >
                    <span className="chrome-text chrome-text--platinum-italic">
                      <span className="chrome-text__depth" aria-hidden="true">SHADY</span>
                      <span className="chrome-text__face">SHADY</span>
                    </span>
                  </motion.span>
                </span>

                <motion.span
                  className="title-mg-tag title-mg-tag--hero"
                  aria-hidden="true"
                  custom={0.22}
                  variants={HERO_PILL_VARIANTS}
                  initial={reducedMotion ? false : 'hidden'}
                  animate={heroTitleVisible ? 'visible' : 'hidden'}
                >
                  <span className="title-mg-tag__corners" />
                  <svg className="title-mg-tag__icon" viewBox="0 0 18 18" fill="none">
                    <path d="M9 1.5L10.7 7.3L16.5 9L10.7 10.7L9 16.5L7.3 10.7L1.5 9L7.3 7.3L9 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  </svg>
                  <span className="title-mg-tag__label mono-num">
                    AI <i>/</i> 3D <i>/</i> DEV
                  </span>
                  <span className="title-mg-tag__sweep" />
                </motion.span>
              </span>

              <span className="hero-space__flip-slot hero-space__flip-slot--block hero-space__flip-slot--sweep">
                <motion.span
                  className="hero-space__line hero-space__line--3d"
                  custom={{ delay: 0.24, yaw: -6 }}
                  variants={HERO_FLIP_VARIANTS}
                  initial={reducedMotion ? false : 'hidden'}
                  animate={heroTitleVisible ? 'visible' : 'hidden'}
                  style={{ transformPerspective: 1100 }}
                >
                  <span className="chrome-text chrome-text--copper-hero">
                    <span className="chrome-text__depth" aria-hidden="true">SHADYFYRIX</span>
                    <span className="chrome-text__face">SHADYFYRIX</span>
                  </span>
                </motion.span>
                <motion.span
                  className="title-block-sweep title-block-sweep--solar"
                  aria-hidden="true"
                  custom={0.16}
                  variants={HERO_SWEEP_VARIANTS}
                  initial={reducedMotion ? false : 'hidden'}
                  animate={heroTitleVisible ? 'visible' : 'hidden'}
                />
                <motion.span
                  className="hero-space__brand-rule"
                  aria-hidden="true"
                  variants={HERO_RULE_VARIANTS}
                  initial={reducedMotion ? false : 'hidden'}
                  animate={heroTitleVisible ? 'visible' : 'hidden'}
                />
              </span>
            </h1>

            <motion.p
              className="hero-space__lead"
              custom={0.28}
              variants={HERO_SUB_VARIANTS}
              initial={reducedMotion ? false : 'hidden'}
              animate={heroTitleVisible ? 'visible' : 'hidden'}
              style={{ transformOrigin: '50% 90%', transformPerspective: 1100 }}
            >
              {t(PROFILE.heroLead)}
            </motion.p>

            <motion.div
              className="hero-space__actions"
              custom={0.35}
              variants={HERO_SUB_VARIANTS}
              initial={reducedMotion ? false : 'hidden'}
              animate={heroTitleVisible ? 'visible' : 'hidden'}
              style={{ transformOrigin: '50% 90%', transformPerspective: 1100 }}
            >
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
            </motion.div>
          </motion.div>

          <motion.aside
            className="spatial-dock"
            aria-label={locale === 'vi' ? 'Điều khiển sân khấu Hero' : 'Hero stage controls'}
            style={
              reducedMotion
                ? undefined
                : {
                    y: dockY,
                    rotateX: dockRotateX,
                    rotateY: dockRotateY,
                    scale: dockScale,
                    transformPerspective: 1200,
                  }
            }
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
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
