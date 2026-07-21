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

/** Localized on-canvas labels (falls back to English/neutral defaults). */
export interface PolymerLabels {
  /** Name of the incoming monomer, drawn beneath it as it approaches. */
  monomer: string;
  /** Formula for the pendant side group, drawn by the first methyl. */
  methyl: string;
}

export function createPolymerScene(
  canvas: HTMLCanvasElement,
  onUpdate?: (units: number, tacticity: Tacticity) => void,
  labels: PolymerLabels = { monomer: 'propylene', methyl: 'CH₃' },
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
    const totalCarbons = MAX_UNITS * 2 + 1;
    const dx = (w * 0.82) / totalCarbons;
    // Cap the zig-zag amplitude by the horizontal pitch so the bond angle
    // stays plausible on narrow phones — otherwise the chain degenerates into
    // near-vertical needle spikes when dx shrinks. dx*1.15 keeps a roughly
    // tetrahedral-looking ~109° zig-zag.
    const amp = Math.min(24, h * 0.09, dx * 1.15);
    // Shrink glow radii along with the pitch so halos don't smear across
    // adjacent carbons at small dx.
    const rScale = Math.min(1, Math.max(0.62, dx / 16));
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
      glowDot(ctx, bx, my, 3.6 * rScale, sampleRamp(colors.gold, t), colors.glowAlpha);
    }

    // Backbone carbons — soft emerald glow; the open (growing) end pulses
    // gently while its bond is forming.
    for (let i = 0; i < drawnCarbons; i++) {
      const t = depthT(i / (totalCarbons - 1));
      const isTip = i === drawnCarbons - 1 && units < MAX_UNITS;
      const r = (i % 2 === 1 ? 3.6 : 3) * rScale;
      const boost = isTip ? 1 + 0.5 * grow : 1;
      glowDot(ctx, cx(i), cyOf(i), r, sampleRamp(colors.emerald, t), colors.glowAlpha * boost);
    }

    // Incoming propylene monomer CH₂=CH(CH₃) docking onto the growing end.
    // For most of the cycle it glides in from the right with an intact C=C
    // double bond (gold, reactive). In the final stretch it "docks": the two
    // sp² carbons slide onto the next two zig-zag vertices, the double bond
    // opens (its second π line fades away) into a single backbone σ bond, and
    // the colour cools from gold toward emerald — so the click into place is
    // drawn, and at the wrap the monomer *is* the two new backbone carbons.
    if (units < MAX_UNITS) {
      const endI = drawnCarbons - 1; // current open chain end
      const ox = cx(endI);
      const oy = cyOf(endI);

      // Landing vertices: the substituted (methyl-bearing) carbon lands on the
      // next odd index; the CH₂ carbon becomes the new open end.
      const t1x = cx(endI + 1);
      const t1y = cyOf(endI + 1);
      const t2x = cx(endI + 2);
      const t2y = cyOf(endI + 2);

      // Glide during the first ~65%, then dock (smoothstepped) in the tail.
      const DOCK_START = 0.65;
      const glide = Math.min(grow / DOCK_START, 1);
      const dockRaw = Math.max(0, (grow - DOCK_START) / (1 - DOCK_START));
      const dock = dockRaw * dockRaw * (3 - 2 * dockRaw);

      // Monomer centre glides from far right to a staging point above the
      // landing zone; its two C=C carbons sit above/below it (vertical bond).
      const halfBond = 7;
      const ccx = (t2x + dx * 4.2) + ((t2x + dx * 1.3) - (t2x + dx * 4.2)) * glide;
      const ccy = (midY - amp * 1.3) + ((midY - amp * 0.6) - (midY - amp * 1.3)) * glide;
      const a1x = ccx;
      const a1y = ccy - halfBond;
      const a2x = ccx;
      const a2y = ccy + halfBond;

      // Dock: interpolate each carbon from its approach point onto its vertex.
      const c1x = a1x + (t1x - a1x) * dock;
      const c1y = a1y + (t1y - a1y) * dock;
      const c2x = a2x + (t2x - a2x) * dock;
      const c2y = a2y + (t2y - a2y) * dock;

      const bondColor = mix(sampleRamp(colors.gold, 0.7), sampleRamp(colors.emerald, 0.8), grow);
      const bondGlow = 0.5 + 0.6 * grow;
      const alphaFactor = 0.55 + 0.45 * grow;

      // Forming σ bond from the chain's open end to the docking carbon: it
      // brightens as the monomer clicks in and coincides with the finished
      // backbone segment at dock = 1 (so nothing pops when the unit completes).
      if (dock > 0) {
        glowStroke(
          ctx,
          [
            { x: ox, y: oy },
            { x: c1x, y: c1y },
          ],
          sampleRamp(colors.emerald, 0.72),
          2.2,
          dock,
          colors.dark,
        );
      }

      // C=C: the surviving σ line c1→c2, plus a parallel π line that fades out
      // as the double bond opens.
      glowStroke(
        ctx,
        [
          { x: c1x, y: c1y },
          { x: c2x, y: c2y },
        ],
        bondColor,
        1.8,
        bondGlow,
        colors.dark,
      );
      const piAlpha = 1 - dock;
      if (piAlpha > 0.02) {
        const bvx = c2x - c1x;
        const bvy = c2y - c1y;
        const blen = Math.hypot(bvx, bvy) || 1;
        const perpX = (-bvy / blen) * 2.4;
        const perpY = (bvx / blen) * 2.4;
        ctx.save();
        ctx.globalAlpha = piAlpha;
        glowStroke(
          ctx,
          [
            { x: c1x + perpX, y: c1y + perpY },
            { x: c2x + perpX, y: c2y + perpY },
          ],
          bondColor,
          1.4,
          bondGlow,
          colors.dark,
        );
        ctx.restore();
      }

      // The two carbons — alpha and radius resolve to the backbone dots at
      // dock = 1 so the completed unit inherits them seamlessly.
      const dotAlpha = colors.glowAlpha * (alphaFactor + (1 - alphaFactor) * dock);
      glowDot(ctx, c1x, c1y, 3.6 * rScale * (0.9 + 0.1 * dock), bondColor, dotAlpha);
      glowDot(ctx, c2x, c2y, 3 * rScale * (0.9 + 0.1 * dock), bondColor, dotAlpha);

      // Methyl stub — swings onto its final tacticity side as it docks so it
      // doesn't jump when the unit locks in.
      const mSide = methylSide(tacticity, units, seed);
      const mAppX = a1x + 9;
      const mAppY = a1y - 8;
      const mEndX = mAppX + (t1x - mAppX) * dock;
      const mEndY = mAppY + (t1y + mSide * amp * 1.4 - mAppY) * dock;
      ctx.save();
      ctx.globalAlpha = alphaFactor;
      ctx.strokeStyle = rgb(colors.inkMuted, colors.dark ? 0.6 : 0.75);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(c1x, c1y);
      ctx.lineTo(mEndX, mEndY);
      ctx.stroke();
      ctx.restore();
      const mT = depthT((endI + 1) / (totalCarbons - 1));
      glowDot(
        ctx,
        mEndX,
        mEndY,
        (3.2 + 0.4 * dock) * rScale,
        mix(sampleRamp(colors.gold, 0.6), sampleRamp(colors.gold, mT), dock),
        dotAlpha,
      );

      // Name the monomer while it is still a recognizable separate molecule.
      const monoAlpha = 0.75 * glide * (1 - dock);
      if (monoAlpha > 0.03) {
        label(ctx, labels.monomer, ccx, Math.max(c1y, c2y) + 16, colors.inkMuted, {
          size: 11,
          align: 'center',
          alpha: monoAlpha,
        });
      }
    }

    // –[ … ]ₙ– bracket framing the completed repeat units, with a subscript n
    // — teaches the notation from the formula block and grows as units add.
    if (units >= 1) {
      const yTop = midY - amp * 1.95;
      const yBot = midY + amp * 1.95;
      const xL = x0 + dx * 0.5;
      const xR = x0 + (units * 2 + 0.5) * dx;
      const tick = Math.max(5, dx * 0.32);
      ctx.save();
      ctx.strokeStyle = rgb(colors.inkMuted, colors.dark ? 0.45 : 0.55);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(xL + tick, yTop);
      ctx.lineTo(xL, yTop);
      ctx.lineTo(xL, yBot);
      ctx.lineTo(xL + tick, yBot);
      ctx.moveTo(xR - tick, yTop);
      ctx.lineTo(xR, yTop);
      ctx.lineTo(xR, yBot);
      ctx.lineTo(xR - tick, yBot);
      ctx.stroke();
      ctx.restore();
      label(ctx, 'n', xR + 5, yBot - 1, colors.inkMuted, { size: 13, weight: 600, alpha: 0.85 });

      // Name the pendant group on the first methyl so the gold dots aren't
      // anonymous.
      const s0 = methylSide(tacticity, 0, seed);
      const m0x = cx(1);
      const m0y = cyOf(1) + s0 * amp * 1.4;
      label(ctx, labels.methyl, m0x + 7 * rScale, m0y + (s0 > 0 ? -6 : 13), sampleRamp(colors.gold, 0.85), {
        size: 11,
        weight: 500,
        alpha: 0.85,
      });
    }
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
