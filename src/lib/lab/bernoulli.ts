/**
 * Bernoulli's principle, shown the way it is actually used: a Venturi meter.
 *
 * Two facts do all the work. Continuity — an incompressible fluid must carry the
 * same volume per second through every cross-section, so A₁v₁ = A₂v₂ and a
 * narrow throat *forces* the fluid to speed up. Bernoulli — along a streamline
 * p + ½ρv² + ρgz is conserved, so wherever the fluid is fast the static pressure
 * must be low. Squeeze the throat and the pressure there collapses; squeeze hard
 * enough and it falls below water's vapour pressure and the liquid boils at room
 * temperature (cavitation).
 *
 * Turn it around and it becomes an instrument: measure Δp between the inlet tap
 * and the throat tap and you know the flow rate. That is a Venturi flowmeter.
 *
 * The physics itself lives in ./venturi (DOM-free, headless-tested by
 * scripts/bernoulli-test.mjs); this file only draws it.
 */

import {
  tokens,
  ramp,
  sampleRamp,
  rgb,
  glowStroke,
  glowDot,
  label,
  subtleGrid,
  type RGB,
} from './viz';
import {
  P_VAP,
  HEAD_VAP,
  RHO,
  GRAV,
  TAP_U,
  D1,
  area,
  ductShape,
  stationAt,
  summarize,
  type Station,
  type FlowSummary,
} from './venturi';

// ——————————————————————————————————————————————————————————————
// render
// ——————————————————————————————————————————————————————————————

export type ColorMode = 'speed' | 'pressure';
export type LossMode = 'ideal' | 'real';

export interface BernoulliLabels {
  egl: string; // "全圧（ピトー管が測る）"
  hgl: string; // "静圧（壁の圧力孔が測る）"
  dyn: string; // "動圧 ½ρv²"
  zero: string; // "大気圧"
  duct: string; // "ベンチュリ管"
  cav: string; // "キャビテーション"
  vap: string; // "水の蒸気圧 — 水はこれより下がれない"
  predicted: string; // "ベルヌーイの予測"
  taps: [string, string, string];
}

export interface BernoulliInfo extends FlowSummary {
  beta: number;
  qLps: number;
}

export interface BernoulliScene {
  setBeta(b: number): void;
  setFlowLps(q: number): void;
  setColorMode(m: ColorMode): void;
  setLossMode(m: LossMode): void;
  dispose(): void;
}

const N_PARTICLES = 260;
const DUCT_LENGTH_M = 1.2; // physical length of the drawn meter
const TIME_SCALE = 0.25; // slow-motion factor so the throat is watchable

/** Length of each tracer's position history. The streak spans the last
 *  EXPOSURE-1 frames — uniform across every particle, so streak length stays
 *  honestly proportional to local speed: it is the shutter that is slow, not
 *  some particles. */
const EXPOSURE = 4;

interface Particle {
  u: number; // 0..1 along the duct
  zeta: number; // r/R — constant along a stream surface for uniform inflow
  hist: number[]; // recent u values; hist[0] is EXPOSURE frames ago
  seed: number;
}

