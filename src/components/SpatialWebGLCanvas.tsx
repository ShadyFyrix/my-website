import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
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
 * Layer 0: Pitch-Black Studio & Bottom Solar-Orange Horizon Uplight Shader (Zero-Lag 165 FPS)
 * - Pure matte pitch-black upper studio (#040202) with silky radiant solar-orange & warm amber glow rising from bottom center
 * - Zero fluted stripes, zero exp()/pow()/sin() -> pure MAD arithmetic + SIGGRAPH Interleaved Gradient Noise anti-banding
 * - Glides subtly with scroll & cursor so Clear Glass cards along the stage catch warm optical floor light
 */
const HORIZON_FRAG = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform float uTime;
  uniform vec2 uFloorCenter;
  uniform vec2 uSideAccent;
  uniform float uPulseStrength;
  uniform float uAudio;

  float dome(vec2 p, vec2 center, vec2 invR) {
    vec2 d = (p - center) * invR;
    float inv = 1.0 / (1.0 + dot(d, d));
    return inv * inv;
  }

  void main() {
    float aspect = uResolution.x / max(1.0, uResolution.y);
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 m = uMouse * 0.5 * vec2(aspect, 1.0);

    // 1. Pure Pitch-Black Studio Darkness across upper 60%
    vec3 pitchBlack = vec3(0.011, 0.008, 0.007);
    vec3 col = pitchBlack;

    // Smooth vertical horizon envelope: pitch black above, luminous warm floor below
    float lowMask = smoothstep(0.92, 0.0, uv.y);
    float floorLift = 1.0 + uAudio * 0.24 + uPulseStrength * 0.42;

    // 2. Radiant Bottom-Center Solar-Orange Stage Uplight (3 nested silky domes)
    float wideEmber = dome(p, uFloorCenter + vec2(0.0, -0.06), vec2(0.98, 1.85));
    float solarCore = dome(p, uFloorCenter, vec2(1.52, 2.75));
    float warmCrest = dome(p, uFloorCenter + vec2(0.0, -0.03), vec2(2.35, 4.40));
    float sideGlow  = dome(p, uSideAccent, vec2(1.35, 2.40));

    // Wide smooth floor horizon wash along very bottom edge
    float edgeBand = 1.0 / (1.0 + (uv.y * 4.2) * (uv.y * 4.2));
    float edgeCenter = smoothstep(0.95, 0.0, abs(uv.x - 0.5 - uFloorCenter.x * 0.12));

    vec3 deepEmber   = vec3(0.72, 0.14, 0.01);
    vec3 solarOrange = vec3(1.00, 0.34, 0.03);
    vec3 brightAmber = vec3(1.00, 0.58, 0.16);
    vec3 warmCream   = vec3(1.00, 0.86, 0.68);

    col += deepEmber   * (wideEmber * 0.72 * lowMask);
    col += solarOrange * ((solarCore * 0.92 + edgeBand * edgeBand * 0.36 * edgeCenter) * floorLift);
    col += brightAmber * ((warmCrest * 0.56 + sideGlow * 0.24 * lowMask) * floorLift);
    col += warmCream   * (warmCrest * warmCrest * 0.36 * floorLift);

    // 3. Kinetic Motion-Graphic Equatorial Pulse Arcs (expanding hairline rings from bottom horizon)
    vec2 arcRel = (p - vec2(uFloorCenter.x, -0.58)) * vec2(0.76, 1.12);
    float arcR = length(arcRel);
    float waveA = fract(uTime * 0.16);
    float waveB = fract(uTime * 0.16 + 0.5);
    float rA = (arcR - (0.20 + waveA * 1.18)) * 46.0;
    float rB = (arcR - (0.20 + waveB * 1.18)) * 46.0;
    float fadeA = (1.0 - waveA) * smoothstep(0.0, 0.18, waveA);
    float fadeB = (1.0 - waveB) * smoothstep(0.0, 0.18, waveB);
    float ringA = (1.0 / (1.0 + rA * rA)) * fadeA;
    float ringB = (1.0 / (1.0 + rB * rB)) * fadeB;
    col += mix(solarOrange, warmCream, 0.46) * ((ringA + ringB) * 0.15 * lowMask * floorLift);

    // Subtle pointer floor sheen (kept strictly quiet in upper dark space)
    vec2 dm = p - m;
    float cInv = 1.0 / (1.0 + dot(dm, dm) * 5.2);
    col += mix(solarOrange, warmCream, 0.35) * (cInv * cInv * 0.085 * (0.28 + 0.72 * lowMask));

    // Soft side & top studio vignette keeping corners pure pitch black
    float sideVig = smoothstep(0.96, 0.24, abs(uv.x - 0.5) * 1.45);
    float topClamp = mix(0.68, 1.0, lowMask);
    col = mix(pitchBlack, col, mix(0.55, 1.0, sideVig) * topClamp);

    // Filmic smooth highlight roll-off (preserves vivid orange saturation, zero muddy brown)
    col = col / (vec3(1.0) + col * 0.34);

    // Zero-trig SIGGRAPH Interleaved Gradient Noise anti-banding dither
    float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    col += (ign - 0.5) / 255.0;

    gl_FragColor = vec4(col, 1.0);
  }
`;

// 1-Draw-Call GPU Kinetic Motion-Graphic Rising Sparks (28 crisp geometric micro-squares & + crosshairs)
const SPARK_VERT = /* glsl */ `
  attribute vec3 aSeed;
  uniform float uTime;
  uniform float uScroll;
  uniform float uPulse;
  varying float vAlpha;
  varying float vShape;

  void main() {
    float speed = 0.045 + aSeed.z * 0.075;
    float life = fract(aSeed.y + uTime * speed + uScroll * (0.38 + aSeed.z * 0.3));
    float x = aSeed.x + sin(life * 6.28318 + aSeed.z * 12.0) * 0.06;
    float y = -0.98 + life * 1.78;
    vec4 mv = vec4(x, y, 0.0, 1.0);
    gl_Position = mv;
    float edgeFade = smoothstep(0.0, 0.16, life) * smoothstep(1.0, 0.62, life);
    vAlpha = edgeFade * (0.34 + 0.42 * aSeed.z + uPulse * 0.25);
    vShape = aSeed.z;
    gl_PointSize = (3.5 + aSeed.z * 4.5) * (1.0 + uPulse * 0.35);
  }
`;

const SPARK_FRAG = /* glsl */ `
  precision mediump float;
  varying float vAlpha;
  varying float vShape;

  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float mask;
    if (vShape > 0.52) {
      // Crisp kinetic '+' registration crosshair
      float barH = step(abs(p.y), 0.12) * step(abs(p.x), 0.44);
      float barV = step(abs(p.x), 0.12) * step(abs(p.y), 0.44);
      mask = max(barH, barV);
    } else {
      // Crisp micro-diamond geometric glyph
      mask = step(abs(p.x) + abs(p.y), 0.38);
    }
    if (mask < 0.5) discard;
    vec3 col = mix(vec3(1.0, 0.48, 0.16), vec3(1.0, 0.94, 0.88), vShape);
    gl_FragColor = vec4(col, vAlpha);
  }
