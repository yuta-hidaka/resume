// Headless check of the closed-string spectrum behind /lab/tduality.
// Run with BUN (it imports the .ts source):  bun scripts/strings-test.mjs
//
// T-duality is an exact statement, so it gets tested exactly: the full multiset of
// M² values at radius R must equal the multiset at α'/R, to floating point, for
// every R — not "look similar on a plot".
import {
  R_SELF_DUAL,
  levelMatched,
  massSquared,
  dualState,
  dualRadius,
  enumerateStates,
  spectrum,
  readout,
  windingPath,
} from '../src/lib/lab/strings.ts';

let pass = 0;
let fail = 0;
const ok = (name, cond, detail = '') => {
  if (cond) { pass++; console.log(`  ok   ${name}${detail ? '  ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? '  ' + detail : ''}`); }
};
const close = (a, b, tol) => Math.abs(a - b) <= tol;

const RADII = [0.12, 0.25, 0.5, 0.8, 0.999, 1, 1.001, 1.25, 2, 4, 8.3];

console.log('— level matching —');
{
  ok('N − Ñ = nw holds for the ground state', levelMatched({ n: 0, w: 0, N: 0, Nt: 0 }));
  ok('a momentum+winding state needs unequal oscillator levels',
    !levelMatched({ n: 1, w: 1, N: 0, Nt: 0 }) && levelMatched({ n: 1, w: 1, N: 1, Nt: 0 }));
  ok('every enumerated state is level matched', enumerateStates(3, 3).every(levelMatched));
  ok('enumeration is non-trivial', enumerateStates(2, 2).length > 20, `${enumerateStates(2, 2).length} states`);
  ok('the enumeration respects its own bounds', enumerateStates(2, 2).every(
    (s) => Math.abs(s.n) <= 2 && Math.abs(s.w) <= 2 && s.N + s.Nt <= 2));
}

console.log('— the mass formula —');
{
  // the bosonic closed-string tachyon
  ok('the ground state is the tachyon at M² = −4/α′',
    massSquared({ n: 0, w: 0, N: 0, Nt: 0 }, 1) === -4);
  // the massless level: N = Ñ = 1, no momentum, no winding → graviton et al.
  ok('N = Ñ = 1 with n = w = 0 is massless',
    massSquared({ n: 0, w: 0, N: 1, Nt: 1 }, 1) === 0);
  ok('pure momentum costs (n/R)²',
    close(massSquared({ n: 3, w: 0, N: 1, Nt: 1 }, 2), (3 / 2) ** 2, 1e-12));
  ok('pure winding costs (wR/α′)²',
    close(massSquared({ n: 0, w: 3, N: 1, Nt: 1 }, 2), (3 * 2) ** 2, 1e-12));
  ok('momentum modes get heavy as the circle shrinks', (() => {
    let prev = -Infinity;
    for (const r of [4, 2, 1, 0.5, 0.25]) {
      const m = massSquared({ n: 1, w: 0, N: 1, Nt: 1 }, r);
      if (m <= prev) return false;
      prev = m;
    }
    return true;
  })());
  ok('winding modes get light as the circle shrinks', (() => {
    let prev = -Infinity;
    for (const r of [0.25, 0.5, 1, 2, 4]) {
      const m = massSquared({ n: 0, w: 1, N: 1, Nt: 1 }, r);
      if (m <= prev) return false;
      prev = m;
    }
    return true;
  })());
}

