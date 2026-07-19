/**
 * Nuclear fusion & the Coulomb barrier. Two light nuclei repel electrostatically
 * — V(r) = Z₁Z₂e²/(4πε₀r) = 1.44·Z₁Z₂/r[fm] MeV — but at short range the strong
 * force takes over and binds them into a lower-energy nucleus, releasing the
 * mass difference as kinetic energy: E = Δm·c² = Δm·931.494 MeV/u. Classically
 * a pair needs kinetic energy above the barrier peak to fuse; quantum
 * mechanically the Gamow tunneling factor P = exp(−√(E_G/E)) lets it happen at
 * a small fraction of that. All masses are 2022 CODATA/AME atomic-mass-table
 * values (u); the barrier and tunneling formulas are the standard nuclear-
 * astrophysics ones (see e.g. Krane, *Introductory Nuclear Physics*, or Rolfs
 * & Rodney, *Cauldrons in the Cosmos*, for the same expressions).
 */

import {
  tokens,
  ramp,
  sampleRamp,
  rgb,
  mix,
  glowStroke,
  areaFill,
  glowDot,
  label,
  type LabTokens,
  type Ramp,
  type RGB,
} from './viz';

// ——— Fundamental constants ———
export const MEV_PER_U = 931.494; // MeV per unified atomic mass unit (Δm·c²)
const K_B_KEV_PER_KELVIN = 8.617333262e-8; // Boltzmann constant, keV/K
export const KELVIN_PER_KEV = 1 / K_B_KEV_PER_KELVIN; // ≈ 1.16045×10⁷ K per keV
const ALPHA = 1 / 137.035999; // fine-structure constant
const KE_COEFF = 1.439964; // e²/(4πε₀) in MeV·fm, i.e. the "1.44" in V(r) = 1.44 Z₁Z₂/r

// ——— Atomic mass table (u) — the "real numbers" that get audited ———
export const MASS = {
  D: 2.014102, // ²H (deuteron atom)
  T: 3.016049, // ³H (triton atom)
  He3: 3.016029, // ³He atom
  He4: 4.002602, // ⁴He atom
  n: 1.008665, // neutron
  H1: 1.007825, // ¹H atom (protium) — used as "p" so electron bookkeeping stays
  // balanced in reactions written with neutral-atom masses (Z is conserved
  // for D-T and D-D, so the orbital electrons cancel exactly; the same
  // convention correctly folds the two positron-annihilation gammas into the
  // p-p chain's net Q when 4×M(¹H) − M(⁴He) is used, which is the standard
  // textbook shortcut).
  pBare: 1.007276, // bare proton (nuclear) mass — used only for tunneling
  // kinematics (reduced mass), where the moving charge is the bare nucleus.
} as const;

/** Mass defect Δm = Σm(reactants) − Σm(products), in u. */
export function massDefectU(reactants: number[], products: number[]): number {
  const sum = (a: number[]) => a.reduce((s, x) => s + x, 0);
  return sum(reactants) - sum(products);
}

/** E = Δm·c² in MeV, from Δm in u. */
export function energyFromMassDefect(deltaMU: number): number {
  return deltaMU * MEV_PER_U;
}

/** Nuclear "touching" radius R = R₀(A₁^⅓ + A₂^⅓), R₀ = 1.2 fm — the standard
 *  nuclear-radius parameterization; this is where the Coulomb tail meets the
 *  nuclear well and V(r) peaks. */
export function touchingRadiusFm(a1: number, a2: number): number {
  return 1.2 * (Math.cbrt(a1) + Math.cbrt(a2));
}

/** Coulomb potential V(r) = 1.44·Z₁Z₂/r, r in fm, V in MeV. */
export function coulombV(z1: number, z2: number, rFm: number): number {
  return (KE_COEFF * z1 * z2) / Math.max(rFm, 1e-6);
}

/** Barrier peak = V(r) evaluated at the nuclear touching radius. */
export function barrierPeakMeV(z1: number, z2: number, a1: number, a2: number): number {
  return coulombV(z1, z2, touchingRadiusFm(a1, a2));
}

