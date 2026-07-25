/**
 * The expanding universe, in three dimensions.
 *
 * Galaxies sit at fixed COMOVING positions on a jittered 3D lattice and are drawn
 * at comoving × a(t), so the camera is looking at physical space and watching it
 * stretch. Nothing moves through space; space itself grows, which is the whole
 * content of the Friedmann solution.
 *
 * Rendering: two additive point layers — a crisp core and a wide bloom — plus a
 * depth-graded palette and exponential fog, so distant galaxies dim and redden
 * into the background instead of stacking into a flat sheet. The camera drifts on
 * its own; a filament-like distribution is used rather than a plain cubic grid so
 * the field reads as large-scale structure and not as graph paper.
 *
 * Physics comes from ./cosmology; this file only shows it.
 */

import * as THREE from 'three';
import { softSprite, sampleRamp, ramp, isDark, type RGB } from './viz';

const N_GALAXIES = 6500;
/** Comoving half-width of the seeded volume, in the same units as the camera. */
const BOX = 26;

export interface Friedmann3D {
  /** Set the current scale factor; positions are comoving × a. */
  setScale(a: number): void;
  /** 0 → 1, how far along the plotted history the playhead sits (drives colour). */
  setPhase(p: number): void;
  resize(): void;
  render(dt: number): void;
  dispose(): void;
}

/**
 * A clustered comoving distribution: points are drawn toward a set of random
 * filament segments, which gives voids and sheets instead of a uniform cube. It
 * is a caricature of large-scale structure, not an N-body result.
 */
function seedComoving(count: number): Float32Array {
  let s = 20260725 >>> 0;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff), s / 0x7fffffff);
  const gauss = () => {
    const u = Math.max(1e-9, rnd());
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
  };

  const FILAMENTS = 26;
  const nodes: number[][] = [];
  while (nodes.length < FILAMENTS) {
    const x = (rnd() * 2 - 1) * BOX;
    const y = (rnd() * 2 - 1) * BOX;
    const z = (rnd() * 2 - 1) * BOX;
    if (x * x + y * y + z * z <= BOX * BOX) nodes.push([x, y, z]);
  }

  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    if (rnd() < 0.22) {
      // a fraction scattered through the voids, so they are not empty
      const u = Math.cbrt(rnd()) * BOX;
      const ct = rnd() * 2 - 1;
      const st = Math.sqrt(1 - ct * ct);
      const ph = rnd() * Math.PI * 2;
      out[i * 3] = u * st * Math.cos(ph);
      out[i * 3 + 1] = u * st * Math.sin(ph);
      out[i * 3 + 2] = u * ct;
      continue;
    }
    const a = nodes[Math.floor(rnd() * FILAMENTS)];
    const b = nodes[Math.floor(rnd() * FILAMENTS)];
    const t = rnd();
    const spread = 1.5 + 2.4 * rnd();
    out[i * 3] = a[0] + (b[0] - a[0]) * t + gauss() * spread;
    out[i * 3 + 1] = a[1] + (b[1] - a[1]) * t + gauss() * spread;
    out[i * 3 + 2] = a[2] + (b[2] - a[2]) * t + gauss() * spread;
  }
  // pull everything inside a sphere so the field has no cube silhouette
  for (let i = 0; i < count; i++) {
    const x = out[i * 3];
    const y = out[i * 3 + 1];
    const z = out[i * 3 + 2];
    const d = Math.sqrt(x * x + y * y + z * z);
    if (d > BOX) {
      const k = (BOX * (0.55 + 0.45 * (BOX / d))) / d;
      out[i * 3] = x * k;
      out[i * 3 + 1] = y * k;
      out[i * 3 + 2] = z * k;
    }
  }
  return out;
}

