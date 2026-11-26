import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Pause, Play, RotateCcw, Volume2, Grid } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface BedrockFaceUv {
  uv: [number, number];
  uv_size: [number, number];
}

interface BedrockCube {
  origin: [number, number, number];
  size: [number, number, number];
  inflate?: number;
  pivot?: [number, number, number];
  rotation?: [number, number, number];
  uv?: Record<'north' | 'east' | 'south' | 'west' | 'up' | 'down', BedrockFaceUv>;
}

interface BedrockBone {
  name: string;
  parent?: string;
  pivot?: [number, number, number];
  rotation?: [number, number, number];
  cubes?: BedrockCube[];
}

interface BedrockModelJson {
  'minecraft:geometry': Array<{
    description: {
      texture_width: number;
      texture_height: number;
    };
    bones: BedrockBone[];
  }>;
}

const SKIP_BONES = new Set(['righthand_pos', 'lefthand_pos', 'u12g']);

const AUDIO_SAMPLES = [
  { id: 'shot', vi: 'Bắn', en: 'Shot', src: '/audio/notgungun/shot.ogg' },
  { id: 'inspect', vi: 'Kiểm tra', en: 'Inspect', src: '/audio/notgungun/inspect.ogg' },
  { id: 'reload', vi: 'Nạp đạn', en: 'Reload', src: '/audio/notgungun/reload.ogg' },
] as const;

function applyBedrockFaceUv(
  geometry: THREE.BoxGeometry,
  uvMap: BedrockCube['uv'],
  texWidth: number,
  texHeight: number
) {
  if (!uvMap) return;

  // Mirroring X across YZ maps Bedrock -X (west) to Three +X and Bedrock +X (east) to Three -X
  const faceOrder: Array<'east' | 'west' | 'up' | 'down' | 'south' | 'north'> = [
    'west',
    'east',
    'up',
    'down',
    'south',
    'north',
  ];

  const uvAttr = geometry.attributes.uv as THREE.BufferAttribute;
  for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
    const faceKey = faceOrder[faceIdx];
    const spec = uvMap[faceKey];
    if (!spec) continue;

    const [u, v] = spec.uv;
    const [us, vs] = spec.uv_size;

    const u0 = u / texWidth;
    const u1 = (u + us) / texWidth;
    // Flip V for Three.js texture coordinates (flipY = true)
    const vTop = 1 - v / texHeight;
    const vBottom = 1 - (v + vs) / texHeight;

    const offset = faceIdx * 4;
    // Three.js BoxGeometry quad vertex order: top-left, top-right, bottom-left, bottom-right
    uvAttr.setXY(offset + 0, u0, vTop);
    uvAttr.setXY(offset + 1, u1, vTop);
    uvAttr.setXY(offset + 2, u0, vBottom);
    uvAttr.setXY(offset + 3, u1, vBottom);
  }
  uvAttr.needsUpdate = true;
}

