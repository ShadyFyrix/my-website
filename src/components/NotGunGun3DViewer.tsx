import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Grid, Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { buildBedrockGroup, NOTGUNGUN_AUDIO } from '../lib/bedrockModel';
import type { BedrockModelJson } from '../lib/bedrockModel';

export function NotGunGun3DViewer({ compact = false }: { compact?: boolean }) {
  const { locale } = useLanguage();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const modelHolderRef = useRef<THREE.Group | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [autoSpin, setAutoSpin] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [webglError, setWebglError] = useState(false);

  const autoSpinRef = useRef(true);
  const targetRotRef = useRef({ x: 0.16, y: -0.78 });
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    autoSpinRef.current = autoSpin;
  }, [autoSpin]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.wireframe = wireframe;
      materialRef.current.emissive.set(wireframe ? 0x36e5ff : 0x0a2533);
      materialRef.current.emissiveIntensity = wireframe ? 1.05 : 0.35;
      materialRef.current.needsUpdate = true;
    }
  }, [wireframe]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let disposed = false;
    let rafId = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let texture: THREE.Texture | null = null;
    let material: THREE.MeshStandardMaterial | null = null;
    let modelHolder: THREE.Group | null = null;

    const init = async () => {
      try {
        const width = Math.max(container.clientWidth, 300);
        const height = Math.max(container.clientHeight, 220);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
        camera.position.set(0, 0.35, 4.9);
        camera.lookAt(0, 0, 0);

        const ambient = new THREE.AmbientLight(0xd9ecff, 1.45);
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
        keyLight.position.set(4, 6, 5);
        const rimLight = new THREE.DirectionalLight(0x36e5ff, 1.35);
        rimLight.position.set(-5, 2, -4);
        scene.add(ambient, keyLight, rimLight);

        const gridHelper = new THREE.GridHelper(5.2, 16, 0x36e5ff, 0x162438);
        gridHelper.position.y = -0.82;
        scene.add(gridHelper);

        const loader = new THREE.TextureLoader();
        texture = await loader.loadAsync('/models/notgungun/ul.png');
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;

        const res = await fetch('/models/notgungun/ul_geo.json');
        const json = (await res.json()) as BedrockModelJson;
        if (disposed) return;

        material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.38,
          metalness: 0.25,
          emissive: new THREE.Color(0x0a2533),
          emissiveIntensity: 0.35,
          transparent: true,
          alphaTest: 0.05,
          side: THREE.DoubleSide,
          wireframe,
        });
        materialRef.current = material;

        const weapon = buildBedrockGroup(json, material, 3.25);
        modelHolder = new THREE.Group();
        modelHolder.add(weapon);
        modelHolder.rotation.set(targetRotRef.current.x, targetRotRef.current.y, 0);
        modelHolderRef.current = modelHolder;
        scene.add(modelHolder);

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) {
          autoSpinRef.current = false;
          setAutoSpin(false);
        }

        const ro = new ResizeObserver(() => {
          if (!container || !renderer) return;
          const w = Math.max(container.clientWidth, 260);
          const h = Math.max(container.clientHeight, 200);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        });
        ro.observe(container);

        const animate = () => {
          if (disposed || !renderer) return;
          if (autoSpinRef.current && !dragRef.current.active) {
            targetRotRef.current.y += 0.0065;
          }
          if (modelHolder) {
            modelHolder.rotation.x += (targetRotRef.current.x - modelHolder.rotation.x) * 0.14;
            modelHolder.rotation.y += (targetRotRef.current.y - modelHolder.rotation.y) * 0.14;
          }
          renderer.render(scene, camera);
          rafId = requestAnimationFrame(animate);
        };
        animate();

        return () => ro.disconnect();
      } catch {
        if (!disposed) setWebglError(true);
        return undefined;
      }
    };

    let disconnectRo: (() => void) | undefined;
    void init().then((fn) => {
      disconnectRo = fn;
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      disconnectRo?.();
      if (modelHolder) {
        modelHolder.traverse((obj) => {
          if (obj instanceof THREE.Mesh) obj.geometry.dispose();
        });
      }
      material?.dispose();
      texture?.dispose();
      renderer?.dispose();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayAudio = (id: string, src: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const audio = new Audio(src);
    audioRef.current = audio;
    setPlayingAudio(id);
    audio.addEventListener('ended', () => setPlayingAudio(null), { once: true });
    audio.addEventListener('error', () => setPlayingAudio(null), { once: true });
    void audio.play().catch(() => setPlayingAudio(null));
  };

  if (webglError) {
    return (
      <div className="viewer3d__fallback">
        <img
          src="/images/products/notgungun-ultimatum.jpg"
          width={1024}
          height={565}
          alt="NotGunGun Ultimatum 3D model"
        />
      </div>
    );
  }

  return (
    <div className={`viewer3d ${compact ? 'viewer3d--compact' : ''}`}>
      <div
        ref={mountRef}
        className="viewer3d__canvas-host"
        data-cursor="orbit"
        role="img"
        aria-label={
          locale === 'vi'
            ? 'Trình xem 3D tương tác NotGunGun Ultimatum, kéo chuột để xoay'
            : 'Interactive 3D viewer for NotGunGun Ultimatum, drag to orbit'
        }
        onPointerDown={(e) => {
          dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragRef.current.active) return;
          const dx = e.clientX - dragRef.current.lastX;
          const dy = e.clientY - dragRef.current.lastY;
          dragRef.current.lastX = e.clientX;
          dragRef.current.lastY = e.clientY;
          targetRotRef.current.y += dx * 0.012;
          targetRotRef.current.x = Math.max(
            -0.95,
            Math.min(0.95, targetRotRef.current.x + dy * 0.01)
          );
        }}
        onPointerUp={(e) => {
          dragRef.current.active = false;
          try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          } catch {
            // ignore released pointer capture
          }
        }}
        onPointerCancel={() => {
          dragRef.current.active = false;
        }}
      />

      <div className="viewer3d__hud">
        <div className="viewer3d__group">
          <button
            type="button"
            className="dock-btn"
            aria-pressed={autoSpin}
            onClick={() => setAutoSpin((prev) => !prev)}
          >
            {autoSpin ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            <span>{locale === 'vi' ? 'Xoay' : 'Spin'}</span>
          </button>
          <button
            type="button"
            className="dock-btn"
            aria-pressed={wireframe}
            onClick={() => setWireframe((prev) => !prev)}
          >
            <Grid size={14} aria-hidden="true" />
            <span>Wire</span>
          </button>
          <button
            type="button"
            className="dock-btn"
            onClick={() => {
              targetRotRef.current = { x: 0.16, y: -0.78 };
            }}
            aria-label={locale === 'vi' ? 'Đặt lại góc nhìn 3D' : 'Reset 3D camera'}
          >
            <RotateCcw size={14} aria-hidden="true" />
          </button>
        </div>

        <div className="viewer3d__group">
          {NOTGUNGUN_AUDIO.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className="dock-btn"
              aria-pressed={playingAudio === sample.id}
              onClick={() => handlePlayAudio(sample.id, sample.src)}
            >
              <Volume2 size={14} aria-hidden="true" />
              <span>{locale === 'vi' ? sample.vi : sample.en}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
