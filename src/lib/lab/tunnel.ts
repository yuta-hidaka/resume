/**
 * Quantum tunneling: the 1D time-dependent Schrödinger equation
 * iℏ∂ψ/∂t = −(ℏ²/2m)∂²ψ/∂x² + V(x)ψ (ℏ = m = 1), solved with the
 * split-step Fourier method (exactly unitary per step). A gaussian wave
 * packet with energy E hits a rectangular barrier of height V₀; even for
 * V₀ > E a tail leaks through. Transmission and reflection probabilities
 * accumulate live as the packet interacts.
 */

import { tokens, ramp, sampleRamp, rgb, glowStroke, areaFill, label, type LabTokens, type Ramp } from './viz';

const N = 1024;
const L = 200;
const DX = L / N;
const DT = 0.05;
const STEPS_PER_FRAME = 4;
const K0 = 1.1; // packet momentum → E = k₀²/2 ≈ 0.605
export const PACKET_ENERGY = (K0 * K0) / 2;
const X0 = 45;
const PACKET_SIGMA = 9;
const BARRIER_CENTER = 100;
/** Sim time at which the packet has fully separated; the run freezes here. */
const T_END = 95;

/** In-place iterative radix-2 FFT (sign = -1 forward, +1 inverse; unscaled). */
function fft(re: Float64Array, im: Float64Array, sign: number) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (sign * 2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let j = 0; j < len / 2; j++) {
        const ur = re[i + j];
        const ui = im[i + j];
        const vr = re[i + j + len / 2] * cr - im[i + j + len / 2] * ci;
        const vi = re[i + j + len / 2] * ci + im[i + j + len / 2] * cr;
        re[i + j] = ur + vr;
        im[i + j] = ui + vi;
        re[i + j + len / 2] = ur - vr;
        im[i + j + len / 2] = ui - vi;
        const ncr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = ncr;
      }
    }
  }
}

export interface TunnelParams {
  /** barrier height as a multiple of the packet energy */
  v0OverE: number;
  /** barrier width in world units */
  width: number;
}

export interface TunnelCore {
  step(): void;
  reset(params: TunnelParams): void;
  readonly re: Float64Array;
  readonly im: Float64Array;
  readonly time: number;
  readonly done: boolean;
  /** [reflected, inBarrier, transmitted] probabilities */
  probabilities(): [number, number, number];
  readonly params: TunnelParams;
}