console.log('— absolute normalisation (the duality tests CANNOT catch this) —');
{
  // massSquared is manifestly invariant under (n,w,R) → (w,n,1/R) by its own
  // shape, and enumerateStates' domain is symmetric in n ↔ w. So every duality
  // assertion below is a property of the CODE, not a check on the oscillator
  // term: changing 2*(N+Ñ−2) to 4*(N+Ñ−2) leaves them all green. The absolute
  // scale has to be pinned separately, against hand-computed values.
  const hand = [
    // [n, w, N, Ñ, R, expected M² in units of 1/α′]
    [0, 0, 0, 0, 1, -4],   // ground state: 2(0+0−2)
    [0, 0, 1, 1, 1, 0],    // massless level: 2(1+1−2)
    [0, 0, 2, 2, 1, 4],    // FIRST MASSIVE LEVEL: 2(2+2−2) = 4/α′
    [0, 0, 3, 3, 1, 8],
    [0, 0, 1, 1, 3, 0],    // the oscillator term must not depend on R
    [2, 0, 0, 0, 1, 0],    // 4/1 + 0 − 4
    [0, 2, 0, 0, 1, 0],
    [3, 0, 1, 1, 2, 2.25], // 9/4
    [0, 3, 1, 1, 2, 36],   // 9·4
    [1, 1, 1, 0, 2, 2.25], // 1/4 + 4 − 2
  ];
  let bad = null;
  for (const [n, w, N, Nt, R, want] of hand) {
    const got = massSquared({ n, w, N, Nt }, R);
    if (!close(got, want, 1e-12)) bad = { n, w, N, Nt, R, want, got };
  }
  ok('every hand-computed M² matches', bad === null, bad ? JSON.stringify(bad) : `${hand.length} states`);
  ok('the first massive level is 4/α′, not 2/α′ or 8/α′',
    massSquared({ n: 0, w: 0, N: 2, Nt: 2 }, 1) === 4,
    'pins the factor in 2(N+Ñ−2)');
  ok('the intercept is −2 per side, not −1',
    massSquared({ n: 0, w: 0, N: 0, Nt: 0 }, 1) === -4 && massSquared({ n: 0, w: 0, N: 1, Nt: 1 }, 1) === 0);
  // level spacing must be 4/α′ between successive N=Ñ levels
  ok('successive N = Ñ levels are spaced by 4/α′',
    [0, 1, 2, 3].every((N) => massSquared({ n: 0, w: 0, N, Nt: N }, 1) === 4 * N - 4));
}

console.log('— T-duality, state by state —');
{
  let worst = 0;
  let count = 0;
  for (const r of RADII) {
    for (const s of enumerateStates(3, 3)) {
      const a = massSquared(s, r);
      const b = massSquared(dualState(s), dualRadius(r));
      worst = Math.max(worst, Math.abs(a - b));
      count++;
    }
  }
  ok('M²(n,w,R) = M²(w,n,α′/R) for every state and radius', worst < 1e-9,
    `${count} comparisons, max |Δ| = ${worst.toExponential(2)}`);
  ok('the dual of the dual is the original',
    enumerateStates(2, 2).every((s) => {
      const d = dualState(dualState(s));
      return d.n === s.n && d.w === s.w && d.N === s.N && d.Nt === s.Nt;
    }));
  ok('level matching survives the duality map',
    enumerateStates(3, 3).every((s) => levelMatched(dualState(s))),
    'N − Ñ = nw is symmetric in n ↔ w');
}

