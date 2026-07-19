/**
 * Shared visual toolkit for the /lab pieces — the single source of the gallery's
 * look. Theme-aware color ramps, glow primitives, motion-trail fading, gradient
 * strokes/fills, soft particle sprites, and in-canvas typography. Every piece
 * draws through these so the whole lab reads as one luminous, editorial system:
 * additive emerald+gold glow on near-black in dark mode, refined ink on paper in
 * light mode. No external dependencies.
 */

export type RGB = [number, number, number];
export type Stop = [number, RGB];
export type Ramp = Stop[];

export function isDark(): boolean {
  const el = document.documentElement;
  if (el.classList.contains('light')) return false;
  if (el.classList.contains('dark')) return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Sample a color ramp at t ∈ [0,1]. */
export function sampleRamp(ramp: Ramp, t: number): RGB {
  t = clamp01(t);
  for (let i = 1; i < ramp.length; i++) {
    if (t <= ramp[i][0]) {
      const [t0, c0] = ramp[i - 1];
      const [t1, c1] = ramp[i];
      const f = t1 === t0 ? 0 : (t - t0) / (t1 - t0);
      return [lerp(c0[0], c1[0], f), lerp(c0[1], c1[1], f), lerp(c0[2], c1[2], f)];
    }
  }
  return ramp[ramp.length - 1][1];
}

export const rgb = (c: RGB, a = 1) =>
  `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;

export function mix(a: RGB, b: RGB, t: number): RGB {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/** Brand ramps, authored for dark mode; `ramp()` dims them for light mode. */
const RAMPS_DARK: Record<string, Ramp> = {
  // deep teal → emerald → mint → pale
  emerald: [
    [0, [12, 46, 34]],
    [0.4, [23, 104, 74]],
    [0.72, [94, 203, 151]],
    [1, [206, 244, 226]],
  ],
  // umber → gold → pale gold
  gold: [
    [0, [58, 40, 16]],
    [0.5, [143, 101, 33]],
    [0.8, [217, 179, 108]],
    [1, [246, 232, 202]],
  ],
  // diverging gold ↔ mint through a warm neutral (for signed quantities)
  phase: [
    [0, [217, 179, 108]],
    [0.5, [176, 168, 150]],
    [1, [94, 203, 151]],
  ],
  // green → warm → gold, for depth / energy / continuous scalars
  spectral: [
    [0, [94, 203, 151]],
    [0.5, [214, 205, 150]],
    [1, [217, 179, 108]],
  ],
};

const LIGHT_INK: RGB = [22, 24, 26];

/** Current-theme ramp: in light mode ramps are pulled toward ink so they read
 *  on paper without additive blending. */
export function ramp(name: keyof typeof RAMPS_DARK): Ramp {
  const base = RAMPS_DARK[name];
  if (isDark()) return base;
  return base.map(([t, c]) => [t, mix(c, LIGHT_INK, 0.34)] as Stop);
}

export interface LabTokens {
  dark: boolean;
  /** additive glow in dark, normal ink in light */
  blend: 'lighter' | 'source-over';
  glowAlpha: number;
  ink: RGB;
  inkMuted: RGB;
  grid: string;
  green: RGB;
  gold: RGB;
}

export function tokens(): LabTokens {
  const dark = isDark();
  return {
    dark,
    blend: dark ? 'lighter' : 'source-over',
    glowAlpha: dark ? 0.9 : 0.55,
    ink: dark ? [237, 237, 238] : [22, 24, 26],
    inkMuted: dark ? [140, 146, 152] : [107, 111, 114],
    grid: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    green: dark ? [94, 203, 151] : [20, 92, 65],
    gold: dark ? [217, 179, 108] : [143, 101, 33],
  };
}

/** DPR-correct sizing. Returns css width/height; sets the backing store. */
export function fitCanvas(canvas: HTMLCanvasElement): { w: number; h: number; dpr: number } {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth || 1;
  const h = canvas.clientHeight || 1;
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  return { w, h, dpr };
}

/** A soft round sprite (radial gradient) usable as a 2D drawImage brush or a
 *  three.js CanvasTexture. Cached by size+core. */
const spriteCache = new Map<string, HTMLCanvasElement>();
export function softSprite(size = 64, core = 0.42): HTMLCanvasElement {
  const key = `${size}:${core}`;
  const hit = spriteCache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(core, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.75, 'rgba(255,255,255,0.22)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  spriteCache.set(key, c);
  return c;
}

/** Fade the canvas toward transparent for motion trails (keeps transparency).
 *  Call once per frame instead of clearRect on pieces that want afterimages. */
export function fadeTrails(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** A glowing dot: broad halo + bright core. Use blend 'lighter' in dark mode. */
export function glowDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: RGB,
  intensity = 1,
) {
  const sprite = softSprite();
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  // halo
  ctx.globalAlpha = 0.5 * intensity;
  tintDraw(ctx, sprite, x, y, r * 3.2, color);
  // core
  ctx.globalAlpha = 0.95 * intensity;
  tintDraw(ctx, sprite, x, y, r * 1.6, color);
  ctx.restore();
}

// draw a white sprite tinted to `color` via an offscreen multiply
const tintCanvas = document.createElement('canvas');
const tintCtx = tintCanvas.getContext('2d')!;
function tintDraw(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  x: number,
  y: number,
  diameter: number,
  color: RGB,
) {
  const s = Math.max(2, Math.round(diameter));
  if (tintCanvas.width !== s || tintCanvas.height !== s) {
    tintCanvas.width = s;
    tintCanvas.height = s;
  }
  tintCtx.clearRect(0, 0, s, s);
  tintCtx.globalCompositeOperation = 'source-over';
  tintCtx.drawImage(sprite, 0, 0, s, s);
  tintCtx.globalCompositeOperation = 'source-in';
  tintCtx.fillStyle = rgb(color, 1);
  tintCtx.fillRect(0, 0, s, s);
  ctx.drawImage(tintCanvas, x - s / 2, y - s / 2);
}

/** Glowing tinted point using a plain fill (fast path for thousands of points).
 *  Draw with ctx.globalCompositeOperation set by the caller. */
export function glowSprite(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  x: number,
  y: number,
  diameter: number,
) {
  ctx.drawImage(sprite, x - diameter / 2, y - diameter / 2, diameter, diameter);
}

/** Smooth polyline as a glowing stroke: a soft wide underlay + crisp core. */
export function glowStroke(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  color: RGB,
  width: number,
  glow: number,
  dark: boolean,
) {
  if (pts.length < 2) return;
  const path = () => {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  };
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (dark) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgb(color, 0.28 * glow);
    ctx.lineWidth = width * 3.4;
    path();
    ctx.stroke();
    ctx.strokeStyle = rgb(color, 0.5 * glow);
    ctx.lineWidth = width * 1.8;
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

/** Vertical gradient fill under a curve (area chart / |ψ|²). */
export function areaFill(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  baseY: number,
  color: RGB,
  topAlpha = 0.32,
) {
  if (pts.length < 2) return;
  const ys = pts.map((p) => p.y);
  const top = Math.min(...ys);
  const grad = ctx.createLinearGradient(0, top, 0, baseY);
  grad.addColorStop(0, rgb(color, topAlpha));
  grad.addColorStop(1, rgb(color, 0));
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0].x, baseY);
  pts.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length - 1].x, baseY);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}

/** Whisper-quiet reference grid for instrument backdrops. */
export function subtleGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = step; x < w; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = step; y < h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
  ctx.restore();
}

/** In-canvas label in the site's muted ink. */
export function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: RGB,
  opts: { size?: number; weight?: number; align?: CanvasTextAlign; alpha?: number } = {},
) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = opts.alpha ?? 1;
  ctx.fillStyle = rgb(color, 1);
  ctx.font = `${opts.weight ?? 400} ${opts.size ?? 12}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = opts.align ?? 'left';
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** Standard theme observer + resize wiring; returns a disposer. Optional —
 *  pieces with existing wiring can keep it. */
export function watchTheme(onChange: () => void): () => void {
  const obs = new MutationObserver(onChange);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => obs.disconnect();
}
