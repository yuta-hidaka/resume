// Headless check of the FLRW cosmology behind /lab/friedmann.
// Run with BUN (it imports the .ts source):  bun scripts/cosmology-test.mjs
//
// The numerics are checked against CLOSED-FORM solutions wherever one exists —
// Einstein–de Sitter, empty, flat ΛCDM, closed matter-only — so a passing run
// means the integrator reproduces analytic general relativity, not merely that it
// returns a plausible-looking number.
import {
  HUBBLE_GYR,
  OMEGA_R_H2,
  radiationFor,
  PLANCK,
  cosmology,
  omegaK,
  hubbleGyr,
  eSquared,
  accelOverA,
  q0,
  matterLambdaEquality,
  matterRadiationEquality,
  redshiftOf,
  ageHubble,
  ageGyr,
  ageToA,
  history,
  hasBigBang,
  turnaround,
  crunchHubble,
  accelerationOnset,
  plotSpanGyr,
} from '../src/lib/lab/cosmology.ts';

let pass = 0;
let fail = 0;
const ok = (name, cond, detail = '') => {
  if (cond) { pass++; console.log(`  ok   ${name}${detail ? '  ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? '  ' + detail : ''}`); }
};
const close = (a, b, tol) => Math.abs(a - b) <= tol;
const rel = (a, b) => Math.abs(a - b) / Math.abs(b);

console.log('— the headline number —');
{
  const c = cosmology(PLANCK.h0, PLANCK.om, PLANCK.ol);
  const age = ageGyr(c);
  console.log(`    Planck 2018 (H₀=${PLANCK.h0}, Ω_m=${PLANCK.om}, Ω_Λ=${PLANCK.ol}) → ${age.toFixed(3)} Gyr`);
  // Planck 2018 quotes 13.797 ± 0.023 Gyr
  ok('the measured universe comes out 13.8 Gyr old', close(age, 13.797, 0.05), `${age.toFixed(3)} Gyr`);
  ok('Hubble time is right', close(hubbleGyr(c), 14.508, 0.01), `1/H₀ = ${hubbleGyr(c).toFixed(3)} Gyr`);
  ok('the measured universe is flat to 1e-4', Math.abs(omegaK(c)) < 1e-4, `Ω_k = ${omegaK(c).toExponential(2)}`);
  // accepted q₀ ≈ −0.53
  ok('q₀ matches the accepted value', close(q0(c), -0.527, 0.005), `q₀ = ${q0(c).toFixed(4)}`);
  const aeq = matterLambdaEquality(c);
  ok('Λ took over at z ≈ 0.3', close(redshiftOf(aeq), 0.295, 0.01), `z = ${redshiftOf(aeq).toFixed(3)}`);
  const arm = matterRadiationEquality(c);
  ok('matter–radiation equality at z ≈ 3400', close(redshiftOf(arm), 3423, 60), `z = ${redshiftOf(arm).toFixed(0)}`);
}

console.log('— against closed-form solutions —');
{
  // Einstein–de Sitter: flat, matter only → t₀ = 2/(3H₀)
  const c = cosmology(70, 1, 0, 0);
  ok('Einstein–de Sitter age = 2/(3H₀)', rel(ageHubble(c), 2 / 3) < 1e-9,
    `${ageHubble(c).toFixed(10)} vs ${(2 / 3).toFixed(10)}`);

  // Empty, curvature only → a ∝ t, t₀ = 1/H₀
  const e = cosmology(70, 0, 0, 0);
  ok('empty (Milne) age = 1/H₀', rel(ageHubble(e), 1) < 1e-9, `${ageHubble(e).toFixed(10)}`);

  // Radiation only, flat → t₀ = 1/(2H₀)
  const r = cosmology(70, 0, 0, 1);
  ok('radiation-only age = 1/(2H₀)', rel(ageHubble(r), 0.5) < 1e-9, `${ageHubble(r).toFixed(10)}`);

  // Flat ΛCDM has a closed form: t₀ = (2/(3√Ω_Λ)) asinh √(Ω_Λ/Ω_m)
  for (const om of [0.1, 0.25, 0.315, 0.5, 0.8]) {
    const ol = 1 - om;
    const cc = cosmology(70, om, ol, 0);
    const exact = (2 / (3 * Math.sqrt(ol))) * Math.asinh(Math.sqrt(ol / om));
    ok(`flat ΛCDM age matches asinh form (Ω_m=${om})`, rel(ageHubble(cc), exact) < 1e-8,
      `${ageHubble(cc).toFixed(9)} vs ${exact.toFixed(9)}`);
  }

  // Open matter-only also has a closed form via the parametric solution; check the
  // limiting behaviour instead: age must sit between the EdS and empty answers.
  const o = cosmology(70, 0.3, 0, 0);
  ok('open matter-only age lies between EdS and empty', ageHubble(o) > 2 / 3 && ageHubble(o) < 1,
    `${ageHubble(o).toFixed(6)}`);
}

