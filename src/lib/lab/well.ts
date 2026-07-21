/**
 * Particle in a box — the infinite square well, the first exactly-solvable
 * Schrödinger problem every course starts with. Confining a particle to a
 * width-L box forces standing waves that fit the walls: ψ_n(x) = √(2/L)
 * sin(nπx/L), with quantized energies E_n = n²π²ℏ²/(2mL²). Energy comes in
 * discrete steps, the ground state can't sit still (zero-point energy), and
 * squeezing the box (small L) pushes every level up as 1/L².
 */

import { tokens, ramp, sampleRamp, rgb, glowStroke, areaFill, glowDot, label } from './viz';

/** Eigen-energy in units of π²ℏ²/2m, so E_n = n²/L². */
export function energy(n: number, L: number): number {
  return (n * n) / (L * L);
}

/** ψ_n(x) on x ∈ [0, L]; ∫|ψ|² = 1. */
export function eigenstate(n: number, L: number, x: number): number {
  return Math.sqrt(2 / L) * Math.sin((n * Math.PI * x) / L);
}

const LEVELS = 6;

export interface WellScene {
  setLevel(n: number): void;
  setWidth(L: number): void;
  setMode(mode: 'psi' | 'prob'): void;
  /** current E_n in display units (π²ℏ²/2mL₀²) */
  currentEnergy(): number;
  dispose(): void;
}

export function createWellScene(canvas: HTMLCanvasElement): WellScene {
  const ctx = canvas.getContext('2d')!;
  let n = 1;
  let L = 1; // box width as a fraction of the reference width
  let mode: 'psi' | 'prob' = 'psi';
  // Fixed energy axis: the deepest box (L=0.6) puts E_6 near the top.
  const E_AXIS_MAX = energy(LEVELS, 0.6) * 1.05;

  // Colors are sampled fresh from the shared viz tokens/ramps every frame
  // (see draw()), so theme changes are reflected immediately without a
  // separate cache-invalidation observer — the rAF loop already runs
  // continuously at 60fps, and the wave's hue also tracks the current level.

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
  let t = 0;
  let last = performance.now();

  const draw = (now: number) => {
    rafId = requestAnimationFrame(draw);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const tk = tokens();
    const goldRamp = ramp('gold');
    const emeraldRamp = ramp('emerald');
    const activeColor = sampleRamp(goldRamp, 0.82);
    // The wave's hue drifts warmer as n climbs — color tracks energy, not a
    // single flat accent.
    const psiColor = sampleRamp(emeraldRamp, 0.38 + 0.5 * ((n - 1) / (LEVELS - 1)));

    const padX = w * 0.1;
    const top = h * 0.08;
    const bottom = h * 0.9;
    // Box occupies the middle, its width proportional to L (centered).
    const boxW = (w - 2 * padX) * L;
    const bx0 = w / 2 - boxW / 2;
    const bx1 = w / 2 + boxW / 2;
    // Square-root-compressed energy axis. A linear axis crushes the low levels:
    // at L=1 the E₁=1 rung sits a few px above the floor, hiding the zero-point
    // gap and letting the ground-state wave dip below the box. Mapping through
    // √E lifts E₁ well clear of the floor and spaces the rungs wide enough that
    // the standing wave no longer breaks through — the ladder still climbs as
    // the box narrows, so all three lessons survive (trade-off: the n² rung
    // spacing reads as ∝ n rather than widening).
    const eY = (E: number) => bottom - Math.sqrt(E / E_AXIS_MAX) * (bottom - top);

    // Standing-wave oscillation: Re(ψ e^{-iEt}) = ψ cos(Et). The true rate ∝ E
    // aliases into flicker at high n (≈17 Hz at n=6/L=0.6 vs the 60fps rAF), so
    // the animation clock runs through √E instead — still monotonic in E, so
    // "higher level breathes faster" reads, but the top speed drops to a
    // legible ≈1.75 Hz.
    const phase = Math.cos(t * 1.1 * Math.sqrt(energy(n, L)));

    // Well walls (infinite potential) — a single quiet, faintly luminous line.
    glowStroke(
      ctx,
      [
        { x: bx0, y: top },
        { x: bx0, y: bottom },
        { x: bx1, y: bottom },
        { x: bx1, y: top },
      ],
      tk.inkMuted,
      1.5,
      tk.dark ? 0.4 : 0.28,
      tk.dark,
    );

    // Energy ladder — the quantization made visible. Quiet dashed rungs; the
    // occupied level glows gold and shimmers with the wave's own breathing.
    const shimmer = 0.7 + 0.3 * Math.abs(phase);
    for (let k = 1; k <= LEVELS; k++) {
      const y = eY(energy(k, L));
      const active = k === n;
      if (active) {
        glowStroke(
          ctx,
          [
            { x: bx0, y },
            { x: bx1, y },
          ],
          activeColor,
          1.7,
          tk.glowAlpha * shimmer,
          tk.dark,
        );
        glowDot(ctx, bx0, y, 2, activeColor, tk.dark ? 1 : 0.7);
        glowDot(ctx, bx1, y, 2, activeColor, tk.dark ? 1 : 0.7);
      } else {
        ctx.save();
        ctx.strokeStyle = rgb(tk.inkMuted, tk.dark ? 0.32 : 0.38);
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(bx0, y);
        ctx.lineTo(bx1, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
      label(ctx, `E${'₀₁₂₃₄₅₆'[k]}`, bx0 - 8, y + 3, active ? activeColor : tk.inkMuted, {
        size: 11,
        weight: active ? 600 : 400,
        align: 'right',
        alpha: active ? 1 : 0.65,
      });
    }

    // The selected eigenstate, drawn as a wave riding on its energy level.
    const y0 = eY(energy(n, L));
    const amp = Math.min(46, (bottom - top) / 7);
    const samples = 160;
    if (mode === 'prob') {
      // |ψ|² filled above the level line — a luminous gradient area under a
      // glowing outline.
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i <= samples; i++) {
        const x = (i / samples) * L;
        const p = eigenstate(n, L, x) ** 2;
        pts.push({ x: bx0 + (i / samples) * boxW, y: y0 - p * amp * 0.5 });
      }
      const ambient = 0.92 + 0.08 * Math.sin(t * 1.6);
      areaFill(ctx, pts, y0, psiColor, (tk.dark ? 0.4 : 0.22) * ambient);
      glowStroke(ctx, pts, psiColor, 1.8, tk.glowAlpha * ambient, tk.dark);
    } else {
      // Re(ψ): a standing wave breathing in place, shimmering brightest at
      // its amplitude extremes and softest as it sweeps through zero.
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i <= samples; i++) {
        const x = (i / samples) * L;
        const v = eigenstate(n, L, x) * phase;
        pts.push({ x: bx0 + (i / samples) * boxW, y: y0 - v * amp * 0.5 });
      }
      glowStroke(ctx, pts, psiColor, 1.9, tk.glowAlpha * shimmer, tk.dark);
    }

    // Zero-point marker: ground level never reaches the floor.
    label(ctx, '0', bx0 - 14, bottom + 4, tk.inkMuted, { size: 12, align: 'center', alpha: 0.8 });
  };
  rafId = requestAnimationFrame(draw);

  return {
    setLevel(next) {
      n = Math.max(1, Math.min(LEVELS, Math.round(next)));
    },
    setWidth(next) {
      L = Math.max(0.6, Math.min(1, next));
    },
    setMode(next) {
      mode = next;
    },
    currentEnergy() {
      return energy(n, L);
    },
    dispose() {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
    },
  };
}
