/**
 * Living thumbnails for the lab index — each tile is a small, animated preview
 * of its piece, drawn through the shared viz toolkit so the whole grid reads as
 * one luminous gallery wall. A single shared rAF loop drives only the tiles that
 * are on-screen (IntersectionObserver) and pauses when the tab is hidden;
 * prefers-reduced-motion falls back to a single still frame. These are
 * lightweight time-parameterized caricatures, NOT the full simulations (which
 * stay on each piece's own page).
 */
import { tokens, ramp, sampleRamp, rgb, type RGB } from './viz';

interface P {
  T: number; // elapsed seconds
  green: RGB;
  gold: RGB;
  mid: RGB;
  faint: RGB;
  dark: boolean;
  state: Record<string, unknown>;
  /** Logical rect covering the WHOLE cell. When the tile is not LW:LH the art is
   *  letterboxed inside it, so a drawer that paints an opaque full-area fill has
   *  to use this instead of (0, 0, LW, LH) — otherwise the letterbox shows up as
   *  a hard-edged block. Line art on transparent can ignore it. */
  bleed: { x: number; y: number; w: number; h: number };
}

const LW = 116; // logical drawing width
const LH = 88; // logical drawing height

/** Deterministic pseudo-random stream. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** Additive-friendly glowing dot (cheap: overlapping circles bloom in 'lighter'). */
function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: RGB, a: number, dark: boolean) {
  ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
  ctx.globalAlpha = a * (dark ? 0.5 : 0.9);
  ctx.fillStyle = rgb(c, 1);
  ctx.beginPath();
  ctx.arc(x, y, r * 2.4, 0, 2 * Math.PI);
  ctx.fill();
  ctx.globalAlpha = a;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

function glowLine(ctx: CanvasRenderingContext2D, pts: [number, number][], c: RGB, w: number, dark: boolean) {
  if (pts.length < 2) return;
  const path = () => {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  };
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (dark) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgb(c, 0.3);
    ctx.lineWidth = w * 3;
    path();
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = rgb(c, 1);
  ctx.lineWidth = w;
  path();
  ctx.stroke();
}

type Drawer = (ctx: CanvasRenderingContext2D, p: P) => void;

const DRAWERS: Record<string, Drawer> = {
  hydrogen(ctx, p) {
    // Two counter-rotating lobes of |ψ|² points, twinkling.
    const rand = rng(7);
    const rot = p.T * 0.35;
    for (let i = 0; i < 240; i++) {
      const up = i % 2 === 0;
      const tt = rand();
      const a = rand() * 2 * Math.PI + (up ? rot : -rot);
      const r = Math.sqrt(tt) * 15;
      const x = LW / 2 + Math.cos(a) * r * 0.82;
      const y = LH / 2 + (up ? -13 : 13) + Math.sin(a) * r * 0.6;
      const tw = 0.55 + 0.45 * Math.sin(p.T * 3 + i);
      dot(ctx, x, y, 1.1, up ? p.green : p.gold, (0.7 - tt * 0.4) * tw, p.dark);
    }
    dot(ctx, LW / 2, LH / 2, 1.6, p.gold, 0.9, p.dark); // nucleus
  },

  fourier(ctx, p) {
    // Measure → transform: a scrolling measured waveform up top, its spectrum
    // as a row of glowing bars below.
    const ph = p.T * 2.2;
    const cy = LH * 0.28;
    const wav: [number, number][] = [];
    for (let i = 0; i <= 64; i++) {
      const u = i / 64;
      const x = 8 + u * (LW - 16);
      const s = Math.sin(u * Math.PI * 6 - ph) + 0.45 * Math.sin(u * Math.PI * 16 - ph * 1.7);
      wav.push([x, cy + s * 9]);
    }
    glowLine(ctx, wav, p.green, 1.5, p.dark);
    // spectrum bars: two dominant peaks + smaller components, gently pulsing.
    const bars = [0.22, 0.95, 0.18, 0.5, 0.14, 0.28, 0.12, 0.1];
    const baseY = LH - 9;
    const slotW = (LW - 20) / bars.length;
    ctx.lineCap = 'round';
    bars.forEach((m, i) => {
      const x = 12 + i * slotW + slotW * 0.5;
      const pulse = 0.88 + 0.12 * Math.sin(p.T * 2.4 + i * 1.3);
      const hgt = Math.max(2, m * pulse * (LH * 0.34));
      ctx.globalCompositeOperation = p.dark ? 'lighter' : 'source-over';
      ctx.strokeStyle = rgb(p.gold, p.dark ? 0.85 : 1);
      ctx.lineWidth = Math.min(6, slotW * 0.5);
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x, baseY - hgt);
      ctx.stroke();
    });
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  },

  entropy(ctx, p) {
    // Two gases oscillating and mixing across the box.
    const rand = rng(11);
    const mixT = 0.5 - 0.5 * Math.cos(Math.min(Math.PI, p.T * 0.5)); // ease 0→1
    for (let i = 0; i < 120; i++) {
      const green = i % 2 === 0;
      const phase = rand() * Math.PI * 2;
      const home = green ? 0.26 : 0.74;
      const spread = 0.22 + 0.24 * mixT;
      const x = (home + Math.sin(p.T * 1.3 + phase) * spread * (0.5 + rand() * 0.5)) * LW;
      const y = (0.12 + rand() * 0.76) * LH + Math.sin(p.T + phase) * 2;
      dot(ctx, x, y, 1.1, green ? p.green : p.gold, 0.7, p.dark);
    }
    // rising S(t) sweep
    const pts: [number, number][] = [];
    for (let i = 0; i <= 40; i++) {
      const tt = i / 40;
      pts.push([6 + tt * (LW - 12), LH - 5 - (1 - Math.exp(-3.2 * tt)) * 11]);
    }
    glowLine(ctx, pts, p.green, 1.3, p.dark);
  },

  ising(ctx, p) {
    // A slowly churning domain field: persistent coarse lattice, a few
    // majority-biased flips per frame, upscaled softly.
    const gx = 22;
    const gy = 16;
    let f = p.state.field as Int8Array | undefined;
    if (!f) {
      const r = rng(23);
      f = new Int8Array(gx * gy);
      for (let i = 0; i < f.length; i++) f[i] = r() < 0.5 ? 1 : -1;
      // pre-coarsen into domains
      for (let pass = 0; pass < 3; pass++) f = coarsen(f, gx, gy);
      p.state.field = f;
      p.state.r = rng(101);
    }
    const rr = p.state.r as () => number;
    for (let k = 0; k < 10; k++) {
      const x = Math.floor(rr() * gx);
      const y = Math.floor(rr() * gy);
      const i = x + y * gx;
      let s = 0;
      if (x > 0) s += f[i - 1];
      if (x < gx - 1) s += f[i + 1];
      if (y > 0) s += f[i - gx];
      if (y < gy - 1) s += f[i + gx];
      if (rr() < 0.85) f[i] = s >= 0 ? 1 : -1;
      else f[i] = -f[i];
    }
    const off = (p.state.off as HTMLCanvasElement) || makeOff(gx, gy);
    p.state.off = off;
    const octx = off.getContext('2d')!;
    const img = octx.createImageData(gx, gy);
    for (let i = 0; i < f.length; i++) {
      const c = f[i] > 0 ? p.green : p.gold;
      const o = i * 4;
      img.data[o] = c[0];
      img.data[o + 1] = c[1];
      img.data[o + 2] = c[2];
      // Kept well below opaque: this is the only drawer that fills the cell, and
      // at full strength it shouts over the glowing line art in every other tile.
      img.data[o + 3] = p.dark ? 120 : 165;
    }
    octx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(off, p.bleed.x, p.bleed.y, p.bleed.w, p.bleed.h); // opaque fill: cover the cell
  },

  polarizer(ctx, p) {
    const beamY = LH / 2;
    const pulse = 0.6 + 0.4 * Math.sin(p.T * 2);
    // beam, dimming through the two filters
    const seg = (x0: number, x1: number, inten: number) => {
      glowLine(ctx, [[x0, beamY], [x1, beamY]], p.gold, 1 + 4 * inten, p.dark);
    };
    seg(6, LW * 0.28, 1);
    seg(LW * 0.28, LW * 0.72, 0.5 * pulse);
    seg(LW * 0.72, LW - 6, 0.14 * pulse);
    [0.28, 0.72].forEach((fx, idx) => {
      const x = LW * fx;
      ctx.strokeStyle = rgb(p.mid, 0.9);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, beamY, 15, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.save();
      ctx.translate(x, beamY);
      ctx.rotate(idx === 0 ? 0 : Math.PI / 4);
      ctx.strokeStyle = rgb(p.faint, 0.55);
      for (let o = -12; o <= 12; o += 5) {
        const half = Math.sqrt(Math.max(0, 225 - o * o)) - 1;
        ctx.beginPath();
        ctx.moveTo(o, -half);
        ctx.lineTo(o, half);
        ctx.stroke();
      }
      ctx.restore();
    });
    dot(ctx, 6, beamY, 1.6, p.gold, 1, p.dark);
  },

  molecules(ctx, p) {
    const rand = rng(5);
    for (let i = 0; i < 7; i++) {
      const bx = LW * 0.22 + rand() * LW * 0.56;
      const by = LH * 0.3 + rand() * LH * 0.5;
      const ph = rand() * Math.PI * 2;
      const jitter = 3;
      const x = bx + Math.sin(p.T * 2.4 + ph) * jitter;
      const y = by + Math.cos(p.T * 2.1 + ph) * jitter;
      const a = p.T * 0.8 + ph;
      for (const side of [-1, 1]) {
        const hx = x + Math.sin(a + side * 0.91) * 7;
        const hy = y - Math.cos(a + side * 0.91) * 7;
        ctx.strokeStyle = rgb(p.faint, 0.42);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        dot(ctx, hx, hy, 1.5, p.gold, 0.85, p.dark);
      }
      dot(ctx, x, y, 2.4, p.green, 0.9, p.dark);
    }
  },

  millikan(ctx, p) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = rgb(p.mid, 0.9);
    ctx.fillRect(10, 12, LW - 20, 2.5);
    ctx.fillRect(10, LH - 15, LW - 20, 2.5);
    // pulsing field lines
    const fp = 0.16 + 0.14 * (0.5 + 0.5 * Math.sin(p.T * 2));
    ctx.strokeStyle = rgb(p.faint, fp);
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const x = 10 + ((LW - 20) * i) / 5;
      ctx.beginPath();
      ctx.moveTo(x, 19);
      ctx.lineTo(x, LH - 20);
      ctx.stroke();
    }
    // bobbing balanced droplet
    const y = LH / 2 + Math.sin(p.T * 1.6) * 8;
    dot(ctx, LW / 2, y, 3, p.green, 1, p.dark);
  },

  tunnel(ctx, p) {
    const base = LH - 12;
    // translucent barrier
    ctx.globalAlpha = 1;
    ctx.fillStyle = rgb(p.gold, p.dark ? 0.28 : 0.2);
    ctx.fillRect(LW * 0.52, base - 34, 10, 34);
    ctx.strokeStyle = rgb(p.gold, 0.8);
    ctx.lineWidth = 1;
    ctx.strokeRect(LW * 0.52, base - 34, 10, 34);
    // packet sweeping in, splitting into big reflected + small transmitted
    const cyc = (p.T * 0.5) % 1;
    const mainX = LW * (0.28 + cyc * 0.22);
    const reflX = LW * (0.5 - Math.max(0, cyc - 0.5) * 0.4);
    const packet = (cx: number, amp: number) => {
      const pts: [number, number][] = [];
      for (let i = 0; i <= 60; i++) {
        const x = (i / 60) * LW;
        const y = base - Math.exp(-(((x - cx) / 10) ** 2)) * amp;
        pts.push([x, y]);
      }
      return pts;
    };
    glowLine(ctx, packet(cyc < 0.5 ? mainX : reflX, 30), p.green, 1.5, p.dark);
    // small transmitted bump past the barrier once it "hits"
    const tAmt = Math.max(0, cyc - 0.45) * 14;
    if (tAmt > 0.5) glowLine(ctx, packet(LW * 0.78, tAmt), p.green, 1.3, p.dark);
    ctx.strokeStyle = rgb(p.faint, 0.28);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, base);
    ctx.lineTo(LW, base);
    ctx.stroke();
  },

  kinetics(ctx, p) {
    const V = (x: number) =>
      0.42 * Math.exp(-((x + 0.32) ** 2) / 0.016) +
      0.75 * Math.exp(-((x - 0.32) ** 2) / 0.016) -
      0.36 * Math.exp(-((x + 0.72) ** 2) / 0.039) -
      0.85 * Math.exp(-((x - 0.72) ** 2) / 0.039) +
      0.9 * x ** 10;
    const sx = (x: number) => ((x + 1.1) / 2.2) * LW;
    const sy = (v: number) => 10 + ((0.85 - v) / 1.8) * (LH - 20);
    const curve: [number, number][] = [];
    for (let i = 0; i <= 80; i++) {
      const x = -1.1 + (2.2 * i) / 80;
      curve.push([sx(x), sy(V(x))]);
    }
    glowLine(ctx, curve, p.mid, 1.3, p.dark);
    // beads jiggling in the two wells
    const rand = rng(3);
    const bead = (wellX: number, c: RGB, n: number, amp: number) => {
      for (let i = 0; i < n; i++) {
        const ph = rand() * Math.PI * 2;
        const x = wellX + Math.sin(p.T * 2 + ph) * amp;
        dot(ctx, sx(x), sy(V(x)) - 3, 1.6, c, 0.85, p.dark);
      }
    };
    bead(-0.72, p.gold, 9, 0.05);
    bead(0.72, p.green, 5, 0.045);
  },

  well(ctx, p) {
    const bx0 = LW * 0.2;
    const bx1 = LW * 0.8;
    const top = 10;
    const bottom = LH - 12;
    ctx.strokeStyle = rgb(p.mid, 1);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(bx0, top);
    ctx.lineTo(bx0, bottom);
    ctx.lineTo(bx1, bottom);
    ctx.lineTo(bx1, top);
    ctx.stroke();
    ctx.strokeStyle = rgb(p.faint, 0.3);
    ctx.lineWidth = 0.8;
    for (let n = 1; n <= 3; n++) {
      const y = bottom - ((n * n) / 10) * (bottom - top);
      ctx.beginPath();
      ctx.moveTo(bx0, y);
      ctx.lineTo(bx1, y);
      ctx.stroke();
    }
    // breathing n=2 standing wave on its level
    const y0 = bottom - (4 / 10) * (bottom - top);
    const breathe = Math.cos(p.T * 2.2);
    const pts: [number, number][] = [];
    for (let i = 0; i <= 60; i++) {
      const x = i / 60;
      pts.push([bx0 + x * (bx1 - bx0), y0 - Math.sin(2 * Math.PI * x) * 14 * breathe]);
    }
    glowLine(ctx, pts, p.green, 1.5, p.dark);
  },

  chirality(ctx, p) {
    const cy = LH / 2;
    const wob = Math.sin(p.T * 1.4) * 0.18;
    const drawMol = (cx: number, mirror: number) => {
      const groups: [number, RGB][] = [
        [-Math.PI / 2, p.green],
        [Math.PI / 6, p.gold],
        [(5 * Math.PI) / 6, p.mid],
      ];
      for (const [ga, gc] of groups) {
        const a = (mirror === 1 ? ga : Math.PI - ga) + wob * mirror;
        const gx = cx + Math.cos(a) * 17;
        const gy = cy + Math.sin(a) * 17;
        ctx.strokeStyle = rgb(p.faint, 0.42);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(gx, gy);
        ctx.stroke();
        dot(ctx, gx, gy, 2, gc, 0.9, p.dark);
      }
      dot(ctx, cx, cy, 1.6, p.mid, 0.85, p.dark);
    };
    drawMol(LW * 0.3, 1);
    drawMol(LW * 0.7, -1);
    ctx.strokeStyle = rgb(p.faint, 0.32);
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(LW / 2, 8);
    ctx.lineTo(LW / 2, LH - 8);
    ctx.stroke();
    ctx.setLineDash([]);
  },

  polymer(ctx, p) {
    // Chain growing to full length, then looping.
    const midY = LH * 0.55;
    const amp = 10;
    const nMax = 9;
    const grown = Math.floor((p.T * 2.2) % (nMax + 3));
    const n = Math.min(nMax, grown);
    const dx = (LW - 20) / nMax;
    const cx = (i: number) => 10 + i * dx;
    const cyOf = (i: number) => midY + (i % 2 === 0 ? -amp : amp);
    const pts: [number, number][] = [];
    for (let i = 0; i <= n; i++) pts.push([cx(i), cyOf(i)]);
    glowLine(ctx, pts, p.green, 1.6, p.dark);
    for (let i = 1; i <= n; i += 2) {
      ctx.strokeStyle = rgb(p.faint, 0.42);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx(i), cyOf(i));
      ctx.lineTo(cx(i), cyOf(i) + amp * 1.5);
      ctx.stroke();
      dot(ctx, cx(i), cyOf(i) + amp * 1.5, 1.6, p.gold, 0.85, p.dark);
    }
    for (let i = 0; i <= n; i++) dot(ctx, cx(i), cyOf(i), 1.3, p.green, 0.9, p.dark);
    // incoming monomer
    if (n < nMax) {
      const mx = cx(n) + dx * 1.6;
      const my = cyOf(n) - 4;
      dot(ctx, mx, my - 6, 1.4, p.gold, 0.8, p.dark);
      dot(ctx, mx, my + 6, 1.4, p.gold, 0.8, p.dark);
    }
  },

  fusion(ctx, p) {
    // Two nuclei (D gold, T emerald) converge, flash, and eject ⁴He + a neutron.
    const cx = LW / 2;
    const cy = LH / 2;
    const ph = (p.T % 3.2) / 3.2;
    if (ph <= 0.55) {
      const sep = (1 - ph / 0.55) * 28 + 9;
      dot(ctx, cx - sep, cy, 2.6, p.gold, 0.95, p.dark);
      dot(ctx, cx + sep, cy, 2.6, p.green, 0.95, p.dark);
    } else if (ph < 0.72) {
      const f = (ph - 0.55) / 0.17;
      dot(ctx, cx, cy, 3 + f * 6, p.green, 1, p.dark);
      ctx.globalCompositeOperation = p.dark ? 'lighter' : 'source-over';
      ctx.strokeStyle = rgb(p.gold, (1 - f) * 0.8);
      ctx.lineWidth = 1;
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * (6 + f * 6), cy + Math.sin(a) * (6 + f * 6));
        ctx.lineTo(cx + Math.cos(a) * (10 + f * 22), cy + Math.sin(a) * (10 + f * 22));
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    } else {
      const f = (ph - 0.72) / 0.28;
      dot(ctx, cx - f * 32, cy - 4, 2.6, p.green, 0.9 * (1 - f * 0.5), p.dark); // ⁴He
      dot(ctx, cx + f * 48, cy + 4, 1.6, p.gold, 0.9 * (1 - f * 0.5), p.dark); // neutron (faster)
    }
  },

  fission(ctx, p) {
    // A neutron triggers a splitting cascade through a small cluster of nuclei.
    const ph = (p.T % 2.8) / 2.8;
    const nuclei: [number, number][] = [
      [LW * 0.5, LH * 0.5],
      [LW * 0.72, LH * 0.36],
      [LW * 0.66, LH * 0.68],
      [LW * 0.3, LH * 0.62],
    ];
    const splitAt = [0.26, 0.5, 0.58, 0.7];
    nuclei.forEach((nu, i) => {
      if (ph < splitAt[i]) {
        dot(ctx, nu[0], nu[1], 2.6, p.green, 0.9, p.dark);
      } else {
        const f = Math.min(1, (ph - splitAt[i]) / 0.2);
        dot(ctx, nu[0], nu[1], 3 + (1 - f) * 4, p.gold, (1 - f) * 0.9, p.dark); // flash
        dot(ctx, nu[0] - f * 11, nu[1] - f * 7, 1.8, p.green, 0.85 * (1 - f * 0.4), p.dark);
        dot(ctx, nu[0] + f * 11, nu[1] + f * 7, 1.8, p.green, 0.85 * (1 - f * 0.4), p.dark);
        // emitted neutrons
        dot(ctx, nu[0] + f * 20, nu[1] - f * 3, 1.1, p.gold, (1 - f) * 0.8, p.dark);
      }
    });
    // the initial neutron flying in
    if (ph < 0.26) {
      const t = ph / 0.26;
      dot(ctx, LW * 0.08 + t * (LW * 0.42), LH * 0.5, 1.3, p.gold, 0.9, p.dark);
    }
  },

  doubleslit(ctx, p) {
    // Wavefronts from two slits + dots accreting into fringes on the screen.
    const barrierX = LW * 0.34;
    const cy = LH / 2;
    const screenX = LW * 0.92;
    const slitGap = 10;
    const slitY = [cy - slitGap / 2, cy + slitGap / 2];
    for (let s = 0; s < 2; s++) {
      for (let k = 0; k < 3; k++) {
        const r = (p.T * 22 + k * 13) % 40;
        ctx.globalAlpha = Math.max(0, 1 - r / 40) * 0.45;
        ctx.strokeStyle = rgb(p.green, 1);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(barrierX, slitY[s], r, -0.9, 0.9);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = rgb(p.mid, 0.9);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(barrierX, 4);
    ctx.lineTo(barrierX, slitY[0] - 2);
    ctx.moveTo(barrierX, slitY[0] + 2);
    ctx.lineTo(barrierX, slitY[1] - 2);
    ctx.moveTo(barrierX, slitY[1] + 2);
    ctx.lineTo(barrierX, LH - 4);
    ctx.stroke();
    ctx.strokeStyle = rgb(p.faint, 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(screenX, 6);
    ctx.lineTo(screenX, LH - 6);
    ctx.stroke();
    const fringe = 9;
    const rand = rng(31);
    for (let b = -2; b <= 2; b++) {
      const yb = cy + b * fringe;
      const bright = Math.exp(-(b * b) / 4);
      const nd = Math.round(6 * bright + 1);
      for (let i = 0; i < nd; i++) {
        dot(ctx, screenX + 2 + rand() * 3, yb + (rand() - 0.5) * 4, 1, p.green, 0.8 * bright + 0.12, p.dark);
      }
    }
    const ph = (p.T * 0.5) % 1;
    const s = Math.floor(p.T) % 2;
    const sy = slitY[s];
    let px: number;
    let py: number;
    if (ph < 0.5) {
      const u = ph / 0.5;
      px = LW * 0.08 + (barrierX - LW * 0.08) * u;
      py = cy + (sy - cy) * u;
    } else {
      const u = (ph - 0.5) / 0.5;
      px = barrierX + (screenX - barrierX) * u;
      py = sy + (cy - sy) * u;
    }
    dot(ctx, px, py, 1.5, p.gold, 0.9, p.dark);
    dot(ctx, LW * 0.08, cy, 1.6, p.green, 0.85, p.dark);
  },

  diffraction(ctx, p) {
    // Left: a rotating real-space lattice. Right: its reciprocal spot grid,
    // spinning in lock-step (the Fourier transform commutes with rotation).
    const th = p.T * 0.22;
    const cos = Math.cos(th);
    const sin = Math.sin(th);
    const rot = (cx: number, cy: number, x: number, y: number): [number, number] => [
      cx + x * cos - y * sin,
      cy + x * sin + y * cos,
    ];
    const lcx = LW * 0.28;
    const rcx = LW * 0.74;
    const cy = LH / 2;
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        const [rx, ry] = rot(lcx, cy, i * 11, j * 11);
        if (rx > 3 && rx < LW * 0.5) dot(ctx, rx, ry, 1.2, p.green, 0.75, p.dark);
        const [sx, sy] = rot(rcx, cy, i * 14, j * 14);
        if (sx > LW * 0.52 && sx < LW - 3) {
          const b = Math.exp(-(i * i + j * j) / 3.2);
          dot(ctx, sx, sy, 1 + b, p.gold, 0.32 + 0.6 * b, p.dark);
        }
      }
    }
  },

  tduality(ctx, p) {
    // M² curves against log R: momentum falls, winding rises, and the picture is
    // mirror-symmetric about the self-dual radius in the middle.
    const X = (lr: number) => LW / 2 + (lr / 0.62) * (LW / 2 - 8);
    const Y = (m2: number) => LH - 14 - (m2 / 17) * (LH - 26);
    const line = (f: (r: number) => number, c: RGB) => {
      const pts: [number, number][] = [];
      for (let i = 0; i <= 40; i++) {
        const lr = -0.6 + (1.2 * i) / 40;
        pts.push([X(lr), Y(Math.min(17, f(Math.pow(10, lr))))]);
      }
      glowLine(ctx, pts, c, 1.3, p.dark);
    };
    line((r) => 1 / (r * r), p.green); // momentum
    line((r) => r * r, p.gold); // winding
    line((r) => 1 / (r * r) + r * r - 2, p.mid); // massless at R = 1

    // the mirror line
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = rgb(p.gold, 0.5);
    ctx.lineWidth = 0.7;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(X(0), 6);
    ctx.lineTo(X(0), LH - 8);
    ctx.stroke();
    ctx.setLineDash([]);

    // a marker sliding back and forth, mirrored about the self-dual point
    const lr = 0.5 * Math.sin(p.T * 0.7);
    dot(ctx, X(lr), Y(Math.min(17, 1 / Math.pow(10, 2 * lr))), 1.3, p.green, 0.95, p.dark);
    dot(ctx, X(-lr), Y(Math.min(17, Math.pow(10, -2 * lr))), 1.3, p.gold, 0.95, p.dark);
  },

  friedmann(ctx, p) {
    // a(t) sweeping up from the Big Bang, with a marker riding the curve and a
    // comoving grid stretching underneath.
    const OM = 0.315;
    const OL = 0.685;
    // a(t) for flat ΛCDM has a closed form: a = (Ω_m/Ω_Λ)^{1/3} sinh^{2/3}(3√Ω_Λ t/2)
    const k = Math.cbrt(OM / OL);
    const aOf = (tH: number) => k * Math.pow(Math.sinh((3 * Math.sqrt(OL) * tH) / 2), 2 / 3);
    const tEnd = 2.4; // Hubble times
    const aEnd = aOf(tEnd);
    const X = (tH: number) => 8 + (tH / tEnd) * (LW - 16);
    const Y = (a: number) => LH * 0.52 - (a / (aEnd * 1.05)) * (LH * 0.52 - 8);

    const curve: [number, number][] = [];
    for (let i = 0; i <= 60; i++) {
      const tH = (i / 60) * tEnd;
      curve.push([X(tH), Y(aOf(tH))]);
    }
    glowLine(ctx, curve, p.green, 1.5, p.dark);

    // the playhead
    const ph = (p.T * 0.2) % 1;
    const tCur = ph * tEnd;
    const aCur = aOf(tCur);
    dot(ctx, X(tCur), Y(aCur), 1.7, p.gold, 0.95, p.dark);
    dot(ctx, X(0), Y(0), 1.4, p.gold, 0.8, p.dark); // the singularity

    // comoving grid, stretching with the playhead
    const gy = LH * 0.78;
    const sp = Math.max(2.5, aCur * 13);
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = rgb(p.mid, 0.35);
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let i = -5; i <= 5; i++) {
      const x = LW / 2 + i * sp;
      if (x < 4 || x > LW - 4) continue;
      ctx.moveTo(x, gy - 9);
      ctx.lineTo(x, gy + 9);
    }
    ctx.stroke();
    for (let i = -5; i <= 5; i++) {
      const x = LW / 2 + i * sp;
      if (x < 4 || x > LW - 4) continue;
      dot(ctx, x, gy, 1, i % 2 ? p.green : p.gold, 0.8, p.dark);
    }
  },

  bernoulli(ctx, p) {
    // A Venturi: the duct narrows, the fluid is forced to accelerate, and the
    // static-pressure line above dips exactly where the throat is.
    const beta = 0.42;
    const ss = (a: number, b: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    // same breakpoints as ductShape() in lib/lab/venturi.ts, so the tile is a
    // caricature of the real piece rather than a different duct
    const shape = (u: number) => {
      if (u < 0.3) return 1;
      if (u < 0.4) return 1 + (beta - 1) * ss(0.3, 0.4, u);
      if (u < 0.5) return beta;
      if (u < 0.88) return beta + (1 - beta) * ss(0.5, 0.88, u);
      return 1;
    };
    const axis = LH * 0.66;
    const maxR = 12;
    const X = (u: number) => 6 + u * (LW - 12);

    const Y_EGL = 12;
    const Y_HGL0 = 17;
    const M = 64;
    const top: [number, number][] = [];
    const bot: [number, number][] = [];
    const hgl: [number, number][] = [];
    // travel time to each station: du/dt ∝ A(u) ∝ shape², so τ = ∫ shape² du
    const tau = [0];
    for (let i = 0; i <= M; i++) {
      const u = i / M;
      const s = shape(u);
      const r = s * maxR;
      top.push([X(u), axis - r]);
      bot.push([X(u), axis + r]);
      // Total pressure sits at Y_EGL; static pressure starts a little below it —
      // that gap is the inlet dynamic head, which must not be drawn as zero — and
      // dips as v². Scaled so the trough stays clear of the pipe wall below.
      hgl.push([X(u), Y_HGL0 + (1 / s ** 4 - 1) * 0.78]);
      if (i > 0) tau.push(tau[i - 1] + (shape((i - 0.5) / M) ** 2) / M);
    }
    const total = tau[M];
    const uAt = (ph: number) => {
      const target = ((ph % 1) + 1) % 1 * total;
      let i = 1;
      while (i < M && tau[i] < target) i++;
      const f = (target - tau[i - 1]) / Math.max(1e-9, tau[i] - tau[i - 1]);
      return (i - 1 + f) / M;
    };

    glowLine(ctx, [[X(0), Y_EGL], [X(1), Y_EGL]], p.gold, 1, p.dark); // total pressure
    glowLine(ctx, hgl, p.green, 1.2, p.dark); // static pressure
    glowLine(ctx, top, p.mid, 1, p.dark);
    glowLine(ctx, bot, p.mid, 1, p.dark);

    for (let i = 0; i < 14; i++) {
      const ph = p.T * 0.22 + i / 14;
      const u = uAt(ph);
      const u0 = uAt(ph - 0.012);
      const zeta = Math.sin(i * 2.399) * 0.72;
      const spd = Math.min(1, (1 / shape(u) ** 2 - 1) / (1 / beta ** 2 - 1));
      const c: RGB = [
        p.green[0] + (p.gold[0] - p.green[0]) * spd,
        p.green[1] + (p.gold[1] - p.green[1]) * spd,
        p.green[2] + (p.gold[2] - p.green[2]) * spd,
      ];
      glowLine(
        ctx,
        [
          [X(u0), axis + shape(u0) * maxR * zeta],
          [X(u), axis + shape(u) * maxR * zeta],
        ],
        c,
        1.3,
        p.dark,
      );
    }
  },
};

