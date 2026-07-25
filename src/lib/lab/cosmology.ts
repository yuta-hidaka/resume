/**
 * FLRW cosmology — the Friedmann equation, solved for real numbers.
 *
 * One equation sets the whole history of the universe. For a homogeneous,
 * isotropic universe with scale factor a (normalised to a = 1 today),
 *
 *     (ȧ/a)² = H₀² [ Ω_r a⁻⁴ + Ω_m a⁻³ + Ω_k a⁻² + Ω_Λ ]
 *
 * with Ω_k ≡ 1 − Ω_r − Ω_m − Ω_Λ fixed by that normalisation. Each term dilutes
 * at its own rate — radiation fastest, then matter, then curvature, while Λ never
 * dilutes at all — so which one dominates changes with time, and that ordering is
 * the history of the universe.
 *
 * Dial in the measured values and the age comes out at 13.8 Gyr. That is the
 * point of the piece, so this module is DOM-free and checked headless against
 * closed-form solutions (scripts/cosmology-test.mjs).
 */

/** 1/H₀ in Gyr for h = 1, i.e. the Hubble time is HUBBLE_GYR / h. */
export const HUBBLE_GYR = 9.77792;
/**
 * Radiation today as Ω_r h², which is what is actually measured — the CMB
 * temperature fixes the photon density, and three species of neutrino are added
 * as relativistic. Ω_r itself therefore scales as h⁻², so it MUST be derived from
 * H₀ rather than frozen: pinning Ω_r = 9.2e-5 while H₀ ranges over 55…85 leaves
 * the matter–radiation equality redshift wrong by up to 60 %.
 *
 * Caveat the copy owns: neutrinos are non-relativistic today, so this is the
 * *effective* early-time radiation extrapolated back as a⁻⁴ from a = 1 — standard
 * practice, and accurate where it matters (a ≪ 1).
 */
export const OMEGA_R_H2 = 4.15e-5;

/** Planck 2018 TT,TE,EE+lowE+lensing+BAO. */
export const PLANCK = { h0: 67.4, om: 0.315, ol: 0.685 } as const;

export interface Cosmology {
  h0: number; // km/s/Mpc
  om: number; // Ω_matter
  ol: number; // Ω_Λ
  orad: number; // Ω_radiation
}

export const radiationFor = (h0: number): number => OMEGA_R_H2 / (h0 / 100) ** 2;

export const cosmology = (
  h0: number,
  om: number,
  ol: number,
  orad: number = radiationFor(h0),
): Cosmology => ({ h0, om, ol, orad });

/** Curvature is not a free parameter — a = 1 today forces it to close the sum. */
export const omegaK = (c: Cosmology): number => 1 - c.om - c.ol - c.orad;

/** Hubble time in Gyr. */
export const hubbleGyr = (c: Cosmology): number => HUBBLE_GYR / (c.h0 / 100);

/** E²(a) = (H/H₀)². Negative means the expansion has turned around there. */
export function eSquared(c: Cosmology, a: number): number {
  const k = omegaK(c);
  return c.orad / a ** 4 + c.om / a ** 3 + k / a ** 2 + c.ol;
}

/** ä/a in units of H₀². Curvature does not appear — only what gravitates. */
export function accelOverA(c: Cosmology, a: number): number {
  return -0.5 * (c.om / a ** 3) - c.orad / a ** 4 + c.ol;
}

/** Deceleration parameter today, q₀ = −ä a/ȧ². Negative = accelerating. */
export const q0 = (c: Cosmology): number => 0.5 * c.om + c.orad - c.ol;

/** Scale factor where matter and Λ have equal density (null if either is absent). */
export function matterLambdaEquality(c: Cosmology): number | null {
  if (c.om <= 0 || c.ol <= 0) return null;
  return Math.cbrt(c.om / c.ol);
}

/** Scale factor of matter–radiation equality (null if either is absent). */
export function matterRadiationEquality(c: Cosmology): number | null {
  if (c.om <= 0 || c.orad <= 0) return null;
  return c.orad / c.om;
}

export const redshiftOf = (a: number): number => 1 / a - 1;

/**
 * Does a = 0 lie a finite time in the past?
 *
 * ∫₀ da/(aE) converges only if something in E blows up faster than 1/a as a → 0.
 * Radiation (a⁻²) and matter (a⁻³ᐟ²) both do; open curvature gives E ~ √Ω_k/a,
 * which is exactly enough. With none of those, E tends to the constant √Ω_Λ and
 * the integral diverges logarithmically — a de Sitter universe has no beginning,
 * it merely gets arbitrarily small. Closed curvature with no matter makes E²
 * negative at small a: the universe bounced rather than began.
 *
 * Deciding this analytically matters: a numeric cutoff on the divergent integral
 * would silently report de Sitter as ~16 Hubble times old.
 */