/** Classical turning point: the r at which V(r) = E (only valid for E below
 *  the barrier peak — the caller is responsible for that check). */
export function classicalTurningPointFm(z1: number, z2: number, eMeV: number): number {
  return (KE_COEFF * z1 * z2) / Math.max(eMeV, 1e-9);
}

/** Combined Coulomb + nuclear-well landscape used for the rendered curve: a
 *  1/r Coulomb hill for r ≥ R_n, smoothly value-matched at r = R_n to a
 *  parabolic well of depth `wellDepthMeV` (a representative, schematic light-
 *  nucleus well depth — the qualitative "deep attractive well" shape is what
 *  matters here, not this number, since real well depths run 3–5 orders of
 *  magnitude below the plotted barrier and cannot share a linear scale). */
export function landscapeV(
  rFm: number,
  z1: number,
  z2: number,
  a1: number,
  a2: number,
  wellDepthMeV = 35,
): number {
  const Rn = touchingRadiusFm(a1, a2);
  if (rFm >= Rn) return coulombV(z1, z2, rFm);
  const peak = coulombV(z1, z2, Rn);
  const x = rFm / Rn;
  return -wellDepthMeV + (wellDepthMeV + peak) * x * x;
}

/** Reduced mass μ = m₁m₂/(m₁+m₂), in u. */
export function reducedMassU(m1: number, m2: number): number {
  return (m1 * m2) / (m1 + m2);
}

/** Gamow energy E_G = 2μc²(παZ₁Z₂)², the characteristic scale of Coulomb-
 *  barrier tunneling suppression (Gamow, 1928). E.g. E_G(p–p) ≈ 0.49 MeV,
 *  E_G(D–T) ≈ 1.18 MeV — matches the standard nuclear-astrophysics values. */
export function gamowEnergyMeV(z1: number, z2: number, muU: number): number {
  const muC2 = muU * MEV_PER_U;
  return 2 * muC2 * (Math.PI * ALPHA * z1 * z2) ** 2;
}

/** Gamow tunneling factor P(E) = exp(−√(E_G/E)) — the WKB penetration
 *  probability through the long-range 1/r Coulomb tail, in the thick-barrier
 *  limit R_n ≪ classical turning point (an excellent approximation here). */
export function gamowFactor(eMeV: number, egMeV: number): number {
  return Math.exp(-Math.sqrt(egMeV / Math.max(eMeV, 1e-12)));
}

/** 1 keV of thermal energy corresponds to T = 1000/k_B kelvin. */
export function keVToKelvin(keV: number): number {
  return keV * KELVIN_PER_KEV;
}

/** Format a small positive number in scientific notation with unicode
 *  superscript exponent, e.g. 0.000139 → "1.39×10⁻⁴". */