function coarsen(f: Int8Array, gx: number, gy: number): Int8Array {
  const out = new Int8Array(f.length);
  for (let i = 0; i < f.length; i++) {
    const x = i % gx;
    const y = (i / gx) | 0;
    let s = f[i];
    if (x > 0) s += f[i - 1];
    if (x < gx - 1) s += f[i + 1];
    if (y > 0) s += f[i - gx];
    if (y < gy - 1) s += f[i + gx];
    out[i] = s >= 0 ? 1 : -1;
  }
  return out;
}

function makeOff(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function palette(): { green: RGB; gold: RGB; mid: RGB; faint: RGB; dark: boolean } {
  const tk = tokens();
  return {
    green: sampleRamp(ramp('emerald'), 0.72),
    gold: sampleRamp(ramp('gold'), 0.72),
    mid: tk.inkMuted,
    faint: tk.dark ? [255, 255, 255] : [0, 0, 0],
    dark: tk.dark,
  };
}

interface Tile {
  canvas: HTMLCanvasElement;
  key: string;
  state: Record<string, unknown>;
  visible: boolean;
  // last backing-store size actually applied, so the ~30fps draw loop only
  // touches canvas.width/height (which resets the bitmap) when it changes.
  dpr: number;
  cw: number;
  ch: number;
}

export function initThumbs() {
  const canvases = Array.from(document.querySelectorAll<HTMLCanvasElement>('canvas[data-thumb]'));
  if (!canvases.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tiles: Tile[] = canvases.map((canvas) => ({
    canvas,
    key: canvas.dataset.thumb || '',
    state: {},
    visible: false,
    dpr: 0,
    cw: 0,
    ch: 0,
  }));

  const sizeOf = (tile: Tile) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const w = tile.canvas.clientWidth || LW;
    const h = tile.canvas.clientHeight || LH;
    if (tile.dpr !== dpr || tile.cw !== w || tile.ch !== h) {
      tile.canvas.width = Math.round(w * dpr);
      tile.canvas.height = Math.round(h * dpr);
      tile.dpr = dpr;
      tile.cw = w;
      tile.ch = h;
    }
    return { dpr, w, h };
  };

  const drawTile = (tile: Tile, T: number, pal: ReturnType<typeof palette>) => {
    const drawer = DRAWERS[tile.key];
    if (!drawer) return;
    const { dpr, w, h } = sizeOf(tile);
    const ctx = tile.canvas.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, tile.canvas.width, tile.canvas.height);
    // Map the logical LW×LH drawing space onto the tile with ONE scale for both
    // axes, centred. Independent x/y scales would stretch every drawer as soon as
    // the tile stops being 4:3 — which it did the moment the index went square.
    const k = Math.min(w / LW, h / LH);
    ctx.setTransform(dpr * k, 0, 0, dpr * k, (dpr * (w - LW * k)) / 2, (dpr * (h - LH * k)) / 2);
    const bleed = { x: -(w / k - LW) / 2, y: -(h / k - LH) / 2, w: w / k, h: h / k };
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    drawer(ctx, { T, state: tile.state, bleed, ...pal });
  };

  const drawAll = (T: number) => {
    const pal = palette();
    for (const tile of tiles) if (tile.visible || reduced) drawTile(tile, T, pal);
  };

  // Redraw once on theme change (covers the paused/reduced case too).
  new MutationObserver(() => drawAll(lastT)).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  window.addEventListener('resize', () => drawAll(lastT));

  let lastT = 0;
  let start = performance.now();
  let rafId = 0;
  let frame = 0;
  const loop = (now: number) => {
    rafId = requestAnimationFrame(loop);
    frame++;
    if (frame % 2) return; // ~30fps is plenty for thumbnails
    lastT = (now - start) / 1000;
    drawAll(lastT);
  };

  const anyVisible = () => tiles.some((t) => t.visible);
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const tile = tiles.find((t) => t.canvas === e.target);
        if (tile) tile.visible = e.isIntersecting;
      }
      if (reduced) {
        drawAll(0);
        return;
      }
      if (anyVisible() && !rafId) {
        start = performance.now() - lastT * 1000;
        rafId = requestAnimationFrame(loop);
      } else if (!anyVisible() && rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    },
    { rootMargin: '120px' },
  );
  tiles.forEach((t) => io.observe(t.canvas));

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    } else if (!reduced && anyVisible() && !rafId) {
      start = performance.now() - lastT * 1000;
      rafId = requestAnimationFrame(loop);
    }
  });

  // First paint.
  drawAll(0);
}
