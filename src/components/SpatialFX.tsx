import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { useSpatial } from './SpatialContext';

const EASE_EXPO = [0.22, 1, 0.36, 1] as const;

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

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        el.style.opacity = '1';
      }
    };

    const onLeave = () => {
      visible = false;
      el.style.opacity = '0';
    };

    const tick = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      el.style.transform = `translate3d(${(cx - 260).toFixed(1)}px, ${(cy - 260).toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <div ref={orbRef} className="pointer-spotlight" aria-hidden="true" />;
}

const TICKER_ITEMS = [
  'SHADYFYRIX',
  'MAGNETIC FLOW',
  'HORIZONTAL GALLERY',
  '3D BEDROCK',
  'COMPUTER VISION',
  'WASAPI AUDIO FFT',
  'ARKNIGHTS CHIBI',
  'BORDER BEAM FX',
];

export function KineticTickerBand() {
  const track = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="kinetic-ticker" aria-hidden="true">
      <div className="kinetic-ticker__track">
        {track.map((label, idx) => (
          <span className="kinetic-ticker__item" key={`${label}-${idx}`}>
            <span className="kinetic-ticker__glyph">{idx % 2 === 0 ? '◆' : '///'}</span>
            <span>{label}</span>
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
    const freqData = new Uint8Array(64);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(240, Math.floor(rect.width));
      const h = Math.max(48, Math.floor(rect.height));

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
        const pointerPeak = Math.exp(-Math.pow((norm - px) * 5.2, 2));
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

        ctx.fillStyle = i % 7 === 0 ? '#ff6a45' : i % 3 === 0 ? '#9b5cff' : '#36e5ff';
        ctx.fillRect(x, y, barW, barH);
      }

      if (!reduced) {
        raf = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => cancelAnimationFrame(raf);
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

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const lx = e.clientX - rect.left;
    const ly = e.clientY - rect.top;
    const px = lx / Math.max(1, rect.width);
    const py = ly / Math.max(1, rect.height);
    ref.current.style.setProperty('--mx', `${lx.toFixed(1)}px`);
    ref.current.style.setProperty('--my', `${ly.toFixed(1)}px`);
    if (canTilt) {
      rawY.set((px - 0.5) * 2 * maxTilt);
      rawX.set(-(py - 0.5) * 2 * maxTilt);
    }
  };

  const handleLeave = () => {
    rawX.set(0);
    rawY.set(0);
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
      onPointerEnter={onMouseEnter}
      onPointerLeave={handleLeave}
    >
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

interface RevealBlockProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function RevealBlock({ children, delay = 0, className }: RevealBlockProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0.14, y: 22, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 'some' }}
      transition={{ duration: 0.46, delay, ease: EASE_EXPO }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedRuleProps {
  className?: string;
  sectionIndex?: string;
  sectionLabel?: string;
}

export function AnimatedRule({ className = '', sectionIndex, sectionLabel }: AnimatedRuleProps) {
  return (
    <div className={`section-chapter ${className}`.trim()}>
      {(sectionIndex || sectionLabel) && (
        <motion.div
          className="section-chapter__meta"
          initial={{ opacity: 0.18, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 'some' }}
          transition={{ duration: 0.4, ease: EASE_EXPO }}
        >
          {sectionIndex && <span className="section-chapter__num mono-num">{sectionIndex}</span>}
          {sectionLabel && <span className="section-chapter__name">{sectionLabel}</span>}
        </motion.div>
      )}
      <motion.div
        className="spatial-rule"
        initial={{ scaleX: 0.08, opacity: 0.35 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: false, amount: 'some' }}
        transition={{ duration: 0.56, ease: EASE_EXPO }}
        aria-hidden="true"
      >
        <span className="spatial-rule__node" />
      </motion.div>
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
