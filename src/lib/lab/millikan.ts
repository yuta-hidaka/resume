/**
 * Millikan oil-drop experiment. A charged oil droplet (q = n·e, n hidden)
 * drifts between capacitor plates. Stokes drag is so strong that motion is
 * quasi-static: v = (mg − qV/d) / (6πηr). Tune the voltage until the drop
 * hovers, record q = mgd/V, repeat — the recorded charges cluster at integer
 * multiples of e. Time is sped up; the physics constants are real.
 */

import { tokens, ramp, sampleRamp, rgb, mix, glowStroke, glowDot, label, type RGB } from './viz';

export const E_CHARGE = 1.602176634e-19; // C
const OIL_DENSITY = 886; // kg/m³
const G = 9.81;
const ETA_AIR = 1.81e-5; // Pa·s
export const PLATE_GAP = 5e-3; // m
const TIME_SCALE = 18; // visual speed-up of the drift
const BALANCE_V = 3e-6; // |drift| below this counts as "hovering" (m/s)

interface Droplet {
  /** radius, m (0.7–1.1 µm) */
  r: number;
  /** mass, kg */
  m: number;
  /** charge magnitude, C — |q| = n·e of a negatively charged drop, n hidden */
  q: number;
  n: number;
  /** height above the bottom plate, m ∈ [0, PLATE_GAP] */
  y: number;
}

const CHARGE_WEIGHTS = [0.32, 0.28, 0.2, 0.13, 0.07]; // n = 1..5

function makeDroplet(): Droplet {
  let n = 1;
  let u = Math.random();
  for (let i = 0; i < CHARGE_WEIGHTS.length; i++) {
    if (u < CHARGE_WEIGHTS[i]) {
      n = i + 1;
      break;
    }
    u -= CHARGE_WEIGHTS[i];
  }
  // 0.7–1.1 µm keeps every n=1..5 balance voltage inside the 0–1600 V slider.
  const r = (0.7 + 0.4 * Math.random()) * 1e-6;
  const m = OIL_DENSITY * (4 / 3) * Math.PI * r ** 3;
  return { r, m, q: n * E_CHARGE, n, y: PLATE_GAP * (0.55 + 0.3 * Math.random()) };
}

const WHITE: RGB = [255, 255, 255];

interface ThemeColors {
  green: RGB;
  gold: RGB;
  ink: RGB;
  inkMuted: RGB;
  dark: boolean;
  glowAlpha: number;
}

function themeColors(): ThemeColors {
  const tk = tokens();
  return { green: tk.green, gold: tk.gold, ink: tk.ink, inkMuted: tk.inkMuted, dark: tk.dark, glowAlpha: tk.glowAlpha };
}

export interface MillikanSim {
  setVoltage(v: number): void;
  newDroplet(): void;
  /** Record q = mgd/V if hovering; returns q/e, or null if not balanced. */
  record(): number | null;
  readonly balanced: boolean;
  /** signed drift velocity, m/s (positive = falling) */
  readonly drift: number;
  readonly records: readonly number[];
  dispose(): void;
}