`;

/**
 * Unified 1-Canvas GPU WebGL Stage:
 * - Scene 0: Pitch-Black Studio & Bottom Solar-Orange Horizon Uplight Shader (Zero-Lag 165 FPS)
 * - Scene 1: Beveled 3D ShadyFyrix Identity Cube + 63-bone NotGunGun 3D + Lightweight 3D Scroll Crystal
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
    let abstractMat: THREE.ShaderMaterial | null = null;
    let weaponTex: THREE.Texture | null = null;
    let weaponMat: THREE.MeshStandardMaterial | null = null;
    let weaponHolder: THREE.Group | null = null;
    let cubeTex: THREE.Texture | null = null;
    let cubeMat: THREE.MeshStandardMaterial | null = null;
    let ringMatA: THREE.MeshBasicMaterial | null = null;
    let ringMatB: THREE.MeshBasicMaterial | null = null;
    let miniCubeMat: THREE.LineBasicMaterial | null = null;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 860;

    const init = async () => {
      try {
        const w = Math.max(window.innerWidth, 320);
        const h = Math.max(window.innerHeight, 320);
        const pr = Math.min(window.devicePixelRatio || 1, 0.78);

        renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(pr);
        renderer.setSize(w, h);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.autoClear = false;
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        // Scene 0: Pitch-Black Studio & Bottom Solar-Orange Horizon Uplight Shader
        const bgScene = new THREE.Scene();
        const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        abstractMat = new THREE.ShaderMaterial({
          vertexShader: HORIZON_VERT,
          fragmentShader: HORIZON_FRAG,
          depthTest: false,
          depthWrite: false,
          uniforms: {
            uResolution: { value: new THREE.Vector2(w, h) },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uScroll: { value: 0 },
            uTime: { value: 0 },
            uFloorCenter: { value: new THREE.Vector2(0.0, -0.54) },
            uSideAccent: { value: new THREE.Vector2(0.32, -0.44) },
            uPulseStrength: { value: 0 },
            uAudio: { value: 0 },
          },
        });
        const bgQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), abstractMat);
        bgScene.add(bgQuad);

        // 1-Draw-Call Kinetic Geometric Motion-Graphic Rising Sparks (+ crosshairs & diamonds)
        const sparkCount = isMobile ? 16 : 28;
        const sparkPos = new Float32Array(sparkCount * 3);
        const sparkSeeds = new Float32Array(sparkCount * 3);
        for (let i = 0; i < sparkCount; i++) {
          const tSeed = (i + 0.5) / sparkCount;
          const hashA = ((i * 73 + 19) % 100) / 100;
          const hashB = ((i * 37 + 53) % 100) / 100;
          sparkSeeds[i * 3] = (tSeed * 2 - 1) * 0.92;
          sparkSeeds[i * 3 + 1] = hashA;
          sparkSeeds[i * 3 + 2] = hashB;
        }
        const sparkGeo = new THREE.BufferGeometry();
        sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
        sparkGeo.setAttribute('aSeed', new THREE.BufferAttribute(sparkSeeds, 3));
        const sparkMat = new THREE.ShaderMaterial({
          vertexShader: SPARK_VERT,
          fragmentShader: SPARK_FRAG,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uScroll: { value: 0 },
            uPulse: { value: 0 },
          },
        });
        const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
        bgScene.add(sparkPoints);

        // Scene 1: Beveled 3D ShadyFyrix Identity Cube + NotGunGun 3D
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 90);
        camera.position.set(0, 0.35, 6.4);

        const ambient = new THREE.AmbientLight(0xfff4eb, 1.55);
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
        keyLight.position.set(4.5, 6.5, 5.5);
        const rimCyan = new THREE.PointLight(0xff6a2b, 9.2, 18);
        rimCyan.position.set(-2.5, 2.2, 3.2);
        const rimSolar = new THREE.PointLight(0xffd2b3, 4.8, 16);
        rimSolar.position.set(3.8, -1.6, 2.2);
        scene.add(ambient, keyLight, rimCyan, rimSolar);

        const cubeStageGroup = new THREE.Group();
        const cubeRotGroup = new THREE.Group();
        const cubeBoxGeo = new THREE.BoxGeometry(1.86, 1.86, 1.86);

        ringMatA = new THREE.MeshBasicMaterial({
          color: 0xff7a3d,
          transparent: true,
          opacity: 0.34,
        });
        ringMatB = new THREE.MeshBasicMaterial({
          color: 0xffd5bd,
          transparent: true,
          opacity: 0.22,
        });
        const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.011, 10, 72), ringMatA);
        ringA.rotation.x = Math.PI * 0.42;
        const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.008, 10, 72), ringMatB);
        ringB.rotation.x = Math.PI * 0.58;
        ringB.rotation.y = 0.35;

        const miniGroup = new THREE.Group();
        const miniEdgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.18, 0.18, 0.18));
        miniCubeMat = new THREE.LineBasicMaterial({
          color: 0xff9a66,
          transparent: true,
          opacity: 0.52,
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
            emissive: new THREE.Color(0x1a0b05),
            emissiveIntensity: 0.32,
          });
          const cubeMesh = new THREE.Mesh(cubeBoxGeo, cubeMat);
          cubeRotGroup.add(cubeMesh);
          setWebglReady(true);
        };
        void loadShadyCube();

        const weaponStageGroup = new THREE.Group();
        const weaponRing = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.01, 12, 96), ringMatA);
        weaponRing.rotation.x = Math.PI * 0.44;
        weaponStageGroup.add(weaponRing);
        weaponStageGroup.visible = false;
        scene.add(weaponStageGroup);

        // Continuous 3D Scroll Companion: Bespoke Faceted Chrono-Prism Astrolabe Sculpture (~420 tris)
        const glassScrollGroup = new THREE.Group();

        // 1. Tall Faceted Architectural Crystal Monolith (flat-shaded twin pyramid + bright edge lines)
        const prismCoreGroup = new THREE.Group();
        const prismGeo = new THREE.OctahedronGeometry(0.96, 0);
        prismGeo.scale(0.76, 1.48, 0.76);
        const prismMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x281209),
          emissive: new THREE.Color(0x8a2c08),
          emissiveIntensity: 0.62,
          roughness: 0.16,
          metalness: 0.65,
          flatShading: true,
          transparent: true,
          opacity: 0.42,
        });
        const prismMesh = new THREE.Mesh(prismGeo, prismMat);

        const prismEdgeGeo = new THREE.EdgesGeometry(prismGeo);
        const prismEdgeMat = new THREE.LineBasicMaterial({
          color: 0xffd5bd,
          transparent: true,
          opacity: 0.52,
        });
        const prismEdges = new THREE.LineSegments(prismEdgeGeo, prismEdgeMat);

        // Twin Polar Crown Rings floating above & below crystal apexes
        const crownGeo = new THREE.TorusGeometry(0.56, 0.014, 6, 6);
        const crownMat = new THREE.MeshBasicMaterial({
          color: 0xff7a3d,
          transparent: true,
          opacity: 0.36,
        });
        const crownTop = new THREE.Mesh(crownGeo, crownMat);
        crownTop.rotation.x = Math.PI * 0.5;
        crownTop.position.y = 1.06;
        const crownBottom = new THREE.Mesh(crownGeo, crownMat);
        crownBottom.rotation.x = Math.PI * 0.5;
        crownBottom.position.y = -1.06;

        prismCoreGroup.add(prismMesh, prismEdges, crownTop, crownBottom);

        // 2. Inner Machined Octagonal Gimbal Bezel (counter-rotating on scroll)
        const gimbalGroup = new THREE.Group();
        const octaRingGeo = new THREE.TorusGeometry(1.38, 0.032, 6, 8);
        const octaRingMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xff6a2b),
          emissive: new THREE.Color(0x451404),
          emissiveIntensity: 0.55,
          roughness: 0.22,
          metalness: 0.72,
          flatShading: true,
          transparent: true,
          opacity: 0.36,
        });
        const octaRingMesh = new THREE.Mesh(octaRingGeo, octaRingMat);
        const octaRingEdgeGeo = new THREE.EdgesGeometry(octaRingGeo);
        const octaRingWire = new THREE.LineSegments(octaRingEdgeGeo, prismEdgeMat);
        gimbalGroup.add(octaRingMesh, octaRingWire);
        gimbalGroup.rotation.x = Math.PI * 0.34;

        // 3. Outer Precision Astrolabe Ring with 4 Orbiting Diamond Satellite Pylons
        const astrolabeGroup = new THREE.Group();
        const astroRingGeo = new THREE.TorusGeometry(1.92, 0.014, 8, 64);
        const astroRingMat = new THREE.MeshBasicMaterial({
          color: 0xffb388,
          transparent: true,
          opacity: 0.26,
        });
        const astroRing = new THREE.Mesh(astroRingGeo, astroRingMat);
        astrolabeGroup.add(astroRing);

        const satGeo = new THREE.OctahedronGeometry(0.12, 0);
        const satMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xfff0e6),
          emissive: new THREE.Color(0xff6a2b),
          emissiveIntensity: 0.75,
          roughness: 0.15,
          metalness: 0.4,
          flatShading: true,
          transparent: true,
          opacity: 0.65,
        });
        for (let i = 0; i < 4; i++) {
          const ang = (i * Math.PI) / 2;
          const sat = new THREE.Mesh(satGeo, satMat);
          sat.position.set(Math.cos(ang) * 1.92, Math.sin(ang) * 1.92, 0);
          sat.scale.set(0.75, 1.35, 0.75);
          sat.rotation.z = ang;
          astrolabeGroup.add(sat);
        }
        astrolabeGroup.rotation.x = Math.PI * 0.58;
        astrolabeGroup.rotation.y = 0.42;

        glassScrollGroup.add(prismCoreGroup, gimbalGroup, astrolabeGroup);
        glassScrollGroup.visible = false;
        scene.add(glassScrollGroup);

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
            emissive: new THREE.Color(0x1f0d06),
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
        let lastRenderTime = lastTime - 20;
        let elapsed = 0;
        let isNarrowViewport = w < 960;

        const onResize = () => {
          if (!renderer || disposed) return;
          const nw = Math.max(window.innerWidth, 320);
          const nh = Math.max(window.innerHeight, 320);
          isNarrowViewport = nw < 960;
          const npr = Math.min(window.devicePixelRatio || 1, 0.78);
          renderer.setPixelRatio(npr);
          renderer.setSize(nw, nh);
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          abstractMat?.uniforms.uResolution.value.set(nw, nh);
        };
        window.addEventListener('resize', onResize);

        // Cap WebGL to ~60 FPS on 120Hz-240Hz monitors so GPU stays cool & browser scroll stays buttery
        const MIN_WEBGL_FRAME_MS = 15.5;

        const renderFrame = (now: number) => {
          if (disposed || !renderer) return;

          if (document.hidden) {
            lastTime = now;
            rafId = requestAnimationFrame(renderFrame);
            return;
          }

          if (now - lastRenderTime < MIN_WEBGL_FRAME_MS) {
            rafId = requestAnimationFrame(renderFrame);
            return;
          }
          lastRenderTime = now;

          const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
          lastTime = now;

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

          if (abstractMat) {
            const res = abstractMat.uniforms.uResolution.value as THREE.Vector2;
            const aspect = res.x / Math.max(1, res.y);
            const tHoriz = elapsed * 0.22 * (reducedMotion ? 0.16 : 1.0);
            const mx = smoothMouse.x * 0.12 * aspect;

            abstractMat.uniforms.uMouse.value.copy(smoothMouse);
            abstractMat.uniforms.uScroll.value = smoothScroll;
            abstractMat.uniforms.uTime.value = reducedMotion ? 0 : elapsed;
            // Bottom-center radiant Solar-Orange horizon dome gently breathing & tracking scroll/pointer
            abstractMat.uniforms.uFloorCenter.value.set(
              Math.sin(smoothScroll * Math.PI * 1.8) * 0.18 * aspect + Math.sin(tHoriz * 0.65) * 0.06 + mx,
              -0.54 + Math.cos(tHoriz * 0.48) * 0.025
            );
            abstractMat.uniforms.uSideAccent.value.set(
              (0.28 - smoothScroll * 0.56) * aspect + Math.cos(tHoriz * 0.55) * 0.08 - mx * 0.5,
              -0.44 + Math.sin(tHoriz * 0.42) * 0.03
            );
            abstractMat.uniforms.uPulseStrength.value = state.pulseStrength;
            abstractMat.uniforms.uAudio.value = smoothAudio;
          }
          sparkMat.uniforms.uTime.value = reducedMotion ? 0 : elapsed;
          sparkMat.uniforms.uScroll.value = smoothScroll;
          sparkMat.uniforms.uPulse.value = state.pulseStrength;

          renderer.clear();
          renderer.render(bgScene, bgCamera);

          // Render Scene 1: Hero 3D Models + Continuous 3D Scroll Liquid-Glass Sculpture
          const is3DMode = state.heroMode === 'shady-cube' || state.heroMode === 'notgungun-3d';
          const heroVisibility = Math.max(0, 1 - smoothScroll * 6.2);
          const scrollCompanionVis = THREE.MathUtils.smoothstep(smoothScroll, 0.08, 0.24);

          if (
            heroVisibility > 0.01 ||
            scrollCompanionVis > 0.01 ||
            cubeStageGroup.visible ||
            weaponStageGroup.visible ||
            glassScrollGroup.visible
          ) {
            if (state.cubeJumpY > 0 || state.cubeJumpVel !== 0) {
              state.cubeJumpY += state.cubeJumpVel * dt;
              state.cubeJumpVel -= 19.5 * dt;
              if (state.cubeJumpY <= 0) {
                state.cubeJumpY = 0;
                state.cubeJumpVel = 0;
              }
            }
            state.cubeFlipCurrent += (state.cubeFlipTarget - state.cubeFlipCurrent) * 0.14;

            const narrow = isNarrowViewport;
            const hoverActive = state.hoveredProjectIndex >= 0 ? 1 : 0;

            // Smooth 3D scroll camera elevation & orbital sway
            camera.position.set(
              smoothMouse.x * 0.48 + Math.sin(smoothScroll * Math.PI * 2.0) * 0.35,
              0.32 + smoothMouse.y * 0.24 - Math.sin(smoothScroll * Math.PI) * 0.28,
              6.4
            );
            camera.lookAt(0, -0.04, 0);

            rimCyan.position.set(smoothMouse.x * 4.5 - 1.2, smoothMouse.y * 3.0 + 1.8, 3.2);
            rimCyan.intensity = 8.4 + smoothAudio * 10.0 + state.pulseStrength * 9.0 + hoverActive * 3.0;
            rimSolar.intensity = 4.4 + state.recoil * 12.0 + smoothScroll * 3.2;

            if (state.autoSpin && !state.isDragging && !reducedMotion) {
              state.rotTargetY += dt * 0.52;
            }

            const cubeActive = is3DMode && state.heroMode === 'shady-cube';
            const cubeScaleTarget =
              (narrow ? 0.46 : 1.04) * heroVisibility * (cubeActive ? 1 : 0.0001);
            const curCubeScale = THREE.MathUtils.lerp(
              cubeStageGroup.scale.x || 0.0001,
              Math.max(0.0001, cubeScaleTarget),
              0.16
            );
            cubeStageGroup.visible = curCubeScale > 0.015;

            if (cubeStageGroup.visible) {
              const squash = state.cubeJumpY > 0 ? 1 + Math.min(0.14, state.cubeJumpY * 0.08) : 1;
              cubeStageGroup.position.x = narrow ? 0 : 1.05 + smoothScroll * 6.4;
              cubeStageGroup.position.y = narrow
                ? 1.44 + state.cubeJumpY * 0.34 + Math.sin(elapsed * 1.5) * 0.05 + smoothScroll * 3.2
                : 0.36 + state.cubeJumpY * 0.52 + Math.sin(elapsed * 1.5) * 0.1 + smoothScroll * 2.6;
              cubeStageGroup.position.z = -smoothScroll * 5.8;
              cubeStageGroup.scale.set(
                curCubeScale / Math.sqrt(squash),
                curCubeScale * squash,
                curCubeScale / Math.sqrt(squash)
              );

              if (cubeMat && cubeMat.wireframe !== state.wireframe) {
                cubeMat.wireframe = state.wireframe;
                cubeMat.emissive.set(state.wireframe ? 0xff6a2b : 0x1a0b05);
                cubeMat.emissiveIntensity = state.wireframe ? 1.15 : 0.32;
                cubeMat.needsUpdate = true;
              }

              cubeRotGroup.rotation.x +=
                (state.rotTargetX + smoothMouse.y * 0.32 - cubeRotGroup.rotation.x) * 0.14;
              cubeRotGroup.rotation.y +=
                (state.rotTargetY + smoothMouse.x * 0.38 - cubeRotGroup.rotation.y) * 0.14;
              cubeRotGroup.rotation.z = state.cubeFlipCurrent;

              ringA.rotation.z = elapsed * 0.36;
              ringB.rotation.z = -elapsed * 0.24;
              ringB.rotation.x = Math.PI * 0.58 + smoothMouse.y * 0.24;

              const burst = 1 + state.pulseStrength * 0.45 + smoothAudio * 0.35;
              for (const item of miniItems) {
                const a = item.angle + elapsed * item.speed;
                item.mesh.position.set(
                  Math.cos(a) * item.r * burst,
                  item.yOff + Math.sin(elapsed * 1.6 + item.angle) * 0.18,
                  Math.sin(a) * item.r * burst
                );
                item.mesh.rotation.x = elapsed * 0.9 + item.angle;
                item.mesh.rotation.y = elapsed * 0.7;
              }
            } else {
              cubeStageGroup.scale.setScalar(curCubeScale);
            }

            const weaponActive = is3DMode && state.heroMode === 'notgungun-3d';
            const weaponScaleTarget =
              (narrow ? 0.52 : 1.02) * heroVisibility * (weaponActive ? 1 : 0.0001);
            const curWeaponScale = THREE.MathUtils.lerp(
              weaponStageGroup.scale.x || 0.0001,
              Math.max(0.0001, weaponScaleTarget),
              0.16
            );
            weaponStageGroup.scale.setScalar(curWeaponScale);
            weaponStageGroup.visible = curWeaponScale > 0.015;

            if (weaponStageGroup.visible) {
              weaponStageGroup.position.x = narrow ? 0 : 0.96 + smoothScroll * 5.6;
              weaponStageGroup.position.y = narrow
                ? 1.48 + Math.sin(elapsed * 1.15) * 0.05 + smoothScroll * 2.8
                : 0.3 + Math.sin(elapsed * 1.15) * 0.08 + smoothScroll * 2.2;
              weaponStageGroup.position.z = -smoothScroll * 4.5 - state.recoil * 0.48;
              weaponRing.rotation.z = -elapsed * 0.3;

              if (weaponHolder && weaponMat) {
                if (weaponMat.wireframe !== state.wireframe) {
                  weaponMat.wireframe = state.wireframe;
                  weaponMat.emissive.set(state.wireframe ? 0xff6a2b : 0x1f0d06);
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
            }

            // Continuous 3D Scroll Liquid-Glass Sculptural Gyroscope gliding along an S-curve spline
            const glassScaleTarget = (narrow ? 0.68 : 1.02) * scrollCompanionVis;
            const curGlassScale = THREE.MathUtils.lerp(
              glassScrollGroup.scale.x || 0.0001,
              Math.max(0.0001, glassScaleTarget),
              0.12
            );
            glassScrollGroup.scale.setScalar(curGlassScale);
            glassScrollGroup.visible = curGlassScale > 0.02;

            if (glassScrollGroup.visible) {
              const sAngle = smoothScroll * Math.PI * 2.4;
              glassScrollGroup.position.x = narrow ? smoothMouse.x * 0.5 : Math.sin(sAngle) * 2.55 + smoothMouse.x * 0.52;
              glassScrollGroup.position.y = Math.cos(sAngle * 0.7) * 0.45 + smoothMouse.y * 0.3;
              glassScrollGroup.position.z = -2.35 + Math.sin(smoothScroll * Math.PI) * 0.92;

              const scrollSpin = reducedMotion ? 0 : smoothScroll * Math.PI * 3.6;
              prismCoreGroup.rotation.y = scrollSpin * 0.95 + elapsed * 0.34 + smoothMouse.x * 0.44;
              prismCoreGroup.rotation.x = Math.sin(elapsed * 0.55) * 0.18 + smoothMouse.y * 0.3;
              crownTop.rotation.z = elapsed * 0.65;
              crownBottom.rotation.z = -elapsed * 0.65;

              gimbalGroup.rotation.x = Math.PI * 0.34 + scrollSpin * 0.48 + elapsed * 0.22;
              gimbalGroup.rotation.y = -scrollSpin * 0.62 - elapsed * 0.28;
              astrolabeGroup.rotation.z = elapsed * 0.32 + scrollSpin * 0.42;
              astrolabeGroup.rotation.x = Math.PI * 0.58 + smoothMouse.y * 0.26;

              prismMat.opacity = (0.34 + state.pulseStrength * 0.18 + smoothAudio * 0.12) * scrollCompanionVis;
              prismEdgeMat.opacity = (0.42 + state.pulseStrength * 0.28) * scrollCompanionVis;
              crownMat.opacity = (0.30 + state.pulseStrength * 0.24) * scrollCompanionVis;
              octaRingMat.opacity = (0.28 + state.pulseStrength * 0.18) * scrollCompanionVis;
              astroRingMat.opacity = (0.22 + state.pulseStrength * 0.20) * scrollCompanionVis;
              satMat.opacity = (0.58 + state.pulseStrength * 0.28) * scrollCompanionVis;
            }

            if (cubeStageGroup.visible || weaponStageGroup.visible || glassScrollGroup.visible) {
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
          sparkGeo.dispose();
          sparkMat.dispose();
          cubeBoxGeo.dispose();
          miniEdgeGeo.dispose();
          ringA.geometry.dispose();
          ringB.geometry.dispose();
          weaponRing.geometry.dispose();
          prismGeo.dispose();
          prismMat.dispose();
          prismEdgeGeo.dispose();
          prismEdgeMat.dispose();
          crownGeo.dispose();
          crownMat.dispose();
          octaRingGeo.dispose();
          octaRingMat.dispose();
          octaRingEdgeGeo.dispose();
          astroRingGeo.dispose();
          astroRingMat.dispose();
          satGeo.dispose();
          satMat.dispose();
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
      abstractMat?.dispose();
      weaponMat?.dispose();
      weaponTex?.dispose();
      cubeMat?.dispose();
      cubeTex?.dispose();
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
