/**
 * The Friedmann equation, drawn twice over.
 *
 * Top panel: a(t) — the scale factor from the Big Bang, through today, into
 * whatever future the parameters imply. Dial in the measured values and the
 * curve's left end lands 13.8 Gyr ago.
 *
 * Bottom panel: the same solution as space itself. Galaxies sit at fixed
 * comoving positions and are drawn at comoving × a(t), so the screen shows
 * physical space stretching. A photon rides along with its wavelength scaling as
 * a — which is all a cosmological redshift is.
 *
 * Physics lives in ./cosmology (DOM-free, checked against closed-form solutions
 * by scripts/cosmology-test.mjs).
 */

import { tokens, rgb, glowStroke, glowDot, label, subtleGrid } from './viz';
import {
  PLANCK,
  cosmology,
  omegaK,
  q0,
  matterLambdaEquality,
  matterRadiationEquality,
  redshiftOf,
  history,
  plotSpanGyr,
  type Cosmology,
  type Fate,
  type History,
} from './cosmology';

export interface FriedmannLabels {
  scale: string; // "スケール因子 a"
  today: string; // "今"
  bang: string; // "ビッグバン"
  crunch: string; // "ビッグクランチ"
  noBang: string; // "始まりがない（ビッグバンなし）"
  continues: string; // "→ この先で再収縮（表示範囲の外）"
  gyr: string; // "Gyr"
}

export interface FriedmannInfo {
  cosmo: Cosmology;
  ok: number; // Ω_k
  ageGyr: number;
  fate: Fate;
  crunchGyr: number | null;
  q0: number;
  zLambda: number | null; // redshift where Λ overtook matter
  zEq: number | null; // matter–radiation equality
  hasBigBang: boolean;
  truncated: boolean;
  accelAtA: number | null;
  /** where the animation currently sits, in Gyr from today */
  cursorGyr: number;
  cursorA: number;
  cursorZ: number;
}

export interface FriedmannScene {
  /** current scale factor at the playhead, for the 3D view to mirror */
  scaleNow(): number;
  /** 0..1 position of the playhead across the plotted history */
  phaseNow(): number;
  setOmegaM(v: number): void;
  setOmegaL(v: number): void;
  setH0(v: number): void;
  setFlat(on: boolean): void;
  usePlanck(): void;
  dispose(): void;
}

const GRID_X = 11;
const GRID_Y = 7;
const SWEEP_SECONDS = 14; // one pass of the animation cursor
const EMIT_MS = 90; // the readouts do not need 60 fps

