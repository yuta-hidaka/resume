/**
 * The fission chain reaction. A neutron striking a fissile nucleus (²³⁵U or
 * ²³⁹Pu) splits it into two fragments, releases ~200 MeV, and emits ν̄ fresh
 * neutrons in random directions. Each of those can go on to strike another
 * nucleus — a branching process whose fate is governed by the effective
 * multiplication factor
 *
 *   k = ν̄ · P(fission | neutron)
 *
 * k < 1: the population decays (subcritical). k = 1: it holds steady
 * (critical — a reactor). k > 1: it grows exponentially (supercritical — a
 * bomb). Every neutron's fate — cause a fission, or be lost to leakage /
 * non-fission capture — is drawn once at birth with probability
 * P(fission|neutron) = k/ν̄, so the branching process realizes k exactly in
 * expectation while still reading, on screen, as an actual box of flying
 * neutrons striking glowing nuclei. A faint ambient neutron background and a
 * regenerating fuel supply (see AMBIENT_INTERVAL, REGEN_DELAY below) keep a
 * critical (k = 1) chain visibly alive instead of statistically dying out,
 * and keep this small 160-nucleus box from artificially running dry —
 * neither changes what k means, only how long the demo can show it.
 */

import {
  tokens,
  ramp,
  sampleRamp,
  rgb,
  mix,
  glowStroke,
  glowSprite,
  areaFill,
  fadeTrails,
  softSprite,
  label,
  type RGB,
  type Ramp,
} from './viz';

// ---------- Real physics: isotopes, energy, and the branching process ----------

export type IsotopeKey = 'u235' | 'pu239';

export interface IsotopeSpec {
  key: IsotopeKey;
  symbol: string;
  name: string;
  /** MeV released per fission (headline figure; ²³⁵U is ≈202 MeV total /
   *  ~193 MeV recoverable, commonly rounded to ~200 MeV). */
  energyMeV: number;
  /** average number of prompt neutrons released per fission, ν̄ */
  nuBar: number;
  /** bare-sphere critical mass, kg (unreflected) */
  criticalMassKg: number;
  /** molar mass, g/mol — used for the "energy per gram" figure */
  molarMass: number;
}

export const ISOTOPES: Record<IsotopeKey, IsotopeSpec> = {
  u235: {
    key: 'u235',
    symbol: '²³⁵U',
    name: 'Uranium-235',
    energyMeV: 200,
    nuBar: 2.43,
    criticalMassKg: 52,
    molarMass: 235,
  },
  pu239: {
    key: 'pu239',
    symbol: '²³⁹Pu',
    name: 'Plutonium-239',
    energyMeV: 207,
    nuBar: 2.88,
    criticalMassKg: 10,
    molarMass: 239,
  },
};

/** J per MeV = 1e6 eV × 1.602176634e-19 J/eV (exact, 2019 SI definition). */
export const MEV_TO_JOULE = 1.602176634e-13;
export const AVOGADRO = 6.02214076e23;

export function mevToJoules(mev: number): number {
  return mev * MEV_TO_JOULE;
}

/** Energy released if 1 g of the isotope fissions completely, in joules
 *  (≈8.2×10¹⁰ J for U-235 — the "~2.5 tonnes of coal" figure). */
export function fullFissionEnergyPerGram(isotope: IsotopeSpec): number {
  const atomsPerGram = AVOGADRO / isotope.molarMass;
  return atomsPerGram * mevToJoules(isotope.energyMeV);
}

export const K_MIN = 0.6;
export const K_MAX = 1.5;
export const DEFAULT_K = 1.0;
export const DEFAULT_ISOTOPE: IsotopeKey = 'u235';

export function clampK(k: number): number {
  return Math.min(K_MAX, Math.max(K_MIN, k));
}

/** Per-encounter fission probability that realizes the target multiplication
 *  factor k for a given ν̄: k = ν̄ · P(fission | neutron). This folds in
 *  everything that is not fission — leakage, non-fission capture — into one
 *  tunable survival probability. */
export function fissionProbability(k: number, nuBar: number): number {
  if (nuBar <= 0) return 0;
  return Math.min(1, Math.max(0, k / nuBar));
}

export type Regime = 'subcritical' | 'critical' | 'supercritical';

export function regimeFor(k: number, epsilon = 0.005): Regime {
  if (k < 1 - epsilon) return 'subcritical';
  if (k > 1 + epsilon) return 'supercritical';
  return 'critical';
}

/** Closed form of the branching process: N(g) = N0 · k^g after g neutron
 *  generations — the textbook relation the chain reaction lives or dies by. */
