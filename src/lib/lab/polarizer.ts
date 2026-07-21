/**
 * Malus's law scene: an unpolarized beam passes through up to three
 * polarizers. An ideal polarizer transmits the E-field component along its
 * axis: unpolarized light → I/2, then I·cos²Δθ per filter. The classic
 * surprise: two crossed filters block everything, but inserting a 45° filter
 * between them lets 12.5% through — a polarizer projects, it doesn't sieve.
 */

import { tokens, ramp, sampleRamp, rgb, mix, glowStroke, glowDot, label, type RGB, type LabTokens, type Ramp } from './viz';

export interface PolarizerState {
  /** middle filter inserted? */
  middleOn: boolean;
  /** middle filter axis, degrees from vertical */
  thetaMiddle: number;
  /** last filter (the "sunglasses") axis, degrees from vertical */
  theta2: number;
}

/** Intensity after each stage, as fractions of the unpolarized input I₀. */
export function stageIntensities(s: PolarizerState): number[] {
  const rad = (d: number) => (d * Math.PI) / 180;
  const stages = [1, 0.5]; // source, after P1 (axis 0°)
  let angle = 0;
  let intensity = 0.5;
  if (s.middleOn) {
    intensity *= Math.cos(rad(s.thetaMiddle - angle)) ** 2;
    angle = s.thetaMiddle;
    stages.push(intensity);
  }
  intensity *= Math.cos(rad(s.theta2 - angle)) ** 2;
  stages.push(intensity);
  return stages;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const WHITE: RGB = [255, 255, 255];

/** Horizontal foreshortening of the filter plane. The bench is viewed at a
 *  slight tilt, so each disk (perpendicular to the beam) reads as an ellipse
 *  and the in-plane horizontal axis is compressed to this fraction. Every
 *  in-plane quantity — ring, hatch, E-field arrows — is projected through the
 *  same factor so all angles live in one consistent plane. */
const PLANE_X = 0.42;

/** Generalized glowStroke for arbitrary (possibly multi-subpath) paths — used
 *  for the E-field arrows and filter rings, which glowStroke's polyline API
 *  can't express. Mirrors glowStroke's own dark/light convention exactly. */
function strokeGlowPath(
  ctx: CanvasRenderingContext2D,
  path: () => void,
  color: RGB,
  width: number,
  glow: number,
  dark: boolean,
) {
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (dark) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgb(color, 0.26 * glow);
    ctx.lineWidth = width * 3.2;
    path();
    ctx.stroke();
    ctx.strokeStyle = rgb(color, 0.48 * glow);
    ctx.lineWidth = width * 1.7;
    path();
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = rgb(color, 1);
  ctx.lineWidth = width;
  path();
  ctx.stroke();
  ctx.restore();
}

export interface PolarizerScene {
  setState(state: PolarizerState): void;
  dispose(): void;
}

export function createPolarizerScene(canvas: HTMLCanvasElement): PolarizerScene {
  const ctx = canvas.getContext('2d')!;
  let state: PolarizerState = { middleOn: false, thetaMiddle: 45, theta2: 90 };

  // Theme-derived palette, refreshed on class-attribute mutation (matches the
  // rest of the gallery's reactivity contract) rather than every frame.
  let t: LabTokens = tokens();
  let goldR: Ramp = ramp('gold');
  const refreshTheme = () => {
    t = tokens();
    goldR = ramp('gold');
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

  /** Filter disk, seen as a foreshortened ellipse in the tilted bench plane.
   *  The faint hatch runs along the iodine chains (the "wires" that absorb the
   *  parallel field); a brighter gold line marks the perpendicular
   *  transmission axis that light actually passes. The ring's glow brightens
   *  with how much light this filter is passing. */
  const drawFilter = (x: number, y: number, r: number, deg: number, labelText: string, throughput: number) => {
    const glowT = clamp01(throughput / 0.5);
    const rad = (deg * Math.PI) / 180;
    const cs = Math.cos(rad);
    const sn = Math.sin(rad);
    // Project a disk-local point (a = along transmission axis, b = along the
    // chains) into screen space, foreshortening the in-plane horizontal by
    // PLANE_X so the disk reads as a tilted plane.
    const proj = (a: number, b: number): [number, number] => [
      x + (a * sn + b * cs) * PLANE_X,
      y - (a * cs - b * sn),
    ];

    // Hatch = iodine chains, perpendicular to the transmission axis.
    ctx.strokeStyle = rgb(t.inkMuted, t.dark ? 0.3 : 0.38);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let a = -r + 7; a < r; a += 7) {
      const half = Math.sqrt(Math.max(0, r * r - a * a)) - 2;
      if (half <= 0) continue;
      const [x1, y1] = proj(a, -half);
      const [x2, y2] = proj(a, half);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();

    // Transmission axis: a subtle double-headed gold tick across the disk.
    const [ax1, ay1] = proj(-r + 3, 0);
    const [ax2, ay2] = proj(r - 3, 0);
    ctx.strokeStyle = rgb(sampleRamp(goldR, 0.55 + 0.4 * glowT), t.dark ? 0.55 : 0.62);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(ax1, ay1);
    ctx.lineTo(ax2, ay2);
    ctx.stroke();

    // Ring: an ellipse, foreshortened horizontally (a circle in the tilted
    // plane projects to the same ellipse regardless of the axis angle).
    const ringColor = mix(t.inkMuted, sampleRamp(goldR, glowT), 0.3 + 0.55 * glowT);
    const ringPath = () => {
      ctx.beginPath();
      ctx.ellipse(x, y, r * PLANE_X, r, 0, 0, 2 * Math.PI);
    };
    strokeGlowPath(ctx, ringPath, ringColor, 1.4, t.glowAlpha * (0.2 + 0.6 * glowT), t.dark);

    label(ctx, labelText, x, y + r + 20, t.inkMuted, { size: 12, align: 'center' });
  };

  /** Double-headed E-field arrow at angle θ from vertical, living in the same
   *  tilted plane as the filters: the vertical reach is full, the in-plane
   *  horizontal reach is foreshortened by PLANE_X. A near-horizontal field
   *  (θ→90°) therefore reads as poking into the bench rather than running
   *  along the beam. */
  const drawEArrow = (x: number, y: number, deg: number, len: number, pulse: number) => {
    if (len < 2) return;
    const l = len * (0.75 + 0.25 * pulse);
    const rad = (deg * Math.PI) / 180;
    // Projected axis offset from centre to tip (screen up = negative y).
    const ox = Math.sin(rad) * PLANE_X;
    const oy = -Math.cos(rad);
    const mag = Math.hypot(ox, oy) || 1;
    const hx = ox / mag; // unit heading, for the arrowheads
    const hy = oy / mag;
    const px = -hy; // unit perpendicular, for the barbs
    const py = hx;
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(x - ox * l, y - oy * l);
      ctx.lineTo(x + ox * l, y + oy * l);
      for (const dir of [-1, 1]) {
        const ex = x + dir * ox * l;
        const ey = y + dir * oy * l;
        const bx = ex - dir * hx * 5;
        const by = ey - dir * hy * 5;
        ctx.moveTo(bx + px * 3.5, by + py * 3.5);
        ctx.lineTo(ex, ey);
        ctx.lineTo(bx - px * 3.5, by - py * 3.5);
      }
    };
    strokeGlowPath(ctx, path, t.green, 1.8, t.glowAlpha * (0.45 + 0.35 * pulse), t.dark);
  };

  /** Unpolarized light: arrows in every direction. */
  const drawStarburst = (x: number, y: number, len: number, pulse: number) => {
    for (let k = 0; k < 4; k++) drawEArrow(x, y, k * 45, len, pulse);
  };

  let rafId = 0;
  const draw = (now: number) => {
    rafId = requestAnimationFrame(draw);
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const beamY = h * 0.46;
    const pulse = Math.abs(Math.sin(now / 320));

    // Element x-positions; the middle slot stays fixed whether or not in use.
    const xs = {
      source: w * 0.07,
      p1: w * 0.3,
      middle: w * 0.5,
      p2: w * 0.7,
      detector: w * 0.9,
    };
    const filterR = Math.min(46, h * 0.16);

    // Whisper-quiet optical-bench rail beneath the beam.
    ctx.strokeStyle = t.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xs.source - 16, beamY);
    ctx.lineTo(xs.detector + 16, beamY);
    ctx.stroke();

    const intensities = stageIntensities(state);
    const angles = state.middleOn ? [0, state.thetaMiddle, state.theta2] : [0, state.theta2];
    const cuts = state.middleOn
      ? [xs.source, xs.p1, xs.middle, xs.p2, xs.detector]
      : [xs.source, xs.p1, xs.p2, xs.detector];

    // Beam segments: a luminous gradient stroke whose thickness AND
    // brightness follow the running intensity — the glow fades as light is
    // absorbed. Post-filter stages top out at 0.5·I₀, so they're normalized
    // against that ceiling to reach the ramp's brightest tone.
    for (let seg = 0; seg < cuts.length - 1; seg++) {
      const intensity = intensities[seg];
      if (intensity < 0.004) continue;
      const norm = seg === 0 ? 1 : clamp01(intensity / 0.5);
      const segColor = sampleRamp(goldR, norm);
      const width = 1 + 6 * intensity;

      ctx.save();
      ctx.globalAlpha = 0.25 + 0.75 * intensity;
      glowStroke(
        ctx,
        [
          { x: cuts[seg], y: beamY },
          { x: cuts[seg + 1], y: beamY },
        ],
        segColor,
        width,
        t.glowAlpha * (0.4 + 0.6 * norm),
        t.dark,
      );
      ctx.restore();

      const mid = (cuts[seg] + cuts[seg + 1]) / 2;
      const arrowLen = 26 * Math.sqrt(intensity);
      if (seg === 0) drawStarburst(mid, beamY, 20, pulse);
      else drawEArrow(mid, beamY, angles[seg - 1], arrowLen, pulse);
    }

    // Source lamp: a soft unpolarized starburst glow.
    glowDot(ctx, xs.source, beamY, 6.5, mix(sampleRamp(goldR, 1), WHITE, 0.4), 0.65 + 0.35 * pulse);

    // Filters.
    drawFilter(xs.p1, beamY, filterR, 0, '0°', intensities[1]);
    if (state.middleOn) {
      drawFilter(xs.middle, beamY, filterR, state.thetaMiddle, `${Math.round(state.thetaMiddle)}°`, intensities[2]);
    }
    drawFilter(xs.p2, beamY, filterR, state.theta2, `${Math.round(state.theta2)}°`, intensities[intensities.length - 1]);

    // Detector meter: a glowing bar, gradient-filled to the transmitted intensity.
    const out = intensities[intensities.length - 1];
    const normOut = clamp01(out / 0.5);
    const meterH = h * 0.34;
    const meterX = xs.detector - 9;
    const meterTop = beamY - meterH / 2;
    const meterBottom = beamY + meterH / 2;
    const filledTop = meterBottom - meterH * out;

    if (t.dark && out > 0.002) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = rgb(sampleRamp(goldR, normOut), 0.22 * t.glowAlpha * (0.3 + 0.7 * normOut));
      ctx.fillRect(meterX - 6, filledTop - 6, 30, meterH * out + 12);
      ctx.restore();
    }

    ctx.strokeStyle = rgb(t.inkMuted, t.dark ? 0.55 : 0.7);
    ctx.lineWidth = 1.2;
    ctx.strokeRect(meterX, meterTop, 18, meterH);

    // Ideal-filter ceiling: unpolarized light through any polarizer chain caps
    // at I₀/2, so the fill can never pass this half-way line. Mark it so a
    // maxed-out meter doesn't read as stuck or broken.
    const ceilY = meterBottom - meterH * 0.5;
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = rgb(t.inkMuted, t.dark ? 0.5 : 0.6);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(meterX - 3, ceilY);
    ctx.lineTo(meterX + 18, ceilY);
    ctx.stroke();
    ctx.restore();
    label(ctx, '50%', meterX - 7, ceilY + 3.5, t.inkMuted, { size: 9, align: 'right' });

    if (out > 0.001) {
      const grad = ctx.createLinearGradient(0, filledTop, 0, meterBottom);
      grad.addColorStop(0, rgb(sampleRamp(goldR, normOut), 1));
      grad.addColorStop(1, rgb(sampleRamp(goldR, 0.12), 1));
      ctx.fillStyle = grad;
      ctx.fillRect(meterX, filledTop, 18, meterH * out);
    }

    label(ctx, `${(out * 100).toFixed(1)}%`, xs.detector, meterBottom + 20, t.ink, { size: 12, align: 'center' });
  };
  rafId = requestAnimationFrame(draw);

  return {
    setState(next) {
      state = { ...next };
    },
    dispose() {
      cancelAnimationFrame(rafId);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
    },
  };
}
