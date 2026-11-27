import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { MutableRefObject, ReactNode } from 'react';
import type { EyjaActionId, EyjaSkinId } from '../data/eyja';

export type HeroStageMode =
  | 'shady-cube'
  | 'notgungun-3d'
  | 'vibe-gif-studio'
  | 'examguard-ai'
  | 'eyja-chibi';

export interface EyjaReactionEvent {
  nonce: number;
  action: EyjaActionId;
  kind: 'pat' | 'skill' | 'cheer';
}

export interface SpatialLiveState {
  pointerX: number;
  pointerY: number;
  pointerClientX: number;
  pointerClientY: number;
  pointerVel: number;
  scrollProgress: number;
  scrollVel: number;
  pulseStrength: number;
  pulseTime: number;
  pulseColorMode: number; // 0 = cyan, 1 = solar ember, 2 = cobalt
  pulseNonce: number;
  recoil: number;
  cubeJumpVel: number;
  cubeJumpY: number;
  cubeFlipTarget: number;
  cubeFlipCurrent: number;
  audioEnergy: number;
  rotTargetX: number;
  rotTargetY: number;
  isDragging: boolean;
  wireframe: boolean;
  autoSpin: boolean;
  heroMode: HeroStageMode;
  hoveredProjectIndex: number;
}

interface SpatialContextValue {
  liveRef: MutableRefObject<SpatialLiveState>;
  analyserRef: MutableRefObject<AnalyserNode | null>;
  heroMode: HeroStageMode;
  setHeroMode: (mode: HeroStageMode) => void;
  eyjaSkin: EyjaSkinId;
  setEyjaSkin: (skin: EyjaSkinId) => void;
  eyjaAction: EyjaActionId;
  setEyjaAction: (action: EyjaActionId) => void;
  eyjaRoamerEnabled: boolean;
  toggleEyjaRoamer: () => void;
  eyjaReaction: EyjaReactionEvent;
  triggerEyjaReaction: (action: EyjaActionId, kind?: 'pat' | 'skill' | 'cheer') => void;
  wireframe: boolean;
  toggleWireframe: () => void;
  autoSpin: boolean;
  toggleAutoSpin: () => void;
  playingAudio: string | null;
  playAudioSample: (id: string, src: string, impulse?: number) => void;
  triggerShockwave: (strength?: number, colorMode?: number) => void;
  triggerCubeBounce: () => void;
  resetCamera: () => void;
  nudgeOrbit: (dx: number, dy: number) => void;
  setDragging: (dragging: boolean) => void;
  setHoveredProject: (index: number) => void;
  webglReady: boolean;
  setWebglReady: (ready: boolean) => void;
}

const DEFAULT_ROT_X = 0.22;
const DEFAULT_ROT_Y = -0.52;

const SpatialContext = createContext<SpatialContextValue | null>(null);

