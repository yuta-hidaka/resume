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
 *
 * The COMPARE mode stacks the two experiments — identical slits, wavelength and
 * source, differing ONLY in whether a which-path detector is present — so the
 * one thing that changes the outcome (knowing the path) is isolated on screen.
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

export type Mode = 'interference' | 'measured' | 'compare';

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
  setMode(mode: Mode): void;
  reset(): void;
  readonly count: number;
  dispose(): void;
}

interface Dot {
  y: number; // screen offset from lane center, px
}
interface Flyer {
  t: number; // 0..1 along its path
  slit: 0 | 1;
  yScreen: number; // final landing offset
}

/** One self-contained experiment occupying a vertical band of the canvas. */
interface Lane {
  yTop: number;
  yBottom: number;
  measured: boolean;
  caption: string;
  dots: Dot[];
  flyers: Flyer[];
  spawnAccum: number;
  sampler: (u: number) => number;
  decohere: number; // 0..1 wash-out of fringes when measured
}

const MAX_DOTS = 4000;
const SPAWN_RATE = 180; // particles per second (time-based, refresh-rate independent)
const FIELD_W = 150; // low-res wave-field buffer
const FIELD_H = 96;

export interface DoubleSlitLabels {
  /** in-canvas caption for the interference (unmeasured) lane */
  fringes: string;
  /** in-canvas caption for the measured (which-path) lane */
  measured: string;
}

