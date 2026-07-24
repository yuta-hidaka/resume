// Headless regression tests for the pure FFT module (src/lib/lab/fft.ts) that
// backs the Fourier and diffraction lab pieces. No DOM, no test runner — run:
//   bun scripts/fft-test.mjs
import { fft, fft2, fftshift2, hann, magnitude, peakBin, dftMatrixCos } from '../src/lib/lab/fft.ts';

let fails = 0;
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? '✓' : '✗'} ${name}${extra ? '  ' + extra : ''}`);
  if (!cond) fails++;
};
const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;
const prng = (seed) => () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;

function naiveDFT(re, im, sign = -1) {
  const M = re.length;
  const or = new Float64Array(M), oi = new Float64Array(M);
  for (let k = 0; k < M; k++) {
    let sr = 0, si = 0;
    for (let n = 0; n < M; n++) {
      const a = (sign * 2 * Math.PI * k * n) / M;
      const c = Math.cos(a), s = Math.sin(a);
      sr += re[n] * c - im[n] * s;
      si += re[n] * s + im[n] * c;
    }
    or[k] = sr; oi[k] = si;
  }
  return [or, oi];
}

// ——— 1D ———
{
  const M = 64, r = prng(42);
  const re = new Float64Array(M), im = new Float64Array(M);
  for (let n = 0; n < M; n++) { re[n] = r(); im[n] = r(); }
  const [nr, ni] = naiveDFT(re, im, -1);
  const fr = re.slice(), fi = im.slice();
  fft(fr, fi, -1);
  let e = 0;
  for (let k = 0; k < M; k++) e = Math.max(e, Math.abs(fr[k] - nr[k]), Math.abs(fi[k] - ni[k]));
  ok('1D FFT == naive DFT', e < 1e-9, `maxErr=${e.toExponential(2)}`);
}
{
  const M = 1024, bin = 40;
  const re = new Float64Array(M), im = new Float64Array(M);
  for (let n = 0; n < M; n++) re[n] = Math.cos((2 * Math.PI * bin * n) / M);
  fft(re, im, -1);
  const mag = magnitude(re, im);
  let peak = 1, pv = -1;
  for (let k = 1; k < mag.length; k++) if (mag[k] > pv) { pv = mag[k]; peak = k; }
  ok('1D pure tone → single bin', peak === bin, `peak=${peak}`);
  ok('1D negligible leakage', Math.max(mag[bin - 2], mag[bin + 2]) / mag[bin] < 1e-10);
}
{
  const M = 128, a = 1.7, b = -0.9;
  const mk = (s) => { const r = prng(s); const re = new Float64Array(M), im = new Float64Array(M); for (let n = 0; n < M; n++) { re[n] = r(); im[n] = r(); } return [re, im]; };
  const [xr, xi] = mk(1), [yr, yi] = mk(2);
  const cr = new Float64Array(M), ci = new Float64Array(M);
  for (let n = 0; n < M; n++) { cr[n] = a * xr[n] + b * yr[n]; ci[n] = a * xi[n] + b * yi[n]; }
  fft(xr, xi, -1); fft(yr, yi, -1); fft(cr, ci, -1);
  let e = 0;
  for (let k = 0; k < M; k++) e = Math.max(e, Math.abs(cr[k] - (a * xr[k] + b * yr[k])), Math.abs(ci[k] - (a * xi[k] + b * yi[k])));
  ok('1D linearity F(ax+by)=aFx+bFy', e < 1e-9, `maxErr=${e.toExponential(2)}`);
}
{
  const M = 256, r = prng(7);
  const re = new Float64Array(M), im = new Float64Array(M);
  for (let n = 0; n < M; n++) { re[n] = r(); im[n] = r(); }
  let te = 0; for (let n = 0; n < M; n++) te += re[n] * re[n] + im[n] * im[n];
  fft(re, im, -1);
  let fe = 0; for (let k = 0; k < M; k++) fe += re[k] * re[k] + im[k] * im[k];
  ok('1D Parseval', near(te, fe / M, 1e-8));
}
{
  let threw = false;
  try { fft(new Float64Array(6), new Float64Array(6), -1); } catch { threw = true; }
  ok('fft rejects non-power-of-two', threw);
  const w = hann(8);
  ok('hann endpoints ~0 & symmetric', near(w[0], 0, 1e-12) && near(w[1], w[7], 1e-12));
  const m = dftMatrixCos(16);
  let dc = true; for (let n = 0; n < 16; n++) if (!near(m[n], 1, 1e-12)) dc = false;
  ok('DFT matrix row0 = DC', dc);
  const re = new Float64Array(1024), im = new Float64Array(1024), win = hann(1024);
  for (let n = 0; n < 1024; n++) re[n] = Math.cos((2 * Math.PI * 40.5 * n) / 1024) * win[n];
  fft(re, im, -1);
  ok('peakBin sub-bin ≈ 40.5', Math.abs(peakBin(magnitude(re, im), 1) - 40.5) < 0.15);
}

// ——— 2D ———
{
  // delta at origin → constant magnitude across the whole spectrum
  const W = 32, H = 16;
  const re = new Float64Array(W * H), im = new Float64Array(W * H);
  re[0] = 1;
  fft2(re, im, W, H, -1);
  let flat = true;
  for (let i = 0; i < W * H; i++) if (!near(Math.hypot(re[i], im[i]), 1, 1e-9)) flat = false;
  ok('2D delta → flat spectrum', flat);
}
{
  // separability: f(x,y)=g(x)h(y) ⇒ F(u,v)=G(u)H(v)
  const W = 32, H = 32, rg = prng(3), rh = prng(9);
  const g = new Float64Array(W), h = new Float64Array(H);
  for (let x = 0; x < W; x++) g[x] = rg();
  for (let y = 0; y < H; y++) h[y] = rh();
  const re = new Float64Array(W * H), im = new Float64Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) re[y * W + x] = g[x] * h[y];
  fft2(re, im, W, H, -1);
  const gr = g.slice(), gi = new Float64Array(W); fft(gr, gi, -1);
  const hr = h.slice(), hi = new Float64Array(H); fft(hr, hi, -1);
  let e = 0;
  for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) {
    const er = gr[u] * hr[v] - gi[u] * hi[v];
    const ei = gr[u] * hi[v] + gi[u] * hr[v];
    e = Math.max(e, Math.abs(re[v * W + u] - er), Math.abs(im[v * W + u] - ei));
  }
  ok('2D separable F=G⊗H', e < 1e-8, `maxErr=${e.toExponential(2)}`);
}
{
  // 2D Parseval + inverse round-trip
  const W = 32, H = 32, r = prng(21);
  const re0 = new Float64Array(W * H), im0 = new Float64Array(W * H);
  for (let i = 0; i < W * H; i++) { re0[i] = r(); im0[i] = r(); }
  let te = 0; for (let i = 0; i < W * H; i++) te += re0[i] * re0[i] + im0[i] * im0[i];
  const re = re0.slice(), im = im0.slice();
  fft2(re, im, W, H, -1);
  let fe = 0; for (let i = 0; i < W * H; i++) fe += re[i] * re[i] + im[i] * im[i];
  ok('2D Parseval', near(te, fe / (W * H), 1e-7));
  fft2(re, im, W, H, +1);
  let e = 0; for (let i = 0; i < W * H; i++) e = Math.max(e, Math.abs(re[i] / (W * H) - re0[i]), Math.abs(im[i] / (W * H) - im0[i]));
  ok('2D inverse round-trip', e < 1e-9, `maxErr=${e.toExponential(2)}`);
}
{
  // fftshift2 moves DC (corner) to the centre
  const W = 8, H = 8;
  const a = new Float64Array(W * H);
  a[0] = 5; // DC at corner
  const s = fftshift2(a, W, H);
  ok('fftshift2 DC → centre', near(s[(H / 2) * W + W / 2], 5) && near(s[0], 0));
}

console.log(`\n=== FFT tests: ${fails === 0 ? 'ALL PASS' : fails + ' FAILED'} ===`);
process.exit(fails ? 1 : 0);
