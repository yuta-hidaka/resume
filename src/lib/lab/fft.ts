/**
 * Pure DFT/FFT helpers for the Fourier lab piece — no DOM, no imports, so the
 * transform itself can be unit-tested headless (see scripts). The Fourier
 * transform is a linear map X = F·x (a change of basis into complex
 * exponentials); these functions are that map and a few things you read off it.
 */

/**
 * In-place iterative radix-2 Cooley–Tukey FFT. `N = re.length` MUST be a power
 * of two, and `im.length === re.length`. `sign = -1` is the forward transform,
 * `+1` the inverse (the inverse is NOT normalized — divide by N yourself).
 */
export function fft(re: Float64Array, im: Float64Array, sign: -1 | 1 = -1): void {
  const N = re.length;
  if (N <= 1) return;
  if ((N & (N - 1)) !== 0) throw new Error(`fft: length must be a power of two, got ${N}`);

  // Decimation-in-time bit-reversal permutation.
  for (let i = 1, j = 0; i < N; i++) {
    let bit = N >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i];
      re[i] = re[j];
      re[j] = tr;
      const ti = im[i];
      im[i] = im[j];
      im[j] = ti;
    }
  }

  for (let len = 2; len <= N; len <<= 1) {
    const ang = (sign * 2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < N; i += len) {
      let cr = 1;
      let ci = 0;
      const half = len >> 1;
      for (let k = 0; k < half; k++) {
        const a = i + k;
        const b = a + half;
        const xr = re[b] * cr - im[b] * ci;
        const xi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - xr;
        im[b] = im[a] - xi;
        re[a] += xr;
        im[a] += xi;
        const ncr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = ncr;
      }
    }
  }
}

/**
 * In-place 2D FFT of a `w × h` complex field stored row-major (`y*w + x`). Both
 * dimensions must be powers of two. Transforms every row, then every column.
 * `sign = -1` forward, `+1` inverse (unnormalized). This is the transform behind
 * a diffraction pattern: the far-field amplitude is the 2D Fourier transform of
 * the object's density.
 */
export function fft2(re: Float64Array, im: Float64Array, w: number, h: number, sign: -1 | 1 = -1): void {
  const rr = new Float64Array(w);
  const ri = new Float64Array(w);
  for (let y = 0; y < h; y++) {
    const o = y * w;
    for (let x = 0; x < w; x++) {
      rr[x] = re[o + x];
      ri[x] = im[o + x];
    }
    fft(rr, ri, sign);
    for (let x = 0; x < w; x++) {
      re[o + x] = rr[x];
      im[o + x] = ri[x];
    }
  }
  const cr = new Float64Array(h);
  const ci = new Float64Array(h);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      cr[y] = re[y * w + x];
      ci[y] = im[y * w + x];
    }
    fft(cr, ci, sign);
    for (let y = 0; y < h; y++) {
      re[y * w + x] = cr[y];
      im[y * w + x] = ci[y];
    }
  }
}

/**
 * Swap quadrants so the zero frequency (DC) moves from the corner to the centre
 * — the natural way to view a diffraction pattern. `w`, `h` should be even.
 */
export function fftshift2(src: Float64Array, w: number, h: number): Float64Array {
  const out = new Float64Array(w * h);
  const hx = w >> 1;
  const hy = h >> 1;
  for (let y = 0; y < h; y++) {
    const sy = (y + hy) % h;
    for (let x = 0; x < w; x++) {
      const sx = (x + hx) % w;
      out[y * w + x] = src[sy * w + sx];
    }
  }
  return out;
}

/** Periodic Hann window — tames spectral leakage so a tone reads as one clean lobe. */
export function hann(N: number): Float64Array {
  const w = new Float64Array(N);
  for (let n = 0; n < N; n++) w[n] = 0.5 * (1 - Math.cos((2 * Math.PI * n) / N));
  return w;
}

/** One-sided magnitude spectrum |X_k| for k in [0, N/2]. */
export function magnitude(re: Float64Array, im: Float64Array): Float64Array {
  const H = re.length >> 1;
  const m = new Float64Array(H + 1);
  for (let k = 0; k <= H; k++) m[k] = Math.hypot(re[k], im[k]);
  return m;
}

/**
 * Index of the strongest bin in [lo, hi], refined to a fractional bin by
 * parabolic interpolation of its neighbours (sub-bin pitch accuracy). Returns
 * `lo` if the range is empty/flat.
 */
export function peakBin(mag: Float64Array, lo = 1, hi = mag.length - 1): number {
  hi = Math.min(hi, mag.length - 1);
  let best = lo;
  let bv = -Infinity;
  for (let k = lo; k <= hi; k++) {
    if (mag[k] > bv) {
      bv = mag[k];
      best = k;
    }
  }
  if (best <= 0 || best >= mag.length - 1) return best;
  const a = mag[best - 1];
  const b = mag[best];
  const c = mag[best + 1];
  const denom = a - 2 * b + c;
  const delta = denom !== 0 ? (0.5 * (a - c)) / denom : 0;
  return best + Math.max(-0.5, Math.min(0.5, delta));
}

/**
 * Real part cos(2π k n / N) of the N×N DFT matrix F, row-major (`k*N + n`).
 * Row k is the k-th basis frequency; X_k is the inner product of that row with
 * the signal. Used to draw the "X = F·x is a change of basis" heatmap.
 */
export function dftMatrixCos(N: number): Float64Array {
  const m = new Float64Array(N * N);
  for (let k = 0; k < N; k++) {
    for (let n = 0; n < N; n++) {
      m[k * N + n] = Math.cos((2 * Math.PI * k * n) / N);
    }
  }
  return m;
}