/** DOM-free physics core (also used by the headless checks). */
export function createTunnelCore(initial: TunnelParams): TunnelCore {
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  const vHalf = new Float64Array(N); // e^{-iV dt/2} phase per cell
  const kinRe = new Float64Array(N);
  const kinIm = new Float64Array(N);
  let params = { ...initial };
  let time = 0;

  // Kinetic propagator e^{-i k²/2 dt} on the FFT frequency grid.
  for (let j = 0; j < N; j++) {
    const k = (2 * Math.PI * (j < N / 2 ? j : j - N)) / L;
    const phase = (-k * k * DT) / 2;
    kinRe[j] = Math.cos(phase);
    kinIm[j] = Math.sin(phase);
  }

  const barrierHalf = () => params.width / 2;
  const inBarrier = (x: number) => Math.abs(x - BARRIER_CENTER) < barrierHalf();

  const reset = (next: TunnelParams) => {
    params = { ...next };
    time = 0;
    const v0 = params.v0OverE * PACKET_ENERGY;
    for (let j = 0; j < N; j++) {
      vHalf[j] = inBarrier(j * DX) ? (-v0 * DT) / 2 : 0;
    }
    let norm = 0;
    for (let j = 0; j < N; j++) {
      const x = j * DX;
      const g = Math.exp(-((x - X0) ** 2) / (4 * PACKET_SIGMA ** 2));
      re[j] = g * Math.cos(K0 * x);
      im[j] = g * Math.sin(K0 * x);
      norm += (re[j] * re[j] + im[j] * im[j]) * DX;
    }
    const inv = 1 / Math.sqrt(norm);
    for (let j = 0; j < N; j++) {
      re[j] *= inv;
      im[j] *= inv;
    }
  };
  reset(initial);

  const applyPotentialHalf = () => {
    for (let j = 0; j < N; j++) {
      if (vHalf[j] === 0) continue;
      const c = Math.cos(vHalf[j]);
      const s = Math.sin(vHalf[j]);
      const r = re[j] * c - im[j] * s;
      im[j] = re[j] * s + im[j] * c;
      re[j] = r;
    }
  };

  return {
    step() {
      if (time >= T_END) return;
      applyPotentialHalf();
      fft(re, im, -1);
      for (let j = 0; j < N; j++) {
        const r = re[j] * kinRe[j] - im[j] * kinIm[j];
        im[j] = (re[j] * kinIm[j] + im[j] * kinRe[j]) / N;
        re[j] = r / N; // fold the 1/N inverse-FFT scaling in here
      }
      fft(re, im, 1);
      applyPotentialHalf();
      time += DT;
    },
    reset,
    re,
    im,
    get time() {
      return time;
    },
    get done() {
      return time >= T_END;
    },
    probabilities() {
      const lo = BARRIER_CENTER - barrierHalf();
      const hi = BARRIER_CENTER + barrierHalf();
      let refl = 0;
      let mid = 0;
      let trans = 0;
      for (let j = 0; j < N; j++) {
        const p = (re[j] * re[j] + im[j] * im[j]) * DX;
        const x = j * DX;
        if (x < lo) refl += p;
        else if (x > hi) trans += p;
        else mid += p;
      }
      return [refl, mid, trans];
    },
    get params() {
      return params;
    },
  };
}

export interface TunnelScene {
  setParams(params: TunnelParams): void;
  restart(): void;
  dispose(): void;
}

