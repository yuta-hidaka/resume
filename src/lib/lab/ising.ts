/**
 * 2D Ising model with Metropolis dynamics. Each cell is a spin s = ±1 with
 * energy E = -J Σ s_i s_j - H Σ s_i (J = 1, nearest neighbours, periodic
 * boundaries). Below Tc = 2 / ln(1 + √2) ≈ 2.269 the lattice magnetizes
 * spontaneously; an external field H tilts the balance.
 */

import { tokens, ramp, sampleRamp, rgb, glowStroke, areaFill, type RGB } from './viz';

const W = 96;
const H_CELLS = 64;
const N = W * H_CELLS;
const SWEEPS_PER_FRAME = 2;
const HISTORY_CAP = 900;

export const T_CRITICAL = 2 / Math.log(1 + Math.SQRT2);

interface ThemeColors {
  up: RGB;
  down: RGB;
  /** tint for the luminous seam drawn along domain walls */
  wall: RGB;
  inkMuted: RGB;
  dark: boolean;
  blend: 'lighter' | 'source-over';
  glowAlpha: number;
}

function themeColors(): ThemeColors {
  const tk = tokens();
  return {
    up: sampleRamp(ramp('emerald'), 0.78),
    down: sampleRamp(ramp('gold'), 0.72),
    wall: sampleRamp(ramp('phase'), 0.5),
    inkMuted: tk.inkMuted,
    dark: tk.dark,
    blend: tk.blend,
    glowAlpha: tk.glowAlpha,
  };
}

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/** Smoothed (bilinear) copy of `src` into `dst`, resized to fill it. Used to
 *  turn the blocky Metropolis lattice into an organic, softly graded field —
 *  purely a render step, no effect on the spins themselves. */
function smoothScale(src: HTMLCanvasElement, dst: HTMLCanvasElement) {
  const ctx = dst.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, dst.width, dst.height);
  ctx.drawImage(src, 0, 0, dst.width, dst.height);
}

export interface IsingSim {
  setTemperature(t: number): void;
  setField(h: number): void;
  randomize(): void;
  readonly magnetization: number;
  dispose(): void;
}

