/**
 * 2D molecular dynamics of "water": molecules interact via a Lennard-Jones
 * potential under weak gravity, with a velocity-rescaling thermostat. Cold →
 * they lock into a vibrating cluster (solid); warm → a sloshing puddle
 * (liquid); hot → they fill the box (gas). Each molecule is drawn as an H₂O
 * glyph whose internal stretch/bend amplitude also grows with temperature —
 * a many-orders-of-magnitude slowed-down caricature of the real ~10¹⁴ Hz
 * vibrations. Rendering: glowing O/H spheres on gradient-linked bonds, color
 * graded warmer as the ensemble heats, with motion trails that lengthen into
 * streaks once molecules are moving fast enough to be gas.
 */

import { tokens, ramp, sampleRamp, rgb, softSprite, fadeTrails, type RGB } from './viz';

const N = 70;
const SIGMA = 0.055; // LJ diameter, box heights
const EPS = 1;
const CUTOFF = 2.5 * SIGMA;
const GRAVITY = 0.6;
const DT = 0.0003; // LJ time unit is σ√(m/ε) ≈ 0.055 — stability needs dt ≪ τ
const SUBSTEPS = 16;
const THERMO_RATE = 0.15; // velocity-rescale strength per frame

export type Phase = 'solid' | 'liquid' | 'gas';

/** Reduced-temperature boundaries of this 2D LJ system (qualitative, not the
 *  quantitative 3D values). Parking targetT within COEXIST of one shows the
 *  two phases coexisting. */
export const MELT_T = 0.32; // solid ⇄ liquid
export const VAPORIZE_T = 1.0; // liquid ⇄ gas
export const COEXIST = 0.06;

/** The Lennard-Jones model was historically calibrated to noble gases; we map
 *  reduced temperature to Kelvin with argon's well depth so the axis carries a
 *  real number. (2D toy → qualitative, not argon's exact 84 K / 87 K points.) */
export const ARGON_EPS_OVER_KB = 119.8; // K, argon ε/k_B
export const ARGON_SIGMA_ANGSTROM = 3.405; // Å, argon σ
export const kelvin = (tStar: number) => tStar * ARGON_EPS_OVER_KB;

/** Adiabatic index γ = (f+2)/f. This 2D monatomic gas has f = 2 translational
 *  degrees of freedom → γ = 2, so its adiabatic law is T·V = const. (Real 3D
 *  gases: monatomic 5/3, diatomic 7/5.) */
export const GAMMA_2D = 2;

export type ThermalMode = 'thermostat' | 'adiabatic';

export function phaseForTemperature(t: number): Phase {
  if (t < MELT_T) return 'solid';
  if (t < VAPORIZE_T) return 'liquid';
  return 'gas';
}

/** Whether the ensemble is sitting on a phase boundary (coexistence). */
export function coexistenceAt(t: number): 'melting' | 'boiling' | null {
  if (Math.abs(t - MELT_T) < COEXIST) return 'melting';
  if (Math.abs(t - VAPORIZE_T) < COEXIST) return 'boiling';
  return null;
}

const gaussian = () =>
  Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

export interface MoleculesSim {
  setTemperature(t: number): void;
  /** 'thermostat' holds T fixed (isothermal); 'adiabatic' cuts the heat bath
   *  so compressing the box heats the gas by itself (PV^γ = const). */
  setMode(mode: ThermalMode): void;
  /** Piston compression 0 (open) → 1 (max), only acts in adiabatic mode. */
  setCompression(c: number): void;
  reset(): void;
  /** Mean kinetic energy per particle (the measured temperature). */
  readonly measuredT: number;
  /** Available volume fraction (1 = open box), for the adiabatic readout. */
  readonly volumeFraction: number;
  dispose(): void;
}

