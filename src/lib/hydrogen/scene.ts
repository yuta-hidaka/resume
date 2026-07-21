/**
 * three.js point-cloud renderer for hydrogen orbital probability clouds.
 * Transparent canvas over the site background. Two point layers — a crisp core
 * and a wide, faint bloom halo (dark mode) — give the cloud real luminosity;
 * points are tinted by phase sign and shaded by radius for depth. Colors follow
 * the site theme: additive glow in dark mode, refined ink in light mode.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { sampleOrbital, type OrbitalSpec } from './orbital';
import { softSprite, sampleRamp, isDark, type RGB } from '../lab/viz';

const POINT_COUNT = 26000;
/** All orbitals are rescaled so r95 lands on this world radius. */
const FRAME_RADIUS = 10;

const PALETTE = {
  dark: {
    // phase-+ and phase-− ramps (inner→outer): luminous cores fading to deep hue
    plus: [
      [180, 240, 210],
      [94, 203, 151],
      [24, 120, 84],
    ] as RGB[],
    minus: [
      [246, 226, 184],
      [217, 179, 108],
      [150, 104, 40],
    ] as RGB[],
    opacity: 0.5,
    bloomOpacity: 0.18,
    additive: true,
    proton: '#e6b45a',
    neutron: '#8e959c',
  },
  light: {
    plus: [
      [46, 130, 96],
      [20, 105, 74],
      [10, 70, 48],
    ] as RGB[],
    minus: [
      [150, 112, 52],
      [130, 92, 34],
      [95, 66, 22],
    ] as RGB[],
    opacity: 0.82,
    bloomOpacity: 0,
    additive: false,
    proton: '#b08430',
    neutron: '#6f767d',
  },
};

const ramp3 = (c: RGB[], t: number): RGB =>
  sampleRamp(
    [
      [0, c[0]],
      [0.5, c[1]],
      [1, c[2]],
    ],
    t,
  );

/** Schematic nucleus size in world units — hugely exaggerated (a real proton
 *  is ~10⁻⁵ of the Bohr radius and would be invisible). */
const NUCLEON_RADIUS = 0.3;