export function hasBigBang(c: Cosmology): boolean {
  const k = omegaK(c);
  if (!(c.orad > 0 || c.om > 0 || k > 0)) return false;
  for (let i = 1; i <= 2000; i++) {
    if (eSquared(c, i / 2000) <= 0) return false; // turning point below today
  }
  return true;
}

/**
 * Age in Hubble times: t₀ = ∫₀¹ da / (a E(a)).
 *
 * The integrand looks singular at a = 0 but is not — whichever term dominates
 * there (radiation or matter) makes it vanish like a or √a. Substituting a = x²
 * absorbs the √a so plain Simpson converges fast, and it is exact for the pure
 * matter case rather than merely close.
 *
 * Returns Infinity when there is no Big Bang: either the integral diverges
 * (Λ-dominated, a → 0 only as t → −∞) or E² vanishes at some a > 0, meaning the
 * universe bounced instead of beginning.
 */
export function ageHubble(c: Cosmology, steps = 4000): number {
  if (!hasBigBang(c)) return Infinity;
  // t = ∫₀¹ da/(aE) with a = x²  →  ∫₀¹ 2 dx / (x E(x²))
  const f = (x: number) => {
    if (x <= 0) return 0;
    const a = x * x;
    const e2 = eSquared(c, a);
    if (e2 <= 0) return Infinity;
    return 2 / (x * Math.sqrt(e2));
  };
  const n = steps % 2 === 0 ? steps : steps + 1;
  const h = 1 / n;
  let sum = f(0) + f(1);
  for (let i = 1; i < n; i++) sum += (i % 2 ? 4 : 2) * f(i * h);
  const t = (h / 3) * sum;
  return Number.isFinite(t) ? t : Infinity;
}

/** Age in Gyr. Infinity when the universe had no beginning. */
export const ageGyr = (c: Cosmology): number => ageHubble(c) * hubbleGyr(c);

/**
 * The scale factor at which expansion turns around, or null if it never does.
 *
 * Decided ANALYTICALLY, by looking for a root of E²(a) above a = 1, because the
 * fate of a universe cannot be read off a finite integration window: a closed
 * matter universe with Ω_m = 1.5 does not turn around for another ~96 Gyr, and a
 * 45 Gyr plot would call it "expanding forever" while it is doomed.
 *
 * A positive Ω_Λ makes E² → Ω_Λ > 0 at large a, so the only way to recollapse is
 * for E² to dip through zero at some intermediate a — hence a scan rather than a
 * limit argument.
 */
export function turnaround(c: Cosmology): number | null {
  if (eSquared(c, 1) <= 0) return null; // not expanding today; nothing to turn
  // Log-spaced scan to a generous ceiling: a = 1 … 1e6.
  const steps = 3000;
  let prevA = 1;
  for (let i = 1; i <= steps; i++) {
    const a = Math.pow(10, (6 * i) / steps);
    if (eSquared(c, a) <= 0) {
      // bisect for the root
      let lo = prevA;
      let hi = a;
      for (let k = 0; k < 80; k++) {
        const mid = 0.5 * (lo + hi);
        if (eSquared(c, mid) > 0) lo = mid;
        else hi = mid;
      }
      return 0.5 * (lo + hi);
    }
    prevA = a;
  }
  return null;
}

/**
 * Scale factor at which the expansion stops decelerating (ä = 0), or null if it
 * never does. Any universe with Ω_Λ > 0 that does not recollapse ends up
 * Λ-dominated and accelerates — so "decelerating" read off today's q₀ is a claim
 * about now, not about the future the readout is labelled with.
 */
export function accelerationOnset(c: Cosmology): number | null {
  if (c.ol <= 0) return null;
  if (accelOverA(c, 1) > 0) return 1; // already accelerating
  let lo = 1;
  let hi = 1;
  for (let i = 0; i < 200 && accelOverA(c, hi) <= 0; i++) hi *= 1.2;
  if (accelOverA(c, hi) <= 0) return null;
  for (let k = 0; k < 80; k++) {
    const mid = 0.5 * (lo + hi);
    if (accelOverA(c, mid) > 0) hi = mid;
    else lo = mid;
  }
  return 0.5 * (lo + hi);
}

export type Fate = 'crunch' | 'accelerating' | 'willAccelerate' | 'coasting';

