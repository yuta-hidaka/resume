/**
 * Kinetic vs thermodynamic control. An ensemble of particles starts in the
 * reactant well A of a 1D energy landscape with two exits: a LOW barrier into
 * a SHALLOW well B (the kinetic product) and a HIGH barrier into a DEEP well C
 * (the thermodynamic product). Overdamped Langevin dynamics
 *   dx = −V′(x)dt + √(2T dt)·η
 * makes the competition play out live: at low T whatever escapes goes over
 * the low barrier and stays in B; at high T everything equilibrates and the
 * Boltzmann factor hands victory to C.
 */

const N = 240;
const DT = 0.004;
const SUBSTEPS = 6;
const HISTORY_CAP = 900;

// Landscape (gaussian bumps/wells + confining walls):
const BARRIER_B = 0.42; // low barrier → kinetic product
const BARRIER_C = 0.75; // high barrier → thermodynamic product
const WELL_B = 0.36; // shallow
const WELL_C = 0.85; // deep
const BX = 0.32;
const WX = 0.72;
const SB = 0.09;
const SW = 0.14;

import { tokens, rgb, glowStroke, areaFill, fadeTrails, label, softSprite, type RGB } from './viz';

const g = (x: number, mu: number, s: number) => Math.exp(-((x - mu) ** 2) / (2 * s * s));

export function potential(x: number): number {
  return (
    BARRIER_B * g(x, -BX, SB) +
    BARRIER_C * g(x, BX, SB) -
    WELL_B * g(x, -WX, SW) -
    WELL_C * g(x, WX, SW) +
    0.9 * x ** 10
  );
}

function gradient(x: number): number {
  const h = 1e-4;
  return (potential(x + h) - potential(x - h)) / (2 * h);
}

const gaussian = () =>
  Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

/** DOM-free core, shared with the headless checks. */
export interface KineticsCore {
  step(): void;
  reset(): void;
  setTemperature(t: number): void;
  readonly xs: Float64Array;
  /** [A, B, C] population fractions */
  populations(): [number, number, number];
}

export function createKineticsCore(initialT = 0.09): KineticsCore {
  const xs = new Float64Array(N);
  let temperature = initialT;

  const reset = () => {
    for (let i = 0; i < N; i++) xs[i] = 0.03 * gaussian();
  };
  reset();

  return {
    step() {
      for (let s = 0; s < SUBSTEPS; s++) {
        const noise = Math.sqrt(2 * temperature * DT);
        for (let i = 0; i < N; i++) {
          xs[i] += -gradient(xs[i]) * DT + noise * gaussian();
          if (xs[i] < -1.15) xs[i] = -1.15;
          else if (xs[i] > 1.15) xs[i] = 1.15;
        }
      }
    },
    reset,
    setTemperature(t) {
      temperature = Math.max(0.02, t);
    },
    get xs() {
      return xs;
    },
    populations() {
      let a = 0;
      let b = 0;
      let c = 0;
      for (let i = 0; i < N; i++) {
        if (xs[i] < -0.4) b++;
        else if (xs[i] > 0.4) c++;
        else a++;
      }
      return [a / N, b / N, c / N];
    },
  };
}

interface ThemeColors {
  dark: boolean;
  blend: 'lighter' | 'source-over';
  glowAlpha: number;
  inkMuted: RGB;
  gold: RGB;
  green: RGB;
}

function themeColors(): ThemeColors {
  const tk = tokens();
  return {
    dark: tk.dark,
    blend: tk.blend,
    glowAlpha: tk.glowAlpha,
    inkMuted: tk.inkMuted,
    gold: tk.gold,
    green: tk.green,
  };
}

/** Small cached radial sprite tinted to one of the three bead colors (gold in
 *  B, emerald in C, muted neutral while still in A) — a plain drawImage per
 *  bead is the only way to keep 240 glowing, piling particles at 60fps.
 *  Rebuilt only when the theme flips. */
