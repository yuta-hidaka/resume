/**
 * T-duality, drawn as a mirror.
 *
 * Top panel: M² for a family of closed-string states against log R. Momentum
 * modes fall as 1/R², winding modes rise as R², and the whole family is mapped
 * onto itself by log R → −log R. The picture is literally mirror-symmetric about
 * the self-dual radius, which is what makes "a circle of radius R is the same
 * physics as one of radius α'/R" something you can see rather than take on trust.
 *
 * Bottom panel: the circle itself at radius R with a closed string wound around
 * it, and its dual circle at α'/R ghosted alongside. Shrink one and the other
 * grows through it; at R = √α' they coincide.
 *
 * Physics lives in ./strings (DOM-free, tested exactly by scripts/strings-test.mjs
 * — the sorted M² multiset at R equals the one at α'/R to 1e-15).
 */

import { tokens, ramp, sampleRamp, rgb, glowStroke, glowDot, label, subtleGrid, type RGB } from './viz';
import {
  R_SELF_DUAL,
  massSquared,
  dualRadius,
  readout,
  type StringState,
  type StringReadout,
} from './strings';

export interface TDualityLabels {
  spectrum: string; // "質量スペクトル M²"
  selfDual: string; // "自己双対半径 R = √α′"
  momentum: string; // "運動量モード"
  winding: string; // "巻きつきモード"
  mixed: string; // "(1,±1) — ここで質量ゼロになる"
  tachyon: string; // "基底状態（タキオン）"
  radiusAxis: string; // "R / ℓs"
}

export interface TDualityInfo extends StringReadout {
  overlayDual: boolean;
}

export interface TDualityScene {
  radiusNow(): number;
  setRadius(r: number): void;
  setOverlay(on: boolean): void;
  dispose(): void;
}

export const R_MIN = 0.25;
export const R_MAX = 4;

/**
 * The curves on the plot.
 *
 * The momentum and winding towers are built on the MASSLESS level (N = Ñ = 1),
 * i.e. the Kaluza–Klein and winding excitations of the graviton — the standard
 * thing to plot, and a deliberate choice, not the minimal one. The minimal
 * level-matched partners (N = Ñ = 0) exist too and are tachyonic for R > √α'/2;
 * only the ground state of that tower is drawn, as the flat line at M² = −4/α'.
 * The mixed state carries the minimal levels its level matching allows.
 */
interface Curve {
  s: StringState;
  key: keyof TDualityLabels;
  tone: 'green' | 'gold' | 'mix';
  /** where along the curve to park its label, and how to offset it there — the
   *  four curves converge at the right edge, so anchoring them all there stacks
   *  the text on itself */
  anchorR: number;
  dy: number;
  align: CanvasTextAlign;
}

const CURVES: Curve[] = [
  { s: { n: 1, w: 0, N: 1, Nt: 1 }, key: 'momentum', tone: 'green', anchorR: 0.34, dy: -8, align: 'left' },
  { s: { n: 0, w: 1, N: 1, Nt: 1 }, key: 'winding', tone: 'gold', anchorR: 2.9, dy: -8, align: 'right' },
  { s: { n: 1, w: 1, N: 1, Nt: 0 }, key: 'mixed', tone: 'mix', anchorR: 1.55, dy: -8, align: 'left' },
  { s: { n: 0, w: 0, N: 0, Nt: 0 }, key: 'tachyon', tone: 'mix', anchorR: 0.3, dy: -7, align: 'left' },
];

const M2_MIN = -5;
const M2_MAX = 17;