export function expectedPopulation(n0: number, k: number, generations: number): number {
  return n0 * Math.pow(k, generations);
}

/** Poisson-distributed integer sample (Knuth's algorithm). The number of
 *  fresh neutrons a single fission emits scatters around ν̄ — 2 or 3 for
 *  U-235, most often 3 for Pu-239, occasionally 1 or 4. */
export function poissonSample(mean: number, rng: () => number = Math.random): number {
  if (mean <= 0) return 0;
  const limit = Math.exp(-mean);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > limit);
  return k - 1;
}

// ---------- DOM-free simulation core ----------

interface Nucleus {
  x: number;
  y: number;
  alive: boolean;
  /** sim time at which a spent nucleus becomes fissionable again (see REGEN_DELAY) */
  respawnAt: number;
}

interface Neutron {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** predetermined fate: will this neutron go on to cause a fission? */
  fission: boolean;
  /** index into `nuclei`, valid only when `fission` is true */
  targetIdx: number;
}

interface Flash {
  x: number;
  y: number;
  age: number;
}

const N_NUCLEI = 160;
const MAX_NEUTRONS = 220;
export const POP_CHART_MAX = MAX_NEUTRONS;
const NEUTRON_SPEED = 0.42; // box-widths per second
const HIT_RADIUS = 0.022;
const FLASH_LIFE = 0.5; // seconds
const SEED_BURST = 10; // neutrons per "Fire" pulse
const HISTORY_CAP = 600;
const SAMPLE_INTERVAL = 1 / 15; // seconds between chart samples
const MIN_NUCLEUS_SPACING = 0.045;
/** Every real subcritical/critical assembly has a faint ambient neutron
 *  background (spontaneous fission of trace impurities, cosmic-ray
 *  spallation) — without it, a chain reaction started from one pulse is a
 *  random walk that eventually goes extinct even exactly at k = 1. One
 *  ambient neutron every couple of seconds is what keeps a critical pile's
 *  flux visibly steady instead of silently dying out. */
const AMBIENT_INTERVAL = 1.2; // seconds between background neutrons
/** Seconds before a spent nucleus is fissionable again. The box is a small
 *  monitored sample of a much larger, continuously-supplied fuel mass (a
 *  real critical mass is tens of kilograms, ~10²⁵ nuclei) — without some
 *  restocking, this tiny 160-nucleus sample would exhaust itself in
 *  seconds at k ≥ 1 and the population would crash for a reason that has
 *  nothing to do with k. Regeneration keeps the *fuel supply* effectively
 *  unlimited so the chart shows the multiplication-factor physics, not a
 *  toy-box depletion artifact. */
const REGEN_DELAY = 6; // seconds

function seedNuclei(rng: () => number): Nucleus[] {
  const nuclei: Nucleus[] = [];
  let attempts = 0;
  const spacing2 = MIN_NUCLEUS_SPACING * MIN_NUCLEUS_SPACING;
  while (nuclei.length < N_NUCLEI && attempts < N_NUCLEI * 60) {
    attempts++;
    const x = 0.06 + rng() * 0.88;
    const y = 0.06 + rng() * 0.88;
    let ok = true;
    for (let i = 0; i < nuclei.length; i++) {
      const dx = nuclei[i].x - x;
      const dy = nuclei[i].y - y;
      if (dx * dx + dy * dy < spacing2) {
        ok = false;
        break;
      }
    }
    if (ok) nuclei.push({ x, y, alive: true, respawnAt: -1 });
  }
  while (nuclei.length < N_NUCLEI) {
    nuclei.push({ x: 0.06 + rng() * 0.88, y: 0.06 + rng() * 0.88, alive: true, respawnAt: -1 });
  }
  return nuclei;
}

/** Reservoir-sample a uniformly random *alive* nucleus index (or -1). */
function randomAliveIndex(nuclei: Nucleus[], rng: () => number): number {
  let seen = 0;
  let chosen = -1;
  for (let i = 0; i < nuclei.length; i++) {
    if (!nuclei[i].alive) continue;
    seen++;
    if (rng() < 1 / seen) chosen = i;
  }
  return chosen;
}

