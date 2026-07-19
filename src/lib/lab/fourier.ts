/**
 * Fourier drawing machine: a closed 2D path is treated as a periodic complex
 * signal z(t) = x(t) + iy(t), decomposed by DFT, and redrawn by a chain of
 * rotating vectors (epicycles). Truncating to the K largest terms shows how
 * few frequencies carry most of the shape.
 */

import { tokens, ramp, sampleRamp, rgb, glowStroke, glowDot, type Ramp } from './viz';

export interface Pt {
  x: number;
  y: number;
}

interface Epicycle {
  freq: number;
  amp: number;
  phase: number;
}

const SAMPLES = 256;

/** DFT of a complex signal, terms sorted by descending amplitude. */
function dft(points: Pt[]): Epicycle[] {
  const N = points.length;
  const out: Epicycle[] = [];
  for (let k = 0; k < N; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n++) {
      const phi = (2 * Math.PI * k * n) / N;
      const cos = Math.cos(phi);
      const sin = Math.sin(phi);
      re += points[n].x * cos + points[n].y * sin;
      im += points[n].y * cos - points[n].x * sin;
    }
    re /= N;
    im /= N;
    out.push({
      freq: k <= N / 2 ? k : k - N,
      amp: Math.hypot(re, im),
      phase: Math.atan2(im, re),
    });
  }
  out.sort((a, b) => b.amp - a.amp);
  return out;
}