console.log('— internal consistency —');
{
  const c = cosmology(PLANCK.h0, PLANCK.om, PLANCK.ol);
  ok('ageToA(1) equals the full age', rel(ageToA(c, 1), ageHubble(c)) < 1e-7,
    `${ageToA(c, 1).toFixed(9)} vs ${ageHubble(c).toFixed(9)}`);
  ok('ageToA is monotone in a', (() => {
    let prev = -1;
    for (let i = 1; i <= 200; i++) {
      const v = ageToA(c, i / 200);
      if (v < prev) return false;
      prev = v;
    }
    return true;
  })());
  ok('ageToA(0) is 0', ageToA(c, 0) === 0);
  // ä/a from the acceleration equation must agree with differentiating E²
  const d = 1e-6;
  for (const a of [0.2, 0.5, 1, 2]) {
    // ȧ² = a²E², so 2äȧ = d(a²E²)/dt = (d/da)(a²E²)·ȧ → ä = ½ d(a²E²)/da
    const num = 0.5 * ((a + d) ** 2 * eSquared(c, a + d) - (a - d) ** 2 * eSquared(c, a - d)) / (2 * d);
    ok(`acceleration equation is the derivative of Friedmann (a=${a})`,
      rel(accelOverA(c, a) * a, num) < 1e-5,
      `${(accelOverA(c, a) * a).toExponential(6)} vs ${num.toExponential(6)}`);
  }
  // Curvature dropping out of ä is already covered above: a²E² carries Ω_k as a
  // CONSTANT, so d(a²E²)/da kills it. The derivative test would fail if
  // accelOverA had picked up a curvature term.
}

console.log('— a(t) history —');
{
  const c = cosmology(PLANCK.h0, PLANCK.om, PLANCK.ol);
  const h = history(c, 40);
  ok('history has a Big Bang', h.hasBigBang);
  ok('history starts exactly at the singularity', h.a[0] === 0, `a[0] = ${h.a[0]}`);
  ok('the Big Bang sits at t = −age', close(h.t[0], -h.ageGyr, 1e-9),
    `t[0] = ${h.t[0].toFixed(6)} Gyr, −age = ${(-h.ageGyr).toFixed(6)}`);
  ok('time is monotone', (() => {
    for (let i = 1; i < h.t.length; i++) if (h.t[i] < h.t[i - 1] - 1e-9) return false;
    return true;
  })());
  ok('a = 1 at t = 0 (today)', (() => {
    let best = Infinity, aHere = 0;
    for (let i = 0; i < h.t.length; i++) {
      if (Math.abs(h.t[i]) < best) { best = Math.abs(h.t[i]); aHere = h.a[i]; }
    }
    return close(aHere, 1, 2e-3);
  })());
  ok('the measured universe accelerates forever', h.fate === 'accelerating' && h.crunchGyr === null);
  ok('every sample is finite', h.a.every(Number.isFinite) && h.t.every(Number.isFinite));

  // RK4 must conserve the Friedmann constraint ȧ² = a²E² along the future branch.
  // Reconstruct ȧ by differencing and compare with a·E(a).
  {
    let worst = 0;
    for (let i = 1; i < h.t.length - 1; i++) {
      if (h.t[i] < 0.5) continue; // future branch only (the past comes from the integral)
      const dtH = (h.t[i + 1] - h.t[i - 1]) / hubbleGyr(c);
      if (dtH <= 0) continue;
      const v = (h.a[i + 1] - h.a[i - 1]) / dtH;
      const want = h.a[i] * Math.sqrt(Math.max(0, eSquared(c, h.a[i])));
      worst = Math.max(worst, Math.abs(v - want) / want);
    }
    ok('RK4 conserves the Friedmann constraint on the future branch', worst < 1e-4,
      `max relative drift = ${worst.toExponential(2)}`);
  }
}

