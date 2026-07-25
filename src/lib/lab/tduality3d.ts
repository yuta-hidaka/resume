/**
 * A compactified dimension, in three dimensions.
 *
 * One direction stays extended (the tube's axis); the other is rolled into a
 * circle of radius R (the tube's cross-section). That is literally what
 * compactification is, so the tube is not decoration — its girth *is* R.
 *
 * On it:
 *  - a closed string wound w times, drawn as a real swept tube along the helix,
 *    oscillating in its lowest excited mode;
 *  - a momentum mode, a small closed loop circling the tube without winding;
 *  - the DUAL tube at radius α'/R, ghosted as a wireframe. Shrink R and the ghost
 *    swells through the solid one; at R = √α' the two coincide exactly.
 *
 * Rendering aims for weight rather than diagram: a glass-like tube with a fresnel
 * rim, an emissive string with an additive halo shell, a subtle floor grid for
 * ground, and a slow orbit. Physics comes from ./strings.
 */

import * as THREE from 'three';
import { isDark, sampleRamp, ramp, type RGB } from './viz';
import { R_SELF_DUAL, dualRadius } from './strings';

/** World length of the extended direction. */
const TUBE_LEN = 26;
/** World units per unit of R — the tube's radius is R × this. */
const R_TO_WORLD = 2.6;

export interface TDuality3D {
  setRadius(r: number): void;
  setWinding(w: number): void;
  setShowDual(on: boolean): void;
  resize(): void;
  render(dt: number): void;
  dispose(): void;
}

const toColor = (c: RGB) => new THREE.Color(c[0] / 255, c[1] / 255, c[2] / 255);