function makeSpriteTexture(core: number): THREE.Texture {
  const tex = new THREE.CanvasTexture(softSprite(128, core));
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Points revealed per frame while the cloud "accumulates". */
const REVEAL_PER_FRAME = 150;

export interface OrbitalScene {
  setOrbital(spec: OrbitalSpec): void;
  /** Rebuild the schematic nucleus (protons gold, neutrons gray). */
  setNucleus(protons: number, neutrons: number): void;
  dispose(): void;
}

export function createOrbitalScene(
  canvas: HTMLCanvasElement,
  onProgress?: (shown: number, total: number) => void,
): OrbitalScene {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 300);
  camera.position.set(0, FRAME_RADIUS * 0.9, FRAME_RADIUS * 2.4);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  controls.autoRotateSpeed = 0.6;
  controls.minDistance = FRAME_RADIUS * 0.6;
  controls.maxDistance = FRAME_RADIUS * 6;

  const geometry = new THREE.BufferGeometry();
  const coreMaterial = new THREE.PointsMaterial({
    size: 0.15,
    map: makeSpriteTexture(0.5),
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const bloomMaterial = new THREE.PointsMaterial({
    size: 0.66,
    map: makeSpriteTexture(0.08),
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
  });
  const corePoints = new THREE.Points(geometry, coreMaterial);
  const bloomPoints = new THREE.Points(geometry, bloomMaterial);
  bloomPoints.renderOrder = -1;
  scene.add(bloomPoints);
  scene.add(corePoints);

  // Draw-order index buffer. Light mode blends the core layer with NormalBlending,
  // which is order-dependent, so we re-sort the revealed prefix back-to-front by
  // camera distance each tick (see sortByDepth). Dark mode is additive
  // (order-independent) and stays in sample order so the cloud accumulates as
  // scattered single events.
  const order = new Uint32Array(POINT_COUNT);
  for (let i = 0; i < POINT_COUNT; i++) order[i] = i;
  const indexAttr = new THREE.BufferAttribute(order, 1);
  geometry.setIndex(indexAttr);

  // Lighting for the schematic nucleus.
  scene.add(new THREE.AmbientLight(0xffffff, 1.0));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(3, 5, 4);
  scene.add(keyLight);
  const coreGlow = new THREE.PointLight(0xffe6b0, 6, 6, 2);
  scene.add(coreGlow);

  const nucleus = new THREE.Group();
  scene.add(nucleus);
  const nucleonGeometry = new THREE.SphereGeometry(NUCLEON_RADIUS, 32, 20);
  const protonMaterial = new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.15 });
  const neutronMaterial = new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.08 });
  let nucleusSpec = { protons: 1, neutrons: 0 };

  /** Close-packed offsets for up to 3 nucleons (touching spheres). */
  const NUCLEON_OFFSETS: [number, number, number][][] = [
    [],
    [[0, 0, 0]],
    [
      [-NUCLEON_RADIUS, 0, 0],
      [NUCLEON_RADIUS, 0, 0],
    ],
    [
      [0, NUCLEON_RADIUS * 1.05, 0],
      [-NUCLEON_RADIUS, -NUCLEON_RADIUS * 0.65, 0],
      [NUCLEON_RADIUS, -NUCLEON_RADIUS * 0.65, 0],
    ],
  ];

  const buildNucleus = () => {
    nucleus.clear();
    const total = Math.min(3, nucleusSpec.protons + nucleusSpec.neutrons);
    const offsets = NUCLEON_OFFSETS[total];
    for (let i = 0; i < total; i++) {
      const isProton = i < nucleusSpec.protons;
      const mesh = new THREE.Mesh(nucleonGeometry, isProton ? protonMaterial : neutronMaterial);
      mesh.position.set(...offsets[i]);
      nucleus.add(mesh);
    }
  };
  buildNucleus();

  let signs: Int8Array<ArrayBufferLike> = new Int8Array(0);
  let radiiNorm = new Float32Array(0); // per-point radius, normalized to [0,1]
  let positions: Float32Array<ArrayBufferLike> = new Float32Array(0); // world-space xyz, kept for depth sorting
  const sortDist = new Float32Array(POINT_COUNT); // scratch: squared camera distance per sample
  let depthSort = false; // true in light mode (order-dependent alpha blending)

  const applyTheme = () => {
    const dark = isDark();
    const palette = PALETTE[dark ? 'dark' : 'light'];
    coreMaterial.opacity = palette.opacity;
    coreMaterial.blending = palette.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    coreMaterial.needsUpdate = true;
    depthSort = !palette.additive; // only NormalBlending needs back-to-front ordering
    bloomMaterial.opacity = palette.bloomOpacity;
    bloomMaterial.visible = palette.bloomOpacity > 0;
    protonMaterial.color.set(palette.proton);
    protonMaterial.emissive.set(palette.proton);
    protonMaterial.emissiveIntensity = dark ? 0.35 : 0.12;
    neutronMaterial.color.set(palette.neutron);
    neutronMaterial.emissive.set(palette.neutron);
    neutronMaterial.emissiveIntensity = dark ? 0.12 : 0.04;
    coreGlow.intensity = dark ? 6 : 1.5;

    const colors = new Float32Array(signs.length * 3);
    for (let i = 0; i < signs.length; i++) {
      // Inner points brighter/paler, outer points deep — depth by radius.
      const c = ramp3(signs[i] > 0 ? palette.plus : palette.minus, radiiNorm[i]);
      colors[i * 3] = c[0] / 255;
      colors[i * 3 + 1] = c[1] / 255;
      colors[i * 3 + 2] = c[2] / 255;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  };

  // The cloud builds up sample by sample: each frame reveals a few more of
  // the |ψ|² draws, so the distribution visibly emerges from single events.
  let revealed = 0;

  const setOrbital = (spec: OrbitalSpec) => {
    const samples = sampleOrbital(spec, POINT_COUNT);
    const scale = FRAME_RADIUS / samples.r95;
    for (let i = 0; i < samples.positions.length; i++) samples.positions[i] *= scale;
    signs = samples.signs;
    // Per-point radius (normalized) for depth-shaded color.
    radiiNorm = new Float32Array(signs.length);
    let rMax = 1e-6;
    for (let i = 0; i < signs.length; i++) {
      const x = samples.positions[i * 3];
      const y = samples.positions[i * 3 + 1];
      const z = samples.positions[i * 3 + 2];
      const r = Math.sqrt(x * x + y * y + z * z);
      radiiNorm[i] = r;
      if (r > rMax) rMax = r;
    }
    for (let i = 0; i < signs.length; i++) radiiNorm[i] = Math.min(1, radiiNorm[i] / (rMax * 0.85));
    geometry.setAttribute('position', new THREE.BufferAttribute(samples.positions, 3));
    positions = samples.positions;
    // Reset draw order to sample order (identity); light mode re-sorts each tick.
    for (let i = 0; i < POINT_COUNT; i++) order[i] = i;
    indexAttr.needsUpdate = true;
    revealed = 0;
    geometry.setDrawRange(0, 0);
    onProgress?.(0, POINT_COUNT);
    applyTheme();
  };

  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  window.addEventListener('resize', resize);
  resize();

  // Back-to-front sort of the revealed prefix by camera distance, so the
  // order-dependent light-mode blend resolves nearer lobes over farther ones.
  // Only the first `revealed` slots are touched, so the visible set stays the
  // first-N samples — reveal semantics are preserved, only draw order changes.
  const cameraPos = new THREE.Vector3();
  const sortByDepth = () => {
    if (!depthSort || revealed < 2) return;
    camera.getWorldPosition(cameraPos);
    const { x: cx, y: cy, z: cz } = cameraPos;
    for (let i = 0; i < revealed; i++) {
      const j = order[i];
      const dx = positions[j * 3] - cx;
      const dy = positions[j * 3 + 1] - cy;
      const dz = positions[j * 3 + 2] - cz;
      sortDist[j] = dx * dx + dy * dy + dz * dz;
    }
    order.subarray(0, revealed).sort((a, b) => sortDist[b] - sortDist[a]);
    indexAttr.needsUpdate = true;
  };

  let rafId = 0;
  let sortTick = 0;
  const loop = () => {
    rafId = requestAnimationFrame(loop);
    if (revealed < POINT_COUNT && signs.length > 0) {
      revealed = Math.min(POINT_COUNT, revealed + REVEAL_PER_FRAME);
      geometry.setDrawRange(0, revealed);
      onProgress?.(revealed, POINT_COUNT);
    }
    nucleus.rotation.y += 0.004;
    nucleus.rotation.x += 0.0017;
    controls.update();
    // Re-sort every ~12 frames: the auto-rotate drift between ticks is <2°, so
    // the throttle is imperceptible but keeps the per-frame cost negligible.
    if (depthSort && ++sortTick % 12 === 0) sortByDepth();
    renderer.render(scene, camera);
  };
  const onVisibility = () => {
    cancelAnimationFrame(rafId);
    if (!document.hidden) loop();
  };
  document.addEventListener('visibilitychange', onVisibility);
  loop();

  return {
    setOrbital,
    setNucleus(protons, neutrons) {
      nucleusSpec = { protons, neutrons };
      buildNucleus();
    },
    dispose() {
      nucleonGeometry.dispose();
      protonMaterial.dispose();
      neutronMaterial.dispose();
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisibility);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
      controls.dispose();
      geometry.dispose();
      coreMaterial.map?.dispose();
      coreMaterial.dispose();
      bloomMaterial.map?.dispose();
      bloomMaterial.dispose();
      renderer.dispose();
    },
  };
}
