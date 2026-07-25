/**
 * Venturi-meter physics — the pure core behind /lab/bernoulli.
 *
 * DOM-free on purpose so the numbers can be checked headless
 * (scripts/bernoulli-test.mjs) instead of being trusted because they look right
 * on a canvas.
 */

export const RHO = 998; // kg/m³ — water at 20 °C
export const GRAV = 9.80665; // m/s²
export const D1 = 0.1; // m — inlet bore (100 mm)
export const P_ATM = 101325; // Pa
export const P_VAP = 2339; // Pa — vapour pressure of water at 20 °C
/** m — static head held constant at the inlet tap (a pressure-regulated supply,
 *  not a tank: a tank would fix the TOTAL head instead). */
export const H_INLET = 1.5;
/**
 * Head loss taken as a fixed fraction of the throat velocity head. This is a
 * one-parameter stand-in for friction, not a friction model: it carries no
 * Reynolds dependence and no geometry dependence, and the value is CHOSEN so the
 * resulting discharge coefficient lands in the ballpark a real classical Venturi
 * shows (~0.984 for β = 0.3–0.75). Because the loss scales as v₂² exactly like
 * Δp does, C_d comes out independent of flow rate by construction; over the
 * β slider it runs 0.986 → 0.960. Treat the agreement as order-of-magnitude.
 */
export const LOSS_K = 0.12;
/**
 * Static head at which water at 20 °C flashes to vapour (gauge, m of water):
 * ≈ −10.1 m. Bernoulli happily predicts pressures below this — the equation has
 * no idea liquids exist — but water cannot follow it. At this floor a vapour
 * cavity opens and pins the throat pressure at p_vap, so the readable Δp
 * saturates and the meter stops tracking flow (see `summarize`).
 */
export const HEAD_VAP = (P_VAP - P_ATM) / (RHO * GRAV);

/** Pressure-tap stations: inlet, throat, recovery. */
export const TAP_U = [0.15, 0.45, 0.97] as const;

export const area = (d: number) => (Math.PI * d * d) / 4;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Duct diameter as a fraction of the inlet bore, for u ∈ [0,1] along the meter:
 * straight inlet → short steep contraction → throat → long gentle diffuser,
 * shaped after a classical Venturi. Note the total loss magnitude is set by
 * LOSS_K alone, so unlike a real meter the *amount* recovered does not depend on
 * how gentle the diffuser is — only on where along it the loss lands.
 * Domain is u ∈ [0,1]; values outside are treated as the straight inlet.
 */
export function ductShape(u: number, beta: number): number {
  if (u < 0.3) return 1;
  if (u < 0.4) return 1 + (beta - 1) * smoothstep(0.3, 0.4, u);
  if (u < 0.5) return beta;
  if (u < 0.88) return beta + (1 - beta) * smoothstep(0.5, 0.88, u);
  return 1;
}

/**
 * Fraction of the total friction loss dissipated upstream of u (0 → 1).
 *
 * A quarter in the contraction, three quarters in the diffuser — where the
 * decelerating boundary layer does the real damage. Both windows are tied to the
 * geometry rather than picked by hand:
 *
 * - the contraction share is spent exactly across ductShape's contraction, so
 *   the constant-area throat is loss-free and the throat tap really does sit at
 *   the pressure minimum;
 * - the diffuser share is spent in proportion to the dynamic head the expansion
 *   destroys, not uniformly along x. Spread uniformly it out-runs the recovery
 *   near the exit at small β and the static-pressure line visibly sags right
 *   where the piece says pressure recovers. Tied to the dynamic head it cannot,
 *   for any β the slider allows.
 */
export function lossFraction(u: number, beta: number): number {
  const contraction = 0.25 * smoothstep(0.3, 0.4, u);
  const b4 = Math.pow(beta, -4);
  const share = u <= 0.5 || b4 === 1 ? 0 : (Math.pow(ductShape(u, beta), -4) - b4) / (1 - b4);
  return contraction + 0.75 * Math.min(1, Math.max(0, share));
}

export interface Station {
  u: number;
  d: number; // m
  v: number; // m/s
  total: number; // total head, m of water (the energy grade line)
  head: number; // static head, m of water (the hydraulic grade line)
  pGauge: number; // Pa, relative to atmosphere
  pAbs: number; // Pa, absolute
}

/**
 * Full state at one station. `q` is the volumetric flow in m³/s; `lossy` adds
 * the friction loss of a real meter (the ideal case keeps the total head flat).
 */
export function stationAt(u: number, beta: number, q: number, lossy: boolean): Station {
  const d = ductShape(u, beta) * D1;
  const v = q / area(d);
  const v1 = q / area(D1);
  const v2 = q / area(beta * D1);
  const h0 = H_INLET + (v1 * v1) / (2 * GRAV);
  const loss = lossy ? LOSS_K * ((v2 * v2) / (2 * GRAV)) * lossFraction(u, beta) : 0;
  const total = h0 - loss;
  const head = total - (v * v) / (2 * GRAV);
  const pGauge = RHO * GRAV * head;
  return { u, d, v, total, head, pGauge, pAbs: P_ATM + pGauge };
}

export interface FlowSummary {
  v1: number; // m/s at the inlet
  v2: number; // m/s at the throat
  dp: number; // Pa the two taps can actually read (saturates once cavitating)
  dpIdeal: number; // Pa the ideal equation predicts, cavitation or not
  p2Gauge: number; // Pa at the throat that Bernoulli predicts (gauge)
  p2Actual: number; // Pa the liquid can actually reach — floored at p_vap (gauge)
  cavitating: boolean;
  h0: number; // total head at the inlet, m
  qFromDp: number; // m³/s inferred from the READABLE Δp by the meter equation
  cd: number; // discharge coefficient = q / qFromDp (NaN if β makes it undefined)
}

/**
 * What an operator standing at the meter would read.
 *
 * Two Δp values, and the difference matters. `dpIdeal` is what Bernoulli
 * predicts. `dp` is what the two pressure taps can physically show: once the
 * throat has bottomed out on the vapour pressure the tap there cannot read any
 * lower, so Δp saturates no matter how hard the throat is squeezed. Inverting
 * the saturated Δp is what a real instrument does — and that is exactly why a
 * cavitating Venturi stops tracking flow.
 *
 * `qFromDp` inverts Q = A₂√(2Δp / ρ(1−β⁴)); comparing it with the true Q gives
 * the discharge coefficient. See LOSS_K for how much weight that number carries.
 */
export function summarize(beta: number, q: number, lossy: boolean): FlowSummary {
  const inlet = stationAt(TAP_U[0], beta, q, lossy);
  const throat = stationAt(TAP_U[1], beta, q, lossy);
  const p2Actual = Math.max(throat.pGauge, P_VAP - P_ATM);
  const dpIdeal = inlet.pGauge - throat.pGauge;
  const dp = inlet.pGauge - p2Actual;
  const a2 = area(beta * D1);
  // β → 1 leaves the meter equation undefined (no area change to measure with);
  // report that honestly rather than falling back to a plausible-looking 1.
  const denom = RHO * (1 - beta ** 4);
  const qFromDp = denom > 0 ? a2 * Math.sqrt(Math.max(0, (2 * dp) / denom)) : NaN;
  return {
    v1: inlet.v,
    v2: throat.v,
    dp,
    dpIdeal,
    p2Gauge: throat.pGauge,
    p2Actual,
    cavitating: throat.pAbs <= P_VAP,
    h0: inlet.total,
    qFromDp,
    cd: qFromDp > 0 ? q / qFromDp : NaN,
  };
}

