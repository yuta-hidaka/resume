/**
 * Chirality and why a drug works — the three-point attachment model. A chiral
 * molecule has a carbon bearing four different groups; its mirror image
 * (enantiomer) cannot be superimposed on it by any in-plane rotation. A
 * receptor pocket is itself chiral, with complementary sub-sites. Only the
 * enantiomer whose groups all match docks and acts; the mirror image can
 * satisfy at most part of the contacts, so it binds differently or not at all.
 * This is why thalidomide's two mirror-image forms had such different effects.
 */

import { tokens, mix, rgb, glowDot, type RGB } from './viz';

export type Hand = 'R' | 'S';

interface Group {
  color: 'green' | 'gold' | 'gray' | 'h';
  /** angle from the chiral center, radians (screen: 0 = right, −π/2 = up) */
  angle: number;
}

// Receptor sub-sites (fixed pocket geometry) and the matching drug groups.
const SITES: { color: Group['color']; angle: number }[] = [
  { color: 'green', angle: -Math.PI / 2 }, // top
  { color: 'gold', angle: Math.PI / 6 }, // lower-right
  { color: 'gray', angle: (5 * Math.PI) / 6 }, // lower-left
];

/** The drug's three functional groups (+H) for a given handedness. The S form
 *  is the mirror image across the vertical axis: left/right groups swap, so
 *  they land on the wrong sockets. */
function groups(hand: Hand): Group[] {
  const base: Group[] = [
    { color: 'green', angle: -Math.PI / 2 },
    { color: 'gold', angle: Math.PI / 6 },
    { color: 'gray', angle: (5 * Math.PI) / 6 },
    { color: 'h', angle: Math.PI / 2 }, // H, points down (out of the pocket)
  ];
  if (hand === 'R') return base;
  return base.map((g) => ({ ...g, angle: Math.PI - g.angle })); // mirror across vertical
}

/** How many groups meet their correct socket (color match within tolerance). */
export function matchCount(hand: Hand): number {
  const gs = groups(hand);
  let matched = 0;
  for (const site of SITES) {
    const g = gs.find(
      (x) => x.color === site.color && Math.abs(normalize(x.angle - site.angle)) < 0.35,
    );
    if (g) matched++;
  }
  return matched;
}