console.log('— fates —');
{
  // Closed, matter only: turns around at a_max = Ω_m/(Ω_m−1) and the total
  // lifetime is π Ω_m / (H₀ (Ω_m−1)^{3/2}).
  const om = 2;
  const c = cosmology(70, om, 0, 0);
  const h = history(c, 120, 4000); // the crunch lands ~80 Gyr out
  const aMaxExact = om / (om - 1);
  const lifeExact = (Math.PI * om) / (om - 1) ** 1.5; // in Hubble times
  ok('closed matter universe recollapses', h.fate === 'crunch' && h.crunchGyr !== null);
  ok('a_max matches Ω_m/(Ω_m−1)', rel(h.aMax, aMaxExact) < 5e-3,
    `${h.aMax.toFixed(5)} vs ${aMaxExact.toFixed(5)}`);
  const lifeNum = (h.ageGyr + h.crunchGyr) / hubbleGyr(c);
  ok('total lifetime matches the parametric solution', rel(lifeNum, lifeExact) < 5e-3,
    `${lifeNum.toFixed(5)} vs ${lifeExact.toFixed(5)} Hubble times`);

  // de Sitter: Λ only → no Big Bang, a grows exponentially forever
  const ds = cosmology(70, 0, 1, 0);
  ok('Λ-only universe has no Big Bang', !Number.isFinite(ageHubble(ds)));
  ok('Λ-only history reports that honestly', history(ds, 20).hasBigBang === false);

  // A bouncing universe: enough Λ and enough positive curvature that E² vanishes
  const bounce = cosmology(70, 0.1, 2.0, 0); // Ω_k = −1.1: E² really does go negative
  const bounced = ageHubble(bounce);
  ok('a bouncing universe has no Big Bang', !Number.isFinite(bounced), 'E² < 0 below today');
  ok('and the history says so', history(bounce, 20).hasBigBang === false);

  // Coasting / decelerating-forever: open, no Λ
  const open = cosmology(70, 0.3, 0, 0);
  ok('open matter universe expands forever without accelerating',
    history(open, 40).fate === 'coasting' && q0(open) > 0, `q₀ = ${q0(open).toFixed(3)}`);

  // The fate must NOT depend on how far ahead the plot happens to look. Ω_m=1.5
  // closed does not turn around for ~96 Gyr; a 45 Gyr window used to call it
  // "expands forever".
  {
    const doomed = cosmology(70, 1.5, 0, 0);
    ok('turnaround is found analytically for Ω_m=1.5', turnaround(doomed) !== null,
      `a_max = ${turnaround(doomed)?.toFixed(4)}`);
    ok('a_max matches Ω_m/(Ω_m−1) = 3', rel(turnaround(doomed), 3) < 1e-9);
    for (const window of [20, 45, 200]) {
      ok(`fate is 'crunch' regardless of the plot window (${window} Gyr)`,
        history(doomed, window, 400).fate === 'crunch');
    }
    ok('an eternal universe reports no turnaround',
      turnaround(cosmology(70, 0.315, 0.685)) === null);
    ok('Einstein–de Sitter (critical, no Λ) does not turn around',
      turnaround(cosmology(70, 1, 0, 0)) === null, 'expands forever, asymptotically at rest');
    // Λ can rescue a closed universe from recollapse
    ok('enough Λ prevents the crunch even when closed',
      turnaround(cosmology(70, 1.5, 0.6, 0)) === null,
      `Ω_k = ${(1 - 1.5 - 0.6).toFixed(2)}, still expands forever`);
  }
}