function spawnNeutron(
  into: Neutron[],
  nuclei: Nucleus[],
  x: number,
  y: number,
  angleBias: number | null,
  k: number,
  nuBar: number,
  rng: () => number,
) {
  if (into.length >= MAX_NEUTRONS) return;
  const pFission = fissionProbability(k, nuBar);
  const targetIdx = rng() < pFission ? randomAliveIndex(nuclei, rng) : -1;
  let vx: number;
  let vy: number;
  if (targetIdx >= 0) {
    const t = nuclei[targetIdx];
    const dx = t.x - x;
    const dy = t.y - y;
    const dist = Math.hypot(dx, dy) || 1e-6;
    vx = (dx / dist) * NEUTRON_SPEED;
    vy = (dy / dist) * NEUTRON_SPEED;
  } else {
    const angle = angleBias === null ? rng() * Math.PI * 2 : angleBias + (rng() - 0.5) * 1.8;
    vx = Math.cos(angle) * NEUTRON_SPEED;
    vy = Math.sin(angle) * NEUTRON_SPEED;
  }
  into.push({ x, y, vx, vy, fission: targetIdx >= 0, targetIdx });
}

const outOfBox = (x: number, y: number) => x < 0 || x > 1 || y < 0 || y > 1;

export interface FissionParams {
  isotope: IsotopeKey;
  k: number;
}

export interface FissionCore {
  step(dt: number): void;
  fire(): void;
  reset(next?: Partial<FissionParams>): void;
  setK(k: number): void;
  setIsotope(isotope: IsotopeKey): void;
  readonly nuclei: readonly Nucleus[];
  readonly neutrons: readonly Neutron[];
  readonly flashes: readonly Flash[];
  /** rolling live-population samples, for the chart */
  readonly history: readonly number[];
  readonly params: FissionParams;
  readonly energyMeV: number;
  readonly fissionCount: number;
  readonly neutronsEmitted: number;
}

/** DOM-free physics core (also used by the headless checks). */
export function createFissionCore(initial: Partial<FissionParams> = {}, rng: () => number = Math.random): FissionCore {
  const params: FissionParams = {
    isotope: initial.isotope ?? DEFAULT_ISOTOPE,
    k: clampK(initial.k ?? DEFAULT_K),
  };
  let nuclei: Nucleus[] = seedNuclei(rng);
  let neutrons: Neutron[] = [];
  let flashes: Flash[] = [];
  let history: number[] = [];
  let sampleAccum = 0;
  let ambientAccum = 0;
  let simTime = 0;
  let energyMeV = 0;
  let fissionCount = 0;
  let neutronsEmitted = 0;

  const doReset = (next?: Partial<FissionParams>) => {
    if (next?.isotope) params.isotope = next.isotope;
    if (typeof next?.k === 'number') params.k = clampK(next.k);
    nuclei = seedNuclei(rng);
    neutrons = [];
    flashes = [];
    history = [];
    sampleAccum = 0;
    ambientAccum = 0;
    simTime = 0;
    energyMeV = 0;
    fissionCount = 0;
    neutronsEmitted = 0;
  };

  return {
    step(dt: number) {
      simTime += dt;

      // age & drop expired flashes
      flashes = flashes.filter((f) => {
        f.age += dt;
        return f.age <= FLASH_LIFE;
      });

      // spent nuclei restock from the surrounding fuel mass (see REGEN_DELAY)
      for (const nu of nuclei) {
        if (!nu.alive && simTime >= nu.respawnAt) nu.alive = true;
      }

      const isotope = ISOTOPES[params.isotope];
      const survivors: Neutron[] = [];
      const spawned: Neutron[] = [];

      for (const n of neutrons) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;

        if (n.fission) {
          const target = nuclei[n.targetIdx];
          const dist = Math.hypot(target.x - n.x, target.y - n.y);
          const reached = !target.alive || dist <= HIT_RADIUS;
          if (!reached) {
            survivors.push(n);
            continue;
          }
          if (target.alive) {
            target.alive = false;
            target.respawnAt = simTime + REGEN_DELAY;
            flashes.push({ x: target.x, y: target.y, age: 0 });
            energyMeV += isotope.energyMeV;
            fissionCount++;
            const emitted = poissonSample(isotope.nuBar, rng);
            neutronsEmitted += emitted;
            for (let e = 0; e < emitted; e++) {
              spawnNeutron(spawned, nuclei, target.x, target.y, null, params.k, isotope.nuBar, rng);
            }
          }
          // consumed either way (fission, or wasted on an already-spent nucleus)
        } else if (!outOfBox(n.x, n.y)) {
          survivors.push(n);
        }
        // else: leaked out of the box, lost
      }

      neutrons = survivors.concat(spawned).slice(0, MAX_NEUTRONS);

      // Faint ambient background (spontaneous fission / cosmic rays): one
      // stray neutron every AMBIENT_INTERVAL seconds, born inside the
      // material itself rather than fired in from outside.
      ambientAccum += dt;
      if (ambientAccum >= AMBIENT_INTERVAL) {
        ambientAccum -= AMBIENT_INTERVAL;
        spawnNeutron(neutrons, nuclei, 0.1 + rng() * 0.8, 0.1 + rng() * 0.8, null, params.k, isotope.nuBar, rng);
      }

      sampleAccum += dt;
      if (sampleAccum >= SAMPLE_INTERVAL) {
        sampleAccum -= SAMPLE_INTERVAL;
        history.push(neutrons.length);
        if (history.length > HISTORY_CAP) history.shift();
      }
    },
    fire() {
      const isotope = ISOTOPES[params.isotope];
      for (let i = 0; i < SEED_BURST; i++) {
        const y = 0.15 + rng() * 0.7;
        spawnNeutron(neutrons, nuclei, 0.02, y, 0, params.k, isotope.nuBar, rng);
      }
    },
    reset: doReset,
    setK(k: number) {
      params.k = clampK(k);
    },
    setIsotope(isotope: IsotopeKey) {
      doReset({ isotope });
    },
    get nuclei() {
      return nuclei;
    },
    get neutrons() {
      return neutrons;
    },
    get flashes() {
      return flashes;
    },
    get history() {
      return history;
    },
    get params() {
      return params;
    },
    get energyMeV() {
      return energyMeV;
    },
    get fissionCount() {
      return fissionCount;
    },
    get neutronsEmitted() {
      return neutronsEmitted;
    },
  };
}

