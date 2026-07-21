/**
 * The double-slit experiment — wave–particle duality made visible. A coherent
 * wave passes two slits and its far-field (Fraunhofer) intensity on the screen
 * is I(Y) ∝ sinc²(πaY/λL) · cos²(πdY/λL): a single-slit diffraction envelope
 * modulating two-slit interference fringes (a = slit width, d = slit spacing,
 * λ = wavelength, L = screen distance). We draw the WAVE as a live field of
 * moving wavefronts (the "line"), and fire particles ONE AT A TIME that land on
 * the screen at a Y drawn from I(Y) — discrete dots (the "points") that pile up
 * into the very fringe pattern the wave predicts. Turn on "which-path" and the
 * coherence is destroyed: the cos² interference term drops out, the fringes
 * dissolve into a single diffraction band, and the wave field decoheres.
 */
import {
  tokens,
  ramp,
  sampleRamp,
  rgb,
  glowStroke,
  glowDot,
  label,
  type RGB,
} from './viz';

export interface SlitParams {
  /** slit separation, px */
  d: number;
  /** slit width, px */
  a: number;
  /** wavelength, px */
  lambda: number;
  /** slits→screen distance, px */
  L: number;
}

const sinc = (x: number) => (x === 0 ? 1 : Math.sin(x) / x);

/** Far-field intensity at screen offset Y (px from center), normalized so the
 *  central maximum is 1. `measured` drops the interference (which-path known:
 *  the two slits add incoherently → envelope only, no fringes). */
export function intensity(Y: number, p: SlitParams, measured: boolean): number {
  const beta = (Math.PI * p.a * Y) / (p.lambda * p.L); // single-slit phase
  const envelope = sinc(beta) ** 2;
  if (measured) return envelope;
  const delta = (Math.PI * p.d * Y) / (p.lambda * p.L); // two-slit phase
  return envelope * Math.cos(delta) ** 2;
}

/** Fringe spacing ΔY = λL/d (px) — distance between adjacent bright fringes. */
export function fringeSpacing(p: SlitParams): number {
  return (p.lambda * p.L) / p.d;
}

/** Build an inverse-CDF sampler for I(Y) over Y ∈ [−half, half]. Returns a
 *  function u∈[0,1) → Y. Rebuild whenever params/measured change. */
export function makeScreenSampler(p: SlitParams, measured: boolean, half: number) {
  const N = 512;
  const cdf = new Float64Array(N + 1);
  const dy = (2 * half) / N;
  for (let i = 1; i <= N; i++) {
    cdf[i] = cdf[i - 1] + intensity(-half + i * dy - dy / 2, p, measured) * dy;
  }
  const total = cdf[N] || 1;
  for (let i = 0; i <= N; i++) cdf[i] /= total;
  return (u: number): number => {
    let lo = 0;
    let hi = N;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] < u) lo = mid;
      else hi = mid;
    }
    const span = cdf[hi] - cdf[lo] || 1;
    const t = (u - cdf[lo]) / span;
    return -half + (lo + t) * dy;
  };
}

interface Colors {
  dark: boolean;
  blend: 'lighter' | 'source-over';
  glowAlpha: number;
  ink: RGB;
  inkMuted: RGB;
  grid: string;
  crest: RGB; // wave crest (emerald)
  trough: RGB; // wave trough (gold)
  particle: RGB;
  curve: RGB;
}

function colors(): Colors {
  const tk = tokens();
  return {
    dark: tk.dark,
    blend: tk.blend,
    glowAlpha: tk.glowAlpha,
    ink: tk.ink,
    inkMuted: tk.inkMuted,
    grid: tk.grid,
    crest: sampleRamp(ramp('emerald'), 0.72),
    trough: sampleRamp(ramp('gold'), 0.66),
    particle: sampleRamp(ramp('emerald'), 0.82),
    curve: sampleRamp(ramp('gold'), 0.7),
  };
}

export interface DoubleSlitScene {
  setSeparation(d: number): void;
  setWavelength(lambda: number): void;
  setMeasured(measured: boolean): void;
  reset(): void;
  readonly count: number;
  dispose(): void;
}

interface Dot {
  y: number; // screen offset from center, px
}
interface Flyer {
  t: number; // 0..1 along its path
  slit: 0 | 1;
  yScreen: number; // final landing offset
}

const MAX_DOTS = 4000;
const SPAWN_RATE = 180; // particles per second (time-based, refresh-rate independent)
const FIELD_W = 150; // low-res wave-field buffer
const FIELD_H = 96;

export interface DoubleSlitLabels {
  /** in-canvas caption for the interference (unmeasured) state */
  fringes: string;
  /** in-canvas caption for the measured (which-path) state */
  measured: string;
}