export interface History {
  /** Times in Gyr measured from today (negative = past). */
  t: Float64Array;
  /** Scale factor at each time. */
  a: Float64Array;
  /** Age in Gyr, or Infinity when there was no Big Bang. */
  ageGyr: number;
  fate: Fate;
  /** Gyr from today to the Big Crunch. Computed analytically, so it is reported
   *  even when the crunch is far outside the plotted window. */
  crunchGyr: number | null;
  /** Largest scale factor reached, when the universe turns around. */
  aMax: number | null;
  /** Scale factor at which deceleration ends, when it does. */
  accelAtA: number | null;
  hasBigBang: boolean;
  /** True when the plotted curve stops before the story ends — the caller must
   *  say so rather than letting the line terminate in mid-air. */
  truncated: boolean;
}

/** Beyond this the whole-arc view is useless: 13.8 Gyr would be under 3 % of it. */
const PLOT_CRUNCH_MAX_GYR = 260;

/**
 * Integrate a(t) forward from today with RK4 on (a, ȧ), in Hubble units where
 * H₀ = 1 and therefore ȧ(today) = 1.
 *
 * The ODE form is used for the future rather than inverting the age integral,
 * because a recollapsing universe passes the same scale factor twice — t(a) is
 * not a function, but a(t) always is. The window is bounded: a universe barely
 * above critical density recollapses ~10⁷ Gyr from now, and plotting that would
 * squash the entire 13.8 Gyr past into a pixel.
 */
