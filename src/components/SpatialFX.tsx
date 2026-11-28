import { useEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { useSpatial } from './SpatialContext';

const EASE_EXPO = [0.22, 1, 0.36, 1] as const;

/**
 * Hysteresis Bidirectional Viewport Reveal Hook:
 * - Triggers `true` cleanly whenever the element enters the clear viewport (forgiving threshold so titles NEVER get stuck hidden).
 * - Resets silently to `false` only once the element leaves the viewport completely
 *   (so it never blinks out while visible, and ALWAYS replays cleanly on scroll UP & DOWN).
 */
export function useBidirectionalReveal(
  ref: RefObject<HTMLElement | null>,
  enterMargin = '-40px 0px -8px 0px',
  threshold = 0.05
): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const enterIO = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { rootMargin: enterMargin, threshold }
    );

    const exitIO = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setVisible(false);
        }
      },
      { rootMargin: '0px', threshold: 0 }
    );

    enterIO.observe(el);
    exitIO.observe(el);

    return () => {
      enterIO.disconnect();
      exitIO.disconnect();
    };
  }, [ref, enterMargin, threshold]);

  return visible;
}

export function ScrollProgressRail() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 34,
    restDelta: 0.001,
  });

  return <motion.div className="scroll-rail" style={{ scaleX }} aria-hidden="true" />;
}

/**
 * Global GPU-only Mouse Flashlight Spotlight (0 React re-renders, 1 transform write per pointer move).
 */