console.log('— matter + radiation, against a closed form the old suite never used —');
{
  // Every previous closed-form check ran with orad = 0, i.e. NOT the configuration
  // the page ships. Flat matter+radiation has an exact solution:
  //   t(a) = Ω_m^-2 [ (2/3) u^{3/2} − 2 Ω_r u^{1/2} ],  u = Ω_r + Ω_m a
  const exact = (om, orad, a) => {
    const u = orad + om * a;
    return (1 / om ** 2) * ((2 / 3) * u ** 1.5 - 2 * orad * Math.sqrt(u));
  };
  let worst = 0;
  for (const orad of [9.14e-5, 1e-3, 0.05, 0.5]) {
    const om = 1 - orad; // flat
    const c = { h0: 70, om, ol: 0, orad };
    for (const a of [1e-3, 0.1, 0.5, 1]) {
      const got = ageToA(c, a);
      const want = exact(om, orad, a) - exact(om, orad, 0);
      worst = Math.max(worst, Math.abs(got - want) / Math.abs(want));
    }
  }
  ok('ageToA matches the matter+radiation closed form', worst < 1e-9,
    `max relative error = ${worst.toExponential(2)}`);
  const ship = { h0: 67.4, om: 1 - 9.14e-5, ol: 0, orad: 9.14e-5 };
  ok('and so does the shipped Ω_r at a = 1',
    Math.abs(ageHubble(ship) - (exact(ship.om, ship.orad, 1) - exact(ship.om, ship.orad, 0))) < 1e-10);
}

console.log('— crunch time, fates, and the plot window —');
{
  // The crunch is now integrated analytically rather than chased with the ODE, so
  // it is reported even when it is 10⁷ Gyr away and unreachable by RK4.
  for (const om of [1.05, 1.2, 1.5, 2, 3]) {
    const c = cosmology(70, om, 0, 0);
    const life = ageHubble(c) + crunchHubble(c);
    const exact = (Math.PI * om) / (om - 1) ** 1.5;
    ok(`crunch time matches the parametric solution (Ω_m=${om})`, rel(life, exact) < 2e-4,
      `${life.toFixed(6)} vs ${exact.toFixed(6)} Hubble times`);
  }
  ok('an eternal universe has no crunch time', crunchHubble(cosmology(70, 0.315, 0.685)) === null);
  {
    // Ω_m = 1.00 free: turnaround at a ≈ 10⁹⁴⁶, crunch ~5×10⁷ Gyr. The old ODE
    // chase reported null here and the curve stopped in mid-air at 1200 Gyr.
    const c = cosmology(67.4, 1, 0);
    const h = history(c, 40, 900);
    ok('a far-future recollapse is still reported, and flagged as off-plot',
      h.fate === 'crunch' && h.crunchGyr !== null && h.truncated === true,
      `crunch in ${h.crunchGyr.toExponential(2)} Gyr`);
    ok('and the plotted window stays legible instead of blowing out',
      h.t[h.t.length - 1] < 120, `plot ends at ${h.t[h.t.length - 1].toFixed(1)} Gyr`);
    ok('the sample count stays bounded', h.t.length < 1400, `${h.t.length} points`);
  }
  {
    // a near recollapse IS drawn in full, with the crunch on the plot
    const c = cosmology(67.4, 1.5, 0);
    const h = history(c, 30, 900);
    ok('a nearby recollapse is drawn all the way to the crunch',
      !h.truncated && h.a[h.a.length - 1] <= 1e-6,
      `crunch in ${h.crunchGyr.toFixed(1)} Gyr, curve ends at a = ${h.a[h.a.length - 1].toExponential(1)}`);
  }
  // H3: "decelerating" from today's q₀ is a claim about NOW, not the future
  for (const om of [0.67, 0.7, 0.8]) {
    const c = cosmology(67.4, om, 1 - om - radiationFor(67.4));
    const h = history(c, 40, 400);
    ok(`Ω_m=${om} flat is reported as accelerating LATER, not decelerating forever`,
      h.fate === 'willAccelerate' && q0(c) > 0 && h.accelAtA > 1,
      `q₀ = ${q0(c).toFixed(3)}, ä > 0 from a = ${h.accelAtA.toFixed(3)}`);
  }
  ok('a universe with no Λ and no turnaround coasts', history(cosmology(70, 0.3, 0, 0), 40).fate === 'coasting');
  ok('the measured universe is already accelerating', history(cosmology(67.4, 0.315, 0.685), 40).fate === 'accelerating');
  ok('accelerationOnset returns null when there is no Λ', accelerationOnset(cosmology(70, 0.3, 0, 0)) === null);
  {
    // plotSpanGyr picks the window; it must never return something the renderer
    // would divide by, and must stop below any turnaround.
    let bad = null;
    for (let i = 0; i <= 40 && !bad; i++) {
      for (let j = 0; j <= 40 && !bad; j++) {
        const c = cosmology(67.4, (i / 40) * 1.5, (j / 40) * 1.5);
        const sp = plotSpanGyr(c);
        if (!(Number.isFinite(sp) && sp >= 3)) bad = { om: c.om, ol: c.ol, sp };
      }
    }
    ok('plotSpanGyr is finite and positive across the slider grid', bad === null,
      bad ? JSON.stringify(bad) : '41×41 grid');
    ok('and it never asks for a window past the turnaround', (() => {
      const c = cosmology(67.4, 1.5, 0);
      const aTurn = turnaround(c);
      const h = history(c, plotSpanGyr(c), 400);
      let maxA = 0;
      for (const a of h.a) maxA = Math.max(maxA, a);
      return maxA <= aTurn * 1.02;
    })());
  }
}