function normalize(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

interface ThemeColors {
  green: RGB;
  gold: RGB;
  gray: RGB;
  h: RGB;
  bond: RGB;
  pocket: RGB;
  bad: RGB;
  ink: RGB;
  dark: boolean;
  glowAlpha: number;
}

/** Palette sourced from the shared /lab visual system (viz.ts tokens), with a
 *  couple of local, theme-aware additions (neutral "gray" group, the H atom,
 *  and a warm mismatch color) that the shared tokens don't carry. */
function themeColors(): ThemeColors {
  const tk = tokens();
  return {
    green: tk.green,
    gold: tk.gold,
    gray: tk.dark ? [139, 144, 150] : [111, 118, 125],
    h: tk.dark ? [207, 210, 213] : [183, 188, 192],
    bond: tk.inkMuted,
    pocket: tk.inkMuted,
    bad: tk.dark ? [214, 132, 100] : [181, 80, 47],
    ink: tk.ink,
    dark: tk.dark,
    glowAlpha: tk.glowAlpha,
  };
}

export interface ChiralityScene {
  setHand(hand: Hand): void;
  /** true when the current enantiomer is the active (fully-matching) one */
  readonly binds: boolean;
  dispose(): void;
}

export function createChiralityScene(
  canvas: HTMLCanvasElement,
  onUpdate?: (hand: Hand, binds: boolean, matched: number) => void,
): ChiralityScene {
  const ctx = canvas.getContext('2d')!;
  let hand: Hand = 'R';
  let colors = themeColors();
  let dock = 0; // 0 = far left, 1 = seated in pocket
  let recoil = 0;

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

  const colorOf = (c: Group['color']): RGB =>
    c === 'green' ? colors.green : c === 'gold' ? colors.gold : c === 'gray' ? colors.gray : colors.h;

  // Contact glow state — a short "snap" burst the moment all three points
  // seat, settling into a slow breathing glow while docked. Purely visual;
  // does not feed back into matchCount/binds.
  let pulseClock = 0;
  let wasBound = false;

  let rafId = 0;
  let last = performance.now();
  const draw = (now: number) => {
    rafId = requestAnimationFrame(draw);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    const matched = matchCount(hand);
    const binds = matched === SITES.length;
    // Approach the pocket; if it doesn't bind, stop short and jitter (recoil).
    const target = binds ? 1 : 0.72;
    dock += (target - dock) * Math.min(1, dt * 2.2);
    recoil = binds ? 0 : (recoil + dt * 6) % (Math.PI * 2);

    if (binds !== wasBound) pulseClock = 0;
    pulseClock += dt;
    wasBound = binds;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const pocketX = w * 0.66;
    const cy = h * 0.5;
    const R = Math.min(w, h) * 0.19;
    const bond = R * 1.0;
    const a0 = Math.PI * 0.62;
    const a1 = Math.PI * 1.38;

    // Receptor pocket: an elegant glowing cradle with three complementary sockets.
    const cradleColor = mix(colors.pocket, colors.green, 0.18);
    // faint ambient depth glow seated inside the cradle
    glowDot(ctx, pocketX + R * 0.15, cy, R * 1.4, cradleColor, colors.glowAlpha * 0.16);
    ctx.save();
    if (colors.dark) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = rgb(cradleColor, colors.glowAlpha * 0.22);
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(pocketX, cy, R * 2.05, a0, a1, true);
      ctx.stroke();
      ctx.strokeStyle = rgb(cradleColor, colors.glowAlpha * 0.4);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pocketX, cy, R * 2.05, a0, a1, true);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = rgb(cradleColor, colors.dark ? 0.9 : 1);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(pocketX, cy, R * 2.05, a0, a1, true);
    ctx.stroke();
    ctx.restore();

    for (const site of SITES) {
      const sx = pocketX + Math.cos(site.angle) * bond;
      const sy = cy + Math.sin(site.angle) * bond;
      const c = colorOf(site.color);
      const seated = dock > 0.6 && binds;
      const socketGlow = colors.glowAlpha * (seated ? 0.75 : 0.34);
      glowDot(ctx, sx, sy, R * 0.4, c, socketGlow);
      ctx.save();
      ctx.strokeStyle = rgb(c, colors.dark ? 0.85 : 0.8);
      ctx.lineWidth = 1.3;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.arc(sx, sy, R * 0.5, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    // The drug molecule, gliding in from the left.
    const startX = w * 0.2;
    const jitter = binds ? 0 : Math.sin(recoil) * 3;
    const cx = startX + (pocketX - startX) * dock + jitter;
    const gs = groups(hand);

    // Bonds — crisp sticks with a whisper of glow in dark mode.
    ctx.save();
    ctx.strokeStyle = rgb(colors.bond, colors.dark ? 0.6 : 0.55);
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    if (colors.dark) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = rgb(colors.bond, colors.glowAlpha * 0.2);
      ctx.lineWidth = 4;
      for (const g of gs) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(g.angle) * bond, cy + Math.sin(g.angle) * bond);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = rgb(colors.bond, 0.85);
      ctx.lineWidth = 1.6;
    }
    for (const g of gs) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(g.angle) * bond, cy + Math.sin(g.angle) * bond);
      ctx.stroke();
    }
    ctx.restore();

    // Chiral center — crisp core, a hairline rim, no glow (it should read as
    // the one precise, unambiguous point among the soft glowing groups).
    ctx.save();
    ctx.fillStyle = rgb(colors.ink, 1);
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.34, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = rgb(mix(colors.ink, colors.green, 0.3), 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = colors.dark ? 'rgba(8,10,11,0.92)' : 'rgba(250,250,250,0.95)';
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('C', cx, cy);
    ctx.textBaseline = 'alphabetic';
    ctx.restore();

    // Functional groups — glowing soft spheres, crisp core inside the halo.
    for (const g of gs) {
      const gx = cx + Math.cos(g.angle) * bond;
      const gy = cy + Math.sin(g.angle) * bond;
      const r = g.color === 'h' ? R * 0.32 : R * 0.5;
      const c = colorOf(g.color);

      // Contact verdict once seated: matching socket → an emerald glow pulse,
      // else a gold/red mismatch glow with a clean X.
      if (dock > 0.6 && g.color !== 'h') {
        const site = SITES.find((s) => Math.abs(normalize(g.angle - s.angle)) < 0.35);
        const ok = site && site.color === g.color;
        if (ok) {
          const burst = Math.max(0, 1 - pulseClock / 0.55);
          const breathe = 0.72 + 0.28 * Math.sin(pulseClock * 2.6);
          glowDot(ctx, gx, gy, r * (0.95 + burst * 0.5), colors.green, colors.glowAlpha * breathe + burst * colors.glowAlpha * 0.7);
          ctx.save();
          ctx.strokeStyle = rgb(colors.green, 0.85 * (1 - burst * 0.5));
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(gx, gy, r + 4 + burst * 10, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.restore();
        } else {
          glowDot(ctx, gx, gy, r * 0.85, colors.bad, colors.glowAlpha * 0.55);
          ctx.save();
          ctx.strokeStyle = rgb(colors.bad, 0.95);
          ctx.lineWidth = 2.2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(gx, gy, r + 4, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(gx - r * 0.5, gy - r * 0.5);
          ctx.lineTo(gx + r * 0.5, gy + r * 0.5);
          ctx.moveTo(gx + r * 0.5, gy - r * 0.5);
          ctx.lineTo(gx - r * 0.5, gy + r * 0.5);
          ctx.stroke();
          ctx.restore();
        }
      }

      const intensity = g.color === 'h' ? colors.glowAlpha * 0.45 : colors.glowAlpha;
      glowDot(ctx, gx, gy, r, c, intensity);
      ctx.save();
      ctx.fillStyle = rgb(c, g.color === 'h' ? 0.55 : 0.92);
      ctx.beginPath();
      ctx.arc(gx, gy, r * 0.55, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }

    onUpdate?.(hand, binds, matched);
  };
  rafId = requestAnimationFrame(draw);

  return {
    setHand(next) {
      if (next === hand) return;
      hand = next;
      dock = 0; // re-run the docking attempt
    },
    get binds() {
      return matchCount(hand) === SITES.length;
    },
    dispose() {
      cancelAnimationFrame(rafId);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
    },
  };
}