export function createDoubleSlitScene(
  canvas: HTMLCanvasElement,
  onCount?: (n: number) => void,
  labels: DoubleSlitLabels = { fringes: 'interference', measured: 'which-path measured → no fringes' },
): DoubleSlitScene {
  const ctx = canvas.getContext('2d')!;
  let c = colors();

  // Geometry is recomputed on resize; params are in px on that geometry.
  let dSep = 46;
  let lambda = 13;
  const slitWidth = 12;
  let measured = false;

  let dots: Dot[] = [];
  let flyers: Flyer[] = [];
  let spawnAccum = 0; // fractional particle-spawn accumulator (time-based)
  let sampler: (u: number) => number = () => 0;
  let decohere = 0; // 0..1 wash-out of fringes when measured

  const off = document.createElement('canvas');
  off.width = FIELD_W;
  off.height = FIELD_H;
  const octx = off.getContext('2d')!;
  const fieldImg = octx.createImageData(FIELD_W, FIELD_H);

  const themeObserver = new MutationObserver(() => {
    c = colors();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  let w = 0;
  let h = 0;
  const geom = () => {
    const sourceX = w * 0.06;
    const barrierX = w * 0.3;
    const screenX = w * 0.9;
    const cy = h / 2;
    const L = screenX - barrierX;
    const half = h * 0.46;
    return { sourceX, barrierX, screenX, cy, L, half };
  };

  const rebuildSampler = () => {
    const { L, half } = geom();
    if (L <= 0) return;
    sampler = makeScreenSampler({ d: dSep, a: slitWidth, lambda, L }, measured, half);
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    rebuildSampler();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  window.addEventListener('resize', resize);
  resize();

  const reset = () => {
    dots = [];
    flyers = [];
    onCount?.(0);
  };

  // ——— wave field: instantaneous Re(ψ) from the two slit sources ———
  const drawField = (now: number) => {
    const { barrierX, screenX, cy } = geom();
    const slitY1 = cy - dSep / 2;
    const slitY2 = cy + dSep / 2;
    const k = (2 * Math.PI) / lambda;
    const omega = 6; // rad/s wave motion
    const phase = omega * (now / 1000);
    // When measured, jitter slit 2's phase so the two waves lose coherence and
    // the interference fringes wash out (which-path destroys coherence).
    const decoherePhase = measured ? decohere * Math.sin(now / 140) * Math.PI * 4 : 0;
    const d = fieldImg.data;
    const x0 = barrierX;
    const x1 = screenX;
    for (let j = 0; j < FIELD_H; j++) {
      const y = (j / (FIELD_H - 1)) * h;
      for (let i = 0; i < FIELD_W; i++) {
        const x = x0 + (i / (FIELD_W - 1)) * (x1 - x0);
        const r1 = Math.hypot(x - x0, y - slitY1) + 1;
        const r2 = Math.hypot(x - x0, y - slitY2) + 1;
        const psi =
          Math.cos(k * r1 - phase) / Math.sqrt(r1) +
          Math.cos(k * r2 - phase + decoherePhase) / Math.sqrt(r2);
        // scale up (near-field amplitudes are small)
        const amp = psi * 5.5;
        const mag = Math.min(1, Math.abs(amp));
        const col = amp >= 0 ? c.crest : c.trough;
        const o = (j * FIELD_W + i) * 4;
        d[o] = col[0];
        d[o + 1] = col[1];
        d[o + 2] = col[2];
        d[o + 3] = Math.round(mag * (c.dark ? 150 : 120));
      }
    }
    octx.putImageData(fieldImg, 0, 0);
    ctx.save();
    ctx.globalCompositeOperation = c.blend;
    ctx.globalAlpha = c.dark ? 0.85 : 0.6;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    // paint the field ONLY in the physical [barrierX, screenX] region it was
    // sampled for, so the wave rippling out of the slits lines up with the
    // slits and the screen (the particle layer it must correspond to).
    ctx.drawImage(off, 0, 0, FIELD_W, FIELD_H, barrierX, 0, screenX - barrierX, h);
    ctx.restore();
  };

  let rafId = 0;
  let lastNow = performance.now();
  const draw = (now: number) => {
    rafId = requestAnimationFrame(draw);
    const dt = Math.min(0.05, (now - lastNow) / 1000);
    lastNow = now;
    decohere += ((measured ? 1 : 0) - decohere) * Math.min(1, dt * 3);

    const dpr = Math.min(window.devicePixelRatio, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const { sourceX, barrierX, screenX, cy, L, half } = geom();
    const slitY1 = cy - dSep / 2;
    const slitY2 = cy + dSep / 2;

    // 1) wave field (the "line")
    drawField(now);

    // 2) barrier with two slits
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = rgb(c.inkMuted, c.dark ? 0.9 : 1);
    const bw = 4;
    const gap = slitWidth;
    // top wall, between-slits wall, bottom wall
    ctx.fillRect(barrierX - bw / 2, 0, bw, slitY1 - gap / 2);
    ctx.fillRect(barrierX - bw / 2, slitY1 + gap / 2, bw, slitY2 - gap / 2 - (slitY1 + gap / 2));
    ctx.fillRect(barrierX - bw / 2, slitY2 + gap / 2, bw, h - (slitY2 + gap / 2));

    // 3) source
    glowDot(ctx, sourceX, cy, 4, c.particle, c.glowAlpha);
    ctx.strokeStyle = rgb(c.inkMuted, 0.4);
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 5]);
    ctx.beginPath();
    ctx.moveTo(sourceX + 6, cy);
    ctx.lineTo(barrierX, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4) fire particles at a fixed real-time rate (independent of refresh rate);
    //    each lands at Y ~ I(Y)
    spawnAccum += dt * SPAWN_RATE;
    while (spawnAccum >= 1) {
      spawnAccum -= 1;
      const yScreen = sampler(Math.random());
      const slit: 0 | 1 = Math.random() < 0.5 ? 0 : 1;
      flyers.push({ t: 0, slit, yScreen });
    }
    // advance flyers along source→slit→screen; on arrival, deposit a dot
    const nextFlyers: Flyer[] = [];
    ctx.globalCompositeOperation = c.blend;
    for (const f of flyers) {
      f.t += dt * 1.6;
      const slitY = f.slit === 0 ? slitY1 : slitY2;
      let px: number;
      let py: number;
      if (f.t < 0.5) {
        const u = f.t / 0.5; // source → slit
        px = sourceX + (barrierX - sourceX) * u;
        py = cy + (slitY - cy) * u;
      } else {
        const u = (f.t - 0.5) / 0.5; // slit → landing point on screen
        px = barrierX + (screenX - barrierX) * u;
        py = slitY + (cy + f.yScreen - slitY) * u;
      }
      if (f.t >= 1) {
        dots.push({ y: f.yScreen });
        if (dots.length > MAX_DOTS) dots.shift();
        onCount?.(dots.length);
        // detector flash at the measured slit
        if (measured) glowDot(ctx, barrierX, slitY, 3.5, c.trough, c.glowAlpha);
      } else {
        glowDot(ctx, px, py, 1.8, c.particle, c.glowAlpha * 0.9);
        nextFlyers.push(f);
      }
    }
    flyers = nextFlyers;

    // 5) accumulated dots on the screen (the "points" building the pattern)
    ctx.globalCompositeOperation = c.blend;
    ctx.fillStyle = rgb(c.particle, 1);
    for (const dpt of dots) {
      const y = cy + dpt.y;
      // small x-jitter so the strip reads as a band, not a 1px line
      const x = screenX + 2 + (((dpt.y * 53) % 9) - 4) * 0.7;
      ctx.globalAlpha = (c.dark ? 0.5 : 0.75) * 0.9;
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 6) screen line + theoretical intensity curve I(Y) hugging the screen
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = rgb(c.inkMuted, c.dark ? 0.5 : 0.6);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(screenX, 0);
    ctx.lineTo(screenX, h);
    ctx.stroke();

    // (guard: on the very first frame before ResizeObserver lands, L/half can
    //  be 0 → intensity() would be 0/0 = NaN; skip until the geometry is real.)
    if (L > 0 && half > 0) {
      const curvePts: { x: number; y: number }[] = [];
      const amp = 46; // px the curve extends to the right of the screen
      const p: SlitParams = { d: dSep, a: slitWidth, lambda, L };
      for (let i = 0; i <= 120; i++) {
        const Y = -half + (2 * half * i) / 120;
        const I = intensity(Y, p, measured);
        curvePts.push({ x: screenX + I * amp, y: cy + Y });
      }
      glowStroke(ctx, curvePts, c.curve, 1.8, c.glowAlpha, c.dark);
    }

    // 7) labels
    label(ctx, measured ? labels.measured : labels.fringes, screenX - 8, 18, c.inkMuted, {
      size: 11,
      align: 'right',
    });
    label(ctx, `N = ${dots.length}`, sourceX - 2, h - 10, c.inkMuted, { size: 11 });
  };
  rafId = requestAnimationFrame(draw);
  const onVisibility = () => {
    cancelAnimationFrame(rafId);
    if (!document.hidden) {
      lastNow = performance.now();
      rafId = requestAnimationFrame(draw);
    }
  };
  document.addEventListener('visibilitychange', onVisibility);

  return {
    setSeparation(d) {
      dSep = Math.max(16, d);
      rebuildSampler();
    },
    setWavelength(l) {
      lambda = Math.max(6, l);
      rebuildSampler();
    },
    setMeasured(m) {
      measured = m;
      rebuildSampler();
    },
    reset,
    get count() {
      return dots.length;
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