const SUP: Record<string, string> = {
  '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};
export function formatScientific(x: number, sig = 2): string {
  if (!(x > 0)) return '0';
  const exp = Math.floor(Math.log10(x));
  const mant = x / 10 ** exp;
  const mantStr = mant.toFixed(sig);
  const expStr = String(exp).split('').map((c) => SUP[c] ?? c).join('');
  return `${mantStr}×10${expStr}`;
}

// ——— Reactions ———

export type ReactionKey = 'dt' | 'dd' | 'pp';

export interface FusionBranch {
  /** relative branching weight (sums to 1 within a reaction) */
  weight: number;
  productsLabel: string;
  qMeV: number;
  deltaMU: number;
  /** kinetic-energy share of each product (two-body breakup at rest:
   *  KEᵢ = Q·m_other/(m1+m2)), used for the ejection-speed split and, for
   *  D–T, pinned to the textbook 3.5 / 14.1 MeV figures. */
  keProduct1: number;
  keProduct2: number;
}

export interface FusionReaction {
  key: ReactionKey;
  reactantLabel: string;
  z1: number;
  a1: number;
  label1: string;
  z2: number;
  a2: number;
  label2: string;
  branches: FusionBranch[];
  barrierMeV: number;
  touchRadiusFm: number;
  gamowEMeV: number;
}

function twoBodySplit(qMeV: number, m1: number, m2: number): [number, number] {
  return [(qMeV * m2) / (m1 + m2), (qMeV * m1) / (m1 + m2)];
}

function makeReaction(
  key: ReactionKey,
  reactantLabel: string,
  z1: number,
  a1: number,
  label1: string,
  z2: number,
  a2: number,
  label2: string,
  branches: FusionBranch[],
  muU: number,
): FusionReaction {
  return {
    key,
    reactantLabel,
    z1,
    a1,
    label1,
    z2,
    a2,
    label2,
    branches,
    barrierMeV: barrierPeakMeV(z1, z2, a1, a2),
    touchRadiusFm: touchingRadiusFm(a1, a2),
    gamowEMeV: gamowEnergyMeV(z1, z2, muU),
  };
}

const dtDeltaM = massDefectU([MASS.D, MASS.T], [MASS.He4, MASS.n]);
const dtQ = energyFromMassDefect(dtDeltaM); // 17.59 MeV

const ddHe3DeltaM = massDefectU([MASS.D, MASS.D], [MASS.He3, MASS.n]);
const ddHe3Q = energyFromMassDefect(ddHe3DeltaM); // 3.27 MeV
const [ddHe3KeHe3, ddHe3KeN] = twoBodySplit(ddHe3Q, MASS.He3, MASS.n);

const ddTpDeltaM = massDefectU([MASS.D, MASS.D], [MASS.T, MASS.H1]);
const ddTpQ = energyFromMassDefect(ddTpDeltaM); // 4.03 MeV
const [ddTpKeT, ddTpKeP] = twoBodySplit(ddTpQ, MASS.T, MASS.H1);

const ppDeltaM = massDefectU([MASS.H1, MASS.H1, MASS.H1, MASS.H1], [MASS.He4]);
const ppQ = energyFromMassDefect(ppDeltaM); // 26.73 MeV

export const REACTIONS: Record<ReactionKey, FusionReaction> = {
  dt: makeReaction(
    'dt', '²H + ³H', 1, 2, '²H', 1, 3, '³H',
    [
      {
        weight: 1,
        productsLabel: '⁴He + n',
        qMeV: dtQ,
        deltaMU: dtDeltaM,
        // Pinned to the standard textbook split (α: 3.5 MeV, n: 14.1 MeV);
        // the exact two-body-kinematics split (3.54 / 14.05 MeV) agrees to
        // within rounding.
        keProduct1: 3.5,
        keProduct2: 14.1,
      },
    ],
    reducedMassU(MASS.D, MASS.T),
  ),
  dd: makeReaction(
    'dd', '²H + ²H', 1, 2, '²H', 1, 2, '²H',
    [
      {
        weight: 0.5,
        productsLabel: '³He + n',
        qMeV: ddHe3Q,
        deltaMU: ddHe3DeltaM,
        keProduct1: ddHe3KeHe3,
        keProduct2: ddHe3KeN,
      },
      {
        weight: 0.5,
        productsLabel: '³H + p',
        qMeV: ddTpQ,
        deltaMU: ddTpDeltaM,
        keProduct1: ddTpKeT,
        keProduct2: ddTpKeP,
      },
    ],
    reducedMassU(MASS.D, MASS.D),
  ),
  pp: makeReaction(
    'pp', '4 ¹H', 1, 1, '¹H', 1, 1, '¹H',
    [
      {
        weight: 1,
        productsLabel: '⁴He + 2e⁺ + 2ν',
        qMeV: ppQ,
        deltaMU: ppDeltaM,
        keProduct1: ppQ / 2,
        keProduct2: ppQ / 2,
      },
    ],
    reducedMassU(MASS.pBare, MASS.pBare),
  ),
};

function pickBranch(reaction: FusionReaction): FusionBranch {
  const r = Math.random();
  let acc = 0;
  for (const b of reaction.branches) {
    acc += b.weight;
    if (r <= acc) return b;
  }
  return reaction.branches[reaction.branches.length - 1];
}

// ——— Scene ———

/** Dramatization multiplier ONLY: real per-encounter tunneling probabilities
 *  at reactor/solar temperatures are ~10⁻⁵–10⁻¹⁴ (see gamowFactor), far too
 *  rare to ever animate one attempt per encounter at 60fps. This stands in
 *  for "many collisions happen per visible pulse in a real dense plasma" so
 *  successes become visible at reactor-like T. It never touches the P
 *  readout, which always shows the true single-encounter Gamow factor. */
const ATTEMPTS_PER_PULSE = 6000;

/** Illustrative-only extra suppression for p–p: tunneling through the
 *  Coulomb barrier is merely the first hurdle. The actual capture step,
 *  p + p → d + e⁺ + ν, proceeds through the WEAK force (a proton turning
 *  into a neutron), which is intrinsically ~20 orders of magnitude rarer
 *  than a strong-force capture. That extra factor is not modeled precisely
 *  here (the real S-factor is ~10⁻⁴⁶ MeV·barn) — this constant only exists
 *  to keep the p–p chip's animation honest: visibly, essentially never. */
const PP_WEAK_ILLUSTRATIVE = 1e-9;

const R_MIN_FM = 1;
const R_MAX_FM = 2000;
const LOG_MIN = Math.log10(R_MIN_FM);
const LOG_MAX = Math.log10(R_MAX_FM);
const TRAVEL_SECONDS = 1.9; // time for u:0→1 at "full speed"
const FUSE_HOLD_SECONDS = 1.1;

const clamp = (x: number, lo: number, hi: number) => (x < lo ? lo : x > hi ? hi : x);

/** u ∈ [0,1]: 0 = far apart (R_MAX), 1 = fused (R_MIN). Log-spaced so
 *  constant du/dt reads as constant pixel speed on the log-x plot. */
const uOfR = (rFm: number) => (LOG_MAX - Math.log10(clamp(rFm, R_MIN_FM, R_MAX_FM))) / (LOG_MAX - LOG_MIN);
const rOfU = (u: number) => 10 ** (LOG_MAX - clamp(u, 0, 1) * (LOG_MAX - LOG_MIN));

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: RGB;
  r: number;
}

