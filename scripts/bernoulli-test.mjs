// Headless check of the Venturi physics behind /lab/bernoulli.
// Run with BUN (it imports the .ts source directly):  bun scripts/bernoulli-test.mjs
//
// Bias of this suite: prefer assertions that could plausibly FAIL. Where a check
// is an algebraic identity rather than physics it is labelled as such and kept to
// one or two cases — rederiving the code under test proves nothing and only
// inflates the pass count. Sweeps run over the actual slider grid, because the
// bugs found here all hid away from the default position.
import {
  RHO,
  GRAV,
  D1,
  P_ATM,
  P_VAP,
  H_INLET,
  HEAD_VAP,
  LOSS_K,
  TAP_U,
  area,
  ductShape,
  lossFraction,
  stationAt,
  summarize,
} from '../src/lib/lab/venturi.ts';

let pass = 0;
let fail = 0;
const ok = (name, cond, detail = '') => {
  if (cond) {
    pass++;
    console.log(`  ok   ${name}${detail ? '  ' + detail : ''}`);
  } else {
    fail++;
    console.log(`  FAIL ${name}${detail ? '  ' + detail : ''}`);
  }
};
const close = (a, b, tol) => Math.abs(a - b) <= tol;

// the sliders the UI actually exposes: β 0.30–0.90 step 0.01, Q 1–20 step 0.5
const BETAS = Array.from({ length: 61 }, (_, i) => 0.3 + i * 0.01);
const FLOWS = Array.from({ length: 39 }, (_, i) => 1 + i * 0.5);
/** Sweep the whole slider grid; returns the first counterexample or null. */
const grid = (f) => {
  for (const b of BETAS) {
    for (const qL of FLOWS) {
      const r = f(b, qL / 1000, qL);
      if (r) return r;
    }
  }
  return null;
};

console.log('— duct geometry —');
ok('inlet is full bore', ductShape(0.1, 0.55) === 1);
ok('throat is beta', ductShape(0.45, 0.55) === 0.55);
ok('outlet recovers to full bore', ductShape(1, 0.55) === 1);
{
  let maxJump = 0;
  let minD = 1;
  let uMin = 0;
  for (let i = 1; i <= 20000; i++) {
    const a = ductShape((i - 1) / 20000, 0.4);
    const b = ductShape(i / 20000, 0.4);
    maxJump = Math.max(maxJump, Math.abs(b - a));
    if (b < minD) {
      minD = b;
      uMin = i / 20000;
    }
  }
  // tight enough that a real C0 kink at a breakpoint would show up
  ok('profile has no step discontinuity', maxJump < 1e-3, `max Δ(d/d₁) per 5e-5 of u = ${maxJump.toExponential(2)}`);
  ok('minimum sits on the throat plateau', uMin >= 0.4 && uMin <= 0.5 && close(minD, 0.4, 1e-9));
}
ok(
  'the throat plateau is exactly flat for every β',
  grid((b) => (Math.abs(ductShape(0.42, b) - ductShape(0.48, b)) > 0 ? { b } : null)) === null,
);

console.log('— continuity: A₁v₁ = A₂v₂ —');
{
  const q = 0.009;
  const beta = 0.55;
  const inlet = stationAt(0.1, beta, q, false);
  const throat = stationAt(0.45, beta, q, false);
  ok(
    'volume flow is conserved',
    close(area(inlet.d) * inlet.v, area(throat.d) * throat.v, 1e-12),
    `Q₁=${(area(inlet.d) * inlet.v * 1000).toFixed(4)} L/s  Q₂=${(area(throat.d) * throat.v * 1000).toFixed(4)} L/s`,
  );
  ok(
    'speed-up is 1/β²',
    close(throat.v / inlet.v, 1 / beta ** 2, 1e-9),
    `v₂/v₁ = ${(throat.v / inlet.v).toFixed(4)}  1/β² = ${(1 / beta ** 2).toFixed(4)}`,
  );
  const a1 = (Math.PI * 0.1 * 0.1) / 4;
  ok('v₁ = Q/A₁ by hand', close(inlet.v, q / a1, 1e-12), `${inlet.v.toFixed(4)} m/s`);
}