export function createDoubleSlitScene(
  canvas: HTMLCanvasElement,
  onCount?: (n: number) => void,
  labels: DoubleSlitLabels = { fringes: 'interference', measured: 'which-path measured → no fringes' },
): DoubleSlitScene {
  const ctx = canvas.getContext('2d')!;
  let c = colors();

  let dSep = 46;
  let lambda = 13;
  const slitWidth = 12;
  let mode: Mode = 'interference';

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
  const xGeom = () => {
    const sourceX = w * 0.06;
    const barrierX = w * 0.3;
    const screenX = w * 0.9;
    return { sourceX, barrierX, screenX, L: screenX - barrierX };
  };
  // lane-local geometry
  const laneCy = (lane: Lane) => (lane.yTop + lane.yBottom) / 2;
  const laneHalf = (lane: Lane) => (lane.yBottom - lane.yTop) * 0.44;

  let lanes: Lane[] = [];

  const rebuildSampler = (lane: Lane) => {
    const { L } = xGeom();
    const half = laneHalf(lane);
    if (L <= 0 || half <= 0) return;
    lane.sampler = makeScreenSampler({ d: dSep, a: slitWidth, lambda, L }, lane.measured, half);
  };

  const LANE_GAP = 10;
  // vertical bands + measured flag for the current mode (compare = two stacked)
  const laneBands = (): { yTop: number; yBottom: number; measured: boolean }[] =>
    mode === 'compare'
      ? [
          { yTop: 0, yBottom: h / 2 - LANE_GAP, measured: false },
          { yTop: h / 2 + LANE_GAP, yBottom: h, measured: true },
        ]
      : [{ yTop: 0, yBottom: h, measured: mode === 'measured' }];

  // Build FRESH lanes (empties the accumulated dots) — only for a mode change.
  const buildLanes = () => {
    lanes = laneBands().map((b) => {
      const lane: Lane = {
        yTop: b.yTop,
        yBottom: b.yBottom,
        measured: b.measured,
        caption: b.measured ? labels.measured : labels.fringes,
        dots: [],
        flyers: [],
        spawnAccum: 0,
        sampler: () => 0,
        decohere: b.measured ? 1 : 0,
      };
      rebuildSampler(lane);
      return lane;
    });
  };

  // Reposition the EXISTING lanes on resize and rebuild their samplers, WITHOUT
  // clearing accumulated dots/flyers/progress — a window resize must not erase
  // the pattern the viewer is watching build. Falls back to a fresh build only
  // if the lane structure doesn't match the current mode (e.g. first paint).
  const relayoutLanes = () => {
    const bands = laneBands();
    if (bands.length !== lanes.length) {
      buildLanes();
      return;
    }
    bands.forEach((b, i) => {
      lanes[i].yTop = b.yTop;
      lanes[i].yBottom = b.yBottom;
      rebuildSampler(lanes[i]);
    });
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    relayoutLanes();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  window.addEventListener('resize', resize);
  resize();

  const totalCount = () => lanes.reduce((n, l) => n + l.dots.length, 0);
  const reset = () => {
    for (const l of lanes) {
      l.dots = [];
      l.flyers = [];
    }
    onCount?.(0);
  };

  // ——— wave field for one lane: instantaneous Re(ψ) from its two slits ———
  const drawLaneField = (now: number, lane: Lane) => {
    const { barrierX, screenX } = xGeom();
    const cy = laneCy(lane);
    const slitY1 = cy - dSep / 2;
    const slitY2 = cy + dSep / 2;
    const k = (2 * Math.PI) / lambda;
    const phase = 6 * (now / 1000);
    // measured → jitter slit 2's phase so coherence (and the fringes) wash out
    const decoherePhase = lane.measured ? lane.decohere * Math.sin(now / 140) * Math.PI * 4 : 0;
    const laneH = lane.yBottom - lane.yTop;
    // Sample only as many field rows as the lane's share of the canvas height, so
    // two half-height compare lanes cost the same as one full lane (and keep the
    // same vertical field resolution) instead of doubling the priciest inner loop.
    const fh = h > 0 ? Math.max(24, Math.min(FIELD_H, Math.round((FIELD_H * laneH) / h))) : FIELD_H;
    const d = fieldImg.data;
    for (let j = 0; j < fh; j++) {
      const y = lane.yTop + (j / (fh - 1)) * laneH;
      for (let i = 0; i < FIELD_W; i++) {
        const x = barrierX + (i / (FIELD_W - 1)) * (screenX - barrierX);
        const r1 = Math.hypot(x - barrierX, y - slitY1) + 1;
        const r2 = Math.hypot(x - barrierX, y - slitY2) + 1;
        const psi =
          Math.cos(k * r1 - phase) / Math.sqrt(r1) +
          Math.cos(k * r2 - phase + decoherePhase) / Math.sqrt(r2);
        const mag = Math.min(1, Math.abs(psi * 5.5));
        const col = psi >= 0 ? c.crest : c.trough;
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
    ctx.drawImage(off, 0, 0, FIELD_W, fh, barrierX, lane.yTop, screenX - barrierX, laneH);
    ctx.restore();
  };

  const renderLane = (now: number, dt: number, lane: Lane) => {
    lane.decohere += ((lane.measured ? 1 : 0) - lane.decohere) * Math.min(1, dt * 3);
    const { sourceX, barrierX, screenX } = xGeom();
    const cy = laneCy(lane);
    const half = laneHalf(lane);
    const slitY1 = cy - dSep / 2;
    const slitY2 = cy + dSep / 2;

    // clip everything to this lane's band so nothing bleeds into the divider
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, lane.yTop, w, lane.yBottom - lane.yTop);
    ctx.clip();

    // 1) wave field
    drawLaneField(now, lane);

    // 2) barrier with two slits
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = rgb(c.inkMuted, c.dark ? 0.9 : 1);
    const bw = 4;
    const gap = slitWidth;
    ctx.fillRect(barrierX - bw / 2, lane.yTop, bw, slitY1 - gap / 2 - lane.yTop);
    ctx.fillRect(barrierX - bw / 2, slitY1 + gap / 2, bw, slitY2 - gap / 2 - (slitY1 + gap / 2));
    ctx.fillRect(barrierX - bw / 2, slitY2 + gap / 2, bw, lane.yBottom - (slitY2 + gap / 2));

    // 3) source + beam
    glowDot(ctx, sourceX, cy, 4, c.particle, c.glowAlpha);
    ctx.strokeStyle = rgb(c.inkMuted, 0.4);
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 5]);
    ctx.beginPath();
    ctx.moveTo(sourceX + 6, cy);
    ctx.lineTo(barrierX, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3b) which-path detector marks at the slits (measured lane only)
    if (lane.measured) {
      for (const sy of [slitY1, slitY2]) {
        ctx.strokeStyle = rgb(c.trough, c.dark ? 0.8 : 0.9);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(barrierX, sy, 6, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    // 4) fire particles at a fixed real-time rate; each lands at Y ~ I(Y)
    lane.spawnAccum += dt * SPAWN_RATE;
    while (lane.spawnAccum >= 1) {
      lane.spawnAccum -= 1;
      lane.flyers.push({ t: 0, slit: Math.random() < 0.5 ? 0 : 1, yScreen: lane.sampler(Math.random()) });
    }
    const nextFlyers: Flyer[] = [];
    ctx.globalCompositeOperation = c.blend;
    for (const f of lane.flyers) {
      f.t += dt * 1.6;
      const slitY = f.slit === 0 ? slitY1 : slitY2;
      let px: number;
      let py: number;
      if (f.t < 0.5) {
        const u = f.t / 0.5;
        px = sourceX + (barrierX - sourceX) * u;
        py = cy + (slitY - cy) * u;
      } else {
        const u = (f.t - 0.5) / 0.5;
        px = barrierX + (screenX - barrierX) * u;
        py = slitY + (cy + f.yScreen - slitY) * u;
      }
      if (f.t >= 1) {
        lane.dots.push({ y: f.yScreen });
        if (lane.dots.length > MAX_DOTS) lane.dots.shift();
        if (lane.measured) glowDot(ctx, barrierX, slitY, 3.5, c.trough, c.glowAlpha);
      } else {
        glowDot(ctx, px, py, 1.8, c.particle, c.glowAlpha * 0.9);
        nextFlyers.push(f);
      }
    }
    lane.flyers = nextFlyers;

    // 5) accumulated dots (the "points")
    ctx.globalCompositeOperation = c.blend;
    ctx.fillStyle = rgb(c.particle, 1);
    for (const dpt of lane.dots) {
      const x = screenX + 2 + (((dpt.y * 53) % 9) - 4) * 0.7;
      ctx.globalAlpha = (c.dark ? 0.5 : 0.75) * 0.9;
      ctx.beginPath();
      ctx.arc(x, cy + dpt.y, 1.4, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 6) screen line + theoretical I(Y) curve
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = rgb(c.inkMuted, c.dark ? 0.5 : 0.6);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(screenX, lane.yTop);
    ctx.lineTo(screenX, lane.yBottom);
    ctx.stroke();

    const { L } = xGeom();
    if (L > 0 && half > 0) {
      const curvePts: { x: number; y: number }[] = [];
      const amp = Math.min(46, half * 0.5);
      const p: SlitParams = { d: dSep, a: slitWidth, lambda, L };
      for (let i = 0; i <= 120; i++) {
        const Y = -half + (2 * half * i) / 120;
        curvePts.push({ x: screenX + intensity(Y, p, lane.measured) * amp, y: cy + Y });
      }
      glowStroke(ctx, curvePts, c.curve, 1.8, c.glowAlpha, c.dark);
    }

    // 7) caption
    label(ctx, lane.caption, screenX - 8, lane.yTop + 16, c.inkMuted, { size: 11, align: 'right' });

    ctx.restore();
  };

  let rafId = 0;
  let lastNow = performance.now();
  const draw = (now: number) => {
    rafId = requestAnimationFrame(draw);
    const dt = Math.min(0.05, (now - lastNow) / 1000);
    lastNow = now;

    const dpr = Math.min(window.devicePixelRatio, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    for (const lane of lanes) renderLane(now, dt, lane);

    // divider between the two compared experiments
    if (lanes.length === 2) {
      const my = (lanes[0].yBottom + lanes[1].yTop) / 2;
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = rgb(c.inkMuted, c.dark ? 0.28 : 0.34);
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(0, my);
      ctx.lineTo(w, my);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    onCount?.(totalCount());
    label(ctx, `N = ${totalCount()}`, xGeom().sourceX - 2, h - 10, c.inkMuted, { size: 11 });
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
      for (const l of lanes) rebuildSampler(l);
    },
    setWavelength(l) {
      lambda = Math.max(6, l);
      for (const lane of lanes) rebuildSampler(lane);
    },
    setMode(m) {
      mode = m;
      buildLanes();
      onCount?.(0);
    },
    reset,
    get count() {
      return totalCount();
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
