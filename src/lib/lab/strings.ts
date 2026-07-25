/**
 * A closed string on a circle — and the duality that makes small radii
 * indistinguishable from large ones.
 *
 * Compactify one dimension into a circle of radius R. A closed string can then do
 * two things a point particle cannot both do: carry quantised momentum around the
 * circle (integer n), and wind around it (integer w). Its mass follows
 *
 *     M² = (n/R)² + (w R/α')² + (2/α')(N + Ñ − 2)
 *
 * subject to level matching  N − Ñ = n w.
 *
 * Momentum modes cost n/R, so they get HEAVY as the circle shrinks — the familiar
 * Kaluza–Klein story. Winding modes cost wR/α', so they get LIGHT. Swap the two
 * roles and the spectrum is untouched:
 *
 *     M²(n, w, R) = M²(w, n, α'/R)
 *
 * That is T-duality. A circle of radius R and a circle of radius α'/R are the same
 * physics, and the self-dual radius R = √α' is the smallest circle that means
 * anything — a string simply cannot resolve a shorter distance.
 *
 * Units here: α' = 1, so lengths are in string lengths ℓ_s = √α' and R is R/ℓ_s.
 * DOM-free; checked headless by scripts/strings-test.mjs.
 */

/** Self-dual radius in these units. R and 1/R describe the same physics. */
export const R_SELF_DUAL = 1;

export interface StringState {
  n: number; // momentum quantum number around the circle
  w: number; // winding number
  N: number; // left-moving oscillator level
  Nt: number; // right-moving oscillator level (Ñ)
}

/** Level matching: a closed string has no preferred point along itself. */
export const levelMatched = (s: StringState): boolean => s.N - s.Nt === s.n * s.w;

/**
 * M² in units of 1/α'. Can be negative: the bosonic closed string's ground state
 * (n = w = N = Ñ = 0) is the famous tachyon at M² = −4/α'. Superstrings remove
 * it; the bosonic spectrum is shown as it is rather than quietly truncated.
 */
export function massSquared(s: StringState, r: number): number {
  // A vanishing quantum number contributes nothing whatever the radius. Both
  // guards are needed, not just the momentum one: without the winding guard,
  // massSquared(n=1,w=0,R=∞) is NaN while its T-dual at R=0 is 0, and the
  // module breaks the identity it exists to demonstrate.
  const momentum = s.n === 0 ? 0 : (s.n / r) ** 2;
  const winding = s.w === 0 ? 0 : (s.w * r) ** 2;
  return momentum + winding + 2 * (s.N + s.Nt - 2);
}

/** The T-dual of a state: momentum and winding trade places. */
export const dualState = (s: StringState): StringState => ({
  n: s.w,
  w: s.n,
  N: s.N,
  Nt: s.Nt,
});

/** The T-dual radius, α'/R. */
export const dualRadius = (r: number): number => 1 / r;

/**
 * Every level-matched state with |n|, |w| ≤ maxNW and N + Ñ ≤ maxLevel.
 *
 * Enumerated in a fixed order so two spectra can be compared as multisets, which
 * is how T-duality gets tested rather than asserted.
 */
export function enumerateStates(maxNW = 2, maxLevel = 2): StringState[] {
  const out: StringState[] = [];
  for (let n = -maxNW; n <= maxNW; n++) {
    for (let w = -maxNW; w <= maxNW; w++) {
      for (let N = 0; N <= maxLevel; N++) {
        for (let Nt = 0; Nt <= maxLevel; Nt++) {
          if (N + Nt > maxLevel) continue;
          const s = { n, w, N, Nt };
          if (levelMatched(s)) out.push(s);
        }
      }
    }
  }
  return out;
}

/** Sorted M² multiset — the observable content of a spectrum. */
export function spectrum(r: number, maxNW = 2, maxLevel = 2): number[] {
  return enumerateStates(maxNW, maxLevel)
    .map((s) => massSquared(s, r))
    .sort((a, b) => a - b);
}

export type Regime = 'momentum' | 'winding' | 'selfdual';

export interface StringReadout {
  r: number;
  rDual: number;
  regime: Regime;
  /**
   * M² of the momentum and winding states built on the MASSLESS level
   * (N = Ñ = 1) — the Kaluza–Klein and winding towers over the graviton. Not the
   * minimal level-matched choice, which would be N = Ñ = 0 and tachyonic.
   */
  m2Momentum: number;
  m2Winding: number;
  /**
   * M² of (n,w) = (1,1) with N = 1, Ñ = 0 — the state that becomes exactly
   * massless at the self-dual radius. Well defined and continuous everywhere,
   * unlike "the lightest state", which depends on where the enumeration is cut
   * off (at R ≈ 4 a state with n = 8 is 50× lighter than anything with |n| ≤ 2)
   * and jumps whenever a tachyonic level crosses zero.
   */
  m2Enhanced: number;
  /** How closely the spectrum at R matches the spectrum at α'/R (max |Δ|). */
  dualityResidual: number;
}

export function readout(r: number, maxNW = 2, maxLevel = 2): StringReadout {
  const m2Momentum = massSquared({ n: 1, w: 0, N: 1, Nt: 1 }, r);
  const m2Winding = massSquared({ n: 0, w: 1, N: 1, Nt: 1 }, r);
  const m2Enhanced = massSquared({ n: 1, w: 1, N: 1, Nt: 0 }, r);

  const here = spectrum(r, maxNW, maxLevel);
  const there = spectrum(dualRadius(r), maxNW, maxLevel);
  let residual = 0;
  for (let i = 0; i < here.length; i++) residual = Math.max(residual, Math.abs(here[i] - there[i]));

  return {
    r,
    rDual: dualRadius(r),
    m2Enhanced,
    regime:
      Math.abs(r - R_SELF_DUAL) < 1e-3
        ? 'selfdual'
        : m2Momentum < m2Winding
          ? 'momentum'
          : 'winding',
    m2Momentum,
    m2Winding,
    dualityResidual: residual,
  };
}

/**
 * Shape of a closed string wound w times around a circle, with an oscillation
 * excited at harmonic `mode`. Returned in the (θ, radial offset) form the
 * renderer needs; purely decorative geometry, no dynamics claimed.
 */
export function windingPath(
  w: number,
  mode: number,
  amp: number,
  phase: number,
  samples = 240,
): { theta: number; dr: number }[] {
  const turns = Math.max(1, Math.abs(w));
  // The oscillation has to come back to where it started or the string is drawn
  // with a visible break; rounding the harmonic count guarantees that instead of
  // relying on the caller passing an integer.
  mode = Math.max(1, Math.round(mode));
  const out: { theta: number; dr: number }[] = [];
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    out.push({
      theta: u * turns * 2 * Math.PI,
      dr: amp * Math.sin(u * turns * mode * 2 * Math.PI + phase),
    });
  }
  return out;
}