console.log('— Bernoulli: total head is conserved (ideal) —');
{
  const q = 0.012;
  const beta = 0.5;
  let maxDev = 0;
  const h0 = stationAt(0, beta, q, false).total;
  for (let i = 0; i <= 400; i++) {
    const st = stationAt(i / 400, beta, q, false);
    maxDev = Math.max(maxDev, Math.abs(st.head + (st.v * st.v) / (2 * GRAV) - h0));
  }
  ok('p/ρg + v²/2g = const', maxDev < 1e-12, `max deviation = ${maxDev.toExponential(2)} m`);
  ok('inlet static head is the boundary condition', close(stationAt(TAP_U[0], beta, q, false).head, H_INLET, 1e-12));
}

console.log('— faster ⇒ lower pressure, in BOTH modes —');
{
  // Ideal: a theorem (head = const − v²/2g), so one case is enough.
  let bad = 0;
  let prev = null;
  for (let i = 0; i <= 500; i++) {
    const st = stationAt(i / 500, 0.45, 0.01, false);
    if (prev && Math.abs(st.v - prev.v) > 1e-9 && (st.v - prev.v) * (st.pGauge - prev.pGauge) > 0) bad++;
    prev = st;
  }
  ok('ideal: pressure is anti-correlated with speed [identity]', bad === 0);

  // Real: NOT a theorem. Friction can pull the pressure down while the fluid
  // slows, putting a visible sag at the diffuser exit — exactly where the page
  // says pressure recovers. This assertion has teeth; it failed before the
  // diffuser loss was tied to the dynamic head it destroys.
  const sag = grid((b, q, qL) => {
    let p = null;
    for (let i = 0; i <= 3000; i++) {
      const st = stationAt(i / 3000, b, q, true);
      if (p && st.v < p.v - 1e-12 && st.head < p.head - 1e-14) {
        return { b, qL, drop: p.head - st.head, at: i / 3000 };
      }
      p = st;
    }
    return null;
  });
  ok(
    'real: pressure never falls where the fluid is decelerating',
    sag === null,
    sag
      ? `sag ${sag.drop.toFixed(4)} m at u=${sag.at} (β=${sag.b.toFixed(2)}, ${sag.qL} L/s)`
      : 'over the full 61×39 slider grid',
  );

  // If the throat TAP is not the pressure minimum, the cavitation flag lags what
  // the graph shows. Only true while the constant-area throat is loss-free.
  const off = grid((b, q, qL) => {
    const tap = stationAt(TAP_U[1], b, q, true).head;
    for (let i = 0; i <= 2000; i++) {
      if (stationAt(i / 2000, b, q, true).head < tap - 1e-12) return { b, qL, at: i / 2000 };
    }
    return null;
  });
  ok(
    'real: the throat tap IS the pressure minimum',
    off === null,
    off ? `lower at u=${off.at} (β=${off.b.toFixed(2)}, ${off.qL} L/s)` : 'over the full slider grid',
  );
}
{
  const throat = stationAt(TAP_U[1], 0.45, 0.01, false);
  const inlet = stationAt(TAP_U[0], 0.45, 0.01, false);
  ok(
    'Δp = ½ρ(v₂²−v₁²) [identity, guards the formula]',
    close(inlet.pGauge - throat.pGauge, 0.5 * RHO * (throat.v ** 2 - inlet.v ** 2), 1e-6),
    `${((inlet.pGauge - throat.pGauge) / 1000).toFixed(1)} kPa`,
  );
}

