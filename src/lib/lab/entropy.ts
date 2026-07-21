/**
 * Two ideal gases (green / gold) start in separate halves of a box divided by
 * a wall. Remove the wall and they mix ballistically. A coarse-grained mixing
 * entropy S ∈ [0, 1] is charted live: 0 = fully separated, 1 = fully mixed —
 * the second law as an inevitability of counting, fluctuations included.
 *
 * S = Σ_cells w_c · H₂(f_c) / ln 2, where f_c is the green fraction in cell c
 * and w_c its share of all particles (16×10 grid).
 */

import { tokens, rgb, glowStroke, areaFill, fadeTrails, softSprite, label, type RGB } from './viz';

const N_PER_SPECIES = 1300;
const GRID_X = 16;
const GRID_Y = 10;
const SPEED_SIGMA = 0.05; // box widths per second (gaussian components)
const HISTORY_CAP = 900;
/** Seconds of simulated time between chart samples. 900 × 1/15 s ≈ 60 s window. */
const SAMPLE_INTERVAL_S = 1 / 15;
/** The wall drops on its own after this long — entropy needs no button. */
const AUTO_RELEASE_S = 3;
/** Render-only: how long the dropped wall takes to dissolve visually. Does
 *  not affect step() or the reflection physics — purely a fade timer. */
const WALL_DISSOLVE_S = 0.6;

interface ThemeColors {
  green: RGB;
  gold: RGB;
  ink: RGB;
  inkMuted: RGB;
  dark: boolean;
  blend: 'lighter' | 'source-over';
  glowAlpha: number;
}

function themeColors(): ThemeColors {
  const tk = tokens();
  return {
    green: tk.green,
    gold: tk.gold,
    ink: tk.ink,
    inkMuted: tk.inkMuted,
    dark: tk.dark,
    blend: tk.blend,
    glowAlpha: tk.glowAlpha,
  };
}

/** Small cached radial sprite tinted to a species color — the "soft glowing
 *  point" brush used for every particle. A plain drawImage per particle is
 *  the only way to keep 2,600 glowing points at 60fps; rebuilt only when the
 *  theme flips. */
function tintSprite(color: RGB, size = 48): HTMLCanvasElement {
  const src = softSprite(size, 0.42);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const tctx = c.getContext('2d')!;
  tctx.drawImage(src, 0, 0);
  tctx.globalCompositeOperation = 'source-in';
  tctx.fillStyle = rgb(color, 1);
  tctx.fillRect(0, 0, size, size);
  return c;
}

const gaussian = () =>
  Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

export interface EntropySim {
  releaseWall(): void;
  reset(): void;
  readonly wallUp: boolean;
  /** Current mixing entropy in [0, 1]. */
  readonly mixing: number;
  dispose(): void;
}