export function SpatialProvider({ children }: { children: ReactNode }) {
  const [heroMode, setHeroModeState] = useState<HeroStageMode>('shady-cube');
  const [eyjaSkin, setEyjaSkinState] = useState<EyjaSkinId>('medic-default');
  const [eyjaAction, setEyjaActionState] = useState<EyjaActionId>('relax');
  const [eyjaRoamerEnabled, setEyjaRoamerEnabled] = useState(true);
  const [eyjaReaction, setEyjaReaction] = useState<EyjaReactionEvent>({
    nonce: 0,
    action: 'relax',
    kind: 'cheer',
  });
  const [wireframe, setWireframe] = useState(false);
  const [autoSpin, setAutoSpin] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [webglReady, setWebglReady] = useState(false);

  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaSourceMapRef = useRef<WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>>(
    new WeakMap()
  );

  const liveRef = useRef<SpatialLiveState>({
    pointerX: 0,
    pointerY: 0,
    pointerClientX: 0.65,
    pointerClientY: 0.42,
    pointerVel: 0,
    scrollProgress: 0,
    scrollVel: 0,
    pulseStrength: 0,
    pulseTime: 10,
    pulseColorMode: 0,
    pulseNonce: 0,
    recoil: 0,
    cubeJumpVel: 0,
    cubeJumpY: 0,
    cubeFlipTarget: 0,
    cubeFlipCurrent: 0,
    audioEnergy: 0,
    rotTargetX: DEFAULT_ROT_X,
    rotTargetY: DEFAULT_ROT_Y,
    isDragging: false,
    wireframe: false,
    autoSpin: true,
    heroMode: 'shady-cube',
    hoveredProjectIndex: -1,
  });

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setAutoSpin(false);
      liveRef.current.autoSpin = false;
    }

    let lastY = window.scrollY;
    let lastPx = 0;
    let lastPy = 0;

    const onScroll = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      liveRef.current.scrollProgress = Math.max(0, Math.min(1, y / maxScroll));
      liveRef.current.scrollVel = Math.max(-1, Math.min(1, delta / 65));
    };

    const onPointerMove = (e: PointerEvent) => {
      const vw = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);
      const nx = (e.clientX / vw) * 2 - 1;
      const ny = -(e.clientY / vh) * 2 + 1;
      const speed = Math.hypot(nx - lastPx, ny - lastPy);
      lastPx = nx;
      lastPy = ny;
      liveRef.current.pointerX = nx;
      liveRef.current.pointerY = ny;
      liveRef.current.pointerClientX = e.clientX / vw;
      liveRef.current.pointerClientY = e.clientY / vh;
      liveRef.current.pointerVel = Math.min(1.6, liveRef.current.pointerVel + speed * 3.4);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        void audioCtxRef.current.close().catch(() => undefined);
      }
    };
  }, []);

  const triggerShockwave = useCallback((strength = 0.9, colorMode = 0) => {
    liveRef.current.pulseStrength = Math.max(liveRef.current.pulseStrength, strength);
    liveRef.current.pulseTime = 0;
    liveRef.current.pulseColorMode = colorMode;
    liveRef.current.pulseNonce += 1;
  }, []);

  const triggerEyjaReaction = useCallback(
    (action: EyjaActionId, kind: 'pat' | 'skill' | 'cheer' = 'cheer') => {
      setEyjaReaction((prev) => ({
        nonce: prev.nonce + 1,
        action,
        kind,
      }));
    },
    []
  );

  const setEyjaSkin = useCallback(
    (skin: EyjaSkinId) => {
      setEyjaSkinState(skin);
      triggerShockwave(0.6, skin.startsWith('caster') ? 1 : 0);
    },
    [triggerShockwave]
  );

  const setEyjaAction = useCallback(
    (action: EyjaActionId) => {
      setEyjaActionState(action);
      if (action === 'skill' || action === 'attack') {
        triggerShockwave(0.98, 1);
      } else if (action === 'interact') {
        triggerShockwave(0.6, 0);
      }
    },
    [triggerShockwave]
  );

  const toggleEyjaRoamer = useCallback(() => {
    setEyjaRoamerEnabled((prev) => !prev);
  }, []);

  const triggerCubeBounce = useCallback(() => {
    liveRef.current.cubeJumpVel = 6.2;
    liveRef.current.cubeFlipTarget -= Math.PI * 0.5;
    triggerShockwave(1.05, 0);
    triggerEyjaReaction('interact', 'cheer');
  }, [triggerShockwave, triggerEyjaReaction]);

  const setHeroMode = useCallback(
    (mode: HeroStageMode) => {
      setHeroModeState(mode);
      liveRef.current.heroMode = mode;
      triggerShockwave(
        0.9,
        mode === 'examguard-ai'
          ? 2
          : mode === 'vibe-gif-studio' || mode === 'eyja-chibi'
            ? 1
            : 0
      );
      if (mode === 'shady-cube') {
        liveRef.current.cubeJumpVel = 4.6;
        liveRef.current.cubeFlipTarget -= Math.PI * 0.5;
      }
    },
    [triggerShockwave]
  );

  const toggleWireframe = useCallback(() => {
    setWireframe((prev) => {
      const next = !prev;
      liveRef.current.wireframe = next;
      triggerShockwave(0.65, 0);
      return next;
    });
  }, [triggerShockwave]);

  const toggleAutoSpin = useCallback(() => {
    setAutoSpin((prev) => {
      const next = !prev;
      liveRef.current.autoSpin = next;
      return next;
    });
  }, []);

  const resetCamera = useCallback(() => {
    liveRef.current.rotTargetX = DEFAULT_ROT_X;
    liveRef.current.rotTargetY = DEFAULT_ROT_Y;
    liveRef.current.cubeFlipTarget = 0;
    triggerShockwave(0.6, 0);
  }, [triggerShockwave]);

  const nudgeOrbit = useCallback((dx: number, dy: number) => {
    liveRef.current.rotTargetY += dx * 0.011;
    liveRef.current.rotTargetX = Math.max(
      -0.88,
      Math.min(0.88, liveRef.current.rotTargetX + dy * 0.009)
    );
  }, []);

  const setDragging = useCallback((dragging: boolean) => {
    liveRef.current.isDragging = dragging;
  }, []);

  const setHoveredProject = useCallback((index: number) => {
    liveRef.current.hoveredProjectIndex = index;
  }, []);

  const playAudioSample = useCallback(
    (id: string, src: string, impulse = 0.85) => {
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current.currentTime = 0;
      }

      const audio = new Audio(src);
      audio.crossOrigin = 'anonymous';
      audioElRef.current = audio;
      setPlayingAudio(id);

      liveRef.current.recoil = Math.min(1.4, impulse * (id === 'shot' ? 1.25 : 0.5));
      if (liveRef.current.heroMode === 'shady-cube') {
        liveRef.current.cubeJumpVel = id === 'shot' ? 6.6 : 4.2;
        liveRef.current.cubeFlipTarget -= Math.PI * 0.5;
      }
      triggerShockwave(impulse, id === 'shot' ? 1 : 0);
      triggerEyjaReaction(id === 'shot' ? 'skill' : 'attack', 'skill');

      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            audioCtxRef.current = new AudioCtx();
          }
          const ctx = audioCtxRef.current;
          if (ctx.state === 'suspended') {
            void ctx.resume();
          }
          if (!analyserRef.current) {
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 128;
            analyser.smoothingTimeConstant = 0.78;
            analyser.connect(ctx.destination);
            analyserRef.current = analyser;
          }
          if (!mediaSourceMapRef.current.has(audio)) {
            const source = ctx.createMediaElementSource(audio);
            source.connect(analyserRef.current);
            mediaSourceMapRef.current.set(audio, source);
          }
        }
      } catch {
        // Fallback to direct HTMLAudioElement playback without analyser
      }

      const clear = () => {
        setPlayingAudio((current) => (current === id ? null : current));
      };
      audio.addEventListener('ended', clear, { once: true });
      audio.addEventListener('error', clear, { once: true });
      void audio.play().catch(clear);
    },
    [triggerShockwave, triggerEyjaReaction]
  );

  const value = useMemo<SpatialContextValue>(
    () => ({
      liveRef,
      analyserRef,
      heroMode,
      setHeroMode,
      eyjaSkin,
      setEyjaSkin,
      eyjaAction,
      setEyjaAction,
      eyjaRoamerEnabled,
      toggleEyjaRoamer,
      eyjaReaction,
      triggerEyjaReaction,
      wireframe,
      toggleWireframe,
      autoSpin,
      toggleAutoSpin,
      playingAudio,
      playAudioSample,
      triggerShockwave,
      triggerCubeBounce,
      resetCamera,
      nudgeOrbit,
      setDragging,
      setHoveredProject,
      webglReady,
      setWebglReady,
    }),
    [
      heroMode,
      setHeroMode,
      eyjaSkin,
      setEyjaSkin,
      eyjaAction,
      setEyjaAction,
      eyjaRoamerEnabled,
      toggleEyjaRoamer,
      eyjaReaction,
      triggerEyjaReaction,
      wireframe,
      toggleWireframe,
      autoSpin,
      toggleAutoSpin,
      playingAudio,
      playAudioSample,
      triggerShockwave,
      triggerCubeBounce,
      resetCamera,
      nudgeOrbit,
      setDragging,
      setHoveredProject,
      webglReady,
    ]
  );

  return <SpatialContext.Provider value={value}>{children}</SpatialContext.Provider>;
}

export function useSpatial() {
  const ctx = useContext(SpatialContext);
  if (!ctx) {
    throw new Error('useSpatial must be used inside SpatialProvider');
  }
  return ctx;
}