console.log('— the meter inverts: Q from Δp —');
{
  // Algebraic inverse of the line above; two cases guard against edits, more
  // would just restate it. Must be non-cavitating for Δp to be unsaturated.
  for (const [beta, qLps] of [[0.5, 9], [0.85, 3]]) {
    const q = qLps / 1000;
    const s = summarize(beta, q, false);
    ok(
      `ideal meter recovers Q [identity] (β=${beta}, ${qLps} L/s)`,
      !s.cavitating && close(s.qFromDp, q, q * 1e-9) && close(s.cd, 1, 1e-9),
      `Q_meter = ${(s.qFromDp * 1000).toFixed(6)} L/s, C_d = ${s.cd.toFixed(6)}`,
    );
  }
  // Not an identity: it also asserts Δp is NOT silently floored where it
  // shouldn't be, across every slider position.
  const bad = grid((b, q, qL) => {
    const s = summarize(b, q, false);
    return !s.cavitating && !close(s.qFromDp, q, q * 1e-9) ? { b, qL } : null;
  });
  ok('ideal C_d = 1 everywhere the meter is not cavitating', bad === null);
}

console.log('— cavitation saturates Δp, and the meter stops tracking flow —');
{
  const mild = summarize(0.8, 0.006, false);
  ok('a gentle throat does not cavitate', !mild.cavitating, `p₂ = ${(mild.p2Gauge / 1000).toFixed(1)} kPa(g)`);

  const hard = summarize(0.3, 0.02, false);
  ok('a tight throat at high flow cavitates', hard.cavitating, `v₂ = ${hard.v2.toFixed(1)} m/s`);

  // REGRESSION for the bug an adversarial review caught: the throat pressure was
  // floored at the vapour pressure but Δp was not, so the UI printed Δp = 396 kPa
  // across two taps that could differ by at most 114 kPa — and fed that
  // impossible differential into the flowmeter inversion.
  const overread = grid((b, q, qL) => {
    for (const lossy of [false, true]) {
      const s = summarize(b, q, lossy);
      const ceiling = stationAt(TAP_U[0], b, q, lossy).pGauge - (P_VAP - P_ATM);
      if (s.dp > ceiling + 1e-6) return { b, qL, dp: s.dp, ceiling };
    }
    return null;
  });
  ok(
    'Δp never exceeds what the two taps can physically read',
    overread === null,
    overread
      ? `${(overread.dp / 1000).toFixed(1)} kPa vs ceiling ${(overread.ceiling / 1000).toFixed(1)} kPa`
      : 'over the full slider grid, both modes',
  );
  const inconsistent = grid((b, q, qL) => {
    for (const lossy of [false, true]) {
      const s = summarize(b, q, lossy);
      const inlet = stationAt(TAP_U[0], b, q, lossy).pGauge;
      if (!close(s.dp, inlet - s.p2Actual, 1e-6)) return { b, qL, lossy, why: 'dp ≠ inlet − p2Actual' };
      if (s.dpIdeal < s.dp - 1e-6) return { b, qL, lossy, why: 'prediction below reading' };
      if (!s.cavitating && !close(s.dp, s.dpIdeal, 1e-9)) return { b, qL, lossy, why: 'floored while not cavitating' };
    }
    return null;
  });
  ok('Δp, Δp_ideal and p₂_actual stay mutually consistent', inconsistent === null, inconsistent?.why ?? '');

  ok(
    'the ideal equation does predict an impossible pressure',
    P_ATM + hard.p2Gauge < 0,
    `p_abs(ideal) = ${((P_ATM + hard.p2Gauge) / 1000).toFixed(0)} kPa`,
  );
  ok(
    'the attainable pressure is floored at the vapour pressure',
    close(P_ATM + hard.p2Actual, P_VAP, 1e-9),
    `p_abs(actual) = ${((P_ATM + hard.p2Actual) / 1000).toFixed(3)} kPa`,
  );
  ok(
    'a cavitating meter under-reads the flow',
    hard.qFromDp < 0.02 * 0.9,
    `true 20.00 L/s → meter reads ${(hard.qFromDp * 1000).toFixed(2)} L/s`,
  );
  {
    // Pushing more flow through a saturated meter must barely move the reading —
    // that decoupling IS "the meter no longer tracks flow".
    const a = summarize(0.3, 0.016, false);
    const b = summarize(0.3, 0.02, false);
    ok(
      'the reading barely moves once Δp has saturated',
      a.cavitating && b.cavitating && Math.abs(b.qFromDp - a.qFromDp) / a.qFromDp < 0.02,
      `16→20 L/s moves the reading by ${(((b.qFromDp - a.qFromDp) / a.qFromDp) * 100).toFixed(2)} %`,
    );
  }
  ok('cavitation is monotone in flow rate at every β', (() => {
    for (const b of BETAS) {
      let seen = false;
      for (const qL of FLOWS) {
        const c = summarize(b, qL / 1000, false).cavitating;
        if (c) seen = true;
        else if (seen) return false;
      }
    }
    return true;
  })());
  ok('HEAD_VAP is the vapour floor expressed as head', close(HEAD_VAP, (P_VAP - P_ATM) / (RHO * GRAV), 1e-12), `${HEAD_VAP.toFixed(2)} m`);
}