console.log('— T-duality, as whole spectra —');
{
  // The strong claim: not just state-by-state, but the OBSERVABLE multiset.
  let worst = 0;
  for (const r of RADII) {
    const here = spectrum(r, 3, 3);
    const there = spectrum(dualRadius(r), 3, 3);
    if (here.length !== there.length) { worst = Infinity; break; }
    for (let i = 0; i < here.length; i++) worst = Math.max(worst, Math.abs(here[i] - there[i]));
  }
  ok('the sorted M² multiset at R equals the one at α′/R', worst < 1e-9,
    `max |Δ| = ${worst.toExponential(2)} over ${RADII.length} radii`);

  // ...and a control: a spectrum that is NOT the dual must differ, or the test
  // above would pass for any R at all.
  const control = (() => {
    let maxDiff = 0;
    for (const r of [0.3, 0.7, 2.5]) {
      const here = spectrum(r, 3, 3);
      const wrong = spectrum(dualRadius(r) * 1.3, 3, 3);
      for (let i = 0; i < here.length; i++) maxDiff = Math.max(maxDiff, Math.abs(here[i] - wrong[i]));
    }
    return maxDiff;
  })();
  // NOTE ON WHAT THIS CONTROL DOES AND DOES NOT SHOW: perturbing R only rules
  // out comparing an array with itself. It does NOT validate the oscillator or
  // intercept terms — those are symmetric under n ↔ w and so cancel out of every
  // duality comparison. What the duality assertions genuinely catch is ASYMMETRY
  // between the momentum and winding terms, which is checked directly below.
  ok('a WRONG dual radius does not match — the comparison is not vacuous', control > 1,
    `max |Δ| = ${control.toFixed(3)} against α′/(1.3R)`);
  ok('an asymmetric mass formula WOULD break the multiset test', (() => {
    // half the winding term, as a stand-in for a typo, and confirm the identity dies
    const bent = (s, r) => (s.n === 0 ? 0 : (s.n / r) ** 2) + 0.5 * (s.w * r) ** 2 + 2 * (s.N + s.Nt - 2);
    const here = enumerateStates(3, 3).map((s) => bent(s, 1.7)).sort((a, b) => a - b);
    const there = enumerateStates(3, 3).map((s) => bent(s, 1 / 1.7)).sort((a, b) => a - b);
    let d = 0;
    for (let i = 0; i < here.length; i++) d = Math.max(d, Math.abs(here[i] - there[i]));
    return d > 1;
  })(), 'so the duality assertions do have teeth against that class of error');
  ok('the enumeration domain is closed under n ↔ w — the multiset test relies on it',
    (() => {
      const key = (s) => `${s.n},${s.w},${s.N},${s.Nt}`;
      const set = new Set(enumerateStates(3, 3).map(key));
      return enumerateStates(3, 3).every((s) => set.has(key(dualState(s))));
    })());

  ok('the readout residual stays inside float noise',
    RADII.every((r) => readout(r).dualityResidual < 1e-13),
    `max = ${Math.max(...RADII.map((r) => readout(r).dualityResidual)).toExponential(2)}`);
}

console.log('— the self-dual radius —');
{
  ok('R = √α′ = 1 in these units', R_SELF_DUAL === 1);
  ok('the self-dual radius is its own dual', dualRadius(R_SELF_DUAL) === R_SELF_DUAL);
  ok('momentum and winding cost exactly the same there',
    massSquared({ n: 1, w: 0, N: 1, Nt: 1 }, 1) === massSquared({ n: 0, w: 1, N: 1, Nt: 1 }, 1),
    'M² = 1/α′ either way');
  ok('the regime flips across the self-dual radius',
    readout(0.5).regime === 'winding' && readout(2).regime === 'momentum' && readout(1).regime === 'selfdual');
  // The (1,1) state's mass is MINIMISED at the self-dual radius (it is exactly
  // zero there and positive everywhere else) — a strict claim, unlike the old
  // "lightest state" one, whose value depended on where the tower was cut off.
  {
    const at1 = readout(1).m2Enhanced;
    ok('the (1,1) state is exactly massless at R = 1', at1 === 0);
    let bad = null;
    for (let i = 0; i <= 400; i++) {
      const r = 0.25 * Math.pow(16, i / 400);
      if (Math.abs(r - 1) < 1e-6) continue;
      if (readout(r).m2Enhanced <= 0) bad = r;
    }
    ok('and strictly massive at every other radius the slider allows', bad === null,
      bad ? `M² ≤ 0 at R = ${bad}` : 'R = 0.25 … 4, 401 samples');
  }
}

console.log('— enhanced symmetry at R = √α′ —');
{
  // (n,w) = (±1,±1) with the minimal level matching goes exactly massless at the
  // self-dual radius: M² = 1/R² + R² − 2 → 0. These are the extra gauge bosons
  // that enhance the symmetry to SU(2) there — a sharp prediction, not decoration.
  const extras = [
    { n: 1, w: 1, N: 1, Nt: 0 },
    { n: -1, w: -1, N: 1, Nt: 0 },
    { n: 1, w: -1, N: 0, Nt: 1 },
    { n: -1, w: 1, N: 0, Nt: 1 },
  ];
  ok('all four are level matched', extras.every(levelMatched));
  ok('all four are exactly massless at R = 1',
    extras.every((s) => Math.abs(massSquared(s, 1)) < 1e-12),
    'M² = 1/R² + R² − 2 = 0');
  ok('and massive at any other radius',
    extras.every((s) => massSquared(s, 0.8) > 0.05 && massSquared(s, 1.25) > 0.05),
    `M²(R=0.8) = ${massSquared(extras[0], 0.8).toFixed(4)}`);
  ok('their M² curve is symmetric under R → α′/R',
    extras.every((s) => close(massSquared(s, 0.37), massSquared(s, 1 / 0.37), 1e-9)));
}