function buildBedrockGroup(
  model: BedrockModelJson,
  material: THREE.Material
): THREE.Group {
  const geo = model['minecraft:geometry'][0];
  const texW = geo.description.texture_width || 128;
  const texH = geo.description.texture_height || 128;

  const root = new THREE.Group();
  const groups = new Map<string, THREE.Group>();
  const boneMap = new Map<string, BedrockBone>();

  for (const bone of geo.bones) {
    boneMap.set(bone.name, bone);
    const group = new THREE.Group();
    group.name = bone.name;
    groups.set(bone.name, group);
  }

  for (const bone of geo.bones) {
    const group = groups.get(bone.name)!;
    const [px, py, pz] = bone.pivot || [0, 0, 0];
    const worldPivot = new THREE.Vector3(-px, py, pz);

    const parentBone = bone.parent ? boneMap.get(bone.parent) : undefined;
    const parentGroup = bone.parent ? groups.get(bone.parent) : undefined;

    if (parentBone && parentGroup) {
      const [ppx, ppy, ppz] = parentBone.pivot || [0, 0, 0];
      group.position.set(worldPivot.x - -ppx, worldPivot.y - ppy, worldPivot.z - ppz);
      parentGroup.add(group);
    } else {
      group.position.copy(worldPivot);
      root.add(group);
    }

    if (bone.rotation) {
      const [rx, ry, rz] = bone.rotation;
      group.rotation.order = 'ZYX';
      group.rotation.set(
        THREE.MathUtils.degToRad(-rx),
        THREE.MathUtils.degToRad(-ry),
        THREE.MathUtils.degToRad(rz)
      );
    }

    if (SKIP_BONES.has(bone.name) || !bone.cubes?.length) continue;

    for (const cube of bone.cubes) {
      const inf = cube.inflate ?? 0;
      const sx = Math.max(0.01, cube.size[0] + inf * 2);
      const sy = Math.max(0.01, cube.size[1] + inf * 2);
      const sz = Math.max(0.01, cube.size[2] + inf * 2);

      const boxGeo = new THREE.BoxGeometry(sx, sy, sz);
      applyBedrockFaceUv(boxGeo, cube.uv, texW, texH);

      const mesh = new THREE.Mesh(boxGeo, material);
      // Mirror X across YZ plane to map Bedrock coordinate space into Three.js
      const cx = -(cube.origin[0] + cube.size[0] / 2);
      const cy = cube.origin[1] + cube.size[1] / 2;
      const cz = cube.origin[2] + cube.size[2] / 2;

      if (cube.rotation) {
        const [cpx, cpy, cpz] = cube.pivot || [0, 0, 0];
        const cubePivotWorld = new THREE.Vector3(-cpx, cpy, cpz);
        const cubePivotGroup = new THREE.Group();
        cubePivotGroup.position.set(
          cubePivotWorld.x - worldPivot.x,
          cubePivotWorld.y - worldPivot.y,
          cubePivotWorld.z - worldPivot.z
        );
        cubePivotGroup.rotation.order = 'ZYX';
        cubePivotGroup.rotation.set(
          THREE.MathUtils.degToRad(-cube.rotation[0]),
          THREE.MathUtils.degToRad(-cube.rotation[1]),
          THREE.MathUtils.degToRad(cube.rotation[2])
        );
        mesh.position.set(
          cx - cubePivotWorld.x,
          cy - cubePivotWorld.y,
          cz - cubePivotWorld.z
        );
        cubePivotGroup.add(mesh);
        group.add(cubePivotGroup);
      } else {
        mesh.position.set(cx - worldPivot.x, cy - worldPivot.y, cz - worldPivot.z);
        group.add(mesh);
      }
    }
  }

  // Center the resulting model around (0, 0, 0)
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  const wrapper = new THREE.Group();
  root.position.sub(center);
  wrapper.add(root);

  const maxDim = Math.max(size.x, size.y, size.z, 1);
  const scale = 3.2 / maxDim;
  wrapper.scale.setScalar(scale);

  return wrapper;
}

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
  const targetRotRef = useRef({ x: 0.18, y: -0.78 });
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    autoSpinRef.current = autoSpin;
  }, [autoSpin]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.wireframe = wireframe;
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

        const ambient = new THREE.AmbientLight(0xffffff, 1.45);
        const keyLight = new THREE.DirectionalLight(0xfff4e8, 1.5);
        keyLight.position.set(4, 6, 5);
        const rimLight = new THREE.DirectionalLight(0x66f0ff, 1.15);
        rimLight.position.set(-5, 2, -4);
        scene.add(ambient, keyLight, rimLight);

        const gridHelper = new THREE.GridHelper(5, 16, 0x45454a, 0x2c2c30);
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
          roughness: 0.45,
          metalness: 0.2,
          transparent: true,
          alphaTest: 0.05,
          side: THREE.DoubleSide,
          wireframe,
        });
        materialRef.current = material;

        const weapon = buildBedrockGroup(json, material);
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
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
          }
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
            // Ignore if pointer capture is already released.
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
            className="viewer3d__btn"
            aria-pressed={autoSpin}
            onClick={() => setAutoSpin((prev) => !prev)}
          >
            {autoSpin ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            <span>{locale === 'vi' ? 'Xoay' : 'Spin'}</span>
          </button>
          <button
            type="button"
            className="viewer3d__btn"
            aria-pressed={wireframe}
            onClick={() => setWireframe((prev) => !prev)}
          >
            <Grid size={14} aria-hidden="true" />
            <span>Wire</span>
          </button>
          <button
            type="button"
            className="viewer3d__btn"
            onClick={() => {
              targetRotRef.current = { x: 0.18, y: -0.78 };
            }}
            aria-label={locale === 'vi' ? 'Đặt lại góc nhìn 3D' : 'Reset 3D camera'}
          >
            <RotateCcw size={14} aria-hidden="true" />
          </button>
        </div>

        <div className="viewer3d__group">
          {AUDIO_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className="viewer3d__btn"
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