console.log('— the loss model, and what its C_d is actually worth —');
{
  ok('loss starts at zero', lossFraction(0, 0.55) === 0);
  ok('the constant-area throat is loss-free', lossFraction(0.4, 0.55) === lossFraction(0.5, 0.55));
  ok('loss is fully spent by the outlet for every β', grid((b) => (close(lossFraction(1, b), 1, 1e-9) ? null : { b })) === null);
  ok('loss is monotone in u for every β', (() => {
    for (const b of BETAS) {
      for (let i = 1; i <= 600; i++) {
        if (lossFraction(i / 600, b) < lossFraction((i - 1) / 600, b) - 1e-12) return false;
      }
    }
    return true;
  })());

  const beta = 0.55;
  const q = 0.009;
  const idealOut = stationAt(1, beta, q, false);
  const realOut = stationAt(1, beta, q, true);
  ok('a real meter loses total head', realOut.total < idealOut.total, `ΔH = ${(idealOut.total - realOut.total).toFixed(3)} m`);
  ok('pressure does not fully recover', realOut.pGauge < idealOut.pGauge);

  // C_d over the WHOLE slider, not just the flattering default. The prose has to
  // describe this range.
  // C_d is only a discharge coefficient while the meter is actually working —
  // past cavitation onset Δp saturates and q/qFromDp climbs past 1, which is the
  // meter failing, not a coefficient. Sweep the working region only.
  let cdLo = Infinity;
  let cdHi = -Infinity;
  let reSpread = 0;
  let cavSeen = 0;
  for (const b of BETAS) {
    const perFlow = FLOWS.map((qL) => summarize(b, qL / 1000, true)).filter((s) => {
      if (s.cavitating) cavSeen++;
      return !s.cavitating;
    }).map((s) => s.cd);
    if (!perFlow.length) continue;
    reSpread = Math.max(reSpread, Math.max(...perFlow) - Math.min(...perFlow));
    cdLo = Math.min(cdLo, ...perFlow);
    cdHi = Math.max(cdHi, ...perFlow);
  }
  console.log(`    C_d over the working slider region: ${cdLo.toFixed(4)} … ${cdHi.toFixed(4)}  (${cavSeen} cavitating points excluded)`);
  ok('the slider can reach cavitation at all', cavSeen > 0, `${cavSeen} of ${BETAS.length * FLOWS.length} grid points`);
  ok(
    'past onset, q/qFromDp is no longer a coefficient but a failure indicator',
    summarize(0.3, 0.02, true).cd > 1.2,
    `β=0.30, 20 L/s → ${summarize(0.3, 0.02, true).cd.toFixed(3)} — reported as "meter no longer tracks flow", not as C_d`,
  );
  ok('C_d stays inside the band the page claims', cdLo > 0.95 && cdHi < 0.99);
  ok(
    'C_d is flow-independent BY CONSTRUCTION, not by physics',
    reSpread < 1e-12,
    `spread across 1→20 L/s = ${reSpread.toExponential(1)} — a real meter varies with Reynolds number; this model cannot, which is why the page hedges the comparison`,
  );
  const isoTop = summarize(0.3, 0.009, true).cd;
  const isoBot = summarize(0.75, 0.009, true).cd;
  ok(
    'inside ISO 5167’s β range it brackets 0.984',
    Math.abs(isoTop - 0.984) < 0.01 && Math.abs(isoBot - 0.984) < 0.01,
    `β=0.30 → ${isoTop.toFixed(4)}, β=0.75 → ${isoBot.toFixed(4)}`,
  );
  ok(
    'outside that range the agreement lapses — and the page says so',
    summarize(0.9, 0.009, true).cd < 0.97,
    `β=0.90 → ${summarize(0.9, 0.009, true).cd.toFixed(4)}`,
  );
  ok('LOSS_K is the documented value', LOSS_K === 0.12);
}

