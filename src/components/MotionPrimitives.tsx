import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
} from 'motion/react';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function ScrollProgressRail() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  return <motion.div className="scroll-rail" style={{ scaleX }} aria-hidden="true" />;
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.48, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedRule({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`animated-rule ${className}`.trim()}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: EASE_OUT }}
      aria-hidden="true"
    />
  );
}

interface TiltPlateProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export function TiltPlate({ children, className = '', maxTilt = 4.2 }: TiltPlateProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(rawX, { stiffness: 220, damping: 24 });
  const rotateY = useSpring(rawY, { stiffness: 220, damping: 24 });
  const [canTilt, setCanTilt] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setCanTilt(fine && !reduced);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canTilt || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rawY.set((px - 0.5) * 2 * maxTilt);
    rawX.set(-(py - 0.5) * 2 * maxTilt);
    ref.current.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    ref.current.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  };

  const handlePointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`cast-plate tilt-plate ${className}`.trim()}
      style={
        canTilt
          ? {
              rotateX,
              rotateY,
              transformPerspective: 950,
            }
          : undefined
      }
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
      <div className="tilt-plate__sheen" aria-hidden="true" />
    </motion.div>
  );
}

interface MagneticWrapProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export function MagneticWrap({ children, strength = 4, className = '' }: MagneticWrapProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 20 });
  const springY = useSpring(y, { stiffness: 280, damping: 20 });
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

    const duration = 700;
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
    <span ref={ref} className={`num-year ${className}`.trim()}>
      {display.toLocaleString('en-US')}
      {suffix}
    </span>
  );
}