export function PointerSpotlight() {
  const orbRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    const el = orbRef.current;
    if (!el) return;

    let raf = 0;
    let tx = window.innerWidth * 0.5;
    let ty = window.innerHeight * 0.45;
    let cx = tx;
    let cy = ty;
    let visible = false;

    const tick = () => {
      raf = 0;
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      el.style.transform = `translate3d(${(cx - 260).toFixed(1)}px, ${(cy - 260).toFixed(1)}px, 0)`;
      if (visible && (Math.abs(tx - cx) > 0.35 || Math.abs(ty - cy) > 0.35)) {
        raf = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        el.style.opacity = '1';
      }
      if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    };

    const onLeave = () => {
      visible = false;
      el.style.opacity = '0';
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <div ref={orbRef} className="pointer-spotlight" aria-hidden="true" />;
}

const TICKER_ITEMS_VI = [
  'SHADYFYRIX',
  'BETTERCALLSHADY',
  'LỤC VĂN SƠN',
  'FULL-STACK & AI',
  'EXAMGUARD AI',
  'VIBE GIF STUDIO',
  'NOTGUNGUN 3D',
  'MA-AT-ZESSOU',
  'MINECRAFT BEDROCK 3D',
  'GAME INDIE & YOUTUBE',
];

const TICKER_ITEMS_EN = [
  'SHADYFYRIX',
  'BETTERCALLSHADY',
  'LUC VAN SON',
  'FULL-STACK & AI',
  'EXAMGUARD AI',
  'VIBE GIF STUDIO',
  'NOTGUNGUN 3D',
  'MA-AT-ZESSOU',
  'MINECRAFT BEDROCK 3D',
  'INDIE GAMES & YOUTUBE',
];

export function KineticTickerBand() {
  const { locale } = useLanguage();
  const bandRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(true);
  const items = locale === 'vi' ? TICKER_ITEMS_VI : TICKER_ITEMS_EN;
  const track = [...items, ...items];

  useEffect(() => {
    const el = bandRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={bandRef} className="kinetic-ticker" data-active={inView ? 'true' : 'false'} aria-hidden="true">
      <div className="kinetic-ticker__track">
        {track.map((label, idx) => (
          <span
            className={`kinetic-ticker__item ${idx % 2 === 1 ? 'kinetic-ticker__item--outline' : ''}`}
            key={`${label}-${idx}`}
          >
            <span className="kinetic-ticker__glyph">
              {idx % 3 === 0 ? '✦' : idx % 3 === 1 ? '+' : '◆'}
            </span>
            <span>{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const BG_MARQUEE_ROW_A = ['Shadyfyrix', 'BetterCallShady'];
const BG_MARQUEE_ROW_B = ['BetterCallShady', 'Shadyfyrix'];

/**
 * Monumental Dual-Track Kinetic Background Typography (Pure GPU translate3d — Lean Texture Footprint)
 */
export function BackgroundKineticMarquee() {
  const rowA = [...BG_MARQUEE_ROW_A, ...BG_MARQUEE_ROW_A];
  const rowB = [...BG_MARQUEE_ROW_B, ...BG_MARQUEE_ROW_B];

  return (
    <div className="bg-kinetic-marquee" aria-hidden="true">
      <div className="bg-kinetic-marquee__row bg-kinetic-marquee__row--left">
        {rowA.map((word, idx) => (
          <span
            key={`a-${idx}`}
            className={`bg-kinetic-marquee__word ${idx % 2 === 1 ? 'bg-kinetic-marquee__word--serif-stroke' : ''}`}
          >
            <span>{word}</span>
            <span className="bg-kinetic-marquee__sep">✦</span>
          </span>
        ))}
      </div>
      <div className="bg-kinetic-marquee__row bg-kinetic-marquee__row--right">
        {rowB.map((word, idx) => (
          <span
            key={`b-${idx}`}
            className={`bg-kinetic-marquee__word ${idx % 2 === 0 ? 'bg-kinetic-marquee__word--serif-white' : 'bg-kinetic-marquee__word--ember'}`}
          >
            <span>{word}</span>
            <span className="bg-kinetic-marquee__sep">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Pure-GPU scroll-linked parallax media frame (transform only — zero repaint cost).
 */
interface ParallaxFrameProps {
  children: ReactNode;
  className?: string;
  offset?: number;
}

export function ParallaxFrame({ children, className = '', offset = 22 }: ParallaxFrameProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.06, 1.01, 1.06]);

  return (
    <div ref={ref} className={`parallax-frame ${className}`.trim()}>
      <motion.div className="parallax-frame__inner" style={{ y, scale }}>
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Live interactive 2D Canvas FFT Visualizer bound to real Web Audio analyser + pointer frequency sweep.
 */
export function LiveFFTCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { liveRef, analyserRef } = useSpatial();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    let inView = true;
    let cachedW = Math.max(240, Math.floor(canvas.clientWidth || 320));
    let cachedH = Math.max(48, Math.floor(canvas.clientHeight || 64));
    const freqData = new Uint8Array(64);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const syncSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      cachedW = Math.max(240, Math.floor(canvas.clientWidth || 320));
      cachedH = Math.max(48, Math.floor(canvas.clientHeight || 64));
      canvas.width = Math.round(cachedW * dpr);
      canvas.height = Math.round(cachedH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    syncSize();

    const ro = new ResizeObserver(syncSize);
    ro.observe(canvas);

    const draw = () => {
      raf = 0;
      if (!inView) return;

      const w = cachedW;
      const h = cachedH;
      ctx.clearRect(0, 0, w, h);

      if (!reduced) t += 0.045;

      let hasLiveAudio = false;
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(freqData);
        for (let i = 0; i < 32; i++) {
          if (freqData[i] > 6) {
            hasLiveAudio = true;
            break;
          }
        }
      }

      const bars = 36;
      const gap = 4;
      const barW = Math.max(3, (w - gap * (bars - 1)) / bars);
      const px = (liveRef.current.pointerX + 1) * 0.5;
      const pulse = liveRef.current.pulseStrength;

      for (let i = 0; i < bars; i++) {
        const norm = i / (bars - 1);
        const diff = (norm - px) * 5.2;
        const pointerPeak = 1 / (1 + diff * diff);
        let amp: number;
        if (hasLiveAudio) {
          amp = (freqData[Math.min(63, i)] / 255) * 0.9 + 0.1;
        } else {
          amp =
            0.18 +
            Math.abs(Math.sin(t * 1.4 + i * 0.32)) * 0.28 +
            Math.abs(Math.cos(t * 0.9 - i * 0.19)) * 0.18 +
            pointerPeak * 0.32 +
            pulse * 0.35;
        }
        const barH = Math.max(6, Math.min(h - 8, amp * (h - 10)));
        const x = i * (barW + gap);
        const y = h - barH;

        ctx.fillStyle = i % 7 === 0 ? '#fff1e6' : i % 3 === 0 ? '#ff9d66' : '#ff6a2b';
        ctx.fillRect(x, y, barW, barH);
      }

      if (!reduced && inView) {
        raf = requestAnimationFrame(draw);
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !raf) {
          raf = requestAnimationFrame(draw);
        } else if (!inView && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0.01 }
    );
    io.observe(canvas);

    draw();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [analyserRef, liveRef]);

  return <canvas ref={canvasRef} className="fft-canvas" aria-hidden="true" />;
}

/**
 * Interactive Card Surface with:
 * - Animated Gradient Border Beam (orbiting Cyan -> Violet -> Solar beam around perimeter)
 * - Dual Mouse Spotlight (illuminates surface + brightens nearest border edge)
 * - Subtle 3D Spring Tilt + HUD Corner Brackets
 */
interface DepthSurfaceProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  cursorMode?: string;
  beamAlwaysOn?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function DepthSurface({
  children,
  className = '',
  maxTilt = 3.2,
  cursorMode,
  beamAlwaysOn = false,
  onMouseEnter,
  onMouseLeave,
}: DepthSurfaceProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(rawX, { stiffness: 210, damping: 24 });
  const rotateY = useSpring(rawY, { stiffness: 210, damping: 24 });
  const [canTilt, setCanTilt] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setCanTilt(fine && !reduced);
  }, []);

  const handleEnter = () => {
    if (ref.current) {
      rectRef.current = ref.current.getBoundingClientRect();
    }
    onMouseEnter?.();
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = rectRef.current ?? ref.current.getBoundingClientRect();
    rectRef.current = rect;
    const lx = e.clientX - rect.left;
    const ly = e.clientY - rect.top;
    const px = lx / Math.max(1, rect.width);
    const py = ly / Math.max(1, rect.height);
    ref.current.style.setProperty('--mx', `${lx.toFixed(1)}px`);
    ref.current.style.setProperty('--my', `${ly.toFixed(1)}px`);
    ref.current.style.setProperty('--glint-shift', `${((py - 0.5) * 28).toFixed(1)}%`);
    if (canTilt) {
      rawY.set((px - 0.5) * 2 * maxTilt);
      rawX.set(-(py - 0.5) * 2 * maxTilt);
    }
  };

  const handleLeave = () => {
    rectRef.current = null;
    rawX.set(0);
    rawY.set(0);
    ref.current?.style.setProperty('--glint-shift', '0%');
    onMouseLeave?.();
  };

  return (
    <motion.div
      ref={ref}
      data-cursor={cursorMode}
      className={`depth-surface ${beamAlwaysOn ? 'depth-surface--beam-live' : ''} ${className}`.trim()}
      style={
        canTilt
          ? {
              rotateX,
              rotateY,
              transformPerspective: 1050,
            }
          : undefined
      }
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      <div className="depth-surface__liquid-glint" aria-hidden="true" />
      <div className="depth-surface__beam" aria-hidden="true" />
      <div className="depth-surface__rim-spot" aria-hidden="true" />
      {children}
      <div className="depth-surface__sheen" aria-hidden="true" />
      <div className="depth-surface__corners" aria-hidden="true">
        <span className="ds-corner ds-corner--tl" />
        <span className="ds-corner ds-corner--tr" />
        <span className="ds-corner ds-corner--bl" />
        <span className="ds-corner ds-corner--br" />
      </div>
    </motion.div>
  );
}

interface MagneticWrapProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export function MagneticWrap({ children, strength = 6, className = '' }: MagneticWrapProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 20 });
  const springY = useSpring(y, { stiffness: 260, damping: 20 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(fine && !reduced);
  }, []);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 2 * strength;
    const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 2 * strength;
    x.set(dx);
    y.set(dy);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`magnetic-wrap ${className}`.trim()}
      style={enabled ? { x: springX, y: springY } : undefined}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}

export type Scroll3DVariant = 'unfold' | 'wing-left' | 'wing-right';

interface ScrollDepth3DProps {
  children: ReactNode;
  className?: string;
  variant?: Scroll3DVariant;
}

/**
 * Zero-Scroll-Thrash Bidirectional 3D Perspective Stage:
 * - Uses IntersectionObserver + WAAPI compositor reveal instead of per-pixel JS scroll inline style writes
 * - Unfolds smoothly in 3D when entering viewport (both scrolling down & up) with 0 scroll-tick recalc cost
 */
export function ScrollDepth3D({
  children,
  className = '',
  variant = 'unfold',
}: ScrollDepth3DProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isVisible = useBidirectionalReveal(ref, '-20px 0px -10px 0px', 0.02);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const enterRotX = variant === 'unfold' ? -14 : -10;
  const enterRotY = variant === 'wing-left' ? 10 : variant === 'wing-right' ? -10 : 0;

  return (
    <div ref={ref} className={`scroll-depth-stage ${className}`.trim()}>
      <motion.div
        className="scroll-depth-inner"
        initial={{ opacity: 0.12, y: 32, rotateX: enterRotX, rotateY: enterRotY, scale: 0.95 }}
        animate={
          isVisible
            ? {
                opacity: 1,
                y: 0,
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                transition: { duration: 0.62, ease: EASE_EXPO },
              }
            : {
                opacity: 0.12,
                y: 32,
                rotateX: enterRotX,
                rotateY: enterRotY,
                scale: 0.95,
                transition: { duration: 0.01 },
              }
        }
        style={{ transformOrigin: '50% 92%', transformPerspective: 1200 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

interface RevealBlockProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: Scroll3DVariant;
}

export function RevealBlock({
  children,
  className = '',
  variant = 'unfold',
}: RevealBlockProps) {
  return (
    <ScrollDepth3D className={className} variant={variant}>
      {children}
    </ScrollDepth3D>
  );
}

const HEADLINE_WORD = {
  hidden: {
    rotateX: -56,
    y: 24,
    scale: 0.9,
    opacity: 0,
    transition: { duration: 0.01 },
  },
  visible: (delay: number) => ({
    rotateX: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 205,
      damping: 23,
      mass: 0.82,
      delay,
    },
  }),
};

const HEADLINE_PILL = {
  hidden: {
    scaleX: 0.22,
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
      mass: 0.78,
      delay,
    },
  }),
};

const HEADLINE_MARKER_WIPE = {
  hidden: {
    scaleX: 0,
    transition: { duration: 0.01 },
  },
  visible: (delay: number) => ({
    scaleX: 1,
    transition: { duration: 0.52, delay, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const HEADLINE_BLOCK_SWEEP = {
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
      duration: 0.54,
      delay,
      ease: [0.76, 0, 0.24, 1] as const,
      times: [0, 0.42, 0.54, 1],
    },
  }),
};

interface MotionHeadlineProps {
  id?: string;
  text: string;
  className?: string;
  pillText?: string;
  pillVariant?: 'live' | 'solar' | 'glass';
}

/**
 * Apple iPhone / Made-by-Google Commercial Kinetic Title Card:
 * - Solid white lead words with 3D Flip-In + crisp commercial block flash
 * - Inline morphing capsule pill (`[● LIVE]`, `[✦ 07]`, `[✦]`, `[&]`) expanding between clauses
 * - Vibrant Solar-Orange Highlight Marker Wipe sweeping behind the emphasis phrase
 */
export function MotionHeadline({
  id,
  text,
  className = '',
  pillText,
  pillVariant = 'glass',
}: MotionHeadlineProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const isVisible = useBidirectionalReveal(headingRef, '-36px 0px -8px 0px', 0.05);

  const words = text.trim().split(/\s+/);
  const ampIdx = words.indexOf('&');
  const dotIdx = words.indexOf('·');
  const sepIdx = ampIdx > 0 ? ampIdx : dotIdx > 0 ? dotIdx : -1;

  let leadWords: string[];
  let accentWords: string[];
  let connectorLabel = pillText;
  let connectorVariant = pillVariant;

  if (sepIdx > 0) {
    leadWords = words.slice(0, sepIdx);
    accentWords = words.slice(sepIdx + 1);
    if (!connectorLabel) {
      connectorLabel = words[sepIdx] === '·' ? '✦' : words[sepIdx];
    }
  } else {
    const splitAt = words.length >= 4 ? words.length - 2 : Math.max(1, words.length - 1);
    leadWords = words.slice(0, splitAt);
    accentWords = words.slice(splitAt);
  }

  const pillDelay = leadWords.length * 0.065 + 0.04;
  const markerDelay = pillDelay + (connectorLabel ? 0.1 : 0.02);

  return (
    <h2
      ref={headingRef}
      id={id}
      className={`motion-headline ${className}`.trim()}
      data-active={isVisible ? 'true' : 'false'}
    >
      {leadWords.map((word, idx) => (
        <span className="motion-headline__mask motion-headline__mask--sweep" key={`lead-${word}-${idx}`}>
          <motion.span
            className="motion-headline__word chrome-text chrome-text--platinum"
            custom={idx * 0.06}
            variants={HEADLINE_WORD}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
            style={{ transformPerspective: 1100 }}
          >
            <span className="chrome-text__depth" aria-hidden="true">
              {word}
            </span>
            <span className="chrome-text__face">{word}</span>
          </motion.span>
          <motion.span
            className="title-block-sweep title-block-sweep--light"
            aria-hidden="true"
            custom={idx * 0.05}
            variants={HEADLINE_BLOCK_SWEEP}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
          />
        </span>
      ))}

      {connectorLabel && connectorLabel === '&' && (
        <motion.span
          className="motion-headline__amp chrome-text chrome-text--hollow-amp"
          custom={pillDelay}
          variants={HEADLINE_WORD}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          style={{ transformPerspective: 1100 }}
        >
          <span className="chrome-text__depth" aria-hidden="true">
            &amp;
          </span>
          <span className="chrome-text__face">&amp;</span>
        </motion.span>
      )}

      {connectorLabel && connectorLabel === '✦' && (
        <motion.span
          className="title-mg-glyph"
          custom={pillDelay}
          variants={HEADLINE_PILL}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L14.3 9.7L22 12L14.3 14.3L12 22L9.7 14.3L2 12L9.7 9.7L12 2Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      )}

      {connectorLabel && connectorLabel !== '&' && connectorLabel !== '✦' && (
        <motion.span
          className={`title-mg-tag title-mg-tag--${connectorVariant}`}
          custom={pillDelay}
          variants={HEADLINE_PILL}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
        >
          <span className="title-mg-tag__corners" aria-hidden="true" />
          {connectorVariant === 'live' ? (
            <>
              <span className="title-mg-tag__radar" aria-hidden="true">
                <i />
              </span>
              <span className="title-mg-tag__label mono-num">{connectorLabel}</span>
            </>
          ) : (
            <span className="title-mg-tag__count mono-num">
              <i aria-hidden="true">/</i>
              <b>{connectorLabel}</b>
            </span>
          )}
        </motion.span>
      )}

      {accentWords.length > 0 && (
        <motion.span
          className="motion-headline__marker"
          custom={markerDelay}
          variants={HEADLINE_WORD}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          style={{ transformPerspective: 1100 }}
        >
          <motion.span
            className="motion-headline__marker-fill"
            aria-hidden="true"
            custom={markerDelay + 0.08}
            variants={HEADLINE_MARKER_WIPE}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
          />
          <span className="motion-headline__marker-text">{accentWords.join(' ')}</span>
        </motion.span>
      )}
    </h2>
  );
}

interface AnimatedRuleProps {
  className?: string;
  sectionIndex?: string;
  sectionLabel?: string;
}

export function AnimatedRule({ className = '', sectionIndex, sectionLabel }: AnimatedRuleProps) {
  const ruleRef = useRef<HTMLDivElement | null>(null);
  const isVisible = useBidirectionalReveal(ruleRef, '-72px 0px -16px 0px', 0.1);

  return (
    <div ref={ruleRef} className={`section-chapter ${className}`.trim()} data-active={isVisible ? 'true' : 'false'}>
      {(sectionIndex || sectionLabel) && (
        <motion.div
          className="section-chapter__meta"
          initial={{ opacity: 0, rotateX: -58, y: 12, scale: 0.9 }}
          animate={
            isVisible
              ? {
                  opacity: 1,
                  rotateX: 0,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.48, ease: EASE_EXPO },
                }
              : {
                  opacity: 0,
                  rotateX: -58,
                  y: 12,
                  scale: 0.9,
                  transition: { duration: 0.01 },
                }
          }
          style={{ transformOrigin: '50% 85%', transformPerspective: 900 }}
        >
          <span className="section-chapter__glyph" aria-hidden="true" />
          {sectionIndex && <span className="section-chapter__num mono-num">{sectionIndex}</span>}
          {sectionLabel && <span className="section-chapter__name">{sectionLabel}</span>}
        </motion.div>
      )}
      <motion.div
        className="spatial-rule"
        initial={{ scaleX: 0.08, opacity: 0.35 }}
        animate={
          isVisible
            ? { scaleX: 1, opacity: 1, transition: { duration: 0.56, ease: EASE_EXPO } }
            : { scaleX: 0.08, opacity: 0.35, transition: { duration: 0.01 } }
        }
        aria-hidden="true"
      >
        <span className="spatial-rule__node" />
        <span className="spatial-rule__pulse" />
      </motion.div>
      {sectionIndex && (
        <span className="section-chapter__ticks mono-num" aria-hidden="true">
          /// CH.{sectionIndex}
        </span>
      )}
    </div>
  );
}

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({ value, suffix = '', className = '' }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(value);
  const [hasEntered, setHasEntered] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);
  const currentRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!hasEntered) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      currentRef.current = value;
      setDisplay(value);
      return;
    }
    const from = currentRef.current;
    const to = value;
    if (from === to) {
      setDisplay(to);
      return;
    }

    const duration = 680;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextVal = Math.round(from + (to - from) * eased);
      currentRef.current = nextVal;
      setDisplay(nextVal);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, hasEntered]);

  return (
    <span ref={ref} className={`mono-num ${className}`.trim()}>
      {display.toLocaleString('en-US')}
      {suffix}
    </span>
  );
}