export function createMillikanSim(
  stage: HTMLCanvasElement,
  chart: HTMLCanvasElement,
  onUpdate?: (drift: number, balanced: boolean) => void,
): MillikanSim {
  const sctx = stage.getContext('2d')!;
  const cctx = chart.getContext('2d')!;
  let droplet = makeDroplet();
  let voltage = 0;
  let records: number[] = [];
  let colors = themeColors();
  let resetAt = 0; // timestamp of the last mid-chamber recenter, for the fade-in

  const driftVelocity = (): number =>
    (droplet.m * G - (droplet.q * voltage) / PLATE_GAP) / (6 * Math.PI * ETA_AIR * droplet.r);

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

  const drawStage = (now: number) => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = stage.width / dpr;
    const h = stage.height / dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.clearRect(0, 0, w, h);
    const top = h * 0.14;
    const bottom = h * 0.86;
    const plateX = w * 0.1;
    const plateW = w * 0.8;
    const fieldAlpha = Math.min(0.65, voltage / 2500);

    // Capacitor plates: a polished instrument bar with a bright inner edge
    // that energizes with the applied field. Top +, bottom −: the field points
    // down, so the negatively charged droplet feels an upward force qE.
    const drawPlate = (barY: number, edgeY: number) => {
      sctx.fillStyle = rgb(colors.inkMuted, colors.dark ? 0.8 : 0.85);
      sctx.fillRect(plateX, barY, plateW, 4);
      sctx.strokeStyle = rgb(colors.gold, (colors.dark ? 0.45 : 0.3) + 0.4 * fieldAlpha);
      sctx.lineWidth = 1;
      sctx.beginPath();
      sctx.moveTo(plateX, edgeY);
      sctx.lineTo(plateX + plateW, edgeY);
      sctx.stroke();
    };
    drawPlate(top - 4, top);
    drawPlate(bottom, bottom);
    label(sctx, '＋', plateX - 24, top + 2, colors.ink, { size: 13, alpha: 0.85 });
    label(sctx, '−', plateX - 22, bottom + 8, colors.ink, { size: 13, alpha: 0.85 });

    // Field lines: delicate glowing verticals, intensity tracking voltage.
    if (voltage > 1) {
      const nLines = 7;
      sctx.globalAlpha = fieldAlpha;
      for (let i = 1; i <= nLines; i++) {
        const x = plateX + (plateW * i) / (nLines + 1);
        glowStroke(
          sctx,
          [
            { x, y: top + 8 },
            { x, y: bottom - 8 },
          ],
          colors.gold,
          1,
          colors.dark ? 0.8 : 0.35,
          colors.dark,
        );
        sctx.strokeStyle = rgb(colors.gold, 1);
        sctx.lineWidth = 1;
        sctx.beginPath();
        sctx.moveTo(x - 3.5, bottom - 16);
        sctx.lineTo(x, bottom - 9);
        sctx.lineTo(x + 3.5, bottom - 16);
        sctx.stroke();
      }
      sctx.globalAlpha = 1;
    }

    // The droplet: a glowing bead, emerald when hovering, gold otherwise.
    const v = driftVelocity();
    const balanced = Math.abs(v) < BALANCE_V;
    const y = top + (1 - droplet.y / PLATE_GAP) * (bottom - top);
    const x = w / 2;
    const dropColor = balanced ? colors.green : colors.gold;
    // After a recenter the bead fades back in over ~250 ms so the jump reads
    // as a fresh view of the same drop rather than a rendering glitch.
    const fade = Math.min(1, (now - resetAt) / 250);

    glowDot(sctx, x, y, 6, dropColor, (colors.glowAlpha + (colors.dark ? 0.1 : 0.3)) * fade);
    // A small bright highlight sells the "glass bead" read.
    sctx.fillStyle = rgb(mix(dropColor, WHITE, colors.dark ? 0.55 : 0.25), (colors.dark ? 0.85 : 0.55) * fade);
    sctx.beginPath();
    sctx.arc(x - 1.7, y - 1.9, 1.5, 0, 2 * Math.PI);
    sctx.fill();

    // Suppress the drift arrow mid-fade so the reset doesn't flash a cue.
    if (!balanced && fade >= 1) {
      const dir = v > 0 ? 1 : -1; // falling = down the screen
      const len = Math.min(26, 8 + Math.abs(v) * 4e6);
      glowStroke(
        sctx,
        [
          { x: x + 16, y: y - (dir * len) / 2 },
          { x: x + 16, y: y + (dir * len) / 2 },
          { x: x + 12, y: y + (dir * len) / 2 - dir * 5 },
        ],
        dropColor,
        1.4,
        colors.dark ? 0.6 : 0.3,
        colors.dark,
      );
      glowStroke(
        sctx,
        [
          { x: x + 16, y: y + (dir * len) / 2 },
          { x: x + 20, y: y + (dir * len) / 2 - dir * 5 },
        ],
        dropColor,
        1.4,
        colors.dark ? 0.6 : 0.3,
        colors.dark,
      );
    }
  };

  const drawChart = () => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = chart.width / dpr;
    const h = chart.height / dpr;
    const pad = 14;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cctx.clearRect(0, 0, w, h);
    const xFor = (qe: number) => pad + (qe / 5.5) * (w - 2 * pad);
    const baseline = h - 16;

    // Integer gridlines 1e..5e — crisp and labeled.
    cctx.strokeStyle = rgb(colors.inkMuted, colors.dark ? 0.16 : 0.22);
    cctx.lineWidth = 1;
    cctx.beginPath();
    cctx.moveTo(pad, baseline);
    cctx.lineTo(w - pad, baseline);
    cctx.stroke();
    for (let n = 1; n <= 5; n++) {
      const x = xFor(n);
      cctx.strokeStyle = rgb(colors.inkMuted, colors.dark ? 0.3 : 0.32);
      cctx.setLineDash([2, 4]);
      cctx.beginPath();
      cctx.moveTo(x, 4);
      cctx.lineTo(x, baseline);
      cctx.stroke();
      cctx.setLineDash([]);
      label(cctx, `${n}e`, x, h - 4, colors.inkMuted, { size: 11, align: 'center', alpha: 0.9 });
    }

    // Recorded charges: glowing dots clustering on the e-multiples, tinted by
    // how far each landed from the nearest integer (the diverging phase
    // ramp: gold = high side, mint = low side).
    const phaseRamp = ramp('phase');
    records.forEach((qe, i) => {
      const jitter = ((i * 37) % 12) - 6;
      const frac = qe - Math.round(qe);
      const t = Math.min(1, Math.max(0, frac + 0.5));
      const dotColor = sampleRamp(phaseRamp, t);
      glowDot(cctx, xFor(qe), h / 2 + jitter, 2.4, dotColor, colors.glowAlpha + (colors.dark ? -0.05 : 0.1));
    });
  };

  let rafId = 0;
  let last = performance.now();
  const loop = (now: number) => {
    rafId = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const v = driftVelocity();
    droplet.y -= v * dt * TIME_SCALE;
    // Drifted out of view: bring it back mid-chamber (same hidden charge).
    if (droplet.y < 0.03 * PLATE_GAP || droplet.y > 0.97 * PLATE_GAP) {
      droplet.y = PLATE_GAP / 2;
      resetAt = now;
    }
    onUpdate?.(v, Math.abs(v) < BALANCE_V);
    drawStage(now);
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
    setVoltage(v) {
      voltage = Math.max(0, v);
    },
    newDroplet() {
      droplet = makeDroplet();
    },
    record() {
      if (voltage < 1 || Math.abs(driftVelocity()) >= BALANCE_V) return null;
      const qe = (droplet.m * G * PLATE_GAP) / voltage / E_CHARGE;
      records.push(qe);
      if (records.length > 40) records.shift();
      return qe;
    },
    get balanced() {
      return Math.abs(driftVelocity()) < BALANCE_V;
    },
    get drift() {
      return driftVelocity();
    },
    get records() {
      return records;
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
