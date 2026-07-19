/**
 * Hydrogen-atom wavefunctions ψ_nlm (real form) and a |ψ|² point sampler.
 *
 * Lengths are in Bohr radii (a₀ = 1). The radial part is sampled exactly by
 * inverse-transform over the radial distribution P(r) = r²R_nl(r)², and the
 * angular part by rejection against the real spherical harmonic Y².
 */

export interface OrbitalSpec {
  /** Principal quantum number */
  n: number;
  /** Azimuthal quantum number */
  l: number;
  /** |m| of the real orbital */
  m: number;
  /** φ dependence of the real form: cos(mφ) or sin(mφ) (ignored for m = 0) */
  form: 'cos' | 'sin';
}

export interface OrbitalSamples {
  /** xyz triplets, in Bohr radii */
  positions: Float32Array;
  /** sign of ψ at each point: +1 / -1 */
  signs: Int8Array;
  /** radius containing ~95% of the probability (for camera framing) */
  r95: number;
}

const factorial = (k: number): number => {
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return f;
};

/** Generalized Laguerre polynomial L_k^α(x) via the three-term recurrence. */
function laguerre(k: number, alpha: number, x: number): number {
  if (k === 0) return 1;
  let prev = 1;
  let cur = 1 + alpha - x;
  for (let i = 2; i <= k; i++) {
    const next = ((2 * i - 1 + alpha - x) * cur - (i - 1 + alpha) * prev) / i;
    prev = cur;
    cur = next;
  }
  return cur;
}

/** Associated Legendre P_l^m(x) for m ≥ 0 (Condon–Shortley phase included). */
function legendre(l: number, m: number, x: number): number {
  let pmm = 1;
  if (m > 0) {
    const s = Math.sqrt(Math.max(0, 1 - x * x));
    for (let i = 1; i <= m; i++) pmm *= -(2 * i - 1) * s;
  }
  if (l === m) return pmm;
  let pm1 = x * (2 * m + 1) * pmm;
  if (l === m + 1) return pm1;
  let p = 0;
  for (let ll = m + 2; ll <= l; ll++) {
    p = (x * (2 * ll - 1) * pm1 - (ll + m - 1) * pmm) / (ll - m);
    pmm = pm1;
    pm1 = p;
  }
  return p;
}

/** Radial wavefunction R_nl(r), a₀ = 1. */
export function radial(n: number, l: number, r: number): number {
  const rho = (2 * r) / n;
  const norm = Math.sqrt(
    ((2 / n) ** 3 * factorial(n - l - 1)) / (2 * n * factorial(n + l)),
  );
  return norm * Math.exp(-rho / 2) * rho ** l * laguerre(n - l - 1, 2 * l + 1, rho);
}

/** Real spherical harmonic. θ is the polar angle, φ the azimuth. */
export function harmonic(spec: OrbitalSpec, cosTheta: number, phi: number): number {
  const { l, m, form } = spec;
  const base = Math.sqrt(
    ((2 * l + 1) / (4 * Math.PI)) * (factorial(l - m) / factorial(l + m)),
  );
  const p = legendre(l, m, cosTheta);
  if (m === 0) return base * p;
  const azimuth = form === 'cos' ? Math.cos(m * phi) : Math.sin(m * phi);
  return Math.SQRT2 * base * p * azimuth;
}

/** Draw `count` points distributed as |ψ_nlm|². */
export function sampleOrbital(spec: OrbitalSpec, count: number): OrbitalSamples {
  const { n, l } = spec;

  // Radial CDF of P(r) = r²R² on a fine grid, then inverse-transform sample.
  const rMax = 3.2 * n * n + 12;
  const GRID = 2048;
  const dr = rMax / GRID;
  const cdf = new Float64Array(GRID + 1);
  const rGrid = new Float64Array(GRID + 1);
  for (let i = 1; i <= GRID; i++) {
    const r = i * dr;
    rGrid[i] = r;
    const R = radial(n, l, r);
    cdf[i] = cdf[i - 1] + r * r * R * R * dr;
  }
  const total = cdf[GRID];
  for (let i = 0; i <= GRID; i++) cdf[i] /= total;

  const invCdf = (u: number): number => {
    let lo = 0;
    let hi = GRID;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] < u) lo = mid;
      else hi = mid;
    }
    const span = cdf[hi] - cdf[lo];
    const t = span > 0 ? (u - cdf[lo]) / span : 0.5;
    return rGrid[lo] + t * dr;
  };

  let r95 = rMax;
  for (let i = 0; i <= GRID; i++) {
    if (cdf[i] >= 0.95) {
      r95 = rGrid[i];
      break;
    }
  }

  // Max of Y² over the sphere (φ maximum is 1 for both cos and sin forms).
  let y2Max = 0;
  for (let i = 0; i <= 512; i++) {
    const y = harmonic({ ...spec, form: 'cos' }, -1 + (2 * i) / 512, 0);
    y2Max = Math.max(y2Max, y * y);
  }

  const positions = new Float32Array(count * 3);
  const signs = new Int8Array(count);
  let filled = 0;
  while (filled < count) {
    const cosTheta = 2 * Math.random() - 1;
    const phi = 2 * Math.PI * Math.random();
    const y = harmonic(spec, cosTheta, phi);
    if (y * y < Math.random() * y2Max) continue;

    const r = invCdf(Math.random());
    const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
    const i3 = filled * 3;
    positions[i3] = r * sinTheta * Math.cos(phi);
    positions[i3 + 1] = r * cosTheta; // physics z-axis → three.js "up" (y)
    positions[i3 + 2] = r * sinTheta * Math.sin(phi);
    signs[filled] = Math.sign(radial(n, l, r) * y) >= 0 ? 1 : -1;
    filled++;
  }

  return { positions, signs, r95 };
}