export function createTDualityScene(
  canvas: HTMLCanvasElement,
  labels: TDualityLabels,
  onInfo?: (info: TDualityInfo) => void,
): TDualityScene {
  const ctx = canvas.getContext('2d')!;

  let r = 2.2;
  let overlay = false;

  // Emitted from the setters only. Nothing in the readout depends on the
  // animation clock, so a per-frame emit would rewrite two aria-live regions
  // eleven times a second for the life of the page.
  const emit = () => onInfo?.({ ...readout(r), overlayDual: overlay });

  const layout = (w: number, h: number) => {
    const compact = w < 560;
    return {
      compact,
      x0: compact ? 36 : 48,
      x1: w - 12,
      graphTop: h * 0.1,
      graphBottom: h - (compact ? 58 : 48),
    };
  };

  const toneOf = (tone: string, tk: ReturnType<typeof tokens>): RGB =>
    tone === 'green' ? tk.green : tone === 'gold' ? tk.gold : sampleRamp(ramp('spectral'), 0.5);

  // ——— top panel: M² against log R ———
  const drawSpectrum = (L: ReturnType<typeof layout>, tk: ReturnType<typeof tokens>) => {
    const lo = Math.log10(R_MIN);
    const hi = Math.log10(R_MAX);
    const xOf = (lr: number) => L.x0 + ((lr - lo) / (hi - lo)) * (L.x1 - L.x0);
    const yOf = (m2: number) =>
      L.graphBottom - ((m2 - M2_MIN) / (M2_MAX - M2_MIN)) * (L.graphBottom - L.graphTop);

    // axes + the M² = 0 line, which is where "massless" lives
    ctx.save();
    ctx.strokeStyle = rgb(tk.inkMuted, 0.22);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(L.x0, L.graphTop);
    ctx.lineTo(L.x0, L.graphBottom);
    ctx.lineTo(L.x1, L.graphBottom);
    ctx.stroke();
    ctx.restore();

    const yZero = yOf(0);
    ctx.save();
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = rgb(tk.inkMuted, 0.3);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(L.x0, yZero);
    ctx.lineTo(L.x1, yZero);
    ctx.stroke();
    ctx.restore();
    label(ctx, 'M² = 0', L.x0 - 6, yZero + 3.5, tk.inkMuted, { size: 10, align: 'right' });

    // the mirror line: everything is symmetric about it
    const xSelf = xOf(Math.log10(R_SELF_DUAL));
    ctx.save();
    ctx.strokeStyle = rgb(tk.gold, 0.55);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xSelf, L.graphTop);
    ctx.lineTo(xSelf, L.graphBottom);
    ctx.stroke();
    ctx.restore();
    if (!L.compact) {
      label(ctx, labels.selfDual, xSelf + 5, L.graphTop + 11, tk.gold, { size: 10, weight: 600 });
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(L.x0, L.graphTop - 2, L.x1 - L.x0, L.graphBottom - L.graphTop + 2);
    ctx.clip();

    for (const c of CURVES) {
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i <= 240; i++) {
        const lr = lo + ((hi - lo) * i) / 240;
        const m2 = massSquared(c.s, Math.pow(10, lr));
        pts.push({ x: xOf(lr), y: yOf(Math.min(M2_MAX + 4, m2)) });
      }
      glowStroke(ctx, pts, toneOf(c.tone, tk), 1.8, 0.85, tk.dark);
    }

    // Overlay: the SAME curves evaluated at the dual radius. If T-duality holds
    // they land exactly on top of the originals — the dashes disappear into them.
    if (overlay) {
      ctx.setLineDash([4, 4]);
      for (const c of CURVES) {
        ctx.strokeStyle = rgb(tk.inkMuted, 0.85);
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= 240; i++) {
          const lr = lo + ((hi - lo) * i) / 240;
          // dual state at the dual radius, plotted at R
          const m2 = massSquared({ n: c.s.w, w: c.s.n, N: c.s.N, Nt: c.s.Nt }, dualRadius(Math.pow(10, lr)));
          const p = { x: xOf(lr), y: yOf(Math.min(M2_MAX + 4, m2)) };
          if (i) ctx.lineTo(p.x, p.y);
          else ctx.moveTo(p.x, p.y);
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // cursor at the current radius
    const xc = xOf(Math.log10(r));
    ctx.save();
    ctx.strokeStyle = rgb(tk.green, 0.45);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xc, L.graphTop);
    ctx.lineTo(xc, L.graphBottom);
    ctx.stroke();
    ctx.restore();
    for (const c of CURVES) {
      const m2 = massSquared(c.s, r);
      if (m2 > M2_MAX || m2 < M2_MIN) continue;
      glowDot(ctx, xc, yOf(m2), 2.4, toneOf(c.tone, tk), tk.dark ? 1 : 0.8);
    }
    ctx.restore();

    // radius ticks
    for (const rv of [0.25, 0.5, 1, 2, 4]) {
      const x = xOf(Math.log10(rv));
      ctx.save();
      ctx.strokeStyle = rgb(tk.inkMuted, 0.22);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, L.graphBottom);
      ctx.lineTo(x, L.graphBottom + 4);
      ctx.stroke();
      ctx.restore();
      label(ctx, `${rv}`, x, L.graphBottom + 15, tk.inkMuted, { size: 10, align: 'center' });
    }
    // the unit sits under the tick row, not beside the last tick
    // the unit goes at the top edge: the bottom belongs to the ticks and the hint
    label(ctx, labels.radiusAxis, L.x1 - 2, L.graphTop + 11, tk.inkMuted, { size: 10, align: 'right' });
    label(ctx, labels.spectrum, L.x0 + 5, L.graphTop + 11, tk.green, { size: 10, weight: 600 });

    // Each curve is labelled where it is well separated from the others rather
    // than at a shared edge.
    if (!L.compact) {
      for (const c of CURVES) {
        const m2 = massSquared(c.s, c.anchorR);
        if (m2 > M2_MAX || m2 < M2_MIN) continue;
        const x = xOf(Math.log10(c.anchorR));
        const dx = c.align === 'left' ? 7 : c.align === 'right' ? -7 : 0;
        label(ctx, labels[c.key], x + dx, yOf(m2) + c.dy, toneOf(c.tone, tk), {
          size: 10,
          align: c.align,
          weight: 600,
        });
      }
    }
  };

  let rafId = 0;

  const draw = () => {
    rafId = requestAnimationFrame(draw);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const tk = tokens();
    const L = layout(w, h);
    subtleGrid(ctx, w, h, Math.max(26, w / 18), tk.grid);
    drawSpectrum(L, tk);
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
  rafId = requestAnimationFrame(draw);
  emit();

  return {
    radiusNow: () => r,
    setRadius(v) {
      r = Math.max(R_MIN, Math.min(R_MAX, v));
      emit();
    },
    setOverlay(on) {
      overlay = on;
      emit();
    },
    dispose() {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('resize', resize);
    },
  };
}