interface FloatText {
  lines: string[];
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

export interface FusionParams {
  reaction: ReactionKey;
  keVTemp: number;
}

export interface FusionUpdate {
  barrierMeV: number;
  keMeV: number;
  pTunnelRaw: number;
  overBarrier: boolean;
  fusions: number;
  kelvin: number;
}

export interface FusionScene {
  setParams(p: Partial<FusionParams>): void;
  dispose(): void;
}

export function createFusionScene(
  canvas: HTMLCanvasElement,
  initial: FusionParams,
  onUpdate?: (u: FusionUpdate) => void,
): FusionScene {
  const ctx = canvas.getContext('2d')!;
  let params: FusionParams = { ...initial };

  let tk: LabTokens = tokens();
  let goldRamp: Ramp = ramp('gold');
  let emeraldRamp: Ramp = ramp('emerald');
  const refreshTheme = () => {
    tk = tokens();
    goldRamp = ramp('gold');
    emeraldRamp = ramp('emerald');
  };
  const themeObserver = new MutationObserver(refreshTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  window.addEventListener('resize', resize);
  resize();

  // ——— Attempt-cycle state ———
  let u = 0;
  let dir: 1 | -1 = 1;
  let overBarrier = false;
  let willTunnel = false;
  let uTurn = 0;
  let uAtRn = 0;
  let branch: FusionBranch = REACTIONS[params.reaction].branches[0];
  let phase: 'travel' | 'fuseHold' = 'travel';
  let fuseTimer = 0;
  let fusions = 0;
  let lastPTunnelRaw = 0;
  let lastFuseY = 0;

  const sparks: Spark[] = [];
  let floatText: FloatText | null = null;

  const currentKeMeV = () => params.keVTemp / 1000;

  const beginLeg = () => {
    const reaction = REACTIONS[params.reaction];
    const keMeV = currentKeMeV();
    overBarrier = keMeV >= reaction.barrierMeV;
    branch = pickBranch(reaction);
    if (!overBarrier) {
      const rTurn = classicalTurningPointFm(reaction.z1, reaction.z2, keMeV);
      uTurn = uOfR(rTurn);
      uAtRn = uOfR(reaction.touchRadiusFm);
      const pRaw = gamowFactor(keMeV, reaction.gamowEMeV);
      lastPTunnelRaw = pRaw;
      let pAnim = -Math.expm1(-ATTEMPTS_PER_PULSE * pRaw);
      if (reaction.key === 'pp') pAnim *= PP_WEAK_ILLUSTRATIVE;
      pAnim = clamp(pAnim, 0, 0.97);
      willTunnel = Math.random() < pAnim;
    } else {
      lastPTunnelRaw = 1;
      willTunnel = false;
      uTurn = 1;
      uAtRn = uOfR(reaction.touchRadiusFm);
    }
  };
  beginLeg();

  const spawnFuseEffects = (cx: number, cy: number, h: number) => {
    const reaction = REACTIONS[params.reaction];
    const goldC = sampleRamp(goldRamp, 0.82);
    const greenC = sampleRamp(emeraldRamp, 0.82);
    // spark burst
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + Math.random() * 0.3;
      const speed = 60 + Math.random() * 90;
      sparks.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed * 0.6,
        life: 0,
        maxLife: 0.55 + Math.random() * 0.35,
        color: i % 2 === 0 ? goldC : greenC,
        r: 1.4 + Math.random() * 1.6,
      });
    }
    // two product nuclei, speed split by their KE share (lighter/faster one travels farther)
    const totalKe = branch.keProduct1 + branch.keProduct2;
    const v1 = 70 + 150 * (branch.keProduct1 / totalKe);
    const v2 = 70 + 150 * (branch.keProduct2 / totalKe);
    sparks.push({ x: cx, y: cy, vx: -v1, vy: -18, life: 0, maxLife: 1, color: goldC, r: 4.2 });
    sparks.push({ x: cx, y: cy, vx: v2, vy: 14, life: 0, maxLife: 1, color: greenC, r: 3 });