export function createFriedmannScene(
  canvas: HTMLCanvasElement,
  labels: FriedmannLabels,
  onInfo?: (info: FriedmannInfo) => void,
): FriedmannScene {
  const ctx = canvas.getContext('2d')!;

  let om = PLANCK.om;
  let ol = PLANCK.ol;
  let h0 = PLANCK.h0;
  let flat = true;

  let hist: History | null = null;
  let cosmo: Cosmology = cosmology(h0, om, ol);
  let dirty = true;

  /**
   * Flat mode is a constraint, not a preset: Ω_Λ is whatever closes the sum —
   * INCLUDING negative values. Clamping it at zero silently abandoned the
   * constraint above Ω_m = 1 and left the panel claiming "Ω_k = 0.000 (flat)"
   * beside "recollapses to a Big Crunch", which cannot both be true of what the
   * chip promised. A flat universe with Λ < 0 is a perfectly good solution; it
   * recollapses, and now it says so honestly.
   */
  const rebuild = () => {
    const base = cosmology(h0, om, ol);
    const olEff = flat ? 1 - om - base.orad : ol;
    cosmo = cosmology(h0, om, olEff);
    // Plot out to a ≈ 2.6 rather than a fixed number of Gyr, so today never gets
    // squashed into the bottom of the frame by a runaway future.
    hist = history(cosmo, plotSpanGyr(cosmo), 900);
    dirty = false;
  };

  let cursor = 0; // 0..1 across the drawn time span
  let lastA = 1; // scale factor at the playhead, shared with the 3D view
  let lastEmit = -1e9;
  const emit = (force = false) => {
    if (!hist) return;
    const nowMs = performance.now();
    if (!force && nowMs - lastEmit < EMIT_MS) return;
    lastEmit = nowMs;
    const span = hist.t[hist.t.length - 1] - hist.t[0];
    const tNow = hist.t[0] + cursor * span;
    let aNow = 0;
    for (let i = 1; i < hist.t.length; i++) {
      if (hist.t[i] >= tNow) {
        const f = (tNow - hist.t[i - 1]) / Math.max(1e-12, hist.t[i] - hist.t[i - 1]);
        aNow = hist.a[i - 1] + f * (hist.a[i] - hist.a[i - 1]);
        break;
      }
    }
    lastA = aNow;
    onInfo?.({
      cosmo,
      ok: omegaK(cosmo),
      ageGyr: hist.ageGyr,
      fate: hist.fate,
      crunchGyr: hist.crunchGyr,
      q0: q0(cosmo),
      zLambda: (() => {
        const a = matterLambdaEquality(cosmo);
        return a === null ? null : redshiftOf(a);
      })(),
      zEq: (() => {
        const a = matterRadiationEquality(cosmo);
        return a === null ? null : redshiftOf(a);
      })(),
      hasBigBang: hist.hasBigBang,
      truncated: hist.truncated,
      accelAtA: hist.accelAtA,
      cursorGyr: tNow,
      cursorA: aNow,
      cursorZ: aNow > 0 ? redshiftOf(aNow) : Infinity,
    });
  };

  const layout = (w: number, h: number) => {
    // .lab-hint is absolutely positioned over the bottom of the stage and wraps to
    // two lines on a phone, so reserve more room there than on a wide screen.
    const compact = w < 560;
    return {
      compact,
      x0: compact ? 34 : 44,
      x1: w - 12,
      graphTop: h * 0.1,
      graphBottom: h - (compact ? 56 : 46),
    };
  };

  // ——— top panel: a(t) ———
  const drawCurve = (L: ReturnType<typeof layout>, tk: ReturnType<typeof tokens>) => {
    if (!hist) return { tOf: (t: number) => L.x0, aOf: (a: number) => L.graphBottom, tNow: 0, aNow: 1 };
    const n = hist.t.length;
    const tMin = hist.t[0];
    const tMax = hist.t[n - 1];
    let aMax = 1;
    for (let i = 0; i < n; i++) if (hist.a[i] > aMax) aMax = hist.a[i];
    const aTop = aMax * 1.1;

    const tOf = (t: number) => L.x0 + ((t - tMin) / Math.max(1e-9, tMax - tMin)) * (L.x1 - L.x0);
    const aOf = (a: number) => L.graphBottom - (a / aTop) * (L.graphBottom - L.graphTop);

    // axes
    ctx.save();
    ctx.strokeStyle = rgb(tk.inkMuted, 0.22);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(L.x0, L.graphTop);
    ctx.lineTo(L.x0, L.graphBottom);
    ctx.lineTo(L.x1, L.graphBottom);
    ctx.stroke();
    ctx.restore();

    // a = 1 reference
    const y1 = aOf(1);
    ctx.save();
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = rgb(tk.inkMuted, 0.3);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(L.x0, y1);
    ctx.lineTo(L.x1, y1);
    ctx.stroke();
    ctx.restore();
    label(ctx, 'a = 1', L.x0 - 6, y1 + 3.5, tk.inkMuted, { size: 10, align: 'right' });

    // today
    const xNow = tOf(0);
    ctx.save();
    ctx.strokeStyle = rgb(tk.gold, 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xNow, L.graphTop);
    ctx.lineTo(xNow, L.graphBottom);
    ctx.stroke();
    ctx.restore();
    label(ctx, labels.today, xNow + 4, L.graphTop + 11, tk.gold, { size: 10, weight: 600 });

    // the curve, coloured past → future
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) pts.push({ x: tOf(hist.t[i]), y: aOf(hist.a[i]) });
    glowStroke(ctx, pts, tk.green, 2, 0.9, tk.dark);

    // endpoints
    if (hist.hasBigBang) {
      glowDot(ctx, tOf(hist.t[0]), aOf(0), 2.4, tk.gold, tk.dark ? 1 : 0.8);
      label(ctx, labels.bang, tOf(hist.t[0]) + 5, aOf(0) - 7, tk.gold, { size: 10, weight: 600 });
    } else {
      label(ctx, labels.noBang, L.x0 + 6, L.graphTop + 11, tk.gold, { size: 10, weight: 600 });
    }
    if (hist.crunchGyr !== null && !hist.truncated) {
      const xc = tOf(hist.crunchGyr);
      glowDot(ctx, xc, aOf(0), 2.4, tk.gold, tk.dark ? 1 : 0.8);
      label(ctx, labels.crunch, xc - 5, aOf(0) - 7, tk.gold, { size: 10, weight: 600, align: 'right' });
    } else if (hist.truncated) {
      // The recollapse is real but astronomically far off; say the curve is cut
      // rather than letting the green line terminate in mid-air.
      const yEnd = aOf(hist.a[hist.a.length - 1]);
      label(ctx, labels.continues, L.x1 - 4, yEnd - 8, tk.gold, { size: 10, weight: 600, align: 'right' });
    }

    // time ticks in Gyr, measured from the Big Bang so the numbers read as ages
    const totalGyr = tMax - tMin;
    const step = niceStep(totalGyr / 5);
    for (let g = 0; g <= totalGyr + 1e-9; g += step) {
      const t = tMin + g;
      const x = tOf(t);
      if (x < L.x0 - 1 || x > L.x1 + 1) continue;
      ctx.save();
      ctx.strokeStyle = rgb(tk.inkMuted, 0.22);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, L.graphBottom);
      ctx.lineTo(x, L.graphBottom + 4);
      ctx.stroke();
      ctx.restore();
      label(ctx, `${Math.round(g)}`, x, L.graphBottom + 15, tk.inkMuted, { size: 10, align: 'center' });
    }
    label(ctx, labels.gyr, L.x1 - 2, L.graphTop + 11, tk.inkMuted, { size: 10, align: 'right' });
    label(ctx, labels.scale, L.x0 + 5, L.graphTop + 11, tk.green, { size: 10, weight: 600 });

    // animation cursor
    const tCur = tMin + cursor * (tMax - tMin);
    let aCur = 0;
    for (let i = 1; i < n; i++) {
      if (hist.t[i] >= tCur) {
        const f = (tCur - hist.t[i - 1]) / Math.max(1e-12, hist.t[i] - hist.t[i - 1]);
        aCur = hist.a[i - 1] + f * (hist.a[i] - hist.a[i - 1]);
        break;
      }
    }
    glowDot(ctx, tOf(tCur), aOf(aCur), 3, tk.green, tk.dark ? 1 : 0.85);

    return { tOf, aOf, tNow: tCur, aNow: aCur };
  };

  let rafId = 0;
  let last = performance.now();
  let clock = 0;

  const draw = (now: number) => {
    rafId = requestAnimationFrame(draw);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    cursor += dt / SWEEP_SECONDS;
    if (cursor > 1) cursor -= 1;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const tk = tokens();
    if (dirty || !hist) rebuild();
    const L = layout(w, h);
    subtleGrid(ctx, w, h, Math.max(26, w / 18), tk.grid);

    drawCurve(L, tk);
    emit();
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  window.addEventListener('resize', resize);
  resize();
  rebuild();
  rafId = requestAnimationFrame(draw);
  emit(true);

  return {
    scaleNow: () => lastA,
    phaseNow: () => cursor,
    setOmegaM(v) {
      om = Math.max(0, Math.min(1.5, v));
      dirty = true;
    },
    setOmegaL(v) {
      ol = Math.max(0, Math.min(1.5, v));
      dirty = true;
    },
    setH0(v) {
      h0 = Math.max(50, Math.min(90, v));
      dirty = true;
    },
    setFlat(on) {
      flat = on;
      dirty = true;
    },
    usePlanck() {
      om = PLANCK.om;
      ol = PLANCK.ol;
      h0 = PLANCK.h0;
      flat = true;
      cursor = 0;
      dirty = true;
    },
    dispose() {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('resize', resize);
    },
  };
}

/** 1, 2, 5, 10, 20, 50 … — axis steps that read as round numbers. */
function niceStep(raw: number): number {
  const mag = Math.pow(10, Math.floor(Math.log10(Math.max(1e-9, raw))));
  const n = raw / mag;
  const m = n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10;
  return m * mag;
}