export function createFriedmann3D(canvas: HTMLCanvasElement): Friedmann3D {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 400);
  camera.position.set(0, 3.2, 34);
  camera.lookAt(0, 0, 0);

  const comoving = seedComoving(N_GALAXIES);
  const positions = new Float32Array(comoving.length);
  const colors = new Float32Array(comoving.length);
  const sizes = new Float32Array(N_GALAXIES);
  const spin0 = new Float32Array(N_GALAXIES); // sky-plane orientation
  const squash = new Float32Array(N_GALAXIES); // 1 = face-on, →0 = edge-on
  const warm = new Float32Array(N_GALAXIES); // colour temperature, 0 blue … 1 red

  let s = 7 >>> 0;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff), s / 0x7fffffff);
  for (let i = 0; i < N_GALAXIES; i++) {
    // a steep size distribution: a few big nearby spirals, a haze of faint ones
    sizes[i] = 0.32 + 2.1 * Math.pow(rnd(), 3.1);
    spin0[i] = rnd() * Math.PI * 2;
    // random inclination — cos i uniform on the sphere gives realistic axis ratios
    squash[i] = 0.18 + 0.82 * Math.abs(rnd() * 2 - 1);
    warm[i] = rnd();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aSpin', new THREE.BufferAttribute(spin0, 1));
  geometry.setAttribute('aSquash', new THREE.BufferAttribute(squash, 1));

  const sprite = new THREE.CanvasTexture(softSprite(128, 0.34));
  sprite.colorSpace = THREE.SRGBColorSpace;

  /** Point material with per-point size and true perspective attenuation. */
  const makeMaterial = (scale: number, opacity: number, additive: boolean, maxSize = 40) =>
    new THREE.ShaderMaterial({
      uniforms: {
        uSprite: { value: sprite },
        uScale: { value: scale },
        uOpacity: { value: opacity },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uFogNear: { value: 18 },
        uFogFar: { value: 120 },
        uMaxSize: { value: maxSize },
      },
      vertexShader: `
        attribute float size;
        attribute float aSpin;
        attribute float aSquash;
        varying vec3 vColor;
        varying float vFog;
        varying float vSpin;
        varying float vSquash;
        varying float vNear;
        uniform float uScale;
        uniform float uPixelRatio;
        uniform float uFogNear;
        uniform float uFogFar;
        uniform float uMaxSize;
        void main() {
          vColor = color;
          vSpin = aSpin;
          vSquash = aSquash;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float dist = -mv.z;
          vFog = 1.0 - clamp((dist - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
          // only the closest galaxies are resolved into discs; the rest stay points
          vNear = 1.0 - clamp((dist - 8.0) / 26.0, 0.0, 1.0);
          // Angular size falls with distance, but it must also be CAPPED: a
          // sprite whose radius approaches the viewport turns three additive
          // layers over thousands of points into solid white the moment the field
          // contracts toward the origin at small a.
          gl_PointSize = min(size * uScale * (140.0 / max(dist, 1.2)), uMaxSize) * uPixelRatio;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform sampler2D uSprite;
        uniform float uOpacity;
        varying vec3 vColor;
        varying float vFog;
        varying float vSpin;
        varying float vSquash;
        varying float vNear;
        void main() {
          // Rotate and flatten the sprite per point: an inclined disc with a
          // brighter bulge, rather than the same round blob 14000 times.
          vec2 p = gl_PointCoord - 0.5;
          float c = cos(vSpin), s = sin(vSpin);
          vec2 r = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
          float squash = mix(1.0, vSquash, vNear);
          r.y /= max(0.22, squash);
          vec4 t = texture2D(uSprite, r + 0.5);
          // a compact bulge on top of the disc, only where it is resolved
          float bulge = exp(-dot(p, p) * 42.0) * vNear * 0.85;
          float a = (t.a + bulge) * uOpacity * vFog;
          if (a < 0.004) discard;
          gl_FragColor = vec4(vColor + bulge * 0.10, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      vertexColors: true,
    });

  let dark = isDark();
  const core = makeMaterial(1, 0.62, dark, 22);
  const bloom = makeMaterial(2.6, 0.06, dark, 54);
  const haze = makeMaterial(6, 0.02, dark, 110);
  const corePoints = new THREE.Points(geometry, core);
  const bloomPoints = new THREE.Points(geometry, bloom);
  const hazePoints = new THREE.Points(geometry, haze);
  for (const o of [corePoints, bloomPoints, hazePoints]) o.frustumCulled = false;
  scene.add(hazePoints);
  scene.add(bloomPoints);
  scene.add(corePoints);

  // A faint comoving cage: the ruler that makes the stretching legible.
  const cageGeo = new THREE.BufferGeometry();
  {
    const seg: number[] = [];
    const K = 2;
    const step = BOX / K;
    for (let i = -K; i <= K; i++) {
      for (let j = -K; j <= K; j++) {
        seg.push(i * step, j * step, -BOX, i * step, j * step, BOX);
        seg.push(i * step, -BOX, j * step, i * step, BOX, j * step);
        seg.push(-BOX, i * step, j * step, BOX, i * step, j * step);
      }
    }
    cageGeo.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
  }
  const cageMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.05 });
  const cage = new THREE.LineSegments(cageGeo, cageMat);
  scene.add(cage);

  let scaleA = 1;
  let phase = 0;
  let spin = 0;

  /**
   * Exposure, tied to the scale factor.
   *
   * Positions are comoving × a, so as a → 0 every galaxy collapses toward the
   * origin and three additive layers over 9000 points clip to solid white. Two
   * things fix it, and both are honest:
   *
   *  - Galaxies did not exist before roughly z ≈ 10, so fade them out below
   *    a ≈ 0.14 and let the wide haze layer carry that era instead — which reads
   *    as the hot, structureless plasma it actually was.
   *  - The camera pulls in as a shrinks (∝ √a), so the field keeps roughly the
   *    same angular size instead of becoming a point or leaving the frame.
   */
  const smoothstep = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const applyExposure = () => {
    // Galaxies fade in over roughly z = 20 → 3: before that there were none to
    // draw, which is both true and the reason the frame is not a white disc.
    const emerge = smoothstep(0.05, 0.26, scaleA);
    // On-screen density: the field's angular size goes as a/dist ∝ √a while the
    // galaxy count is fixed, so surface density rises as 1/a. Dimming each point
    // in proportion keeps total brightness roughly constant instead of letting
    // additive blending clip to white.
    const density = Math.min(1, 0.32 + 0.68 * scaleA);
    const lit = dark ? 1 : 1.05;
    core.uniforms.uOpacity.value = 0.62 * emerge * density * lit;
    bloom.uniforms.uOpacity.value = (dark ? 0.06 : 0) * emerge * density;
    // the haze carries the pre-galactic era, so it runs the other way
    haze.uniforms.uOpacity.value = (dark ? 0.02 : 0) * (2.6 - 1.6 * emerge) * density;
    cageMat.opacity = (dark ? 0.028 : 0.05) * (0.3 + 0.7 * emerge);
  };

  /**
   * Colour by depth AND by the era: early = hot blue-white, late = emerald→gold.
   *
   * The ramps are baked into small lookup tables first: sampling them per galaxy
   * meant 6500 ramp walks per repaint, sixteen times a second.
   */
  const LUT = 64;
  const bake = (name: 'spectral' | 'emerald'): RGB[] => {
    const r = ramp(name);
    const out: RGB[] = [];
    for (let i = 0; i < LUT; i++) out.push(sampleRamp(r, i / (LUT - 1)));
    return out;
  };
  const paint = () => {
    const spec = bake('spectral');
    const em = bake('emerald');
    const pick = (tbl: RGB[], t: number) => tbl[Math.min(LUT - 1, Math.max(0, Math.round(t * (LUT - 1))))];
    const hot = isDark() ? ([150, 205, 255] as RGB) : ([70, 110, 150] as RGB);
    for (let i = 0; i < N_GALAXIES; i++) {
      const x = comoving[i * 3];
      const y = comoving[i * 3 + 1];
      const z = comoving[i * 3 + 2];
      const rad = Math.min(1, Math.sqrt(x * x + y * y + z * z) / BOX);
      // early universe reads hotter and bluer, late universe emerald→gold
      // A real field mixes blue star-forming spirals with red ellipticals; the
      // per-galaxy temperature does that, the era gradient shifts the whole
      // population as radiation gives way to matter and then to Λ.
      const late = pick(warm[i] < 0.34 ? em : spec, 0.18 + 0.42 * rad * (0.6 + warm[i]));
      const era = Math.min(1, Math.max(0, (phase - 0.06) / 0.35));
      const c: RGB = [
        hot[0] + (late[0] - hot[0]) * era,
        hot[1] + (late[1] - hot[1]) * era,
        hot[2] + (late[2] - hot[2]) * era,
      ];
      colors[i * 3] = c[0] / 255;
      colors[i * 3 + 1] = c[1] / 255;
      colors[i * 3 + 2] = c[2] / 255;
    }
    geometry.attributes.color.needsUpdate = true;
  };

  const applyScale = () => {
    for (let i = 0; i < positions.length; i++) positions[i] = comoving[i] * scaleA;
    geometry.attributes.position.needsUpdate = true;
    // No computeBoundingSphere: it is another O(n) pass every frame and the two
    // Points objects have frustum culling switched off anyway.
    cage.scale.setScalar(scaleA);
  };

  const applyTheme = () => {
    dark = isDark();
    applyExposure();
    for (const m of [core, bloom, haze]) {
      m.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
      m.needsUpdate = true;
    }
    cageMat.color.set(dark ? 0xffffff : 0x000000);
    cageMat.opacity = dark ? 0.05 : 0.07;
    paint();
  };

  const resize = () => {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    for (const m of [core, bloom, haze]) m.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  };

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  applyTheme();
  applyScale();
  resize();

  return {
    setScale(a) {
      const next = Math.max(1e-3, a);
      if (Math.abs(next - scaleA) < 1e-6) return;
      scaleA = next;
      applyScale();
      applyExposure();
    },
    setPhase(p) {
      if (Math.abs(p - phase) < 0.004) return;
      phase = p;
      paint();
    },
    resize,
    render(dt) {
      if (!reduced) spin += dt * 0.045;
      // A slow drift rather than a spin, so the field reads as depth not as a
      // turntable — and the distance tracks √a so the field keeps its angular
      // size instead of collapsing to a point or flying out of frame.
      const r = 12 + 22 * Math.min(1.6, Math.sqrt(Math.max(0.02, scaleA)));
      camera.position.set(Math.sin(spin) * r * 0.28, 3.2 + Math.sin(spin * 0.7) * 2.2, Math.cos(spin) * r);
      camera.lookAt(0, 0, 0);
      if (isDark() !== dark) applyTheme();
      renderer.render(scene, camera);
    },
    dispose() {
      geometry.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      core.dispose();
      bloom.dispose();
      haze.dispose();
      sprite.dispose();
      renderer.dispose();
    },
  };
}