console.log('— degenerate inputs —');
{
  const s = summarize(1, 0.009, false);
  ok(
    'β = 1 leaves the meter equation undefined, and says so',
    Number.isNaN(s.qFromDp) && Number.isNaN(s.cd),
    'no silent fallback to a plausible-looking C_d = 1',
  );
  ok('β = 1 still reports finite pressures', Number.isFinite(s.dp) && Number.isFinite(s.p2Actual));
  const zero = summarize(0.55, 0, false);
  ok('zero flow gives zero Δp and zero speed', close(zero.dp, 0, 1e-12) && close(zero.v2, 0, 1e-12));
  ok('zero flow does not cavitate', !zero.cavitating);
  ok(
    'every summarize field is finite across the whole slider grid',
    grid((b, q) => {
      for (const lossy of [false, true]) {
        for (const [k, v] of Object.entries(summarize(b, q, lossy))) {
          if (typeof v === 'number' && !Number.isFinite(v)) return { b, k };
        }
      }
      return null;
    }) === null,
  );
}

console.log('— sanity of the numbers a viewer will read —');
{
  const s = summarize(0.55, 0.009, false);
  console.log(
    `    β=0.55, Q=9 L/s →  v₁=${s.v1.toFixed(2)} m/s  v₂=${s.v2.toFixed(2)} m/s  Δp=${(s.dp / 1000).toFixed(1)} kPa  p₂=${(s.p2Gauge / 1000).toFixed(1)} kPa(g)`,
  );
  ok('inlet speed is a plausible pipe velocity', s.v1 > 0.5 && s.v1 < 4, `${s.v1.toFixed(2)} m/s`);

  // Both slider extremes fall outside a real DP cell's span. That is fine — but
  // the UI must not round the small one away, hence the Pa/kPa switch.
  const tiny = summarize(0.9, 0.001, false);
  const huge = summarize(0.3, 0.02, false);
  console.log(`    slider extremes: Δp = ${tiny.dp.toFixed(1)} Pa … ${(huge.dp / 1000).toFixed(0)} kPa`);
  ok('the smallest Δp is nonzero but sub-pascal-order', tiny.dp > 0 && tiny.dp < 100, `${tiny.dp.toFixed(1)} Pa`);
  ok(
    'the largest Δp is the saturated one, not the predicted one',
    close(huge.dp, stationAt(TAP_U[0], 0.3, 0.02, false).pGauge - (P_VAP - P_ATM), 1e-6) && huge.dpIdeal > huge.dp,
    `read ${(huge.dp / 1000).toFixed(1)} kPa vs predicted ${(huge.dpIdeal / 1000).toFixed(1)} kPa`,
  );
  ok(
    'h0 (denominator of the pressure colour ramp) is positive everywhere',
    grid((b, q) => (summarize(b, q, true).h0 > 0 ? null : { b })) === null,
  );
  ok(
    'taps are ordered inlet → throat → recovery',
    TAP_U[0] < 0.3 && TAP_U[1] > 0.4 && TAP_U[1] < 0.5 && TAP_U[2] > 0.88,
  );
  ok(
    'constants are the textbook ones',
    RHO === 998 && close(GRAV, 9.80665, 1e-9) && D1 === 0.1 && P_VAP === 2339 && P_ATM === 101325,
  );
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