export function createIsingSim(
  stage: HTMLCanvasElement,
  chart: HTMLCanvasElement,
  onUpdate?: (magnetization: number) => void,
): IsingSim {
  const sctx = stage.getContext('2d')!;
  const cctx = chart.getContext('2d')!;
  const spins = new Int8Array(N);
  let temperature = 3.5;
  let field = 0;
  let magnetSum = 0;
  let history: number[] = [];
  let colors = themeColors();

  // Grid-resolution field (spin colour) and domain-wall (boundary energy)
  // buffers, progressively upscaled with smoothing at draw time so the
  // lattice reads as an organic magnetic film rather than hard pixels.
  const fieldOff = makeCanvas(W, H_CELLS);
  const fieldCtx = fieldOff.getContext('2d')!;
  const fieldImg = fieldCtx.createImageData(W, H_CELLS);
  const fieldMid = makeCanvas(W * 2, H_CELLS * 2);
  const fieldMid2 = makeCanvas(W * 4, H_CELLS * 4);

  const wallOff = makeCanvas(W, H_CELLS);
  const wallCtx = wallOff.getContext('2d')!;
  const wallImg = wallCtx.createImageData(W, H_CELLS);

  const randomize = () => {
    magnetSum = 0;
    for (let i = 0; i < N; i++) {
      spins[i] = Math.random() < 0.5 ? 1 : -1;
      magnetSum += spins[i];
    }
    history = [];
  };
  randomize();

  const sweep = () => {
    for (let k = 0; k < N; k++) {
      const i = (Math.random() * N) | 0;
      const x = i % W;
      const y = (i / W) | 0;
      const s = spins[i];
      const neighbours =
        spins[((x + 1) % W) + y * W] +
        spins[((x + W - 1) % W) + y * W] +
        spins[x + ((y + 1) % H_CELLS) * W] +
        spins[x + ((y + H_CELLS - 1) % H_CELLS) * W];
      const dE = 2 * s * (neighbours + field);
      if (dE <= 0 || Math.random() < Math.exp(-dE / temperature)) {
        spins[i] = -s;
        magnetSum -= 2 * s;
      }
    }
  };

  const themeObserver = new MutationObserver(() => {
    colors = themeColors();
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
    const fd = fieldImg.data;
    const wd = wallImg.data;
    const upC = colors.up;
    const downC = colors.down;
    const wallC = colors.wall;
    for (let y = 0; y < H_CELLS; y++) {
      const yUp = (y + 1) % H_CELLS;
      const yDown = (y + H_CELLS - 1) % H_CELLS;
      for (let x = 0; x < W; x++) {
        const i = x + y * W;
        const s = spins[i];
        const c = s > 0 ? upC : downC;
        const o = i * 4;
        fd[o] = c[0];
        fd[o + 1] = c[1];
        fd[o + 2] = c[2];
        fd[o + 3] = 255;

        // Domain-wall strength: how many of the 4 neighbours disagree —
        // this is where a real ferromagnet pays an energy cost, so it gets
        // a soft luminous seam instead of a hard edge.
        const xUp = (x + 1) % W;
        const xDown = (x + W - 1) % W;
        const walls =
          (spins[xUp + y * W] !== s ? 1 : 0) +
          (spins[xDown + y * W] !== s ? 1 : 0) +
          (spins[x + yUp * W] !== s ? 1 : 0) +
          (spins[x + yDown * W] !== s ? 1 : 0);
        wd[o] = wallC[0];
        wd[o + 1] = wallC[1];
        wd[o + 2] = wallC[2];
        wd[o + 3] = walls === 0 ? 0 : Math.round((walls / 4) * 255);
      }
    }
    fieldCtx.putImageData(fieldImg, 0, 0);
    wallCtx.putImageData(wallImg, 0, 0);

    // Progressive smoothing upscale (grid → 2× → 4×) softens the blocky
    // Metropolis pixels into organic, anti-aliased domain boundaries.
    smoothScale(fieldOff, fieldMid);
    smoothScale(fieldMid, fieldMid2);

    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = 'high';
    sctx.clearRect(0, 0, stage.width, stage.height);

    // Cover-fit the lattice into the stage so cells stay square whatever the
    // canvas aspect is — otherwise a tall mobile canvas stretches the
    // statistically isotropic domains into vertical blobs. Periodic
    // boundaries make the cropped edge cells free of visible seams.
    const scale = Math.max(stage.width / fieldMid2.width, stage.height / fieldMid2.height);
    const dw = fieldMid2.width * scale;
    const dh = fieldMid2.height * scale;
    const dx = (stage.width - dw) / 2;
    const dy = (stage.height - dh) / 2;
    sctx.drawImage(fieldMid2, dx, dy, dw, dh);

    // A single soft (bilinear) pass for the wall glow, composited additively
    // in dark mode — a faint luminous film over every domain boundary. Same
    // destination rect as the field so the seams stay registered.
    sctx.save();
    sctx.globalCompositeOperation = colors.blend;
    sctx.globalAlpha = colors.glowAlpha * 0.55;
    sctx.drawImage(wallOff, dx, dy, dw, dh);
    sctx.restore();
  };

  const drawChart = () => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = chart.width / dpr;
    const h = chart.height / dpr;
    const pad = 6;
    const midY = h / 2;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cctx.clearRect(0, 0, w, h);

    // M = ±1 bounds and the M = 0 midline, whisper-quiet reference lines.
    cctx.save();
    cctx.strokeStyle = rgb(colors.inkMuted, colors.dark ? 0.32 : 0.36);
    cctx.lineWidth = 1;
    cctx.setLineDash([3, 4]);
    cctx.beginPath();
    cctx.moveTo(0, pad);
    cctx.lineTo(w, pad);
    cctx.moveTo(0, h - pad);
    cctx.lineTo(w, h - pad);
    cctx.stroke();
    cctx.setLineDash([]);
    cctx.strokeStyle = rgb(colors.inkMuted, colors.dark ? 0.16 : 0.18);
    cctx.beginPath();
    cctx.moveTo(0, midY);
    cctx.lineTo(w, midY);
    cctx.stroke();

    // Micro-labels so the chart is self-describing: M runs +1 (all ↑) at the
    // top to −1 (all ↓) at the bottom. Left-aligned inside the pad so they
    // never collide with the curve's leading edge on the right.
    cctx.fillStyle = rgb(colors.inkMuted, colors.dark ? 0.5 : 0.55);
    cctx.font = '9px ui-sans-serif, system-ui';
    cctx.fillText('+1', 4, pad + 9);
    cctx.fillText('−1', 4, h - pad - 3);
    cctx.restore();

    if (history.length > 1) {
      const pts = history.map((m, i) => ({
        x: (i / (HISTORY_CAP - 1)) * w,
        y: midY - m * (midY - pad),
      }));

      // Domain-coloured area fill: emerald above the midline (net ↑), gold
      // below it (net ↓) — the same palette as the lattice itself. Each
      // half is clipped and, for the lower half, mirrored about the
      // midline so areaFill's built-in "fades toward baseY" gradient reads
      // correctly in both directions (strong at the curve, fading at M=0).
      cctx.save();
      cctx.beginPath();
      cctx.rect(0, 0, w, midY);
      cctx.clip();
      areaFill(cctx, pts, midY, colors.up, colors.dark ? 0.32 : 0.2);
      cctx.restore();

      cctx.save();
      cctx.beginPath();
      cctx.rect(0, midY, w, h - midY);
      cctx.clip();
      cctx.translate(0, 2 * midY);
      cctx.scale(1, -1);
      areaFill(
        cctx,
        pts.map((p) => ({ x: p.x, y: 2 * midY - p.y })),
        midY,
        colors.down,
        colors.dark ? 0.32 : 0.2,
      );
      cctx.restore();

      // The line itself glows with a hue drawn live from the diverging
      // phase ramp — gold when net-down, emerald when net-up.
      const latest = history[history.length - 1];
      const lineColor = sampleRamp(ramp('phase'), (latest + 1) / 2);
      glowStroke(cctx, pts, lineColor, 1.6, colors.dark ? 1 : 0.6, colors.dark);
    }
  };

  let rafId = 0;
  let frame = 0;
  const loop = () => {
    rafId = requestAnimationFrame(loop);
    for (let s = 0; s < SWEEPS_PER_FRAME; s++) sweep();
    if (frame % 3 === 0) {
      const m = magnetSum / N;
      if (history.length >= HISTORY_CAP) history.shift();
      history.push(m);
      onUpdate?.(m);
    }
    frame++;
    drawStage();
    drawChart();
  };
  const onVisibility = () => {
    cancelAnimationFrame(rafId);
    if (!document.hidden) rafId = requestAnimationFrame(loop);
  };
  document.addEventListener('visibilitychange', onVisibility);
  rafId = requestAnimationFrame(loop);

  return {
    setTemperature(t) {
      temperature = Math.max(0.05, t);
    },
    setField(h) {
      field = h;
    },
    randomize,
    get magnetization() {
      return magnetSum / N;
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