export function createMoleculesSim(stage: HTMLCanvasElement): MoleculesSim {
  const ctx = stage.getContext('2d')!;
  // World: y ∈ [0, 1], x ∈ [0, aspect]; gravity pulls toward y = 1 (bottom).
  let aspect = 16 / 9;
  const px = new Float64Array(N);
  const py = new Float64Array(N);
  const vx = new Float64Array(N);
  const vy = new Float64Array(N);
  const fx = new Float64Array(N);
  const fy = new Float64Array(N);
  const angle = new Float64Array(N);
  const spin = new Float64Array(N);
  const vibPhase = new Float64Array(N);
  let targetT = 0.5;
  let measuredT = 0.5;
  let mode: ThermalMode = 'thermostat';
  // Piston: a ceiling that descends from the top (y = 0). `ceiling` is its
  // world-y; available height = 1 − ceiling. Only driven in adiabatic mode.
  let ceiling = 0;
  let ceilingTarget = 0;
  let pistonVel = 0; // world units per unit sim-time (for moving-wall boost)
  /** Smoothed copy of measuredT — render-only, used to color-grade the glow
   *  by how hot the ensemble actually is rather than jittering every frame
   *  off the raw kinetic-energy estimate. Never read by step()/computeForces(). */
  let displayT = targetT;

  const reset = () => {
    // Loose grid near the floor, small thermal velocities.
    const cols = Math.ceil(Math.sqrt(N * aspect));
    for (let i = 0; i < N; i++) {
      const c = i % cols;
      const r = (i / cols) | 0;
      px[i] = aspect / 2 + (c - cols / 2 + 0.5 + 0.1 * gaussian()) * SIGMA * 1.15;
      py[i] = 0.94 - (r + 0.5) * SIGMA * 1.05;
      vx[i] = gaussian() * Math.sqrt(targetT) * 0.3;
      vy[i] = gaussian() * Math.sqrt(targetT) * 0.3;
      angle[i] = Math.random() * 2 * Math.PI;
      spin[i] = gaussian();
      vibPhase[i] = Math.random() * 2 * Math.PI;
    }
  };
  reset();

  const computeForces = () => {
    fx.fill(0);
    fy.fill(0);
    for (let i = 0; i < N; i++) fy[i] += GRAVITY;
    const cut2 = CUTOFF * CUTOFF;
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = px[j] - px[i];
        const dy = py[j] - py[i];
        const r2 = dx * dx + dy * dy;
        if (r2 > cut2 || r2 === 0) continue;
        // Saturate the repulsion below ~0.85σ so residual overlaps relax
        // instead of detonating the integrator.
        const r2eff = Math.max(r2, 0.72 * SIGMA * SIGMA);
        const s2 = (SIGMA * SIGMA) / r2eff;
        const s6 = s2 * s2 * s2;
        const fOverR = (24 * EPS * s6 * (2 * s6 - 1)) / r2eff;
        fx[i] -= fOverR * dx;
        fy[i] -= fOverR * dy;
        fx[j] += fOverR * dx;
        fy[j] += fOverR * dy;
      }
    }
  };

  const step = () => {
    // Piston motion. In adiabatic mode it tracks the compression slider; in
    // thermostat mode it retracts. The speed is capped WELL below the thermal
    // speed (√T) so the compression is quasi-static and near-reversible —
    // otherwise the wall shock-heats the gas far past the adiabatic law.
    const target = mode === 'adiabatic' ? ceilingTarget : 0;
    const remaining = target - ceiling;
    const vCap = 0.06 * Math.sqrt(Math.max(0.05, measuredT));
    const frameDt = SUBSTEPS * DT;
    const speed = Math.min(Math.abs(remaining) / frameDt, vCap);
    pistonVel = Math.sign(remaining) * speed;

    for (let s = 0; s < SUBSTEPS; s++) {
      ceiling += pistonVel * DT;
      const topWall = ceiling + SIGMA / 2;
      for (let i = 0; i < N; i++) {
        vx[i] += fx[i] * DT * 0.5;
        vy[i] += fy[i] * DT * 0.5;
        px[i] += vx[i] * DT;
        py[i] += vy[i] * DT;
        // Reflecting side + floor walls.
        if (px[i] < SIGMA / 2) {
          px[i] = SIGMA - px[i];
          vx[i] = Math.abs(vx[i]);
        } else if (px[i] > aspect - SIGMA / 2) {
          px[i] = 2 * (aspect - SIGMA / 2) - px[i];
          vx[i] = -Math.abs(vx[i]);
        }
        // Ceiling: a moving wall. A molecule striking a descending piston
        // reflects as v' = 2·v_piston − v, gaining energy — this is the
        // microscopic origin of adiabatic compression heating.
        if (py[i] < topWall) {
          py[i] = 2 * topWall - py[i];
          vy[i] = 2 * pistonVel - vy[i];
        } else if (py[i] > 1 - SIGMA / 2) {
          py[i] = 2 * (1 - SIGMA / 2) - py[i];
          vy[i] = -Math.abs(vy[i]);
        }
      }
      computeForces();
      for (let i = 0; i < N; i++) {
        vx[i] += fx[i] * DT * 0.5;
        vy[i] += fy[i] * DT * 0.5;
      }
    }

    // Measure kinetic temperature (2D: <½m(vx²+vy²)> = T).
    let ke = 0;
    for (let i = 0; i < N; i++) ke += vx[i] * vx[i] + vy[i] * vy[i];
    measuredT = ke / (2 * N);

    // Thermostat rescale ONLY in isothermal mode; adiabatic runs with no heat
    // bath, so the piston's work is the only thing that changes T.
    if (mode === 'thermostat') {
      const scale = Math.sqrt(1 + THERMO_RATE * (targetT / Math.max(1e-6, measuredT) - 1));
      for (let i = 0; i < N; i++) {
        vx[i] *= scale;
        vy[i] *= scale;
      }
    }
    // Rotational bath (visual only): spin tracks the actual temperature.
    const spinScale = Math.sqrt(Math.max(0.02, measuredT));
    for (let i = 0; i < N; i++) {
      spin[i] = spin[i] * 0.99 + gaussian() * 0.25 * spinScale;
      angle[i] += spin[i] * 0.06;
    }
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    stage.width = Math.max(1, Math.round(stage.clientWidth * dpr));
    stage.height = Math.max(1, Math.round(stage.clientHeight * dpr));
    if (stage.clientHeight > 0) aspect = stage.clientWidth / stage.clientHeight;
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  window.addEventListener('resize', resize);
  resize();

  // Two small offscreen brushes, one per species, retinted every frame to the
  // temperature-graded O/H color and blitted with drawImage — the only way
  // to keep ~210 glowing spheres at 60fps. Colors are sampled fresh from the
  // shared viz tokens/ramps each frame, so theme changes land on the very
  // next frame with no separate cache-invalidation observer needed.
  const SPRITE_SIZE = 56;
  const oSprite = document.createElement('canvas');
  oSprite.width = oSprite.height = SPRITE_SIZE;
  const oSpriteCtx = oSprite.getContext('2d')!;
  const hSprite = document.createElement('canvas');
  hSprite.width = hSprite.height = SPRITE_SIZE;
  const hSpriteCtx = hSprite.getContext('2d')!;
  const paintSprite = (spriteCtx: CanvasRenderingContext2D, color: RGB) => {
    spriteCtx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    spriteCtx.globalCompositeOperation = 'source-over';
    spriteCtx.drawImage(softSprite(SPRITE_SIZE, 0.42), 0, 0);
    spriteCtx.globalCompositeOperation = 'source-in';
    spriteCtx.fillStyle = rgb(color, 1);
    spriteCtx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    spriteCtx.globalCompositeOperation = 'source-over';
  };

  const draw = (now: number) => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = stage.width / dpr;
    const h = stage.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const tk = tokens();
    displayT += (measuredT - displayT) * 0.05;
    const heat = Math.min(1, Math.max(0, (displayT - 0.05) / 1.3));

    // Motion trails instead of a hard clear: cold/solid molecules stay crisp
    // (almost no afterimage), hot/gas ones streak with their real speed.
    const trailBase = tk.dark ? 0.78 : 0.88;
    const trailHot = tk.dark ? 0.3 : 0.45;
    fadeTrails(ctx, w, h, trailBase - (trailBase - trailHot) * heat);

    // O stays emerald, H stays gold, but both climb toward the brighter,
    // warmer end of their ramp as the ensemble heats up.
    const oColor = sampleRamp(ramp('emerald'), 0.5 + 0.34 * heat);
    const hColor = sampleRamp(ramp('gold'), 0.46 + 0.42 * heat);
    paintSprite(oSpriteCtx, oColor);
    paintSprite(hSpriteCtx, hColor);

    const scale = h; // world y ∈ [0,1] fills the height
    const rO = Math.max(2.5, SIGMA * 0.32 * scale);
    const rH = rO * 0.62;
    const bond = SIGMA * 0.42 * scale;
    // Internal vibration amplitude grows with √T (stretch + bend wobble).
    const vibAmp = 0.28 * Math.sqrt(Math.min(2, targetT));
    const halfHOH = (104.5 / 2 / 180) * Math.PI;
    const oDot = rO * 3.4;
    const hDot = rH * 4.0;

    ctx.save();
    for (let i = 0; i < N; i++) {
      const x = px[i] * scale * (w / (aspect * scale));
      const y = py[i] * scale;
      const stretch = 1 + vibAmp * Math.sin(now / 90 + vibPhase[i]);
      const bendWobble = vibAmp * 0.5 * Math.sin(now / 110 + vibPhase[i] * 1.7);
      for (const side of [-1, 1]) {
        const a = angle[i] + side * (halfHOH + bendWobble);
        const hx = x + Math.sin(a) * bond * stretch;
        const hy = y - Math.cos(a) * bond * stretch;

        // Bond: a thin gradient link from the oxygen core to this hydrogen.
        const grad = ctx.createLinearGradient(x, y, hx, hy);
        grad.addColorStop(0, rgb(oColor, tk.dark ? 0.6 : 0.55));
        grad.addColorStop(1, rgb(hColor, tk.dark ? 0.6 : 0.55));
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(hx, hy);
        ctx.stroke();

        // Hydrogen: a small glowing sphere.
        ctx.globalCompositeOperation = tk.blend;
        ctx.globalAlpha = tk.glowAlpha;
        ctx.drawImage(hSprite, hx - hDot / 2, hy - hDot / 2, hDot, hDot);
      }
      // Oxygen: the larger, brighter sphere, drawn last so it reads forward.
      ctx.globalCompositeOperation = tk.blend;
      ctx.globalAlpha = tk.glowAlpha;
      ctx.drawImage(oSprite, x - oDot / 2, y - oDot / 2, oDot, oDot);
    }
    ctx.restore();

    // Piston face (adiabatic compression): a hatched bar sealing the top.
    if (ceiling > 0.004) {
      const barY = ceiling * scale;
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = rgb(tk.inkMuted, tk.dark ? 0.9 : 1);
      ctx.fillRect(0, barY - 3, w, 3);
      ctx.strokeStyle = rgb(tk.inkMuted, 0.5);
      ctx.lineWidth = 1;
      for (let hx = 8; hx < w; hx += 14) {
        ctx.beginPath();
        ctx.moveTo(hx, barY - 3);
        ctx.lineTo(hx - 5, barY - 8);
        ctx.stroke();
      }
    }
  };

  let rafId = 0;
  const loop = (now: number) => {
    rafId = requestAnimationFrame(loop);
    step();
    draw(now);
  };
  const onVisibility = () => {
    cancelAnimationFrame(rafId);
    if (!document.hidden) rafId = requestAnimationFrame(loop);
  };
  document.addEventListener('visibilitychange', onVisibility);
  rafId = requestAnimationFrame(loop);

  return {
    setTemperature(t) {
      targetT = Math.max(0.02, t);
    },
    setMode(m) {
      mode = m;
      if (m === 'thermostat') ceilingTarget = 0;
    },
    setCompression(c) {
      // Max compression seals the box to ~45% of its open volume.
      ceilingTarget = Math.max(0, Math.min(0.55, c * 0.55));
    },
    reset,
    get measuredT() {
      return measuredT;
    },
    get volumeFraction() {
      return Math.max(0.05, 1 - ceiling);
    },
    dispose() {
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisibility);
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
    },
  };
}
