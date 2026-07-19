/**
 * Polypropylene polymerization. Propylene monomers (CH₂=CH–CH₃) add one at a
 * time to a growing chain: the C=C double bond opens and links into a
 * saturated –CH₂–CH(CH₃)– backbone. The methyl side groups can sit all on one
 * side (isotactic), strictly alternating (syndiotactic), or at random
 * (atactic) — the tacticity that Ziegler–Natta and metallocene catalysts
 * control, and that decides whether you get a strong crystalline plastic or a
 * soft gum.
 */

import type { RGB, Ramp } from './viz';
import { tokens, ramp, sampleRamp, rgb, mix, glowStroke, glowDot, label } from './viz';

export type Tacticity = 'isotactic' | 'syndiotactic' | 'atactic';

/** Maps a 0..1 chain-position fraction to a ramp position that keeps the
 *  oldest units legible instead of fading all the way to black. */
const depthT = (raw: number) => 0.35 + 0.65 * raw;

const MAX_UNITS = 14;
const ADD_INTERVAL_S = 0.7;

/** Which side (+1 up / −1 down) the methyl on repeat unit i points. */
export function methylSide(tacticity: Tacticity, i: number, seed: number): number {
  if (tacticity === 'isotactic') return 1;
  if (tacticity === 'syndiotactic') return i % 2 === 0 ? 1 : -1;
  // Atactic: deterministic hash of (seed, i) so a given run is stable.
  const hviz = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return hviz - Math.floor(hviz) < 0.5 ? 1 : -1;
}

interface ThemeColors {
  dark: boolean;
  glowAlpha: number;
  inkMuted: RGB;
  emerald: Ramp;
  gold: Ramp;
}

function themeColors(): ThemeColors {
  const tk = tokens();
  return {
    dark: tk.dark,
    glowAlpha: tk.glowAlpha,
    inkMuted: tk.inkMuted,
    emerald: ramp('emerald'),
    gold: ramp('gold'),
  };
}

export interface PolymerScene {
  setTacticity(t: Tacticity): void;
  reset(): void;
  readonly units: number;
  dispose(): void;
}