export function createBernoulliScene(
  canvas: HTMLCanvasElement,
  labels: BernoulliLabels,
  onInfo?: (info: BernoulliInfo) => void,
): BernoulliScene {
  const ctx = canvas.getContext('2d')!;

  let beta = 0.55;
  let qLps = 9;
  let colorMode: ColorMode = 'speed';
  let lossMode: LossMode = 'ideal';

  const q = () => qLps / 1000;
  const lossy = () => lossMode === 'real';

  const emit = () =>
    onInfo?.({ ...summarize(beta, q(), lossy()), beta, qLps });

  // ——— particles ———
  const particles: Particle[] = [];
  let rngState = 12345;
  const rnd = () => {
    rngState = (rngState * 1103515245 + 12345) & 0x7fffffff;
    return rngState / 0x7fffffff;
  };
  for (let i = 0; i < N_PARTICLES; i++) {
    const u = rnd();
    particles.push({ u, hist: new Array(EXPOSURE).fill(u), zeta: rnd() * 2 - 1, seed: rnd() });
  }

  const respawn = (p: Particle) => {
    p.u = -0.02 * rnd();
    p.hist.fill(p.u);
    p.zeta = rnd() * 2 - 1;
    p.seed = rnd();
  };

  const step = (dt: number) => {
    const scaled = dt * TIME_SCALE;
    for (const p of particles) {
      p.hist.push(p.u);
      if (p.hist.length > EXPOSURE) p.hist.shift();
      // integrate du/dt = v(u)/L in a few substeps — v varies fast at the throat
      const vHere = q() / area(ductShape(p.u, beta) * D1);
      const guess = (vHere / DUCT_LENGTH_M) * scaled;
      const sub = Math.min(8, Math.max(1, Math.ceil(guess / 0.02)));
      const h = scaled / sub;
      for (let s = 0; s < sub; s++) {
        const v = q() / area(ductShape(p.u, beta) * D1);
        p.u += (v / DUCT_LENGTH_M) * h;
        if (p.u > 1) break;
      }
      if (p.u > 1) respawn(p);
    }
  };

  // ——— layout ———
  const layout = (w: number, h: number) => {
    // On a phone the .lab-hint wraps to three lines over the bottom of the stage
    // and the in-canvas legend runs out of room, so pull the duct up and drop the
    // non-essential labels rather than letting text pile on text.
    const compact = w < 560;
    const x0 = compact ? 34 : 46;
    const x1 = w - 12;
    return {
      compact,
      x0,
      x1,
      graphTop: h * (compact ? 0.1 : 0.09),
      graphBottom: h * (compact ? 0.44 : 0.5),
      ductAxis: h * (compact ? 0.63 : 0.72),
      ductMaxR: Math.min(h * (compact ? 0.125 : 0.155), compact ? 46 : 58),
    };
  };

  const xOf = (u: number, L: ReturnType<typeof layout>) => L.x0 + u * (L.x1 - L.x0);

  // smoothed vertical autoscale for the head diagram — the throat head swings
  // over three orders of magnitude across the sliders
  let axisLo = 0;
  let axisHi = 2;

  const drawHeads = (L: ReturnType<typeof layout>, tk: ReturnType<typeof tokens>) => {
    const N = 160;
    const egl: { x: number; y: number }[] = [];
    const hgl: { x: number; y: number }[] = [];
    const stations: Station[] = [];
    let lo = 0;
    let hi = 0;
    for (let i = 0; i <= N; i++) {
      const st = stationAt(i / N, beta, q(), lossy());
      stations.push(st);
      if (st.head < lo) lo = st.head;
      if (st.total > hi) hi = st.total;
    }
    // keep a little air above and below, and never collapse to zero span. Once
    // the ideal curve dives past the vapour floor it is off in fantasy land, so
    // stop following it down — otherwise the whole diagram squashes to a line.
    const targetHi = hi * 1.12 + 0.05;
    const targetLo = Math.max(HEAD_VAP * 1.25, Math.min(0, lo) * 1.12 - 0.05);
    axisHi += (targetHi - axisHi) * 0.12;
    axisLo += (targetLo - axisLo) * 0.12;
    const span = Math.max(0.2, axisHi - axisLo);
    const rawY = (head: number) =>
      L.graphBottom - ((head - axisLo) / span) * (L.graphBottom - L.graphTop);
    const yOf = (head: number) =>
      Math.max(L.graphTop - 2, Math.min(L.graphBottom + 2, rawY(head)));

    // hglIdeal = what the equation predicts; hglReal = what water can do. They
    // differ only once the throat is driven below the vapour pressure.
    const hglIdeal: { x: number; y: number }[] = [];
    let cavitates = false;
    for (let i = 0; i <= N; i++) {
      const x = xOf(i / N, L);
      egl.push({ x, y: yOf(stations[i].total) });
      hglIdeal.push({ x, y: yOf(stations[i].head) });
      const attainable = Math.max(stations[i].head, HEAD_VAP);
      if (stations[i].head < HEAD_VAP) cavitates = true;
      hgl.push({ x, y: yOf(attainable) });
    }

    // dynamic-head band between the two grade lines = ½ρv²
    ctx.save();
    ctx.beginPath();
    egl.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    for (let i = hgl.length - 1; i >= 0; i--) ctx.lineTo(hgl[i].x, hgl[i].y);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, L.graphTop, 0, L.graphBottom);
    grad.addColorStop(0, rgb(tk.gold, tk.dark ? 0.16 : 0.13));
    grad.addColorStop(1, rgb(tk.green, tk.dark ? 0.1 : 0.08));
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // atmospheric datum
    if (axisLo < 0 && axisHi > 0) {
      const y0 = yOf(0);
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = rgb(tk.inkMuted, 0.55);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(L.x0, y0);
      ctx.lineTo(L.x1, y0);
      ctx.stroke();
      ctx.restore();
      label(ctx, labels.zero, L.x1 - 4, y0 - 5, tk.inkMuted, { size: 10, align: 'right' });
    }

    // the vapour-pressure floor: Bernoulli keeps going down, water does not
    if (cavitates) {
      const yv = yOf(HEAD_VAP);
      ctx.save();
      ctx.setLineDash([2, 5]);
      ctx.strokeStyle = rgb(tk.gold, 0.6);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(L.x0, yv);
      ctx.lineTo(L.x1, yv);
      ctx.stroke();
      ctx.restore();
      label(ctx, labels.vap, L.x1 - 4, yv - 5, tk.gold, { size: 10, align: 'right' });

      // the unattainable branch, drawn as a ghost
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = rgb(tk.green, 0.35);
      ctx.lineWidth = 1;
      ctx.beginPath();
      hglIdeal.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
      ctx.restore();
      label(ctx, labels.predicted, xOf(0.45, L), L.graphBottom - 4, tk.green, {
        size: 10,
        align: 'center',
        alpha: 0.6,
      });
    }

    glowStroke(ctx, egl, tk.gold, 2, 0.9, tk.dark);
    glowStroke(ctx, hgl, tk.green, 2, 0.9, tk.dark);

    // head axis in metres of water
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const hv = axisLo + (span * i) / ticks;
      const y = yOf(hv);
      ctx.save();
      ctx.strokeStyle = rgb(tk.inkMuted, 0.22);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(L.x0 - 5, y);
      ctx.lineTo(L.x0, y);
      ctx.stroke();
      ctx.restore();
      const txt = Math.abs(hv) < 0.05 ? '0' : hv.toFixed(Math.abs(hv) >= 100 ? 0 : 1);
      label(ctx, txt, L.x0 - 8, y + 3.5, tk.inkMuted, {
        size: 10,
        align: 'right',
      });
    }
    label(ctx, 'm H₂O', L.x0 - 8, L.graphTop - 6, tk.inkMuted, { size: 10, align: 'right' });

    label(ctx, labels.egl, xOf(0.02, L), yOf(stations[Math.round(N * 0.02)].total) - 8, tk.gold, {
      size: 11,
      weight: 600,
    });
    label(ctx, labels.hgl, xOf(0.02, L), yOf(stations[Math.round(N * 0.02)].head) + 14, tk.green, {
      size: 11,
      weight: 600,
    });
    // The band between the grade lines is ½ρv² only while the HGL is the real
    // pressure. Once it is clipped to the vapour floor the gap no longer equals
    // the dynamic head, so drop the label rather than assert something false.
    if (!L.compact && !cavitates) {
      const iThroat = Math.round(N * TAP_U[1]);
      const midHead = (stations[iThroat].total + stations[iThroat].head) / 2;
      label(ctx, labels.dyn, xOf(0.45, L), yOf(midHead), tk.inkMuted, {
        size: 10,
        align: 'center',
      });
    }

    return { yOf };
  };

  const drawDuct = (
    L: ReturnType<typeof layout>,
    tk: ReturnType<typeof tokens>,
    yOfHead: (h: number) => number,
  ) => {
    const N = 160;
    const top: { x: number; y: number }[] = [];
    const bottom: { x: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const r = ductShape(u, beta) * L.ductMaxR;
      const x = xOf(u, L);
      top.push({ x, y: L.ductAxis - r });
      bottom.push({ x, y: L.ductAxis + r });
    }

    // wall fill — a whisper of body so the bore reads as a vessel
    ctx.save();
    ctx.beginPath();
    top.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    for (let i = bottom.length - 1; i >= 0; i--) ctx.lineTo(bottom[i].x, bottom[i].y);
    ctx.closePath();
    ctx.fillStyle = rgb(tk.green, tk.dark ? 0.055 : 0.045);
    ctx.fill();
    ctx.restore();

    glowStroke(ctx, top, tk.green, 1.6, 0.55, tk.dark);
    glowStroke(ctx, bottom, tk.green, 1.6, 0.55, tk.dark);

    // pressure taps — the physical link between the pipe and the graph above
    TAP_U.forEach((u, i) => {
      const x = xOf(u, L);
      const st = stationAt(u, beta, q(), lossy());
      const rTop = L.ductAxis - ductShape(u, beta) * L.ductMaxR;
      const yHead = yOfHead(Math.max(st.head, HEAD_VAP));
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = rgb(tk.inkMuted, 0.34);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, rTop);
      ctx.lineTo(x, Math.max(L.graphTop, Math.min(L.graphBottom, yHead)));
      ctx.stroke();
      ctx.restore();
      glowDot(ctx, x, rTop, 2.2, tk.green, tk.dark ? 0.9 : 0.7);
      label(ctx, labels.taps[i], x, rTop - 8, tk.inkMuted, { size: 10, align: 'center' });
    });
  };

  const drawParticles = (L: ReturnType<typeof layout>, tk: ReturnType<typeof tokens>) => {
    const spec = ramp('spectral');
    const phase = ramp('phase');
    const s = summarize(beta, q(), lossy());
    const vMax = Math.max(1e-6, s.v2);
    const hiRef = Math.max(0.05, s.h0);
    const loRef = Math.max(0.05, -Math.min(-0.05, s.p2Actual / (RHO * GRAV)));
    ctx.save();
    ctx.globalCompositeOperation = tk.dark ? 'lighter' : 'source-over';
    ctx.lineCap = 'round';
    for (const p of particles) {
      if (p.u < 0 || p.u > 1) continue;
      const st = stationAt(p.u, beta, q(), lossy());
      let c: RGB;
      if (colorMode === 'speed') {
        c = sampleRamp(spec, Math.min(1, st.v / vMax));
      } else {
        // Diverging about ATMOSPHERIC (head = 0): mint where the fluid is
        // pressurised, gold where it is pulled below atmosphere. Each arm is
        // scaled separately so the suction side keeps its gradation instead of
        // clamping to one flat colour.
        const h = Math.max(st.head, HEAD_VAP);
        const t =
          h >= 0
            ? 0.5 + 0.5 * Math.min(1, h / hiRef)
            : 0.5 - 0.5 * Math.min(1, -h / loRef);
        c = sampleRamp(phase, t);
      }
      const a = tk.dark ? 0.75 : 0.9;
      ctx.strokeStyle = rgb(c, a);
      ctx.lineWidth = 1.6 + 0.9 * p.seed;
      ctx.beginPath();
      let started = false;
      for (const hu of [...p.hist, p.u]) {
        const u = Math.max(0, hu);
        const y = L.ductAxis + ductShape(u, beta) * L.ductMaxR * p.zeta;
        if (started) ctx.lineTo(xOf(u, L), y);
        else {
          ctx.moveTo(xOf(u, L), y);
          started = true;
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawCavitation = (
    L: ReturnType<typeof layout>,
    tk: ReturnType<typeof tokens>,
    t: number,
  ) => {
    const throat = stationAt(TAP_U[1], beta, q(), lossy());
    if (throat.pAbs > P_VAP) return;
    // how far below the vapour pressure the throat has been driven
    const sev = Math.min(1, (P_VAP - throat.pAbs) / 60000 + 0.25);
    const gold = sampleRamp(ramp('gold'), 0.85);
    ctx.save();
    ctx.globalCompositeOperation = tk.dark ? 'lighter' : 'source-over';
    for (let i = 0; i < 26; i++) {
      const ph = (t * (0.55 + 0.5 * ((i * 37) % 11) / 11) + i * 0.137) % 1;
      // bubbles nucleate at the throat and collapse in the diffuser
      const u = 0.42 + ph * 0.24;
      const life = Math.sin(Math.PI * Math.min(1, ph / 0.85));
      const r = ductShape(u, beta) * L.ductMaxR;
      const zeta = Math.sin(i * 2.399) * 0.85;
      const x = xOf(u, L);
      const y = L.ductAxis + r * zeta;
      glowDot(ctx, x, y, (1 + 2.2 * life) * sev, gold, (0.35 + 0.55 * life) * sev);
    }
    ctx.restore();
    label(ctx, labels.cav, xOf(0.54, L), L.ductAxis + L.ductMaxR + 16, tk.gold, {
      size: 11,
      weight: 600,
      align: 'center',
    });
  };

  let rafId = 0;
  let last = performance.now();
  let clock = 0;

  const draw = (now: number) => {
    rafId = requestAnimationFrame(draw);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    step(dt);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const tk = tokens();
    const L = layout(w, h);
    subtleGrid(ctx, w, h, Math.max(26, w / 18), tk.grid);

    const { yOf } = drawHeads(L, tk);
    drawDuct(L, tk, yOf);
    drawParticles(L, tk);
    drawCavitation(L, tk, clock);
    if (!L.compact) {
      label(ctx, labels.duct, L.x1, L.graphTop - 8, tk.inkMuted, { size: 10, align: 'right' });
    }
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
    setBeta(b) {
      beta = Math.max(0.3, Math.min(0.9, b));
      emit();
    },
    setFlowLps(v) {
      qLps = Math.max(1, Math.min(20, v));
      emit();
    },
    setColorMode(m) {
      colorMode = m;
      emit();
    },
    setLossMode(m) {
      lossMode = m;
      emit();
    },
    dispose() {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('resize', resize);
    },
  };
}