    floatText = {
      lines: [
        `+${branch.qMeV.toFixed(2)} MeV`,
        `Δm = ${branch.deltaMU.toFixed(6)} u × ${MEV_PER_U} MeV/u`,
        reaction.reactantLabel + ' → ' + branch.productsLabel,
      ],
      x: cx,
      y: cy - h * 0.06,
      life: 0,
      maxLife: 1.9,
    };
  };

  let lastT = performance.now();
  let rafId = 0;

  const draw = (nowMs: number) => {
    const dt = Math.min(0.05, (nowMs - lastT) / 1000);
    lastT = nowMs;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const reaction = REACTIONS[params.reaction];
    const keMeV = currentKeMeV();
    const cx = w / 2;
    const baseline = h * 0.66;
    const posScale = (h * 0.34) / 0.78; // px per MeV above baseline (0.78 MeV headroom clears the tallest
    // barrier, p–p at 0.60 MeV, plus the slider's classical-crossing overshoot)
    const wellPixelMax = h * 0.22;
    const wellK = posScale / wellPixelMax;
    const yFor = (V: number) => (V >= 0 ? baseline - V * posScale : baseline + wellPixelMax * (1 - Math.exp(V * wellK)));
    const halfW = w * 0.46;
    // pixel distance from center for travel-parameter u ∈ [0,1]: u=0 (r=R_MAX,
    // far apart) sits at the stage edge, u=1 (r=R_MIN, fused) sits at center.
    const xFor = (u01: number) => (1 - clamp(u01, 0, 1)) * halfW;

    const fuseY = yFor(landscapeV(R_MIN_FM, reaction.z1, reaction.z2, reaction.a1, reaction.a2));
    const triggerFuse = () => {
      u = 1;
      phase = 'fuseHold';
      fuseTimer = 0;
      lastFuseY = fuseY;
      spawnFuseEffects(cx, fuseY, h);
      fusions++;
    };

    // ——— advance the attempt-cycle state machine ———
    if (phase === 'travel') {
      u += (dt / TRAVEL_SECONDS) * dir;
      if (dir === 1) {
        if (overBarrier) {
          if (u >= 1) triggerFuse();
        } else if (willTunnel) {
          if (u >= 1) triggerFuse();
        } else if (u >= uTurn) {
          u = uTurn;
          dir = -1;
        }
      } else if (u <= 0) {
        u = 0;
        dir = 1;
        beginLeg();
      }
    } else if (phase === 'fuseHold') {
      fuseTimer += dt;
      if (fuseTimer >= FUSE_HOLD_SECONDS) {
        phase = 'travel';
        u = 0;
        dir = 1;
        beginLeg();
      }
    }

    // ——— height (potential-energy value, MeV) each nucleus rides ———
    const heightMeVAt = (uu: number) => {
      if (overBarrier || !willTunnel) return landscapeV(rOfU(uu), reaction.z1, reaction.z2, reaction.a1, reaction.a2);
      if (uu < uTurn) return landscapeV(rOfU(uu), reaction.z1, reaction.z2, reaction.a1, reaction.a2);
      if (uu < uAtRn) return keMeV; // tunneling: flat pass through the classically-forbidden region
      return landscapeV(rOfU(uu), reaction.z1, reaction.z2, reaction.a1, reaction.a2);
    };
    const inShimmer = phase === 'travel' && !overBarrier && willTunnel && dir === 1 && u >= uTurn && u < uAtRn;

    // ——— landscape curve (mirrored volcano: two Coulomb hills + shared well) ———
    const SAMPLES = 160;
    const leftPts: { x: number; y: number }[] = new Array(SAMPLES + 1);
    const rightPts: { x: number; y: number }[] = new Array(SAMPLES + 1);
    for (let i = 0; i <= SAMPLES; i++) {
      const uu = i / SAMPLES;
      const V = landscapeV(rOfU(uu), reaction.z1, reaction.z2, reaction.a1, reaction.a2);
      const y = yFor(V);
      const off = xFor(uu);
      leftPts[i] = { x: cx - off, y };
      rightPts[SAMPLES - i] = { x: cx + off, y };
    }
    const curvePts = [...leftPts, ...rightPts];

    const floorY = yFor(-35);
    areaFill(ctx, curvePts, floorY, sampleRamp(goldRamp, 0.5), tk.dark ? 0.16 : 0.1);

    // barrier-crest shimmer highlight
    const shimmerT = 0.5 + 0.5 * Math.sin(nowMs * 0.018);
    if (inShimmer) {
      const peakY = yFor(reaction.barrierMeV);
      const gx0 = cx - xFor(uAtRn);
      const gx1 = cx + xFor(uAtRn);
      ctx.save();
      ctx.globalCompositeOperation = tk.blend;
      ctx.globalAlpha = tk.glowAlpha * (0.35 + 0.45 * shimmerT);
      const grad = ctx.createLinearGradient(0, peakY - 18, 0, peakY + 24);
      grad.addColorStop(0, rgb(sampleRamp(goldRamp, 0.9), 0));
      grad.addColorStop(0.5, rgb(sampleRamp(goldRamp, 0.9), 0.85));
      grad.addColorStop(1, rgb(sampleRamp(goldRamp, 0.9), 0));
      ctx.fillStyle = grad;
      ctx.fillRect(gx0, peakY - 18, gx1 - gx0, 42);
      ctx.restore();
    }

    glowStroke(ctx, curvePts, mix(tk.inkMuted, tk.gold, 0.35), 1.6, tk.dark ? 0.85 : 0.45, tk.dark);

    // barrier peak + KE reference lines
    const peakY = yFor(reaction.barrierMeV);
    ctx.save();
    ctx.strokeStyle = rgb(tk.gold, tk.dark ? 0.35 : 0.45);
    ctx.setLineDash([3, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, peakY);
    ctx.lineTo(w, peakY);
    ctx.stroke();
    ctx.restore();
    label(ctx, `V₀ = ${reaction.barrierMeV.toFixed(2)} MeV`, w - 8, peakY - 6, tk.gold, {
      size: 10,
      align: 'right',
      alpha: 0.75,
    });

    const keY = yFor(keMeV);
    ctx.save();
    ctx.strokeStyle = rgb(tk.inkMuted, tk.dark ? 0.45 : 0.55);
    ctx.setLineDash([2, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, keY);
    ctx.lineTo(w, keY);
    ctx.stroke();
    ctx.restore();
    label(ctx, 'KE', 8, keY - 6, tk.inkMuted, { size: 10, alpha: 0.8 });

    // ——— the two traveling nuclei ———
    ctx.save();
    ctx.globalCompositeOperation = tk.blend;
    const leftColor = sampleRamp(goldRamp, 0.75);
    const rightColor = sampleRamp(emeraldRamp, 0.75);
    if (phase === 'travel') {
      const flicker = inShimmer ? 0.5 + 0.5 * Math.sin(nowMs * 0.05) : 1;
      const hy = yFor(heightMeVAt(u));
      const lx = cx - xFor(u);
      const rx = cx + xFor(u);
      glowDot(ctx, lx, hy, 4.4, leftColor, tk.glowAlpha * flicker);
      glowDot(ctx, rx, hy, 4.4, rightColor, tk.glowAlpha * flicker);
      label(ctx, reaction.label1, lx, hy - 12, leftColor, { size: 10, align: 'center', alpha: 0.85 * flicker });
      label(ctx, reaction.label2, rx, hy - 12, rightColor, { size: 10, align: 'center', alpha: 0.85 * flicker });
    }
    ctx.restore();

    // ——— sparks / ejected products ———
    ctx.save();
    ctx.globalCompositeOperation = tk.blend;
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life += dt;
      if (s.life >= s.maxLife) {
        sparks.splice(i, 1);
        continue;
      }
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 40 * dt;
      const a = 1 - s.life / s.maxLife;
      glowDot(ctx, s.x, s.y, s.r, s.color, tk.glowAlpha * a);
    }
    ctx.restore();

    // ——— fusion flash ———
    if (phase === 'fuseHold') {
      const flashA = clamp(1 - fuseTimer / 0.4, 0, 1);
      if (flashA > 0) {
        ctx.save();
        ctx.globalCompositeOperation = tk.blend;
        glowDot(ctx, cx, lastFuseY, 22, mix(tk.gold, tk.green, 0.5), tk.glowAlpha * flashA);
        ctx.restore();
      }
    }

    // ——— floating "+Q MeV" breakdown text ———
    if (floatText) {
      floatText.life += dt;
      const t = floatText.life / floatText.maxLife;
      if (t >= 1) {
        floatText = null;
      } else {
        const rise = 26 * t;
        const alpha = t < 0.15 ? t / 0.15 : t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
        label(ctx, floatText.lines[0], floatText.x, floatText.y - rise, tk.ink, {
          size: 17,
          weight: 600,
          align: 'center',
          alpha: alpha * 0.95,
        });
        label(ctx, floatText.lines[1], floatText.x, floatText.y - rise + 17, tk.inkMuted, {
          size: 10.5,
          align: 'center',
          alpha: alpha * 0.85,
        });
        label(ctx, floatText.lines[2], floatText.x, floatText.y - rise + 31, tk.inkMuted, {
          size: 10.5,
          align: 'center',
          alpha: alpha * 0.7,
        });
      }
    }

    // baseline hairline
    ctx.strokeStyle = tk.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, baseline);
    ctx.lineTo(w, baseline);
    ctx.stroke();

    onUpdate?.({
      barrierMeV: reaction.barrierMeV,
      keMeV,
      pTunnelRaw: lastPTunnelRaw,
      overBarrier,
      fusions,
      kelvin: keVToKelvin(params.keVTemp),
    });
  };

  const loop = (nowMs: number) => {
    rafId = requestAnimationFrame(loop);
    draw(nowMs);
  };
  const onVisibility = () => {
    cancelAnimationFrame(rafId);
    if (!document.hidden) {
      lastT = performance.now();
      rafId = requestAnimationFrame(loop);
    }
  };
  document.addEventListener('visibilitychange', onVisibility);
  rafId = requestAnimationFrame(loop);

  return {
    setParams(p) {
      const reactionChanged = p.reaction !== undefined && p.reaction !== params.reaction;
      params = { ...params, ...p };
      if (reactionChanged) {
        u = 0;
        dir = 1;
        phase = 'travel';
        sparks.length = 0;
        floatText = null;
        beginLeg();
      }
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