export function createPolymerScene(
  canvas: HTMLCanvasElement,
  onUpdate?: (units: number, tacticity: Tacticity) => void,
): PolymerScene {
  const ctx = canvas.getContext('2d')!;
  let tacticity: Tacticity = 'isotactic';
  let units = 0; // completed repeat units
  let grow = 0; // 0..1 animation of the unit currently attaching
  let seed = 1;
  let colors = themeColors();

  const themeObserver = new MutationObserver(() => {
    colors = themeColors();
  });
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

  const reset = () => {
    units = 0;
    grow = 0;
    seed = (seed % 997) + 7; // fresh atactic pattern each reset
  };

  let rafId = 0;
  let last = performance.now();
  const draw = (now: number) => {
    rafId = requestAnimationFrame(draw);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (units < MAX_UNITS) {
      grow += dt / ADD_INTERVAL_S;
      if (grow >= 1) {
        grow = 0;
        units++;
        onUpdate?.(units, tacticity);
      }
    }

    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Backbone zig-zag geometry. Each repeat unit = 2 backbone carbons
    // (–CH₂– then the –CH(CH₃)– that carries the methyl).
    const midY = h * 0.52;
    const amp = Math.min(24, h * 0.09);
    const totalCarbons = MAX_UNITS * 2 + 1;
    const dx = (w * 0.82) / totalCarbons;
    const x0 = w * 0.09;
    const cx = (i: number) => x0 + i * dx;
    const cyOf = (i: number) => midY + (i % 2 === 0 ? -amp : amp);

    const drawnCarbons = units * 2 + 1; // include the open end

    // Backbone: a glowing gradient zig-zag. Older bonds sit deep and quiet;
    // the growing tip glows brightest, so colour itself reads as the
    // chain's "age" as it's built up one click at a time.
    for (let i = 0; i < drawnCarbons - 1; i++) {
      const t = depthT(i / (totalCarbons - 1));
      const segColor = sampleRamp(colors.emerald, t);
      glowStroke(
        ctx,
        [
          { x: cx(i), y: cyOf(i) },
          { x: cx(i + 1), y: cyOf(i + 1) },
        ],
        segColor,
        2.2,
        1,
        colors.dark,
      );
    }

    // Methyl side groups on every substituted carbon (odd index) — soft
    // gold glowing spheres, tacticity decides which side they land on.
    for (let u = 0; u < units; u++) {
      const ci = u * 2 + 1;
      const side = methylSide(tacticity, u, seed);
      const bx = cx(ci);
      const by = cyOf(ci);
      const my = by + side * amp * 1.4;
      const t = depthT(ci / (totalCarbons - 1));
      ctx.save();
      ctx.strokeStyle = rgb(colors.inkMuted, colors.dark ? 0.5 : 0.65);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, my);
      ctx.stroke();
      ctx.restore();
      glowDot(ctx, bx, my, 3.6, sampleRamp(colors.gold, t), colors.glowAlpha);
    }

    // Backbone carbons — soft emerald glow; the open (growing) end pulses
    // gently while its bond is forming.
    for (let i = 0; i < drawnCarbons; i++) {
      const t = depthT(i / (totalCarbons - 1));
      const isTip = i === drawnCarbons - 1 && units < MAX_UNITS;
      const r = i % 2 === 1 ? 3.6 : 3;
      const boost = isTip ? 1 + 0.5 * grow : 1;
      glowDot(ctx, cx(i), cyOf(i), r, sampleRamp(colors.emerald, t), colors.glowAlpha * boost);
    }

    // Incoming monomer CH₂=CHCH₃ approaching the growing (right) end: its
    // C=C double bond glows, cooling from reactive gold toward backbone
    // emerald as it opens and clicks into place.
    if (units < MAX_UNITS) {
      const endI = drawnCarbons - 1;
      const ex = cx(endI);
      const ey = cyOf(endI);
      const approach = 1 - grow;
      const mx = ex + dx * (1.8 + approach * 3);
      const my = ey - amp * 0.4;
      const alphaFactor = 0.55 + 0.45 * grow;
      const bondColor = mix(sampleRamp(colors.gold, 0.7), sampleRamp(colors.emerald, 0.8), grow);
      const bondGlow = 0.5 + 0.6 * grow;

      // C=C double bond (two glowing parallel lines).
      for (const off of [-2, 2]) {
        glowStroke(
          ctx,
          [
            { x: mx + off, y: my - 7 },
            { x: mx + off, y: my + 7 },
          ],
          bondColor,
          1.6,
          bondGlow,
          colors.dark,
        );
      }
      for (const dyc of [-7, 7]) {
        glowDot(ctx, mx, my + dyc, 4, bondColor, colors.glowAlpha * alphaFactor * (0.85 + 0.35 * grow));
      }
      // Its methyl stub.
      ctx.save();
      ctx.globalAlpha = alphaFactor;
      ctx.strokeStyle = rgb(colors.inkMuted, colors.dark ? 0.6 : 0.75);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(mx, my + 7);
      ctx.lineTo(mx + 9, my + 14);
      ctx.stroke();
      ctx.restore();
      glowDot(ctx, mx + 9, my + 14, 3.2, sampleRamp(colors.gold, 0.6), colors.glowAlpha * alphaFactor);
    }

    // "n" bracket label at the chain end.
    label(ctx, `( … )n = ${units}`, x0, h * 0.9, colors.inkMuted, {
      size: 13,
      weight: 500,
      alpha: 0.85,
    });
  };
  rafId = requestAnimationFrame(draw);

  return {
    setTacticity(next) {
      tacticity = next;
      reset();
    },
    reset,
    get units() {
      return units;
    },
    dispose() {
      cancelAnimationFrame(rafId);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
    },
  };
}