console.log('— limits —');
{
  // R → ∞: winding modes decouple, momentum spacing → continuum
  const big = readout(60);
  ok('at large R winding is prohibitively heavy', big.m2Winding > 1000, `M²_w = ${big.m2Winding.toFixed(0)}`);
  ok('at large R momentum states are nearly free', big.m2Momentum < 1e-3, `M²_n = ${big.m2Momentum.toExponential(2)}`);
  // R → 0: exactly the mirror image
  const small = readout(1 / 60);
  ok('at small R momentum is prohibitively heavy', small.m2Momentum > 1000, `M²_n = ${small.m2Momentum.toFixed(0)}`);
  ok('at small R winding states are nearly free', small.m2Winding < 1e-3, `M²_w = ${small.m2Winding.toExponential(2)}`);
  ok('the two limits are each other, exactly',
    close(big.m2Winding, small.m2Momentum, 1e-9) && close(big.m2Momentum, small.m2Winding, 1e-9),
    'a shrinking circle is a growing one in disguise');
}

console.log('— degenerate inputs —');
{
  ok('R = 0 does not produce NaN in the winding term',
    Number.isFinite(massSquared({ n: 0, w: 1, N: 1, Nt: 1 }, 0)));
  ok('R = 0 makes momentum states infinitely heavy, not NaN',
    massSquared({ n: 1, w: 0, N: 1, Nt: 1 }, 0) === Infinity);
  ok('and the R → ∞ side behaves as its exact mirror', (() => {
    // the guard has to be two-sided, or the module breaks its own identity at
    // the endpoints: w = 0 at R = ∞ used to give NaN while its dual gave 0
    const a = massSquared({ n: 0, w: 1, N: 1, Nt: 1 }, 0);
    const b = massSquared({ n: 1, w: 0, N: 1, Nt: 1 }, Infinity);
    return a === b && Number.isFinite(a);
  })());
  ok('readout() at an endpoint radius still returns finite numbers',
    ['r', 'rDual', 'm2Winding', 'm2Enhanced'].every((k) => {
      const v = readout(1e-6)[k];
      return typeof v !== 'number' || Number.isFinite(v);
    }));
  ok('spectrum at R = 0 stays sorted and finite where it should be', (() => {
    const s = spectrum(0.0001, 2, 2);
    for (let i = 1; i < s.length; i++) if (s[i] < s[i - 1]) return false;
    return s.filter(Number.isFinite).length > 5;
  })());
  ok('windingPath is closed and has the right number of turns', (() => {
    const p = windingPath(3, 2, 0.1, 0, 120);
    return close(p[0].theta, 0, 1e-12) && close(p[p.length - 1].theta, 3 * 2 * Math.PI, 1e-9);
  })());
  ok('windingPath treats w = 0 as a single loop', (() => {
    const p = windingPath(0, 1, 0.1, 0, 60);
    return close(p[p.length - 1].theta, 2 * Math.PI, 1e-9);
  })());
  ok('windingPath is finite everywhere', windingPath(2, 3, 0.2, 1.1, 200).every(
    (q) => Number.isFinite(q.theta) && Number.isFinite(q.dr)));
}

console.log('— slider sweep —');
{
  // the UI exposes log10(R) over ±0.60206, i.e. R from 0.25 to 4
  let bad = null;
  for (let i = 0; i <= 400 && !bad; i++) {
    const r = Math.pow(10, -0.60206 + (2 * 0.60206 * i) / 400);
    const ro = readout(r);
    for (const [k, v] of Object.entries(ro)) {
      if (typeof v === 'number' && !Number.isFinite(v)) bad = { r, k };
    }
    if (ro.dualityResidual > 1e-13) bad = { r, k: 'dualityResidual', v: ro.dualityResidual };
  }
  ok('every radius the slider allows gives finite, dual-consistent output', bad === null,
    bad ? JSON.stringify(bad) : 'R = 0.25 … 4, 401 samples');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