export function createTDuality3D(canvas: HTMLCanvasElement): TDuality3D {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 300);

  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(6, 10, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x88bbaa, 0.5);
  fill.position.set(-8, -4, -6);
  scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffffff, 0.28));

  let dark = isDark();
  const green = () => toColor(sampleRamp(ramp('emerald'), 0.72));
  const gold = () => toColor(sampleRamp(ramp('gold'), 0.74));

  // ——— the compact circle, as a tube ———
  // unit radius; scaled to R so one geometry serves every radius
  const tubeGeo = new THREE.CylinderGeometry(1, 1, TUBE_LEN, 96, 1, true);
  tubeGeo.rotateZ(Math.PI / 2); // lie along x
  const tubeMat = new THREE.MeshPhysicalMaterial({
    color: 0x2a4a3c,
    metalness: 0.1,
    roughness: 0.35,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    transmission: 0.6,
    thickness: 1.4,
    clearcoat: 1,
    clearcoatRoughness: 0.25,
    // transparent glass must not write depth, or the dual tube nested inside it
    // is occluded and only shows where it pokes past the end
    depthWrite: false,
  });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  scene.add(tube);

  // a bright rim on the silhouette gives the tube its edge without a hard outline
  const rimMat = new THREE.MeshBasicMaterial({
    color: 0x5ecb97,
    transparent: true,
    opacity: 0.14,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const rim = new THREE.Mesh(tubeGeo, rimMat);
  rim.scale.set(1, 1.015, 1.015);
  scene.add(rim);

  // circular ribs mark the compact direction so the girth is readable
  const ribs = new THREE.Group();
  {
    const ribGeo = new THREE.TorusGeometry(1, 0.012, 6, 90);
    const ribMat = new THREE.MeshBasicMaterial({ color: 0x5ecb97, transparent: true, opacity: 0.3 });
    for (let i = -3; i <= 3; i++) {
      const m = new THREE.Mesh(ribGeo, ribMat);
      m.rotation.y = Math.PI / 2;
      m.position.x = (i / 3) * (TUBE_LEN / 2) * 0.86;
      ribs.add(m);
    }
    scene.add(ribs);
  }

  // ——— the dual tube, ghosted ———
  const dualGeo = new THREE.CylinderGeometry(1, 1, TUBE_LEN, 14, 6, true);
  dualGeo.rotateZ(Math.PI / 2);
  const dualMat = new THREE.MeshBasicMaterial({
    color: 0xd9b36c,
    transparent: true,
    opacity: 0.34,
    wireframe: true,
  });
  const dualTube = new THREE.Mesh(dualGeo, dualMat);
  scene.add(dualTube);

  // ——— the wound string ———
  let stringMesh: THREE.Mesh | null = null;
  let haloMesh: THREE.Mesh | null = null;
  /**
   * The standing wave is applied in the VERTEX SHADER, not by rebuilding the
   * geometry. Rebuilding a 420-segment TubeGeometry every frame allocated
   * thousands of vertices sixty times a second; displacing them is free.
   *
   * For a helix about the x axis the radial direction at a vertex is just its
   * own (y, z) normalised, and the helix angle is atan2(z, y) — so the wobble
   * can be reconstructed per-vertex with no extra attributes.
   */
  const uWobble = { value: 0 };
  const injectWobble = (m: THREE.Material) => {
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uWobble = uWobble;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uWobble;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
           float rr = length(transformed.yz);
           if (rr > 1e-4) {
             float th = atan(transformed.z, transformed.y);
             float wob = 1.0 + 0.13 * sin(th * 2.0 - uWobble);
             transformed.yz = normalize(transformed.yz) * rr * wob;
           }`,
        );
    };
    m.needsUpdate = true;
  };

  const stringMat = new THREE.MeshStandardMaterial({
    color: 0x5ecb97,
    emissive: 0x2f7f5c,
    emissiveIntensity: 1.4,
    roughness: 0.3,
    metalness: 0.1,
  });
  injectWobble(stringMat);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x5ecb97,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  injectWobble(haloMat);

  // ——— a momentum mode: a small loop circling the tube ———
  const loopGeo = new THREE.TorusGeometry(0.5, 0.055, 10, 48);
  const loopMat = new THREE.MeshStandardMaterial({
    color: 0xd9b36c,
    emissive: 0x8f6521,
    emissiveIntensity: 1.5,
    roughness: 0.35,
  });
  const momentumLoop = new THREE.Mesh(loopGeo, loopMat);
  scene.add(momentumLoop);

  // ——— floor grid, for ground ———
  const grid = new THREE.GridHelper(64, 32, 0x5ecb97, 0x5ecb97);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.05;
  grid.position.y = -9;
  scene.add(grid);

  let r = 2.2;
  let winding = 1;
  let showDual = false; // matches the chip group's initial state on the page
  let clock = 0;
  let spin = 0.6;

  /**
   * Rebuild the wound string.
   *
   * A closed string winding the compact direction w times sits at ONE place along
   * the extended direction and closes on itself — the two ends are the same point,
   * because that direction is periodic. Drawing it as a helix running the length of
   * the tube made it look like an OPEN string with two loose ends, which is the
   * opposite of what winding means.
   *
   * So: w turns of the circle, with a small sinusoidal excursion along the axis
   * purely so the turns can be told apart, returning to where it started. The
   * curve is closed.
   */
  const buildString = () => {
    const rw = Math.max(0.05, r * R_TO_WORLD);
    const turns = Math.max(1, Math.abs(winding));
    const pts: THREE.Vector3[] = [];
    const N = 360;
    const spread = Math.min(3.4, 1.1 + 0.9 * turns);
    for (let i = 0; i < N; i++) {
      const u = i / N;
      const th = u * turns * Math.PI * 2;
      // returns to 0 at u = 1, so the loop closes
      const x = Math.sin(u * Math.PI * 2) * spread;
      pts.push(new THREE.Vector3(x, Math.sin(th) * rw, Math.cos(th) * rw));
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    const geo = new THREE.TubeGeometry(curve, 360, Math.max(0.04, rw * 0.05), 12, true);
    if (stringMesh) {
      stringMesh.geometry.dispose();
      stringMesh.geometry = geo;
    } else {
      stringMesh = new THREE.Mesh(geo, stringMat);
      scene.add(stringMesh);
    }
    const haloGeo = new THREE.TubeGeometry(curve, 180, Math.max(0.12, rw * 0.17), 10, true);
    if (haloMesh) {
      haloMesh.geometry.dispose();
      haloMesh.geometry = haloGeo;
    } else {
      haloMesh = new THREE.Mesh(haloGeo, haloMat);
      scene.add(haloMesh);
    }
  };

  const applyRadius = () => {
    const rw = Math.max(0.05, r * R_TO_WORLD);
    tube.scale.set(1, rw, rw);
    rim.scale.set(1, rw * 1.02, rw * 1.02);
    ribs.children.forEach((m) => m.scale.setScalar(rw));
    const rd = Math.max(0.05, dualRadius(r) * R_TO_WORLD);
    dualTube.scale.set(1, rd, rd);
    dualTube.visible = showDual;
    momentumLoop.scale.setScalar(Math.max(0.35, rw * 0.55));
  };

  const applyTheme = () => {
    dark = isDark();
    const g = green();
    const y = gold();
    stringMat.color.copy(g);
    stringMat.emissive.copy(g).multiplyScalar(0.45);
    stringMat.emissiveIntensity = dark ? 1.5 : 0.5;
    haloMat.color.copy(g);
    haloMat.opacity = dark ? 0.1 : 0;
    rimMat.color.copy(g);
    rimMat.opacity = dark ? 0.14 : 0.05;
    tubeMat.color.copy(g).multiplyScalar(dark ? 0.32 : 0.7);
    tubeMat.opacity = dark ? 0.22 : 0.16;
    dualMat.color.copy(y);
    dualMat.opacity = dark ? 0.34 : 0.4;
    loopMat.color.copy(y);
    loopMat.emissive.copy(y).multiplyScalar(0.45);
    loopMat.emissiveIntensity = dark ? 1.6 : 0.5;
    (grid.material as THREE.Material).opacity = dark ? 0.05 : 0.07;
    key.intensity = dark ? 1.5 : 2.1;
  };

  const resize = () => {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  applyTheme();
  applyRadius();
  buildString();
  resize();

  return {
    setRadius(v) {
      if (Math.abs(v - r) < 1e-6) return;
      r = v;
      applyRadius();
      buildString();
    },
    setWinding(w) {
      const n = Math.max(1, Math.round(Math.abs(w)));
      if (n === winding) return;
      winding = n;
      buildString();
    },
    setShowDual(on) {
      showDual = on;
      dualTube.visible = on;
    },
    resize,
    render(dt) {
      clock += dt;
      if (!reduced) {
        spin += dt * 0.16;
        uWobble.value = clock * 2.4; // the standing wave, animated on the GPU
      }
      const dist = 34;
      camera.position.set(
        Math.sin(spin) * dist * 0.55,
        6.5 + Math.sin(spin * 0.6) * 2.4,
        Math.cos(spin) * dist,
      );
      camera.lookAt(0, 0, 0);

      // the momentum mode slides along the tube while circling it: momentum
      // around the compact direction, free motion along the extended one
      const th = clock * 1.15;
      const rw = Math.max(0.05, r * R_TO_WORLD);
      momentumLoop.position.set(
        Math.sin(clock * 0.32) * TUBE_LEN * 0.34,
        Math.sin(th) * rw,
        Math.cos(th) * rw,
      );
      momentumLoop.rotation.set(0, Math.PI / 2, th + Math.PI / 2);

      if (isDark() !== dark) applyTheme();
      renderer.render(scene, camera);
    },
    dispose() {
      tubeGeo.dispose();
      dualGeo.dispose();
      loopGeo.dispose();
      tubeMat.dispose();
      rimMat.dispose();
      dualMat.dispose();
      stringMat.dispose();
      haloMat.dispose();
      loopMat.dispose();
      stringMesh?.geometry.dispose();
      haloMesh?.geometry.dispose();
      ribs.children.forEach((m) => (m as THREE.Mesh).geometry.dispose());
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      renderer.dispose();
    },
  };
}

/** Exposed so the page can tell the viewer what the tube's girth means. */
export const worldRadiusOf = (r: number) => r * R_TO_WORLD;
export const SELF_DUAL = R_SELF_DUAL;