/** Resample a polyline as a closed curve with uniform arc-length spacing. */
function resampleClosed(points: Pt[], n: number): Pt[] {
  const cum = [0];
  for (let i = 1; i <= points.length; i++) {
    const a = points[i - 1];
    const b = points[i % points.length];
    cum.push(cum[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  const total = cum[cum.length - 1];
  const out: Pt[] = [];
  let seg = 0;
  for (let i = 0; i < n; i++) {
    const target = (total * i) / n;
    while (seg < points.length - 1 && cum[seg + 1] < target) seg++;
    const a = points[seg];
    const b = points[(seg + 1) % points.length];
    const span = cum[seg + 1] - cum[seg];
    const t = span > 0 ? (target - cum[seg]) / span : 0;
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return out;
}

/** Preset shapes in normalized coords (roughly within [-1, 1]²). */
export const PRESETS: Record<string, () => Pt[]> = {
  star: () =>
    Array.from({ length: SAMPLES }, (_, i) => {
      const t = (2 * Math.PI * i) / SAMPLES;
      const r = 0.62 + 0.38 * Math.cos(5 * t);
      return { x: r * Math.cos(t), y: r * Math.sin(t) };
    }),
  heart: () =>
    Array.from({ length: SAMPLES }, (_, i) => {
      const t = (2 * Math.PI * i) / SAMPLES;
      return {
        x: (16 * Math.sin(t) ** 3) / 17,
        y: (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17,
      };
    }),
  lemniscate: () =>
    Array.from({ length: SAMPLES }, (_, i) => {
      const t = (2 * Math.PI * i) / SAMPLES;
      const d = 1 + Math.sin(t) ** 2;
      return { x: Math.cos(t) / d, y: (0.9 * Math.sin(t) * Math.cos(t)) / d };
    }),
};

export interface FourierMachine {
  setShape(points: Pt[]): void;
  setPreset(name: keyof typeof PRESETS): void;
  setTerms(k: number): void;
  readonly maxTerms: number;
  dispose(): void;
}

const PERIOD_S = 10;
const PATH_LEN = 512;
/** Length, in path samples, of the bright comet head trailing the tracer. */
const COMET_LEN = 70;

export function createFourierMachine(
  canvas: HTMLCanvasElement,
  onDrawnShape?: () => void,
): FourierMachine {
  const ctx = canvas.getContext('2d')!;
  let epicycles: Epicycle[] = [];
  let terms = 32;
  let t = 0;
  let path: Pt[] = []; // reconstruction with `terms` terms, normalized coords
  /** True once the current shape came from hand-drawn input (colors the trace gold). */
  let drawnSource = false;

  // Evaluate the truncated Fourier sum at phase u ∈ [0, 1).
  const evalSum = (u: number, k: number): Pt => {
    let x = 0;
    let y = 0;
    for (let i = 0; i < Math.min(k, epicycles.length); i++) {
      const e = epicycles[i];
      const a = 2 * Math.PI * e.freq * u + e.phase;
      x += e.amp * Math.cos(a);
      y += e.amp * Math.sin(a);
    }
    return { x, y };
  };

  const recomputePath = () => {
    path = Array.from({ length: PATH_LEN }, (_, i) => evalSum(i / PATH_LEN, terms));
  };

  const setShapeInternal = (points: Pt[], drawn: boolean) => {
    epicycles = dft(resampleClosed(points, SAMPLES));
    drawnSource = drawn;
    recomputePath();
  };

  const setShape = (points: Pt[]) => setShapeInternal(points, false);

  // Drawing input (normalized coords; y flipped so up is positive).
  let stroke: Pt[] = [];
  let drawing = false;
  const toNorm = (ev: PointerEvent): Pt => {
    const rect = canvas.getBoundingClientRect();
    const s = Math.min(rect.width, rect.height) * 0.36;
    return {
      x: (ev.clientX - rect.left - rect.width / 2) / s,
      y: -(ev.clientY - rect.top - rect.height / 2) / s,
    };
  };
  const onDown = (ev: PointerEvent) => {
    drawing = true;
    stroke = [toNorm(ev)];
    try {
      canvas.setPointerCapture(ev.pointerId);
    } catch {
      // Synthetic or already-released pointers can't be captured; drawing still works.
    }
  };
  const onMove = (ev: PointerEvent) => {
    if (drawing) stroke.push(toNorm(ev));
  };
  const onUp = () => {
    if (!drawing) return;
    drawing = false;
    if (stroke.length > 8) {
      setShapeInternal(stroke, true);
      onDrawnShape?.();
    }
    stroke = [];
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  // Colors are sampled fresh from the shared viz tokens/ramps every frame
  // (see draw()), so theme changes are reflected immediately without a
  // separate cache-invalidation observer — the rAF loop already runs
  // continuously at 60fps.

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  window.addEventListener('resize', resize);
  resize();

  let rafId = 0;
  let last = performance.now();
  const draw = (now: number) => {
    rafId = requestAnimationFrame(draw);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!drawing) t = (t + dt / PERIOD_S) % 1;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    // Normalized → screen: center origin, y up.
    const s = Math.min(w, h) * 0.36;
    const sx = (p: Pt) => w / 2 + p.x * s;
    const sy = (p: Pt) => h / 2 - p.y * s;

    const tk = tokens();
    const goldRamp = ramp('gold');

    if (drawing && stroke.length > 1) {
      // Live hand-drawn input: a thread of gold light with a bright tip.
      const pts = stroke.map((p) => ({ x: sx(p), y: sy(p) }));
      glowStroke(ctx, pts, sampleRamp(goldRamp, 0.82), 1.6, tk.glowAlpha, tk.dark);
      const tip = pts[pts.length - 1];
      glowDot(ctx, tip.x, tip.y, 2.2, sampleRamp(goldRamp, 1), tk.dark ? 1 : 0.75);
      return;
    }
    if (!epicycles.length) return;

    // A hand-drawn shape keeps tracing in gold; presets trace in emerald.
    const curveRamp: Ramp = drawnSource ? goldRamp : ramp('emerald');

    // Full reconstruction: a whisper-quiet outline of where the trace is headed.
    ctx.strokeStyle = rgb(tk.ink, tk.dark ? 0.08 : 0.13);
    ctx.lineWidth = 1;
    ctx.beginPath();
    path.forEach((p, i) => (i ? ctx.lineTo(sx(p), sy(p)) : ctx.moveTo(sx(p), sy(p))));
    ctx.closePath();
    ctx.stroke();

    const upto = Math.floor(t * path.length);
    if (upto > 1) {
      // Traced-so-far: a luminous gradient stroke — a dim tail feeding a
      // bright comet head at the current point.
      const tail = Math.max(0, upto - COMET_LEN);
      if (tail > 0) {
        const basePts: { x: number; y: number }[] = [];
        for (let i = 0; i <= tail; i++) {
          const p = path[i];
          basePts.push({ x: sx(p), y: sy(p) });
        }
        glowStroke(ctx, basePts, sampleRamp(curveRamp, 0.4), 1.3, tk.glowAlpha * 0.5, tk.dark);
      }
      const cometPts: { x: number; y: number }[] = [];
      for (let i = tail; i <= upto; i++) {
        const p = path[i];
        cometPts.push({ x: sx(p), y: sy(p) });
      }
      glowStroke(ctx, cometPts, sampleRamp(curveRamp, 0.9), 2.4, tk.glowAlpha, tk.dark);
    }

    // Epicycle chain: barely-there rings + thin, glowing radius vectors.
    let cx = 0;
    let cy = 0;
    const k = Math.min(terms, epicycles.length);
    for (let i = 0; i < k; i++) {
      const e = epicycles[i];
      const a = 2 * Math.PI * e.freq * t + e.phase;
      const nx = cx + e.amp * Math.cos(a);
      const ny = cy + e.amp * Math.sin(a);
      if (e.amp * s > 1.5) {
        const origin = { x: sx({ x: cx, y: cy }), y: sy({ x: cx, y: cy }) };
        const vecTip = { x: sx({ x: nx, y: ny }), y: sy({ x: nx, y: ny }) };
        ctx.strokeStyle = rgb(tk.ink, tk.dark ? 0.045 : 0.07);
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.arc(origin.x, origin.y, e.amp * s, 0, 2 * Math.PI);
        ctx.stroke();
        glowStroke(ctx, [origin, vecTip], sampleRamp(curveRamp, 0.55), 0.8, tk.glowAlpha * 0.4, tk.dark);
      }
      cx = nx;
      cy = ny;
    }

    // Tip: a bright point of light at the pen's current position.
    const tip = { x: sx({ x: cx, y: cy }), y: sy({ x: cx, y: cy }) };
    glowDot(ctx, tip.x, tip.y, 2.6, sampleRamp(curveRamp, 1), tk.dark ? 1.05 : 0.85);
  };
  rafId = requestAnimationFrame(draw);

  return {
    setShape,
    setPreset(name) {
      setShape(PRESETS[name]());
    },
    setTerms(k) {
      terms = Math.max(1, Math.round(k));
      recomputePath();
    },
    get maxTerms() {
      return SAMPLES;
    },
    dispose() {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    },
  };
}