export function history(c: Cosmology, futureGyr = 40, samples = 900): History {
  const tH = hubbleGyr(c);
  const age = ageHubble(c);
  const hasBigBang = Number.isFinite(age);
  const aTurn = turnaround(c);
  const crunchH = crunchHubble(c);
  const crunchGyr = crunchH === null ? null : crunchH * tH;

  // Plot the whole arc when a recollapse is close enough to be legible; otherwise
  // keep the normal window and flag the truncation.
  const showsCrunch = crunchGyr !== null && crunchGyr <= PLOT_CRUNCH_MAX_GYR;
  const span = showsCrunch ? crunchGyr! * 1.005 : futureGyr;
  const truncated = crunchGyr !== null && !showsCrunch;

  const accel = (a: number) => accelOverA(c, a) * a;
  const dt = span / tH / samples;

  const tF: number[] = [];
  const aF: number[] = [];
  let a = 1;
  let v = 1; // ȧ today = H₀ a = 1
  for (let i = 0; i <= samples; i++) {
    tF.push(i * dt * tH);
    aF.push(a);
    if (a <= 0) break;
    const k1a = v;
    const k1v = accel(a);
    const k2a = v + 0.5 * dt * k1v;
    const k2v = accel(Math.max(1e-8, a + 0.5 * dt * k1a));
    const k3a = v + 0.5 * dt * k2v;
    const k3v = accel(Math.max(1e-8, a + 0.5 * dt * k2a));
    const k4a = v + dt * k3v;
    const k4v = accel(Math.max(1e-8, a + dt * k3a));
    a += (dt / 6) * (k1a + 2 * k2a + 2 * k3a + k4a);
    v += (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
    if (a <= 0) {
      tF.push((i + 1) * dt * tH);
      aF.push(0);
      break;
    }
  }

  // The past: ONE cumulative sweep of the age integrand rather than 260
  // independent integrations, then rescaled so the curve lands exactly on
  // (t = −age, a = 0) and (t = 0, a = 1).
  const tP: number[] = [];
  const aP: number[] = [];
  if (hasBigBang) {
    const M = 1600;
    const cum = new Float64Array(M + 1);
    const f = (x: number) => {
      if (x <= 0) return 0;
      const e2 = eSquared(c, x * x);
      return e2 <= 0 ? 0 : 2 / (x * Math.sqrt(e2));
    };
    const h = 1 / M;
    for (let i = 1; i <= M; i++) cum[i] = cum[i - 1] + 0.5 * h * (f((i - 1) * h) + f(i * h));
    const scale = cum[M] > 0 ? age / cum[M] : 0;
    const past = 260;
    tP.push(-age * tH);
    aP.push(0);
    for (let i = 1; i <= past; i++) {
      const x = i / past;
      const j = Math.min(M, Math.round(x * M));
      tP.push((cum[j] * scale - age) * tH);
      aP.push(x * x);
    }
  }

  const t = new Float64Array(tP.length + tF.length);
  const aa = new Float64Array(tP.length + tF.length);
  for (let i = 0; i < tP.length; i++) {
    t[i] = tP[i];
    aa[i] = aP[i];
  }
  for (let i = 0; i < tF.length; i++) {
    t[tP.length + i] = tF[i];
    aa[tP.length + i] = aF[i];
  }

  const accelAtA = accelerationOnset(c);
  const fate: Fate =
    aTurn !== null
      ? 'crunch'
      : accelAtA !== null
        ? accelOverA(c, 1) > 0
          ? 'accelerating'
          : 'willAccelerate'
        : 'coasting';

  return { t, a: aa, ageGyr: age * tH, fate, crunchGyr, aMax: aTurn, accelAtA, hasBigBang, truncated };
}

/**
 * How far into the future to plot, in Gyr, so the vertical scale stays
 * comparable across parameter choices: out to the moment the universe is
 * `aTarget` times its present size. A fixed span in Gyr does not work — a
 * Λ-dominated universe would run off the top while a coasting one barely moves,
 * and today would be squashed into the bottom of the frame.
 *
 * Recollapsing universes get a nominal span; `history` extends past it on its own
 * until the crunch actually arrives.
 */
export function plotSpanGyr(c: Cosmology, aTarget = 2.6): number {
  const age = ageHubble(c);
  if (!Number.isFinite(age)) return 30;
  const aTurn = turnaround(c);
  const target = aTurn === null ? aTarget : Math.min(aTarget, aTurn * 0.999);
  if (target <= 1) return 30;
  return Math.max(3, (ageToA(c, target) - age) * hubbleGyr(c));
}

/**
 * Time from the Big Bang to the turnaround, in Hubble times.
 *
 * Split in two because the integrand blows up like (a_max − a)^(−1/2) at the top:
 * the lower half uses a = x² as elsewhere, the upper half uses a = a_max − v²,
 * which cancels the singularity exactly (da/√(a_max−a) → 2 dv). Integrating this
 * instead of chasing the crunch with the ODE keeps the answer accurate for
 * universes whose recollapse is 10⁴ Gyr away and would otherwise need millions of
 * RK4 steps to reach.
 */
export function timeToTurnaround(c: Cosmology, aMax: number, steps = 2000): number {
  const simpson = (f: (t: number) => number, lo: number, hi: number, n: number) => {
    const m = n % 2 === 0 ? n : n + 1;
    const h = (hi - lo) / m;
    let sum = f(lo) + f(hi);
    for (let i = 1; i < m; i++) sum += (i % 2 ? 4 : 2) * f(lo + i * h);
    return (h / 3) * sum;
  };
  const mid = aMax / 2;
  // ∫₀^mid da/(aE) with a = x²·mid
  const lower = simpson(
    (x) => {
      if (x <= 0) return 0;
      const a = x * x * mid;
      const e2 = eSquared(c, a);
      return e2 <= 0 ? 0 : 2 / (x * Math.sqrt(e2));
    },
    0,
    1,
    steps,
  );
  // ∫_mid^aMax da/(aE) with a = aMax − v², v from √(aMax−mid) down to 0
  const vHi = Math.sqrt(aMax - mid);
  const upper = simpson(
    (v) => {
      const a = aMax - v * v;
      const e2 = eSquared(c, a);
      return e2 <= 0 ? 0 : (2 * v) / (a * Math.sqrt(e2));
    },
    0,
    vHi,
    steps,
  );
  return lower + upper;
}

/**
 * Hubble times from today to the Big Crunch, or null if the universe never
 * recollapses. By time symmetry the collapse mirrors the expansion, so the total
 * lifetime is twice the time to the turnaround.
 */
export function crunchHubble(c: Cosmology): number | null {
  const aMax = turnaround(c);
  if (aMax === null) return null;
  const age = ageHubble(c);
  if (!Number.isFinite(age)) return null;
  return 2 * timeToTurnaround(c, aMax) - age;
}

/** Time from the Big Bang to scale factor `target`, in Hubble times. */
export function ageToA(c: Cosmology, target: number, steps = 1200): number {
  if (target <= 0) return 0;
  const f = (x: number) => {
    if (x <= 0) return 0;
    const a = x * x * target;
    const e2 = eSquared(c, a);
    if (e2 <= 0) return Infinity;
    return 2 / (x * Math.sqrt(e2));
  };
  const n = steps % 2 === 0 ? steps : steps + 1;
  const h = 1 / n;
  let sum = f(0) + f(1);
  for (let i = 1; i < n; i++) sum += (i % 2 ? 4 : 2) * f(i * h);
  return (h / 3) * sum;
}