console.log('— the flat constraint really is flat —');
{
  // H1: clamping Ω_Λ at 0 used to abandon the constraint above Ω_m = 1, so the
  // panel showed "Ω_k = 0.000 (flat)" beside "recollapses to a Big Crunch".
  let worst = 0;
  for (let i = 0; i <= 300; i++) {
    const om = (i / 300) * 1.5;
    const orad = radiationFor(67.4);
    const c = cosmology(67.4, om, 1 - om - orad);
    worst = Math.max(worst, Math.abs(omegaK(c)));
  }
  ok('Ω_k is identically zero across the whole Ω_m slider in flat mode', worst < 1e-12,
    `max |Ω_k| = ${worst.toExponential(2)}`);
  const eds = cosmology(67.4, 1, 1 - 1 - radiationFor(67.4));
  ok('flat Ω_m = 1 gives a slightly NEGATIVE Ω_Λ, and says so', eds.ol < 0 && eds.ol > -1e-4,
    `Ω_Λ = ${eds.ol.toExponential(2)}`);
  ok('which is why it recollapses — consistent, not contradictory',
    history(eds, 40).fate === 'crunch' && Math.abs(omegaK(eds)) < 1e-12);
}

console.log('— slider-range sweep: nothing NaNs —');
{
  let bad = null;
  for (let i = 0; i <= 30 && !bad; i++) {
    for (let j = 0; j <= 30 && !bad; j++) {
      for (const h0 of [60, 67.4, 74]) {
        const c = cosmology(h0, (i / 30) * 1.5, (j / 30) * 1.5);
        const age = ageHubble(c);
        if (!(Number.isFinite(age) || age === Infinity)) { bad = { om: c.om, ol: c.ol, h0, age }; break; }
        const hh = history(c, 30, 200);
        if (!hh.a.every(Number.isFinite) || !hh.t.every(Number.isFinite)) {
          bad = { om: c.om, ol: c.ol, h0, why: 'non-finite history' };
          break;
        }
      }
    }
  }
  ok('every (Ω_m, Ω_Λ, H₀) the sliders allow gives finite output', bad === null, bad ? JSON.stringify(bad) : '31×31×3 grid');
  ok('Ω_r is derived from H₀, not frozen', (() => {
    // Ω_r h² is the measured quantity, so Ω_r must scale as h⁻². Freezing it left
    // the matter–radiation equality redshift wrong by up to 60 % across the
    // H₀ slider.
    const a = cosmology(55, 0.315, 0.685);
    const b = cosmology(85, 0.315, 0.685);
    return a.orad > b.orad && close(a.orad * 0.55 ** 2, OMEGA_R_H2, 1e-12) && close(radiationFor(67.4), 9.14e-5, 1e-6);
  })(), `Ω_r(55) = ${radiationFor(55).toExponential(2)}, Ω_r(85) = ${radiationFor(85).toExponential(2)}`);
  ok('z_eq therefore moves with H₀', (() => {
    const z = (h) => redshiftOf(matterRadiationEquality(cosmology(h, 0.315, 0.685)));
    return z(55) < z(67.4) && z(67.4) < z(85) && Math.abs(z(67.4) - 3447) < 40;
  })(), `z_eq: ${[55, 67.4, 85].map((h) => redshiftOf(matterRadiationEquality(cosmology(h, 0.315, 0.685))).toFixed(0)).join(' → ')}`);
  ok('HUBBLE_GYR is 9.778 h⁻¹ Gyr', close(HUBBLE_GYR, 9.77792, 1e-5));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
