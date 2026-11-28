import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EyeOff, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  EYJA_ACTIONS,
  EYJA_PAT_QUOTES,
  EYJA_SKILL_QUOTES,
  EYJA_SKINS,
  getEyjaClipSrc,
} from '../data/eyja';
import type { EyjaActionId } from '../data/eyja';
import { useSpatial } from './SpatialContext';

interface SparkleBurst {
  id: number;
  dx: number;
  dy: number;
  glyph: string;
}

const QUICK_ACTIONS: EyjaActionId[] = ['move', 'relax', 'sit', 'sleep', 'interact', 'attack', 'skill'];
const EYJA_ACTION_MAP = new Map(EYJA_ACTIONS.map((meta) => [meta.id, meta]));

export function EyjaCompanion() {
  const { locale, t } = useLanguage();
  const {
    heroMode,
    eyjaSkin,
    setEyjaSkin,
    eyjaRoamerEnabled,
    toggleEyjaRoamer,
    eyjaReaction,
    triggerShockwave,
  } = useSpatial();

  const [action, setAction] = useState<EyjaActionId>('relax');
  const [facing, setFacing] = useState<1 | -1>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [popoverAlign, setPopoverAlign] = useState<'center' | 'left' | 'right'>('center');
  const [quote, setQuote] = useState<string | null>(null);
  const [sparkles, setSparkles] = useState<SparkleBurst[]>([]);
  const [nearHeroTop, setNearHeroTop] = useState(true);
  const [videoFallback, setVideoFallback] = useState(false);

  const roamerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const actionRef = useRef<EyjaActionId>('relax');
  const facingRef = useRef<1 | -1>(1);
  const menuOpenRef = useRef<boolean>(false);
  const xRef = useRef<number>(
    typeof window === 'undefined'
      ? 420
      : window.innerWidth < 760
        ? Math.max(24, window.innerWidth - 116)
        : Math.round(window.innerWidth * 0.45)
  );
  const velXRef = useRef<number>(0);
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ pointerX: 0, startX: 0, moved: 0 });
  const longPressTimerRef = useRef<number | null>(null);
  const longPressedRef = useRef(false);
  const lockedUntilRef = useRef<number>(0);
  const lastActivityRef = useRef<number>(Date.now());
  const quoteTimerRef = useRef<number | null>(null);
  const burstSeqRef = useRef<number>(1);
  const lastReactionNonceRef = useRef<number>(0);
  const startWalkRef = useRef<(() => void) | null>(null);

  const syncDomX = useCallback((x: number) => {
    const el = roamerRef.current;
    if (el) {
      el.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
    }
  }, []);

  const updatePopoverAlign = useCallback(() => {
    const x = xRef.current;
    const vw = window.innerWidth;
    if (x < 140) {
      setPopoverAlign('left');
    } else if (x > vw - 220) {
      setPopoverAlign('right');
    } else {
      setPopoverAlign('center');
    }
  }, []);

  const setActionSafe = useCallback((next: EyjaActionId, lockMs = 0) => {
    actionRef.current = next;
    setAction(next);
    if (lockMs > 0) {
      lockedUntilRef.current = performance.now() + lockMs;
    }
  }, []);

  const showQuote = useCallback((text: string, durationMs = 2400) => {
    setQuote(text);
    if (quoteTimerRef.current) window.clearTimeout(quoteTimerRef.current);
    quoteTimerRef.current = window.setTimeout(() => setQuote(null), durationMs);
  }, []);

  const emitSparkles = useCallback((glyphs: string[]) => {
    const items: SparkleBurst[] = glyphs.map((glyph, idx) => ({
      id: burstSeqRef.current++,
      dx: (idx - 1) * 24 + (Math.random() * 14 - 7),
      dy: -24 - Math.random() * 24,
      glyph,
    }));
    setSparkles((prev) => [...prev.slice(-6), ...items]);
    window.setTimeout(() => {
      const ids = new Set(items.map((item) => item.id));
      setSparkles((prev) => prev.filter((item) => !ids.has(item.id)));
    }, 950);
  }, []);

  useEffect(() => {
    menuOpenRef.current = menuOpen;
    if (menuOpen) {
      updatePopoverAlign();
    }
  }, [menuOpen, updatePopoverAlign]);

  // Close menu when clicking outside Eyja & popover
  useEffect(() => {
    if (!menuOpen) return;
    const onOutsideDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (roamerRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onOutsideDown);
    window.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('pointerdown', onOutsideDown);
      window.removeEventListener('keydown', onEsc);
    };
  }, [menuOpen]);

  // Track whether hero showcase is in view so we avoid duplicate Eyja when Hero tab = eyja-chibi
  useEffect(() => {
    let threshold = Math.max(380, window.innerHeight * 0.55);
    let lastNear = window.scrollY < threshold;
    setNearHeroTop(lastNear);

    const onResize = () => {
      threshold = Math.max(380, window.innerHeight * 0.55);
    };
    const onScroll = () => {
      const next = window.scrollY < threshold;
      if (next !== lastNear) {
        lastNear = next;
        setNearHeroTop(next);
      }
    };
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Warm browser HTTP cache for active skin clips via lightweight fetch without holding 7 video decoders open
  useEffect(() => {
    const controller = new AbortController();
    for (const meta of EYJA_ACTIONS) {
      void fetch(getEyjaClipSrc(eyjaSkin, meta.id), { signal: controller.signal }).catch(
        () => undefined
      );
    }
    return () => controller.abort();
  }, [eyjaSkin]);

  // Single hardware-decoded video element: zero 7-decoder GPU contention
  useEffect(() => {
    setVideoFallback(false);
    const v = videoRef.current;
    if (!v) return;
    const playPromise = v.play();
    if (playPromise) {
      void playPromise.catch(() => undefined);
    }
  }, [eyjaSkin, action, eyjaRoamerEnabled]);

  // Sync initial DOM transform when mounted/enabled
  useEffect(() => {
    if (!eyjaRoamerEnabled) return;
    syncDomX(xRef.current);
  }, [eyjaRoamerEnabled, syncDomX]);

  // Synchronize with site-wide WebGL reactions (Bounce, NotGunGun SFX, Pulse)
  useEffect(() => {
    if (eyjaReaction.nonce === 0 || eyjaReaction.nonce === lastReactionNonceRef.current) return;
    lastReactionNonceRef.current = eyjaReaction.nonce;
    lastActivityRef.current = Date.now();
    if (!eyjaRoamerEnabled) return;

    if (eyjaReaction.kind === 'skill') {
      setActionSafe(eyjaReaction.action, 2800);
      const line = EYJA_SKILL_QUOTES[eyjaReaction.nonce % EYJA_SKILL_QUOTES.length];
      showQuote(t(line), 2200);
      emitSparkles(['✦', '🔥', '✦']);
    } else {
      setActionSafe('interact', 1700);
      emitSparkles(['✦', '♪', '✦']);
    }
  }, [eyjaReaction, eyjaRoamerEnabled, setActionSafe, showQuote, emitSparkles, t]);

  // Track general user activity so Eyja can peacefully nap when AFK
  useEffect(() => {
    const bump = () => {
      lastActivityRef.current = Date.now();
      if (actionRef.current === 'sleep' && performance.now() > lockedUntilRef.current) {
        setActionSafe('relax', 1600);
      }
    };
    window.addEventListener('pointerdown', bump, { passive: true });
    window.addEventListener('keydown', bump, { passive: true });
    window.addEventListener('scroll', bump, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', bump);
      window.removeEventListener('keydown', bump);
      window.removeEventListener('scroll', bump);
    };
  }, [setActionSafe]);

  // Idle-sleeping 60 FPS GPU-driven Dorm AI loop (0 RAF frames when resting/sitting/sleeping!)
  useEffect(() => {
    if (!eyjaRoamerEnabled) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let decisionTimer: number | null = null;
    let lastTs = performance.now();
    let lastDrawTs = lastTs - 20;
    let viewportW = window.innerWidth;

    syncDomX(xRef.current);

    const scheduleDecision = (delayMs: number) => {
      if (decisionTimer) window.clearTimeout(decisionTimer);
      decisionTimer = window.setTimeout(() => {
        decisionTimer = null;
        if (document.hidden || reduced) {
          scheduleDecision(3500);
          return;
        }
        const now = performance.now();
        if (draggingRef.current || menuOpenRef.current || now < lockedUntilRef.current) {
          scheduleDecision(1600);
          return;
        }
        const minX = 28;
        const maxX = Math.max(minX + 40, viewportW - 134);
        const idleMs = Date.now() - lastActivityRef.current;
        if (idleMs > 24000) {
          setActionSafe('sleep');
          scheduleDecision(7000);
        } else {
          const r = Math.random();
          if (r < 0.48) {
            if (xRef.current < minX + 95) {
              facingRef.current = 1;
            } else if (xRef.current > maxX - 95) {
              facingRef.current = -1;
            } else {
              facingRef.current = Math.random() < 0.5 ? 1 : -1;
            }
            setFacing(facingRef.current);
            setActionSafe('move');
            startWalkLoop();
            scheduleDecision(4200 + Math.random() * 3400);
          } else if (r < 0.78) {
            setActionSafe('relax');
            scheduleDecision(3400 + Math.random() * 2800);
          } else {
            setActionSafe('sit');
            scheduleDecision(4800 + Math.random() * 3200);
          }
        }
      }, delayMs);
    };

    const tickWalk = (now: number) => {
      rafId = 0;
      if (document.hidden) {
        lastTs = now;
        rafId = requestAnimationFrame(tickWalk);
        return;
      }
      if (now - lastDrawTs < 15.5) {
        rafId = requestAnimationFrame(tickWalk);
        return;
      }
      lastDrawTs = now;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;

      const minX = 28;
      const maxX = Math.max(minX + 40, viewportW - 134);
      const shouldWalk = actionRef.current === 'move' && !menuOpenRef.current && !draggingRef.current && !reduced;
      const cruiseSpeed = viewportW < 760 ? 44 : 62;
      const targetVel = shouldWalk ? facingRef.current * cruiseSpeed : 0;

      velXRef.current += (targetVel - velXRef.current) * Math.min(1, dt * 8.5);

      if (Math.abs(velXRef.current) > 0.25) {
        let nx = xRef.current + velXRef.current * dt;
        if (nx <= minX) {
          nx = minX;
          facingRef.current = 1;
          velXRef.current = Math.abs(velXRef.current) * 0.5;
          setFacing(1);
        } else if (nx >= maxX) {
          nx = maxX;
          facingRef.current = -1;
          velXRef.current = -Math.abs(velXRef.current) * 0.5;
          setFacing(-1);
        }
        xRef.current = nx;
        syncDomX(nx);
        rafId = requestAnimationFrame(tickWalk);
      } else if (shouldWalk) {
        rafId = requestAnimationFrame(tickWalk);
      } else {
        velXRef.current = 0;
      }
    };

    const startWalkLoop = () => {
      if (!rafId && !reduced) {
        lastTs = performance.now();
        lastDrawTs = lastTs - 20;
        rafId = requestAnimationFrame(tickWalk);
      }
    };
    startWalkRef.current = startWalkLoop;

    const onResize = () => {
      viewportW = window.innerWidth;
      const clamped = Math.max(24, Math.min(viewportW - 128, xRef.current));
      xRef.current = clamped;
      syncDomX(clamped);
    };

    window.addEventListener('resize', onResize, { passive: true });
    if (actionRef.current === 'move') startWalkLoop();
    scheduleDecision(3200);

    return () => {
      startWalkRef.current = null;
      if (rafId) cancelAnimationFrame(rafId);
      if (decisionTimer) window.clearTimeout(decisionTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [eyjaRoamerEnabled, setActionSafe, syncDomX]);

  useEffect(() => {
    if (action === 'move') {
      startWalkRef.current?.();
    }
  }, [action]);

  useEffect(() => {
    return () => {
      if (quoteTimerRef.current) window.clearTimeout(quoteTimerRef.current);
      if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    };
  }, []);

  if (!eyjaRoamerEnabled) return null;

  const hiddenForHeroShowcase = heroMode === 'eyja-chibi' && nearHeroTop;

  const handlePat = () => {
    lastActivityRef.current = Date.now();
    if (actionRef.current === 'interact') {
      setActionSafe('skill', 3000);
      const q = EYJA_SKILL_QUOTES[Math.floor(Math.random() * EYJA_SKILL_QUOTES.length)];
      showQuote(t(q), 2400);
      emitSparkles(['✦', '🔥', '✦']);
      triggerShockwave(0.95, 1);
    } else {
      setActionSafe('interact', 2000);
      const q = EYJA_PAT_QUOTES[Math.floor(Math.random() * EYJA_PAT_QUOTES.length)];
      showQuote(t(q), 2100);
      emitSparkles(['♥', '✦', '♪']);
      triggerShockwave(0.55, 0);
    }
  };

  const openOrToggleMenu = () => {
    lastActivityRef.current = Date.now();
    setMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        updatePopoverAlign();
        if (actionRef.current === 'move' || actionRef.current === 'sleep') {
          setActionSafe('relax', 1800);
        }
      }
      return next;
    });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    draggingRef.current = true;
    longPressedRef.current = false;
    velXRef.current = 0;
    setIsDragging(true);
    dragStartRef.current = { pointerX: e.clientX, startX: xRef.current, moved: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    // Touch long-press fallback (~450ms) to open menu cleanly on mobile
    if (e.pointerType === 'touch') {
      if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = window.setTimeout(() => {
        if (dragStartRef.current.moved < 8) {
          longPressedRef.current = true;
          draggingRef.current = false;
          setIsDragging(false);
          openOrToggleMenu();
        }
      }, 450);
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.pointerX;
    dragStartRef.current.moved = Math.max(dragStartRef.current.moved, Math.abs(dx));
    if (dragStartRef.current.moved > 6 && longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (Math.abs(dx) > 4) {
      const nextFacing: 1 | -1 = dx >= 0 ? 1 : -1;
      if (nextFacing !== facingRef.current) {
        facingRef.current = nextFacing;
        setFacing(nextFacing);
      }
      const nextX = Math.max(
        20,
        Math.min(window.innerWidth - 120, dragStartRef.current.startX + dx)
      );
      xRef.current = nextX;
      syncDomX(nextX);
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore released pointer
    }

    if (longPressedRef.current) return;

    lastActivityRef.current = Date.now();
    if (dragStartRef.current.moved < 8) {
      // Left-click = headpat / interact cleanly (does NOT pop open menu!)
      if (menuOpenRef.current) {
        setMenuOpen(false);
      }
      handlePat();
    } else {
      updatePopoverAlign();
      setActionSafe('interact', 1400);
      emitSparkles(['✦', '♪']);
    }
  };

  return (
    <div
      ref={roamerRef}
      className={`eyja-roamer ${hiddenForHeroShowcase ? 'eyja-roamer--receded' : ''} ${
        isDragging ? 'eyja-roamer--dragging' : ''
      }`}
      aria-label={
        locale === 'vi'
          ? 'Eyja Chibi đồng hành — click trái để xoa đầu, chuột phải để mở menu, kéo để di chuyển'
          : 'Eyja Chibi companion — left-click to headpat, right-click to open menu, drag to move'
      }
    >
      <AnimatePresence>
        {quote && !menuOpen && (
          <motion.div
            key="eyja-quote"
            className="eyja-roamer__bubble"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {quote}
          </motion.div>
        )}
      </AnimatePresence>

      {action === 'sleep' && (
        <span className="eyja-roamer__zzz" aria-hidden="true">
          zZz
        </span>
      )}

      <div className="eyja-roamer__sparkles" aria-hidden="true">
        {sparkles.map((sp) => (
          <motion.span
            key={sp.id}
            className="eyja-roamer__spark"
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.7 }}
            animate={{ opacity: 0, x: sp.dx, y: sp.dy, scale: 1.25 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
          >
            {sp.glyph}
          </motion.span>
        ))}
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={`eyja-popover ${
              popoverAlign === 'left'
                ? 'eyja-popover--align-left'
                : popoverAlign === 'right'
                  ? 'eyja-popover--align-right'
                  : ''
            }`}
            role="dialog"
            aria-label={locale === 'vi' ? 'Tủ đồ & hành động Eyja' : 'Eyja wardrobe and actions'}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.18 }}
          >
            <div className="eyja-popover__head">
              <span className="eyja-popover__title">
                <Sparkles size={13} aria-hidden="true" />
                Eyja Chibi
              </span>
              <div className="eyja-popover__head-actions">
                <button
                  type="button"
                  className="eyja-popover__icon-btn"
                  onClick={() => {
                    setMenuOpen(false);
                    toggleEyjaRoamer();
                  }}
                  title={locale === 'vi' ? 'Ẩn Eyja đi dạo' : 'Hide Eyja companion'}
                  aria-label={locale === 'vi' ? 'Ẩn Eyja đi dạo' : 'Hide Eyja companion'}
                >
                  <EyeOff size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="eyja-popover__icon-btn"
                  onClick={() => setMenuOpen(false)}
                  aria-label={locale === 'vi' ? 'Đóng' : 'Close'}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="eyja-popover__group">
              <span className="eyja-popover__label">
                {locale === 'vi' ? '6 Trang phục' : '6 Outfits'}
              </span>
              <div className="eyja-popover__grid">
                {EYJA_SKINS.map((skin) => (
                  <button
                    key={skin.id}
                    type="button"
                    className={`eyja-chip ${eyjaSkin === skin.id ? 'is-active' : ''}`}
                    onClick={() => {
                      setEyjaSkin(skin.id);
                      setActionSafe('interact', 1500);
                    }}
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
            </div>

            <div className="eyja-popover__group">
              <span className="eyja-popover__label">
                {locale === 'vi' ? 'Hành động' : 'Actions'}
              </span>
              <div className="eyja-popover__grid">
                {QUICK_ACTIONS.map((actId) => {
                  const meta = EYJA_ACTION_MAP.get(actId) ?? EYJA_ACTIONS[0];
                  return (
                    <button
                      key={actId}
                      type="button"
                      className={`eyja-chip ${action === actId ? 'is-active' : ''}`}
                      onClick={() => {
                        lastActivityRef.current = Date.now();
                        setActionSafe(
                          actId,
                          actId === 'sleep' || actId === 'sit' || actId === 'move' ? 14000 : 4200
                        );
                        if (actId === 'skill' || actId === 'attack') {
                          triggerShockwave(0.95, 1);
                          emitSparkles(['✦', '🔥', '✦']);
                          const q =
                            EYJA_SKILL_QUOTES[
                              Math.floor(Math.random() * EYJA_SKILL_QUOTES.length)
                            ];
                          showQuote(t(q), 2200);
                        } else if (actId === 'interact') {
                          triggerShockwave(0.55, 0);
                          emitSparkles(['♥', '✦', '♪']);
                          const q =
                            EYJA_PAT_QUOTES[Math.floor(Math.random() * EYJA_PAT_QUOTES.length)];
                          showQuote(t(q), 2000);
                        }
                        if (actId === 'move') {
                          setMenuOpen(false);
                        }
                      }}
                    >
                      {t(meta.label)}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Single 60-FPS hardware-composited video decoder (clips pre-cached in HTTP cache) */}
      <div
        className={`eyja-roamer__stage eyja-roamer__stage--${action}`}
        style={{ transform: `scaleX(${facing})` }}
        aria-hidden="true"
      >
        {!videoFallback ? (
          (() => {
            const meta = EYJA_ACTION_MAP.get(action) ?? EYJA_ACTIONS[0];
            return (
              <video
                ref={videoRef}
                className="eyja-roamer__video is-current"
                src={getEyjaClipSrc(eyjaSkin, action)}
                preload="auto"
                muted
                playsInline
                autoPlay
                loop={meta.loop}
                onEnded={() => {
                  if (!meta.loop && actionRef.current === action) {
                    setActionSafe('relax', 1200);
                  }
                }}
                onError={() => setVideoFallback(true)}
              />
            );
          })()
        ) : (
          <img
            src="/brand-logo.png"
            alt=""
            className="eyja-roamer__fallback"
            width={92}
            height={92}
          />
        )}
      </div>

      <span className="eyja-roamer__shadow" aria-hidden="true" />

      {/* Left-click = headpat/interact; Right-click = open menu; Drag = slide */}
      <div
        className="eyja-roamer__hitbox"
        role="button"
        tabIndex={0}
        aria-expanded={menuOpen}
        aria-label={
          locale === 'vi'
            ? 'Click trái để xoa đầu Eyja, chuột phải để mở menu trang phục & hành động, kéo để di chuyển'
            : 'Left-click to headpat Eyja, right-click to open wardrobe menu, drag to move'
        }
        title={
          locale === 'vi'
            ? 'Click trái: xoa đầu · Chuột phải: mở menu · Kéo: di chuyển'
            : 'Left-click: pat · Right-click: menu · Drag: move'
        }
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onContextMenu={(e) => {
          e.preventDefault();
          openOrToggleMenu();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handlePat();
          } else if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
            e.preventDefault();
            openOrToggleMenu();
          }
        }}
      />
    </div>
  );
}