export function createTunnelScene(
  canvas: HTMLCanvasElement,
  initial: TunnelParams,
  onUpdate?: (reflected: number, transmitted: number, done: boolean) => void,
): TunnelScene {
  const ctx = canvas.getContext('2d')!;
  const core = createTunnelCore(initial);

  // Theme-derived palette, refreshed on class-attribute mutation rather than
  // every frame (matches the rest of the gallery's reactivity contract).
  let tk: LabTokens = tokens();
  let goldRamp: Ramp = ramp('gold');
  let phaseRamp: Ramp = ramp('phase');
  let emeraldRamp: Ramp = ramp('emerald');
  const refreshTheme = () => {
    tk = tokens();
    goldRamp = ramp('gold');
    phaseRamp = ramp('phase');
    emeraldRamp = ramp('emerald');
  };

  const themeObserver = new MutationObserver(refreshTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  window.addEventListener('resize', resize);
  resize();

  const draw = () => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const base = h * 0.86;
    const xFor = (x: number) => (x / L) * w;

    // Energy line and barrier block share one scale: the packet energy E
    // sits at 30% of the stage height.
    const eScale = (h * 0.3) / PACKET_ENERGY;
    const eY = base - PACKET_ENERGY * eScale;
    const v0 = core.params.v0OverE * PACKET_ENERGY;
    const barrierHalfWidth = core.params.width / 2;
    const barrierRightWorld = BARRIER_CENTER + barrierHalfWidth;
    const bx0 = xFor(BARRIER_CENTER - barrierHalfWidth);
    const bx1 = xFor(barrierRightWorld);
    const bTop = base - v0 * eScale;

    // Barrier: a translucent gold slab with a soft glowing edge — a wall of
    // light, not a flat block.
    const barrierColor = sampleRamp(goldRamp, 0.72);
    const slab = ctx.createLinearGradient(0, bTop, 0, base);
    slab.addColorStop(0, rgb(barrierColor, tk.dark ? 0.3 : 0.2));
    slab.addColorStop(1, rgb(barrierColor, tk.dark ? 0.1 : 0.05));
    ctx.save();
    ctx.fillStyle = slab;
    ctx.fillRect(bx0, bTop, bx1 - bx0, base - bTop);
    ctx.restore();
    glowStroke(ctx, [{ x: bx0, y: bTop }, { x: bx0, y: base }], barrierColor, 1.3, tk.glowAlpha * 0.6, tk.dark);
    glowStroke(ctx, [{ x: bx1, y: bTop }, { x: bx1, y: base }], barrierColor, 1.3, tk.glowAlpha * 0.6, tk.dark);
    glowStroke(ctx, [{ x: bx0, y: bTop }, { x: bx1, y: bTop }], barrierColor, 1.1, tk.glowAlpha * 0.5, tk.dark);
    label(ctx, 'V₀', bx0 + 4, bTop - 6, tk.gold, { size: 10, alpha: 0.65 });

    // Energy line: dashed and quiet — a reference, not a signal.
    ctx.save();
    ctx.strokeStyle = rgb(tk.inkMuted, tk.dark ? 0.4 : 0.5);
    ctx.setLineDash([4, 5]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, eY);
    ctx.lineTo(w, eY);
    ctx.stroke();
    ctx.restore();
    label(ctx, 'E', 6, eY - 5, tk.inkMuted, { size: 11, alpha: 0.85 });

    // |ψ|²: a luminous gradient area under a glow-stroked curve, the curve
    // shimmering with the wavefunction's local phase as it evolves. The
    // tail that has tunneled past the barrier glows brighter — the part of
    // the story worth lingering on.
    const { re, im } = core;
    const psiScale = h * 5.2;
    const pts: { x: number; y: number }[] = [];
    for (let j = 0; j < N; j++) {
      const p = re[j] * re[j] + im[j] * im[j];
      pts.push({ x: (j / N) * w, y: base - p * psiScale });
    }
    areaFill(ctx, pts, base, sampleRamp(emeraldRamp, 0.58), tk.dark ? 0.3 : 0.22);

    const SEGMENTS = 56;
    const segLen = Math.max(1, Math.ceil(N / SEGMENTS));
    for (let start = 0; start < N - 1; start += segLen) {
      const end = Math.min(N - 1, start + segLen);
      let sinSum = 0;
      let cosSum = 0;
      for (let j = start; j <= end; j++) {
        const phi = Math.atan2(im[j], re[j]);
        sinSum += Math.sin(phi);
        cosSum += Math.cos(phi);
      }
      const phaseT = (Math.atan2(sinSum, cosSum) + Math.PI) / (2 * Math.PI);
      const transmitted = start * DX > barrierRightWorld;
      glowStroke(
        ctx,
        pts.slice(start, end + 1),
        sampleRamp(phaseRamp, phaseT),
        transmitted ? 2.1 : 1.6,
        tk.glowAlpha * (transmitted ? 1.4 : 1),
        tk.dark,
      );
    }

    // Baseline.
    ctx.strokeStyle = tk.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, base);
    ctx.lineTo(w, base);
    ctx.stroke();
  };

  let rafId = 0;
  const loop = () => {
    rafId = requestAnimationFrame(loop);
    if (!core.done) {
      for (let s = 0; s < STEPS_PER_FRAME; s++) core.step();
      const [refl, , trans] = core.probabilities();
      onUpdate?.(refl, trans, core.done);
    }
    draw();
  };
  const onVisibility = () => {
    cancelAnimationFrame(rafId);
    if (!document.hidden) rafId = requestAnimationFrame(loop);
  };
  document.addEventListener('visibilitychange', onVisibility);
  rafId = requestAnimationFrame(loop);

  return {
    setParams(params) {
      core.reset(params);
      onUpdate?.(0, 0, false);
    },
    restart() {
      core.reset(core.params);
      onUpdate?.(0, 0, false);
    },
    dispose() {
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisibility);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
    },
  };
}