export function createEntropySim(
  stage: HTMLCanvasElement,
  chart: HTMLCanvasElement,
  onUpdate?: (mixing: number, wallUp: boolean) => void,
): EntropySim {
  const sctx = stage.getContext('2d')!;
  const cctx = chart.getContext('2d')!;
  const N = N_PER_SPECIES * 2;
  const px = new Float32Array(N);
  const py = new Float32Array(N);
  const vx = new Float32Array(N);
  const vy = new Float32Array(N);
  let wallUp = true;
  let wallClock = 0;
  /** 1 while the wall stands, decays to 0 as it dissolves after release —
   *  purely visual, read only by drawStage(). */
  let wallDissolve = 1;
  let history: number[] = [];
  let mixing = 0;
  let colors = themeColors();
  let greenSprite = tintSprite(colors.green);
  let goldSprite = tintSprite(colors.gold);

  const init = () => {
    for (let i = 0; i < N; i++) {
      const green = i < N_PER_SPECIES;
      px[i] = green ? 0.02 + 0.455 * Math.random() : 0.525 + 0.455 * Math.random();
      py[i] = 0.02 + 0.96 * Math.random();
      vx[i] = gaussian() * SPEED_SIGMA;
      vy[i] = gaussian() * SPEED_SIGMA;
    }
    wallUp = true;
    wallClock = 0;
    wallDissolve = 1;
    history = [];
  };
  init();

  const step = (dt: number) => {
    for (let i = 0; i < N; i++) {
      let x = px[i] + vx[i] * dt;
      let y = py[i] + vy[i] * dt;
      if (x < 0) {
        x = -x;
        vx[i] = -vx[i];
      } else if (x > 1) {
        x = 2 - x;
        vx[i] = -vx[i];
      }
      if (wallUp) {
        // Reflect at the divider from whichever side the particle came.
        if (px[i] < 0.5 && x > 0.5) {
          x = 1 - x;
          vx[i] = -vx[i];
        } else if (px[i] > 0.5 && x < 0.5) {
          x = 1 - x;
          vx[i] = -vx[i];
        }
      }
      if (y < 0) {
        y = -y;
        vy[i] = -vy[i];
      } else if (y > 1) {
        y = 2 - y;
        vy[i] = -vy[i];
      }
      px[i] = Math.min(0.9999, Math.max(0, x));
      py[i] = Math.min(0.9999, Math.max(0, y));
    }
  };

  const cellsG = new Uint16Array(GRID_X * GRID_Y);
  const cellsO = new Uint16Array(GRID_X * GRID_Y);
  const computeMixing = (): number => {
    cellsG.fill(0);
    cellsO.fill(0);
    for (let i = 0; i < N; i++) {
      const c = Math.floor(px[i] * GRID_X) + GRID_X * Math.floor(py[i] * GRID_Y);
      if (i < N_PER_SPECIES) cellsG[c]++;
      else cellsO[c]++;
    }
    let s = 0;
    for (let c = 0; c < cellsG.length; c++) {
      const g = cellsG[c];
      const o = cellsO[c];
      const n = g + o;
      if (n === 0 || g === 0 || o === 0) continue;
      const f = g / n;
      s += (n / N) * -(f * Math.log(f) + (1 - f) * Math.log(1 - f));
    }
    return s / Math.LN2;
  };

  const themeObserver = new MutationObserver(() => {
    colors = themeColors();
    greenSprite = tintSprite(colors.green);
    goldSprite = tintSprite(colors.gold);
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    for (const c of [stage, chart]) {
      c.width = Math.max(1, Math.round(c.clientWidth * dpr));
      c.height = Math.max(1, Math.round(c.clientHeight * dpr));
    }
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  window.addEventListener('resize', resize);
  resize();

  const drawStage = () => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = stage.width / dpr;
    const h = stage.height / dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Afterimage trails instead of a hard clear — the two gases read as inks
    // diffusing into one another. Fade fast enough that a dense, still
    // mostly-separated box never smears to fog.
    fadeTrails(sctx, w, h, colors.dark ? 0.3 : 0.42);

    const r = Math.max(1.1, Math.min(w, h) / 280);
    const dot = r * 5.4;
    sctx.save();
    sctx.globalCompositeOperation = colors.blend;
    sctx.globalAlpha = colors.glowAlpha;
    for (let i = 0; i < N_PER_SPECIES; i++) {
      sctx.drawImage(greenSprite, px[i] * w - dot / 2, py[i] * h - dot / 2, dot, dot);
    }
    for (let i = N_PER_SPECIES; i < N; i++) {
      sctx.drawImage(goldSprite, px[i] * w - dot / 2, py[i] * h - dot / 2, dot, dot);
    }
    sctx.restore();

    // The dividing wall: a luminous line that dissolves once it drops.
    if (wallDissolve > 0) {
      sctx.save();
      sctx.globalAlpha = wallDissolve;
      glowStroke(
        sctx,
        [
          { x: w / 2, y: 0 },
          { x: w / 2, y: h },
        ],
        colors.ink,
        1.4,
        colors.dark ? 1 : 0.6,
        colors.dark,
      );
      sctx.restore();
    }
  };

  const drawChart = () => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = chart.width / dpr;
    const h = chart.height / dpr;
    const pad = 6;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cctx.clearRect(0, 0, w, h);

    // S = 1 reference (dashed) and the baseline, in a whisper-quiet ink.
    cctx.save();
    cctx.lineWidth = 1;
    cctx.strokeStyle = rgb(colors.inkMuted, colors.dark ? 0.4 : 0.3);
    cctx.setLineDash([3, 4]);
    cctx.beginPath();
    cctx.moveTo(0, pad);
    cctx.lineTo(w, pad);
    cctx.stroke();
    cctx.setLineDash([]);
    cctx.strokeStyle = rgb(colors.inkMuted, colors.dark ? 0.18 : 0.15);
    cctx.beginPath();
    cctx.moveTo(0, h - pad);
    cctx.lineTo(w, h - pad);
    cctx.stroke();
    cctx.restore();

    if (history.length > 1) {
      const pts = history.map((s, i) => ({
        x: (i / (HISTORY_CAP - 1)) * w,
        y: h - pad - s * (h - 2 * pad),
      }));
      areaFill(cctx, pts, h - pad, colors.green, colors.dark ? 0.3 : 0.16);
      glowStroke(cctx, pts, colors.green, 1.6, colors.dark ? 1 : 0.55, colors.dark);
    }

    // Draw the 'S = 1' label last, over a small transparent knockout — in the
    // mixed end state S rides right along the dashed line, and the additive
    // glow would otherwise swallow this 9px caption.
    cctx.save();
    cctx.font = '400 9px system-ui, -apple-system, sans-serif';
    const tw = cctx.measureText('S = 1').width;
    cctx.clearRect(w - 4 - tw - 3, pad + 1, tw + 6, 13);
    cctx.restore();
    label(cctx, 'S = 1', w - 4, pad + 10, colors.inkMuted, { size: 9, align: 'right', alpha: 0.5 });
  };

  let rafId = 0;
  let last = performance.now();
  /** The chart samples on simulated wall-clock (not frame count) so its ~60 s
   *  window is identical on 60 Hz and 120 Hz displays. 900 samples × 1/15 s. */
  let sampleClock = 0;
  const loop = (now: number) => {
    rafId = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (wallUp) {
      wallClock += dt;
      if (wallClock >= AUTO_RELEASE_S) wallUp = false;
      wallDissolve = 1;
    } else if (wallDissolve > 0) {
      wallDissolve = Math.max(0, wallDissolve - dt / WALL_DISSOLVE_S);
    }
    step(dt);
    sampleClock += dt;
    if (sampleClock >= SAMPLE_INTERVAL_S) {
      sampleClock %= SAMPLE_INTERVAL_S;
      mixing = computeMixing();
      if (history.length >= HISTORY_CAP) history.shift();
      history.push(mixing);
      onUpdate?.(mixing, wallUp);
    }
    drawStage();
    drawChart();
  };
  const onVisibility = () => {
    cancelAnimationFrame(rafId);
    if (!document.hidden) {
      last = performance.now();
      rafId = requestAnimationFrame(loop);
    }
  };
  document.addEventListener('visibilitychange', onVisibility);
  rafId = requestAnimationFrame(loop);

  return {
    releaseWall() {
      wallUp = false;
    },
    reset() {
      init();
    },
    get wallUp() {
      return wallUp;
    },
    get mixing() {
      return mixing;
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