function tintSprite(color: RGB, size = 40): HTMLCanvasElement {
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

export interface KineticsScene {
  setTemperature(t: number): void;
  reset(): void;
  dispose(): void;
}

export function createKineticsScene(
  stage: HTMLCanvasElement,
  chart: HTMLCanvasElement,
  onUpdate?: (b: number, c: number) => void,
): KineticsScene {
  const sctx = stage.getContext('2d')!;
  const cctx = chart.getContext('2d')!;
  const core = createKineticsCore();
  let colors = themeColors();
  let goldSprite = tintSprite(colors.gold);
  let greenSprite = tintSprite(colors.green);
  let neutralSprite = tintSprite(colors.inkMuted);
  let historyB: number[] = [];
  let historyC: number[] = [];

  // Offscreen buffer that holds ONLY the beads. It is the only layer that gets
  // faded for motion trails; the static landscape is redrawn fresh on the stage
  // each frame and composited over it — so the valley fills, curve, and labels
  // render at exactly their authored alpha instead of accumulating a trail gain.
  const trail = document.createElement('canvas');
  const tctx = trail.getContext('2d')!;
  const clearTrail = () => {
    tctx.setTransform(1, 0, 0, 1, 0, 0);
    tctx.clearRect(0, 0, trail.width, trail.height);
  };

  const themeObserver = new MutationObserver(() => {
    colors = themeColors();
    goldSprite = tintSprite(colors.gold);
    greenSprite = tintSprite(colors.green);
    neutralSprite = tintSprite(colors.inkMuted);
    clearTrail(); // drop trails tinted for the old theme
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    for (const c of [stage, chart]) {
      c.width = Math.max(1, Math.round(c.clientWidth * dpr));
      c.height = Math.max(1, Math.round(c.clientHeight * dpr));
    }
    // Match the bead buffer to the stage backing store (this also clears it).
    trail.width = stage.width;
    trail.height = stage.height;
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  window.addEventListener('resize', resize);
  resize();

  // Screen mapping: x ∈ [−1.15, 1.15], V ∈ [−0.95, 0.85]
  const drawStage = () => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = stage.width / dpr;
    const h = stage.height / dpr;

    const sx = (x: number) => ((x + 1.15) / 2.3) * w;
    const sy = (v: number) => h * 0.12 + ((0.85 - v) / 1.8) * h * 0.78;

    // --- Bead buffer: the only layer that keeps afterimage trails. ---
    // Count each well's current population first so a dense pile can share out
    // its glow instead of every bead firing at full additive alpha.
    const { xs } = core;
    let cntB = 0;
    let cntC = 0;
    for (let i = 0; i < xs.length; i++) {
      if (xs[i] < -0.4) cntB++;
      else if (xs[i] > 0.4) cntC++;
    }

    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fadeTrails(tctx, w, h, colors.dark ? 0.3 : 0.42);
    const dot = 10.5;
    tctx.save();
    tctx.globalCompositeOperation = colors.blend;
    for (let i = 0; i < xs.length; i++) {
      const x = xs[i];
      const inB = x < -0.4;
      const inC = x > 0.4;
      const sprite = inB ? goldSprite : inC ? greenSprite : neutralSprite;
      // Density-aware alpha: small piles keep the full glow; a full well drops
      // each bead's additive alpha so the core stays recognisably gold/green
      // rather than saturating to white (min caps the boost at 1).
      const inWell = inB || inC;
      const base = inWell ? colors.glowAlpha : colors.glowAlpha * 0.55;
      tctx.globalAlpha = inWell ? base * Math.min(1, 14 / (inB ? cntB : cntC)) : base;
      const jx = (((i * 53) % 15) - 7) * 0.35;
      const jy = ((i * 29) % 13) * 0.9;
      const bx = sx(x) + jx;
      const by = sy(potential(x)) - 4 - jy;
      tctx.drawImage(sprite, bx - dot / 2, by - dot / 2, dot, dot);
    }
    tctx.restore();

    // --- Stage: static landscape, redrawn fresh at its authored alpha. ---
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.clearRect(0, 0, w, h);

    // Landscape curve, sampled once and reused for the stroke + well fills.
    const SAMPLES = 240;
    const curvePts: { x: number; y: number }[] = new Array(SAMPLES + 1);
    for (let i = 0; i <= SAMPLES; i++) {
      const x = -1.15 + (2.3 * i) / SAMPLES;
      curvePts[i] = { x: sx(x), y: sy(potential(x)) };
    }
    const idxFor = (xDomain: number) => Math.round(((xDomain + 1.15) / 2.3) * SAMPLES);

    // Subtle valley fills: gold pools toward the kinetic well B, emerald
    // toward the thermodynamic well C — the landscape itself hints which
    // side is which before a single bead moves.
    const floorY = sy(-0.95);
    const bPts = curvePts.slice(idxFor(-0.95), idxFor(-0.03) + 1);
    const cPts = curvePts.slice(idxFor(0.03), idxFor(0.95) + 1);
    areaFill(sctx, bPts, floorY, colors.gold, colors.dark ? 0.22 : 0.12);
    areaFill(sctx, cPts, floorY, colors.green, colors.dark ? 0.22 : 0.12);

    glowStroke(sctx, curvePts, colors.inkMuted, 1.6, colors.dark ? 0.8 : 0.4, colors.dark);

    // Activation-energy sticks: a whisper-quiet dashed riser from the reactant
    // (A) reference floor up to each barrier crest, tying the low-vs-high hump
    // comparison to the Eₐ in the Arrhenius formula above. Gold marks the low
    // B barrier, emerald the high C barrier.
    const eaFloorY = sy(potential(0));
    const eaMark = (xDom: number, color: RGB, side: -1 | 1) => {
      const x = sx(xDom);
      const yTop = sy(potential(xDom));
      sctx.save();
      sctx.globalCompositeOperation = 'source-over';
      sctx.globalAlpha = 0.6;
      sctx.strokeStyle = rgb(color, 1);
      sctx.lineWidth = 1;
      sctx.setLineDash([3, 3]);
      sctx.beginPath();
      sctx.moveTo(x, eaFloorY);
      sctx.lineTo(x, yTop);
      sctx.stroke();
      sctx.restore();
      label(sctx, 'Eₐ', x + side * 6, (yTop + eaFloorY) / 2 + 4, color, {
        size: 11,
        weight: 500,
        align: side < 0 ? 'right' : 'left',
        alpha: 0.6,
      });
    };
    eaMark(-BX, colors.gold, -1);
    eaMark(BX, colors.green, 1);

    // Region labels, tinted toward the product each side favors.
    label(sctx, 'B', sx(-WX), sy(-WELL_B) + 26, colors.gold, {
      size: 13,
      weight: 500,
      align: 'center',
      alpha: 0.9,
    });
    label(sctx, 'A', sx(0), sy(0) + 26, colors.inkMuted, {
      size: 13,
      weight: 500,
      align: 'center',
      alpha: 0.85,
    });
    label(sctx, 'C', sx(WX), sy(-WELL_C) + 26, colors.green, {
      size: 13,
      weight: 500,
      align: 'center',
      alpha: 0.9,
    });

    // Composite the bead buffer (device pixels) over the fresh landscape.
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.drawImage(trail, 0, 0);
  };

  const drawChart = () => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = chart.width / dpr;
    const h = chart.height / dpr;
    const pad = 6;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cctx.clearRect(0, 0, w, h);

    // Whisper-quiet 100%/0% reference lines.
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

    // Two glowing population curves with a light gradient fill beneath.
    const line = (hist: number[], color: RGB) => {
      if (hist.length < 2) return;
      const pts = hist.map((v, i) => ({
        x: (i / (HISTORY_CAP - 1)) * w,
        y: h - pad - v * (h - 2 * pad),
      }));
      areaFill(cctx, pts, h - pad, color, colors.dark ? 0.24 : 0.14);
      glowStroke(cctx, pts, color, 1.6, colors.dark ? 0.75 : 0.4, colors.dark);
    };
    line(historyB, colors.gold);
    line(historyC, colors.green);
  };

  let rafId = 0;
  let frame = 0;
  const loop = () => {
    rafId = requestAnimationFrame(loop);
    core.step();
    if (frame % 4 === 0) {
      const [, b, c] = core.populations();
      if (historyB.length >= HISTORY_CAP) {
        historyB.shift();
        historyC.shift();
      }
      historyB.push(b);
      historyC.push(c);
      onUpdate?.(b, c);
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
      core.setTemperature(t);
    },
    reset() {
      core.reset();
      historyB = [];
      historyC = [];
      clearTrail();
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