// ---------- Rendering ----------

interface ThemeColors {
  dark: boolean;
  blend: 'lighter' | 'source-over';
  glowAlpha: number;
  ink: RGB;
  inkMuted: RGB;
  gold: RGB;
  green: RGB;
}

function themeColors(): ThemeColors {
  const tk = tokens();
  return { dark: tk.dark, blend: tk.blend, glowAlpha: tk.glowAlpha, ink: tk.ink, inkMuted: tk.inkMuted, gold: tk.gold, green: tk.green };
}

const WHITE: RGB = [255, 255, 255];

/** Small cached radial sprite tinted to one color — the fast path for
 *  drawing hundreds of glowing points per frame (nuclei + neutrons). */
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

export interface FissionSnapshot {
  isotope: IsotopeKey;
  k: number;
  regime: Regime;
  energyMeV: number;
  energyJoules: number;
  fissionCount: number;
  neutronCount: number;
}

export interface FissionScene {
  setK(k: number): void;
  setIsotope(isotope: IsotopeKey): void;
  fire(): void;
  reset(): void;
  dispose(): void;
}

export function createFissionScene(
  stage: HTMLCanvasElement,
  chart: HTMLCanvasElement,
  initial: Partial<FissionParams> = {},
  onUpdate?: (snap: FissionSnapshot) => void,
): FissionScene {
  const sctx = stage.getContext('2d')!;
  const cctx = chart.getContext('2d')!;
  const core = createFissionCore(initial);

  let colors = themeColors();
  let goldRamp: Ramp = ramp('gold');
  let emeraldRamp: Ramp = ramp('emerald');
  let phaseRamp: Ramp = ramp('phase');
  let goldNucleusSprite = tintSprite(sampleRamp(goldRamp, 0.62));
  let greenNucleusSprite = tintSprite(sampleRamp(emeraldRamp, 0.62));
  let spentSprite = tintSprite(colors.inkMuted);
  let neutronSprite = tintSprite(mix(colors.ink, WHITE, 0.5));
  let flashSprite = tintSprite(mix(colors.gold, WHITE, 0.55), 64);

  const refreshTheme = () => {
    colors = themeColors();
    goldRamp = ramp('gold');
    emeraldRamp = ramp('emerald');
    phaseRamp = ramp('phase');
    goldNucleusSprite = tintSprite(sampleRamp(goldRamp, 0.62));
    greenNucleusSprite = tintSprite(sampleRamp(emeraldRamp, 0.62));
    spentSprite = tintSprite(colors.inkMuted);
    neutronSprite = tintSprite(mix(colors.ink, WHITE, 0.5));
    flashSprite = tintSprite(mix(colors.gold, WHITE, 0.55), 64);
  };
  const themeObserver = new MutationObserver(refreshTheme);
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
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = stage.width / dpr;
    const h = stage.height / dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fadeTrails(sctx, w, h, colors.dark ? 0.14 : 0.2);

    const padX = w * 0.05;
    const padY = h * 0.07;
    const bx0 = padX;
    const by0 = padY;
    const bw = w - 2 * padX;
    const bh = h - 2 * padY;
    const toX = (x: number) => bx0 + x * bw;
    const toY = (y: number) => by0 + y * bh;

    sctx.save();
    sctx.strokeStyle = rgb(colors.inkMuted, colors.dark ? 0.28 : 0.35);
    sctx.lineWidth = 1;
    sctx.strokeRect(bx0, by0, bw, bh);
    sctx.restore();

    const isotope = ISOTOPES[core.params.isotope];
    const nucleusSprite = isotope.key === 'u235' ? goldNucleusSprite : greenNucleusSprite;

    // spent nuclei — dim, drawn first
    sctx.save();
    sctx.globalCompositeOperation = 'source-over';
    sctx.globalAlpha = colors.dark ? 0.28 : 0.22;
    for (const nu of core.nuclei) {
      if (nu.alive) continue;
      glowSprite(sctx, spentSprite, toX(nu.x), toY(nu.y), 5);
    }
    sctx.restore();

    // live nuclei — the fuel
    sctx.save();
    sctx.globalCompositeOperation = colors.blend;
    sctx.globalAlpha = colors.glowAlpha;
    for (const nu of core.nuclei) {
      if (!nu.alive) continue;
      glowSprite(sctx, nucleusSprite, toX(nu.x), toY(nu.y), 9);
    }
    sctx.restore();

    // fission flashes — expanding, fading bursts of released energy
    sctx.save();
    sctx.globalCompositeOperation = colors.blend;
    for (const f of core.flashes) {
      const t = f.age / FLASH_LIFE;
      const size = 10 + t * 50;
      sctx.globalAlpha = colors.glowAlpha * (1 - t);
      glowSprite(sctx, flashSprite, toX(f.x), toY(f.y), size);
    }
    sctx.restore();

    // neutrons in flight
    sctx.save();
    sctx.globalCompositeOperation = colors.blend;
    sctx.globalAlpha = colors.glowAlpha;
    for (const n of core.neutrons) {
      glowSprite(sctx, neutronSprite, toX(n.x), toY(n.y), 5.5);
    }
    sctx.restore();

    // k / regime tag, tinted by the diverging phase ramp centered on k = 1
    const k = core.params.k;
    const t = Math.min(1, Math.max(0, 0.5 + (k - 1)));
    label(sctx, `${isotope.symbol} · k = ${k.toFixed(2)}`, bx0 + 8, by0 + 16, sampleRamp(phaseRamp, t), {
      size: 12,
      weight: 600,
      alpha: 0.9,
    });
  };

  const drawChart = () => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = chart.width / dpr;
    const h = chart.height / dpr;
    const pad = 6;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cctx.clearRect(0, 0, w, h);

    cctx.save();
    cctx.lineWidth = 1;
    cctx.strokeStyle = rgb(colors.inkMuted, colors.dark ? 0.18 : 0.16);
    cctx.setLineDash([3, 4]);
    cctx.beginPath();
    cctx.moveTo(0, pad);
    cctx.lineTo(w, pad);
    cctx.stroke();
    cctx.setLineDash([]);
    cctx.strokeStyle = rgb(colors.inkMuted, colors.dark ? 0.4 : 0.3);
    cctx.beginPath();
    cctx.moveTo(0, h - pad);
    cctx.lineTo(w, h - pad);
    cctx.stroke();
    cctx.restore();

    const hist = core.history;
    if (hist.length >= 2) {
      const isotope = ISOTOPES[core.params.isotope];
      const curveColor = isotope.key === 'u235' ? colors.gold : colors.green;
      const pts = hist.map((v, i) => ({
        x: (i / (HISTORY_CAP - 1)) * w,
        y: h - pad - Math.min(1, v / POP_CHART_MAX) * (h - 2 * pad),
      }));
      areaFill(cctx, pts, h - pad, curveColor, colors.dark ? 0.26 : 0.16);
      glowStroke(cctx, pts, curveColor, 1.6, colors.dark ? 0.8 : 0.4, colors.dark);
    }
  };

  const emit = () => {
    onUpdate?.({
      isotope: core.params.isotope,
      k: core.params.k,
      regime: regimeFor(core.params.k),
      energyMeV: core.energyMeV,
      energyJoules: mevToJoules(core.energyMeV),
      fissionCount: core.fissionCount,
      neutronCount: core.neutrons.length,
    });
  };

  let rafId = 0;
  let last = performance.now();
  const loop = (now: number) => {
    rafId = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    core.step(dt);
    emit();
    drawStage();
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
    setK(k) {
      core.setK(k);
      emit();
    },
    setIsotope(isotope) {
      core.setIsotope(isotope);
      emit();
    },
    fire() {
      core.fire();
    },
    reset() {
      core.reset();
      emit();
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
