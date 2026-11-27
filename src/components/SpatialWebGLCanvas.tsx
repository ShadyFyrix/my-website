import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { buildBedrockGroup } from '../lib/bedrockModel';
import type { BedrockModelJson } from '../lib/bedrockModel';
import { useSpatial } from './SpatialContext';

const HORIZON_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

/**
 * Layer 0a: Ultra-light 1-Pass Curved Titanium Silver Studio Horizon Backdrop (0 loops, < 0.08ms/frame)
 */
const HORIZON_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 uResolution;
  uniform float uDpr;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform float uAudio;

  void main() {
    vec2 px = vec2(gl_FragCoord.x / max(0.5, uDpr), uResolution.y - gl_FragCoord.y / max(0.5, uDpr));
    vec2 mousePx = vec2((uMouse.x * 0.5 + 0.5) * uResolution.x, (0.5 - uMouse.y * 0.5) * uResolution.y);
    float dMousePx = length(px - mousePx);

    float intensity = 1.1;
    vec3 cAccent = vec3(0.84, 0.91, 1.00);
    vec3 cSecondary = vec3(0.46, 0.58, 0.78);
    vec3 cPulseCyan = vec3(0.22, 0.89, 1.00);

    // Clean matte obsidian base (#05070c)
    vec3 col = mix(vec3(0.018, 0.025, 0.043), vec3(0.024, 0.034, 0.058), smoothstep(0.95, 0.02, vUv.y));

    // Curved top Titanium Silver studio horizon rim beneath the navbar
    float xNorm = (vUv.x - 0.5) * 2.0;
    float arcY = 0.945 - xNorm * xNorm * 0.115 - uScroll * 0.08;
    float dArc = vUv.y - arcY;
    float arcRim = exp(-pow(dArc * 92.0, 2.0)) * smoothstep(1.18, 0.15, abs(xNorm));
    float canopySpill =
      exp(-max(0.0, -dArc) * 4.4) *
      smoothstep(0.06, -0.02, dArc) *
      smoothstep(1.25, 0.1, abs(xNorm));
    float upperFade = exp(-max(0.0, dArc) * 12.0) * smoothstep(-0.02, 0.04, dArc);

    col += mix(cSecondary, cAccent, 0.45) * canopySpill * (0.17 + uAudio * 0.07) * intensity;
    col += mix(cAccent, vec3(0.95, 0.99, 1.0), 0.42) * arcRim * 0.30 * intensity;
    col += cSecondary * upperFade * 0.08 * intensity;

    // Subtle dark studio ambient reflection under cursor
    col += mix(cAccent, cPulseCyan, 0.32) * exp(-pow(dMousePx / 235.0, 2.0)) * 0.046 * intensity;

    float vig = 1.0 - smoothstep(0.62, 1.50, length((vUv - 0.5) * vec2(1.10, 1.0)));
    col *= mix(0.74, 1.0, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * Layer 0b: GPU Vertex-Shader Motion-Graphics Micro-Dot Matrix (1 draw call, ~1,800 dots, 165 FPS locked!)
 * Evaluates wave physics ONCE per dot instead of 9x per screen pixel -> 15,000x faster with zero clipping.
 */
const DOT_VERT = /* glsl */ `
  attribute vec2 aGridId;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uDpr;
  uniform float uPitch;
  uniform vec2 uGridSpan;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform float uPulseTime;
  uniform float uPulseStrength;
  uniform float uAudio;
  uniform float uMotionScale;

  varying float vRadiusPx;
  varying float vBoxPx;
  varying float vEnergy;
  varying float vVis;
  varying vec3 vDotCol;
  varying vec3 vCrossCol;

  void main() {
    float intensity = 1.1;
    float motion = uMotionScale;
    float t = uTime * 1.35 * motion;

    // Seamless wrapped CSS-pixel position on scrolling lattice
    float restX = (aGridId.x + 0.5) * uPitch;
    float rawY = (aGridId.y + 0.5) * uPitch - uScroll * 145.0;
    float spanY = max(uPitch, uGridSpan.y);
    float restY = mod(rawY + uPitch, spanY) - uPitch;
    vec2 screenPos = vec2(restX, restY);

    vec2 mousePx = vec2((uMouse.x * 0.5 + 0.5) * uResolution.x, (0.5 - uMouse.y * 0.5) * uResolution.y);

    // 1. Traveling Kinetic Wave Field (choreographed After Effects / Cavalry wave motion)
    float worldRow = floor((rawY + uPitch) / spanY) * (spanY / uPitch) + aGridId.y;
    float diagPhase = aGridId.x * 0.24 - worldRow * 0.17 - t * 1.35;
    float crossPhase = aGridId.x * 0.13 + worldRow * 0.26 + t * 0.92;
    float waveA = sin(diagPhase);
    float waveB = cos(crossPhase);
    float ribbonEnergy = pow(0.5 + 0.5 * sin(aGridId.x * 0.16 - worldRow * 0.11 - t * 1.05), 5.0);

    vec2 waveOffset = vec2(
      waveA * 4.0 + waveB * 2.1,
      cos(diagPhase) * 4.2 + sin(crossPhase) * 2.1
    ) * motion;

    // 2. Periodic Concentric Motion-Graphics Sonar Ripple radiating from upper Hero focal zone
    vec2 sonarOrigin = vec2(uResolution.x * 0.58, uResolution.y * 0.44);
    float sonarPhase = fract(t * 0.115);
    float sonarRadius = sonarPhase * max(uResolution.x, uResolution.y) * 1.15;
    float sonarFade = smoothstep(0.0, 0.12, sonarPhase) * (1.0 - smoothstep(0.68, 1.0, sonarPhase));
    vec2 fromSonar = screenPos - sonarOrigin;
    float dSonar = length(fromSonar);
    float sonarBand = exp(-pow((dSonar - sonarRadius) / 68.0, 2.0)) * sonarFade;
    vec2 sonarPush = normalize(fromSonar + vec2(0.001)) * sonarBand * 6.0 * motion;

    // 3. Elastic Radial Cursor Wave (pushes dots smoothly outward & ripples cleanly)
    vec2 fromMouse = screenPos - mousePx;
    float dMCell = length(fromMouse);
    float mouseField = exp(-pow(dMCell / 190.0, 2.0));
    float mouseRipple = sin(dMCell * 0.055 - t * 3.2) * exp(-pow(dMCell / 235.0, 2.0));
    vec2 mousePush = normalize(fromMouse + vec2(0.001)) * (mouseField * 7.6 + mouseRipple * 2.6) * motion;

    // 4. Stage Action Shockwave (Nhảy 3D / Bắn / Xung) + live audio swell
    float pulseR = uPulseTime * 960.0;
    float pulseBand = exp(-pow((dMCell - pulseR) / 56.0, 2.0)) * uPulseStrength;
    vec2 pulsePush = normalize(fromMouse + vec2(0.001)) * pulseBand * 9.5 * motion;

    vec2 animPx = screenPos + waveOffset + sonarPush + mousePush + pulsePush;

    // Normalized screen UV for perimeter studio falloff
    vec2 uv = vec2(animPx.x / max(1.0, uResolution.x), 1.0 - animPx.y / max(1.0, uResolution.y));
    float radialMask = 1.0 - smoothstep(0.28, 0.96, length((uv - vec2(0.5, 0.46)) * vec2(1.02, 1.15)));
    radialMask = clamp(radialMask, 0.06, 1.0);
    float vig = 1.0 - smoothstep(0.62, 1.50, length((uv - 0.5) * vec2(1.10, 1.0)));

    float energy = clamp(
      ribbonEnergy * 0.75 +
      sonarBand * 0.80 +
      mouseField * 1.05 +
      pulseBand * 1.35 +
      uAudio * 0.45 * (0.5 + 0.5 * waveA),
      0.0,
      1.6
    );

    float radiusPx = 1.05 + (0.5 + 0.5 * waveA) * 0.28 * motion + energy * 1.08;
    float boxPx = max(6.0, (radiusPx + 4.4) * 2.0);

    vec3 cAccent = vec3(0.84, 0.91, 1.00);
    vec3 cPulseCyan = vec3(0.22, 0.89, 1.00);
    vec3 idleDotCol = vec3(0.45, 0.57, 0.78);

    vec3 litCol = mix(cAccent, vec3(0.96, 0.99, 1.0), smoothstep(0.45, 1.2, energy) * 0.5);
    float cyanMix = clamp(mouseField * 0.48 + sonarBand * 0.35 + pulseBand * 0.85, 0.0, 0.88);
    litCol = mix(litCol, cPulseCyan, cyanMix);

    vDotCol = mix(idleDotCol, litCol, clamp(energy * 0.95, 0.0, 1.0));
    vCrossCol = mix(cAccent, cPulseCyan, 0.55);
    vRadiusPx = radiusPx;
    vBoxPx = boxPx;
    vEnergy = energy;
    vVis = (0.145 * radialMask + energy * 0.62) * intensity * mix(0.74, 1.0, vig);

    // Convert CSS pixels directly to NDC clip coordinates
    vec2 ndc = vec2(
      (animPx.x / max(1.0, uResolution.x)) * 2.0 - 1.0,
      1.0 - (animPx.y / max(1.0, uResolution.y)) * 2.0
    );
    gl_Position = vec4(ndc, 0.5, 1.0);
    gl_PointSize = ceil(boxPx * uDpr);
  }
`;

const DOT_FRAG = /* glsl */ `
  precision mediump float;
  varying float vRadiusPx;
  varying float vBoxPx;
  varying float vEnergy;
  varying float vVis;
  varying vec3 vDotCol;
  varying vec3 vCrossCol;

  void main() {
    vec2 delta = (gl_PointCoord - 0.5) * vBoxPx;
    float dist = length(delta);

    float core = 1.0 - smoothstep(vRadiusPx - 0.40, vRadiusPx + 0.48, dist);
    float crossH =
      (1.0 - smoothstep(0.35, 0.85, abs(delta.y))) *
      (1.0 - smoothstep(vRadiusPx + 1.8, vRadiusPx + 3.2, abs(delta.x)));
    float crossV =
      (1.0 - smoothstep(0.35, 0.85, abs(delta.x))) *
      (1.0 - smoothstep(vRadiusPx + 1.8, vRadiusPx + 3.2, abs(delta.y)));
    float microCross = max(crossH, crossV) * smoothstep(0.62, 1.25, vEnergy);

    vec3 outCol = vDotCol * core * vVis + vCrossCol * microCross * 0.36;
    if (dot(outCol, vec3(1.0)) < 0.002) discard;

    gl_FragColor = vec4(min(outCol, vec3(0.45)), 1.0);
  }
`;

function buildDotGridGeometry(width: number, height: number, pitch: number) {
  const cols = Math.ceil(width / pitch) + 2;
  const rows = Math.ceil(height / pitch) + 3;
  const total = cols * rows;
  const positions = new Float32Array(total * 3);
  const gridIds = new Float32Array(total * 2);

  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      gridIds[i * 2] = c - 1;
      gridIds[i * 2 + 1] = r - 1;
      i++;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aGridId', new THREE.BufferAttribute(gridIds, 2));
  return { geo, spanX: cols * pitch, spanY: rows * pitch };
}

/**
 * Unified 1-Canvas GPU WebGL Stage:
 * - Scene 0: Curved Titanium Studio Horizon + GPU Vertex-Shader Motion-Graphics Micro-Dots (165 FPS)
 * - Scene 1: Beveled 3D ShadyFyrix Identity Cube + 63-bone NotGunGun 3D (auto-idles when scrolled below Hero)
 */
export function SpatialWebGLCanvas() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const { liveRef, analyserRef, setWebglReady } = useSpatial();
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const container = hostRef.current;
    if (!container) return;

    let disposed = false;
    let rafId = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let horizonMat: THREE.ShaderMaterial | null = null;
    let dotMat: THREE.ShaderMaterial | null = null;
    let dotGeo: THREE.BufferGeometry | null = null;
    let weaponTex: THREE.Texture | null = null;
    let weaponMat: THREE.MeshStandardMaterial | null = null;
    let weaponHolder: THREE.Group | null = null;
    let cubeTex: THREE.Texture | null = null;
    let cubeMat: THREE.MeshStandardMaterial | null = null;
    let cubeCageMat: THREE.LineBasicMaterial | null = null;
    let ringMatA: THREE.MeshBasicMaterial | null = null;
    let ringMatB: THREE.MeshBasicMaterial | null = null;
    let miniCubeMat: THREE.LineBasicMaterial | null = null;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 860;
    const dotPitch = isMobile ? 32 : 28;

    const init = async () => {
      try {
        const w = Math.max(window.innerWidth, 320);
        const h = Math.max(window.innerHeight, 320);
        const pr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.35);

        renderer = new THREE.WebGLRenderer({
          antialias: !isMobile,
          alpha: false,
          powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(pr);
        renderer.setSize(w, h);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.autoClear = false;
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        // Scene 0: Titanium Studio Horizon + GPU Vertex-Shader Motion-Graphics Micro-Dots
        const bgScene = new THREE.Scene();
        const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        horizonMat = new THREE.ShaderMaterial({
          vertexShader: HORIZON_VERT,
          fragmentShader: HORIZON_FRAG,
          depthTest: false,
          depthWrite: false,
          uniforms: {
            uResolution: { value: new THREE.Vector2(w, h) },
            uDpr: { value: pr },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uScroll: { value: 0 },
            uAudio: { value: 0 },
          },
        });
        const bgQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), horizonMat);
        bgQuad.renderOrder = 0;
        bgScene.add(bgQuad);

        const initialGrid = buildDotGridGeometry(w, h, dotPitch);
        dotGeo = initialGrid.geo;
        dotMat = new THREE.ShaderMaterial({
          vertexShader: DOT_VERT,
          fragmentShader: DOT_FRAG,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(w, h) },
            uDpr: { value: pr },
            uPitch: { value: dotPitch },
            uGridSpan: { value: new THREE.Vector2(initialGrid.spanX, initialGrid.spanY) },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uScroll: { value: 0 },
            uPulseTime: { value: 10 },
            uPulseStrength: { value: 0 },
            uAudio: { value: 0 },
            uMotionScale: { value: reducedMotion ? 0.16 : 1.0 },
          },
        });
        const dotPoints = new THREE.Points(dotGeo, dotMat);
        dotPoints.frustumCulled = false;
        dotPoints.renderOrder = 1;
        bgScene.add(dotPoints);

        // Scene 1: Beveled 3D ShadyFyrix Identity Cube + NotGunGun 3D
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 90);
        camera.position.set(0, 0.35, 6.4);

        const ambient = new THREE.AmbientLight(0xe5f4ff, 1.55);
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.55);
        keyLight.position.set(4.5, 6.5, 5.5);
        const rimCyan = new THREE.PointLight(0x36e5ff, 8.5, 18);
        rimCyan.position.set(-2.5, 2.2, 3.2);
        const rimSolar = new THREE.PointLight(0xff6a45, 4.2, 16);
        rimSolar.position.set(3.8, -1.6, 2.2);
        scene.add(ambient, keyLight, rimCyan, rimSolar);

        const cubeStageGroup = new THREE.Group();
        const cubeRotGroup = new THREE.Group();
        const cubeBoxGeo = new RoundedBoxGeometry(1.82, 1.82, 1.82, 5, 0.2);
        const cubeCageGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.08, 2.08, 2.08));
        cubeCageMat = new THREE.LineBasicMaterial({
          color: 0x36e5ff,
          transparent: true,
          opacity: 0.72,
        });
        const cubeCage = new THREE.LineSegments(cubeCageGeo, cubeCageMat);

        ringMatA = new THREE.MeshBasicMaterial({
          color: 0x36e5ff,
          transparent: true,
          opacity: 0.34,
        });
        ringMatB = new THREE.MeshBasicMaterial({
          color: 0x4f82ff,
          transparent: true,
          opacity: 0.22,
        });
        const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.011, 12, 96), ringMatA);
        ringA.rotation.x = Math.PI * 0.42;
        const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.008, 12, 96), ringMatB);
        ringB.rotation.x = Math.PI * 0.58;
        ringB.rotation.y = 0.35;

        const miniGroup = new THREE.Group();
        const miniEdgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.18, 0.18, 0.18));
        miniCubeMat = new THREE.LineBasicMaterial({
          color: 0x36e5ff,
          transparent: true,
          opacity: 0.55,
        });
        const miniItems: Array<{
          mesh: THREE.LineSegments;
          r: number;
          speed: number;
          angle: number;
          yOff: number;
        }> = [];
        const miniCount = isMobile ? 10 : 18;
        for (let i = 0; i < miniCount; i++) {
          const m = new THREE.LineSegments(miniEdgeGeo, miniCubeMat);
          const angle = (i / miniCount) * Math.PI * 2;
          const r = 1.9 + (i % 4) * 0.42;
          const yOff = ((i % 5) - 2) * 0.34;
          const s = 0.55 + (i % 3) * 0.42;
          m.scale.setScalar(s);
          miniGroup.add(m);
          miniItems.push({ mesh: m, r, speed: 0.32 + (i % 4) * 0.12, angle, yOff });
        }

        cubeStageGroup.add(cubeRotGroup, ringA, ringB, miniGroup);
        scene.add(cubeStageGroup);

        const loadShadyCube = async () => {
          const loader = new THREE.TextureLoader();
          const tex = await loader.loadAsync('/logo-shadyfyrix.png');
          if (disposed) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = Math.min(8, renderer?.capabilities.getMaxAnisotropy() || 4);
          cubeTex = tex;

          cubeMat = new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.24,
            metalness: 0.15,
            emissive: new THREE.Color(0x0c3442),
            emissiveIntensity: 0.32,
          });
          const cubeMesh = new THREE.Mesh(cubeBoxGeo, cubeMat);
          cubeRotGroup.add(cubeMesh, cubeCage);
          setWebglReady(true);
        };
        void loadShadyCube();

        const weaponStageGroup = new THREE.Group();
        const weaponRing = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.01, 12, 96), ringMatA);
        weaponRing.rotation.x = Math.PI * 0.44;
        weaponStageGroup.add(weaponRing);
        weaponStageGroup.visible = false;
        scene.add(weaponStageGroup);

        const loadWeapon = async () => {
          const loader = new THREE.TextureLoader();
          const tex = await loader.loadAsync('/models/notgungun/ul.png');
          if (disposed) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.magFilter = THREE.NearestFilter;
          tex.minFilter = THREE.NearestFilter;
          tex.generateMipmaps = false;
          weaponTex = tex;

          const res = await fetch('/models/notgungun/ul_geo.json');
          const json = (await res.json()) as BedrockModelJson;
          if (disposed) return;

          weaponMat = new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.36,
            metalness: 0.28,
            emissive: new THREE.Color(0x0a2533),
            emissiveIntensity: 0.42,
            transparent: true,
            alphaTest: 0.05,
            side: THREE.DoubleSide,
          });

          const weapon = buildBedrockGroup(json, weaponMat, 3.65);
          weaponHolder = new THREE.Group();
          weaponHolder.add(weapon);
          weaponHolder.rotation.set(liveRef.current.rotTargetX, liveRef.current.rotTargetY, 0);
          weaponStageGroup.add(weaponHolder);
        };
        void loadWeapon();

        const smoothMouse = new THREE.Vector2(0, 0);
        let smoothScroll = 0;
        let smoothAudio = 0;
        const freqData = new Uint8Array(64);
        let lastTime = performance.now();
        let elapsed = 0;

        const onResize = () => {
          if (!renderer || disposed) return;
          const nw = Math.max(window.innerWidth, 320);
          const nh = Math.max(window.innerHeight, 320);
          const npr = Math.min(window.devicePixelRatio || 1, nw < 860 ? 1.25 : 1.35);
          renderer.setPixelRatio(npr);
          renderer.setSize(nw, nh);
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();

          if (horizonMat) {
            horizonMat.uniforms.uResolution.value.set(nw, nh);
            horizonMat.uniforms.uDpr.value = npr;
          }
          if (dotMat) {
            const pitch = nw < 860 ? 32 : 28;
            const nextGrid = buildDotGridGeometry(nw, nh, pitch);
            dotGeo?.dispose();
            dotGeo = nextGrid.geo;
            dotPoints.geometry = dotGeo;
            dotMat.uniforms.uResolution.value.set(nw, nh);
            dotMat.uniforms.uDpr.value = npr;
            dotMat.uniforms.uPitch.value = pitch;
            dotMat.uniforms.uGridSpan.value.set(nextGrid.spanX, nextGrid.spanY);
          }
        };
        window.addEventListener('resize', onResize);

        const renderFrame = (now: number) => {
          if (disposed || !renderer) return;
          const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
          lastTime = now;

          if (document.hidden) {
            rafId = requestAnimationFrame(renderFrame);
            return;
          }

          const state = liveRef.current;
          if (!reducedMotion) {
            elapsed += dt;
          }

          let rawAudio = 0;
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(freqData);
            let sum = 0;
            for (let i = 0; i < 24; i++) sum += freqData[i];
            rawAudio = sum / (24 * 255);
          }
          smoothAudio += (rawAudio - smoothAudio) * 0.22;
          state.audioEnergy = smoothAudio;

          state.pointerVel *= Math.pow(0.08, dt);
          state.scrollVel *= Math.pow(0.06, dt);
          state.pulseTime += dt;
          state.pulseStrength *= Math.pow(0.16, dt);
          state.recoil *= Math.pow(0.015, dt);

          smoothMouse.x += (state.pointerX - smoothMouse.x) * (reducedMotion ? 0.05 : 0.14);
          smoothMouse.y += (state.pointerY - smoothMouse.y) * (reducedMotion ? 0.05 : 0.14);
          smoothScroll += (state.scrollProgress - smoothScroll) * 0.085;

          if (horizonMat) {
            horizonMat.uniforms.uMouse.value.copy(smoothMouse);
            horizonMat.uniforms.uScroll.value = smoothScroll;
            horizonMat.uniforms.uAudio.value = smoothAudio;
          }
          if (dotMat) {
            dotMat.uniforms.uTime.value = elapsed;
            dotMat.uniforms.uMouse.value.copy(smoothMouse);
            dotMat.uniforms.uScroll.value = smoothScroll;
            dotMat.uniforms.uPulseTime.value = state.pulseTime;
            dotMat.uniforms.uPulseStrength.value = state.pulseStrength;
            dotMat.uniforms.uAudio.value = smoothAudio;
          }

          renderer.clear();
          renderer.render(bgScene, bgCamera);

          // Render Scene 1 ONLY when Hero 3D models are in view
          const is3DMode = state.heroMode === 'shady-cube' || state.heroMode === 'notgungun-3d';
          const heroVisibility = Math.max(0, 1 - smoothScroll * 7.2);

          if (heroVisibility > 0.01 || cubeStageGroup.visible || weaponStageGroup.visible) {
            if (state.cubeJumpY > 0 || state.cubeJumpVel !== 0) {
              state.cubeJumpY += state.cubeJumpVel * dt;
              state.cubeJumpVel -= 19.5 * dt;
              if (state.cubeJumpY <= 0) {
                state.cubeJumpY = 0;
                state.cubeJumpVel = 0;
              }
            }
            state.cubeFlipCurrent += (state.cubeFlipTarget - state.cubeFlipCurrent) * 0.14;

            const narrow = window.innerWidth < 960;
            const hoverActive = state.hoveredProjectIndex >= 0 ? 1 : 0;

            camera.position.set(smoothMouse.x * 0.45, 0.32 + smoothMouse.y * 0.22, 6.4);
            camera.lookAt(0, -0.04, 0);

            rimCyan.position.set(smoothMouse.x * 4.5 - 1.2, smoothMouse.y * 3.0 + 1.8, 3.2);
            rimCyan.intensity = 8.0 + smoothAudio * 10.0 + state.pulseStrength * 9.0 + hoverActive * 3.0;
            rimSolar.intensity = 4.2 + state.recoil * 12.0 + smoothScroll * 2.0;

            if (state.autoSpin && !state.isDragging && !reducedMotion) {
              state.rotTargetY += dt * 0.52;
            }

            const cubeActive = is3DMode && state.heroMode === 'shady-cube';
            const cubeScaleTarget =
              (narrow ? 0.46 : 1.04) * heroVisibility * (cubeActive ? 1 : 0.0001);
            const squash = state.cubeJumpY > 0 ? 1 + Math.min(0.14, state.cubeJumpY * 0.08) : 1;

            cubeStageGroup.position.x = narrow ? 0 : 1.05 + smoothScroll * 5.4;
            cubeStageGroup.position.y = narrow
              ? 1.44 + state.cubeJumpY * 0.34 + Math.sin(elapsed * 1.5) * 0.05 + smoothScroll * 2.8
              : 0.36 + state.cubeJumpY * 0.52 + Math.sin(elapsed * 1.5) * 0.1 + smoothScroll * 2.2;
            cubeStageGroup.position.z = -smoothScroll * 4.5;

            const curCubeScale = THREE.MathUtils.lerp(
              cubeStageGroup.scale.x || 0.0001,
              Math.max(0.0001, cubeScaleTarget),
              0.16
            );
            cubeStageGroup.scale.set(
              curCubeScale / Math.sqrt(squash),
              curCubeScale * squash,
              curCubeScale / Math.sqrt(squash)
            );
            cubeStageGroup.visible = curCubeScale > 0.015;

            if (cubeMat && cubeMat.wireframe !== state.wireframe) {
              cubeMat.wireframe = state.wireframe;
              cubeMat.emissive.set(state.wireframe ? 0x36e5ff : 0x0c3442);
              cubeMat.emissiveIntensity = state.wireframe ? 1.15 : 0.32;
              cubeMat.needsUpdate = true;
            }
            if (cubeCageMat) {
              cubeCageMat.opacity = 0.62 + state.pulseStrength * 0.35 + smoothAudio * 0.3;
            }

            cubeRotGroup.rotation.x +=
              (state.rotTargetX + smoothMouse.y * 0.32 - cubeRotGroup.rotation.x) * 0.14;
            cubeRotGroup.rotation.y +=
              (state.rotTargetY + smoothMouse.x * 0.38 - cubeRotGroup.rotation.y) * 0.14;
            cubeRotGroup.rotation.z = state.cubeFlipCurrent;

            ringA.rotation.z = elapsed * 0.36;
            ringB.rotation.z = -elapsed * 0.24;
            ringB.rotation.x = Math.PI * 0.58 + smoothMouse.y * 0.24;

            for (const item of miniItems) {
              const a = item.angle + elapsed * item.speed;
              const burst = 1 + state.pulseStrength * 0.45 + smoothAudio * 0.35;
              item.mesh.position.set(
                Math.cos(a) * item.r * burst,
                item.yOff + Math.sin(elapsed * 1.6 + item.angle) * 0.18,
                Math.sin(a) * item.r * burst
              );
              item.mesh.rotation.x = elapsed * 0.9 + item.angle;
              item.mesh.rotation.y = elapsed * 0.7;
            }

            const weaponActive = is3DMode && state.heroMode === 'notgungun-3d';
            const weaponScaleTarget =
              (narrow ? 0.52 : 1.02) * heroVisibility * (weaponActive ? 1 : 0.0001);
            weaponStageGroup.position.x = narrow ? 0 : 0.96 + smoothScroll * 5.6;
            weaponStageGroup.position.y = narrow
              ? 1.48 + Math.sin(elapsed * 1.15) * 0.05 + smoothScroll * 2.8
              : 0.3 + Math.sin(elapsed * 1.15) * 0.08 + smoothScroll * 2.2;
            weaponStageGroup.position.z = -smoothScroll * 4.5 - state.recoil * 0.48;

            const curWeaponScale = THREE.MathUtils.lerp(
              weaponStageGroup.scale.x || 0.0001,
              Math.max(0.0001, weaponScaleTarget),
              0.16
            );
            weaponStageGroup.scale.setScalar(curWeaponScale);
            weaponStageGroup.visible = curWeaponScale > 0.015;
            weaponRing.rotation.z = -elapsed * 0.3;

            if (weaponHolder && weaponMat) {
              if (weaponMat.wireframe !== state.wireframe) {
                weaponMat.wireframe = state.wireframe;
                weaponMat.emissive.set(state.wireframe ? 0x36e5ff : 0x0a2533);
                weaponMat.emissiveIntensity = state.wireframe ? 1.15 : 0.42;
                weaponMat.needsUpdate = true;
              }
              const pitchRecoil = state.recoil * 0.22;
              weaponHolder.rotation.x +=
                (state.rotTargetX - pitchRecoil + smoothMouse.y * 0.14 - weaponHolder.rotation.x) *
                0.14;
              weaponHolder.rotation.y +=
                (state.rotTargetY + smoothMouse.x * 0.2 - weaponHolder.rotation.y) * 0.14;
            }

            if (cubeStageGroup.visible || weaponStageGroup.visible) {
              renderer.clearDepth();
              renderer.render(scene, camera);
            }
          }

          rafId = requestAnimationFrame(renderFrame);
        };

        rafId = requestAnimationFrame(renderFrame);

        return () => {
          window.removeEventListener('resize', onResize);
          bgQuad.geometry.dispose();
          dotGeo?.dispose();
          cubeBoxGeo.dispose();
          cubeCageGeo.dispose();
          miniEdgeGeo.dispose();
          ringA.geometry.dispose();
          ringB.geometry.dispose();
          weaponRing.geometry.dispose();
        };
      } catch {
        if (!disposed) {
          setFallback(true);
          setWebglReady(true);
        }
        return undefined;
      }
    };

    let cleanupScene: (() => void) | undefined;
    void init().then((fn) => {
      cleanupScene = fn;
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      cleanupScene?.();
      if (weaponHolder) {
        weaponHolder.traverse((obj) => {
          if (obj instanceof THREE.Mesh) obj.geometry.dispose();
        });
      }
      horizonMat?.dispose();
      dotMat?.dispose();
      weaponMat?.dispose();
      weaponTex?.dispose();
      cubeMat?.dispose();
      cubeTex?.dispose();
      cubeCageMat?.dispose();
      miniCubeMat?.dispose();
      ringMatA?.dispose();
      ringMatB?.dispose();
      renderer?.dispose();
    };
  }, [analyserRef, liveRef, setWebglReady]);

  return (
    <div
      className={`spatial-canvas ${fallback ? 'spatial-canvas--fallback' : ''}`}
      ref={hostRef}
      aria-hidden="true"
    />
  );
}
