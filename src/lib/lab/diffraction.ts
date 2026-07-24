/**
 * Crystals & diffraction — the reciprocal world. A 2D crystal (real space) and
 * its diffraction pattern side by side. Physically, the far-field diffracted
 * amplitude is the 2D Fourier transform of the crystal's electron density, and
 * what a detector measures is its squared magnitude |F(q)|². So: real lattice on
 * the left, |F|² on the right — and because the Fourier transform commutes with
 * rotation, spinning the crystal spins the pattern in lock-step.
 *
 * The "phase problem" is built in: a detector records only |F|², throwing the
 * phase away. Inverse-transforming the intensities alone does NOT give the
 * crystal back — it gives the autocorrelation (the Patterson map). Toggle it to
 * see the image fail to reconstruct.
 *
 * The pure 2D transform lives in ./fft (fft2/fftshift2, unit-tested headless).
 */

import { tokens, ramp, sampleRamp, rgb, glowDot, label, subtleGrid, type RGB, type Ramp } from './viz';
import { fft2, fftshift2 } from './fft';

export type Lattice = 'square' | 'hex';
export type PhaseMode = 'crystal' | 'nophase';

export interface DiffractionLabels {
  real: string; // "結晶（実空間）"
  recip: string; // "回折 |F|²（逆空間）"
  patterson: string; // "強度だけで復元（位相なし）→ 自己相関"
}

export interface DiffractionInfo {
  dAngstrom: number; // real-space spacing in Å (flavor)
  qInv: number; // 2π/d in Å⁻¹
  lattice: Lattice;
  basis: number;
  phaseMode: PhaseMode;
}

export interface DiffractionScene {
  setSpacing(px: number): void;
  setLattice(l: Lattice): void;
  setBasis(count: number): void;
  setPhaseMode(m: PhaseMode): void;
  dispose(): void;
}

const G = 128; // density grid (power of two for fft2)
const SIGMA = 2.0; // atom blob radius (px)
const ANG_PER_PX = 0.26; // Å per grid pixel — makes d land in a realistic few-Å range

interface Atom {
  x: number;
  y: number;
}

export function createDiffractionScene(
  canvas: HTMLCanvasElement,
  labels: DiffractionLabels,
  onInfo?: (info: DiffractionInfo) => void,
): DiffractionScene {
  const ctx = canvas.getContext('2d')!;

  let dPix = 22;
  let lattice: Lattice = 'square';
  let basis = 1;
  let phaseMode: PhaseMode = 'crystal';
  let dirty = true;

  const density = new Float64Array(G * G);
  const re = new Float64Array(G * G);
  const im = new Float64Array(G * G);

  let atoms: Atom[] = [];
  let diffImg: HTMLCanvasElement | null = null; // |F|² heatmap
  let pattImg: HTMLCanvasElement | null = null; // Patterson (phase-discarded) reconstruction
  let imgDark: boolean | null = null;

  const emit = () =>
    onInfo?.({
      dAngstrom: dPix * ANG_PER_PX,
      qInv: (2 * Math.PI) / (dPix * ANG_PER_PX),
      lattice,
      basis,
      phaseMode,
    });

  // lattice vectors in grid px
  const latticeVectors = (): [Atom, Atom] =>
    lattice === 'hex'
      ? [
          { x: dPix, y: 0 },
          { x: dPix / 2, y: (dPix * Math.sqrt(3)) / 2 },
        ]
      : [
          { x: dPix, y: 0 },
          { x: 0, y: dPix },
        ];

  const buildAtoms = (): Atom[] => {
    const [a1, a2] = latticeVectors();
    const basisOffsets: Atom[] =
      basis === 2 ? [{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }] : [{ x: 0, y: 0 }];
    const out: Atom[] = [];
    const span = Math.ceil(G / dPix) + 2;
    const m = SIGMA * 3;
    for (let i = -span; i <= span; i++) {
      for (let j = -span; j <= span; j++) {
        for (const b of basisOffsets) {
          const fi = i + b.x;
          const fj = j + b.y;
          const x = G / 2 + fi * a1.x + fj * a2.x;
          const y = G / 2 + fi * a1.y + fj * a2.y;
          if (x >= -m && x < G + m && y >= -m && y < G + m) out.push({ x, y });
        }
      }
    }
    return out;
  };

  const rasterize = () => {
    density.fill(0);
    const r = Math.ceil(SIGMA * 3);
    const inv2s2 = 1 / (2 * SIGMA * SIGMA);
    for (const a of atoms) {
      const cx = Math.round(a.x);
      const cy = Math.round(a.y);
      for (let dy = -r; dy <= r; dy++) {
        const y = cy + dy;
        if (y < 0 || y >= G) continue;
        for (let dx = -r; dx <= r; dx++) {
          const x = cx + dx;
          if (x < 0 || x >= G) continue;
          const ex = a.x - x;
          const ey = a.y - y;
          density[y * G + x] += Math.exp(-(ex * ex + ey * ey) * inv2s2);
        }
      }
    }
  };

  // paint a G×G scalar field into an offscreen canvas through a color ramp
  const makeImage = (
    vals: Float64Array,
    rampArr: Ramp,
    opts: { log?: boolean; gain?: number; pow?: number; dark: boolean },
  ): HTMLCanvasElement => {
    const off = document.createElement('canvas');
    off.width = G;
    off.height = G;
    const octx = off.getContext('2d')!;
    const img = octx.createImageData(G, G);
    const t = new Float64Array(G * G);
    let max = 1e-12;
    for (let i = 0; i < vals.length; i++) {
      const v = Math.max(0, vals[i]);
      const tv = opts.log ? Math.log(1 + v * (opts.gain ?? 1)) : Math.pow(v, opts.pow ?? 1);
      t[i] = tv;
      if (tv > max) max = tv;
    }
    const dim = opts.dark ? 1 : 0.9;
    for (let i = 0; i < t.length; i++) {
      const u = t[i] / max;
      const c = sampleRamp(rampArr, u);
      const o = i * 4;
      img.data[o] = c[0] * dim;
      img.data[o + 1] = c[1] * dim;
      img.data[o + 2] = c[2] * dim;
      // alpha tracks intensity so low signal is transparent — the panel keeps the
      // gallery's additive-glow-on-transparent look instead of an opaque block.
      img.data[o + 3] = Math.round(Math.min(1, u * 1.15) * 255);
    }
    octx.putImageData(img, 0, 0);
    return off;
  };

  const rebuild = (dark: boolean) => {
    atoms = buildAtoms();
    rasterize();

    // 2D FFT of the density → structure factor F(q)
    for (let i = 0; i < density.length; i++) {
      re[i] = density[i];
      im[i] = 0;
    }
    fft2(re, im, G, G, -1);

    // intensity |F|² (corner-DC layout)
    const inten = new Float64Array(G * G);
    for (let i = 0; i < inten.length; i++) inten[i] = re[i] * re[i] + im[i] * im[i];

    // diffraction display: drop the enormous DC (forward beam) so the Bragg
    // spots are visible, then fftshift to centre and log-compress.
    const intenDisp = inten.slice();
    intenDisp[0] = 0;
    const diffShift = fftshift2(intenDisp, G, G);
    diffImg = makeImage(diffShift, ramp('gold'), { log: true, gain: 0.02, dark });

    // Patterson map = ifft2(|F|²) → autocorrelation (what intensities alone give)
    const pr = inten.slice();
    const pi = new Float64Array(G * G);
    fft2(pr, pi, G, G, +1);
    const patReal = new Float64Array(G * G);
    for (let i = 0; i < patReal.length; i++) patReal[i] = Math.abs(pr[i]);
    const patShift = fftshift2(patReal, G, G);
    patShift[(G / 2) * G + G / 2] = 0; // clamp the giant self-correlation origin peak
    pattImg = makeImage(patShift, ramp('emerald'), { pow: 0.5, dark });

    imgDark = dark;
    emit();
  };

  // ——— layout: two panels, side by side when wide, stacked when tall ———
  const panels = (w: number, h: number) => {
    const gap = 10;
    if (w >= h * 1.15) {
      const pw = (w - gap) / 2;
      return [
        { x: 0, y: 0, w: pw, h },
        { x: pw + gap, y: 0, w: pw, h },
      ];
    }
    const ph = (h - gap) / 2;
    return [
      { x: 0, y: 0, w, h: ph },
      { x: 0, y: ph + gap, w, h: ph },
    ];
  };

  const drawImagePanel = (
    off: HTMLCanvasElement,
    p: { x: number; y: number; w: number; h: number },
    theta: number,
    dark: boolean,
  ) => {
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const s = Math.min(p.w, p.h) * 0.92;
    ctx.save();
    ctx.beginPath();
    ctx.rect(p.x, p.y, p.w, p.h);
    ctx.clip();
    ctx.translate(cx, cy);
    ctx.rotate(theta);
    ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, -s / 2, -s / 2, s, s);
    ctx.restore();
  };

  const drawAtoms = (
    p: { x: number; y: number; w: number; h: number },
    theta: number,
    tk: ReturnType<typeof tokens>,
  ) => {
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const s = Math.min(p.w, p.h) * 0.92;
    const scale = s / G;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const green = ramp('emerald');
    ctx.save();
    ctx.beginPath();
    ctx.rect(p.x, p.y, p.w, p.h);
    ctx.clip();
    for (const a of atoms) {
      const rx = (a.x - G / 2) * scale;
      const ry = (a.y - G / 2) * scale;
      const x = cx + rx * cos - ry * sin;
      const y = cy + rx * sin + ry * cos;
      if (x < p.x - 4 || x > p.x + p.w + 4 || y < p.y - 4 || y > p.y + p.h + 4) continue;
      glowDot(ctx, x, y, Math.max(1.4, scale * 1.4), sampleRamp(green, 0.75), tk.dark ? 0.95 : 0.8);
    }
    ctx.restore();
  };

  let rafId = 0;
  let last = performance.now();
  let theta = 0;
  const draw = (now: number) => {
    rafId = requestAnimationFrame(draw);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    theta += dt * 0.12; // slow lock-step rotation

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const tk = tokens();
    if (dirty || imgDark !== tk.dark) {
      rebuild(tk.dark);
      dirty = false;
    }
    if (!diffImg || !pattImg) return;

    subtleGrid(ctx, w, h, Math.max(26, w / 18), tk.grid);
    const [pa, pb] = panels(w, h);

    // left: crystal (or the phase-discarded reconstruction)
    if (phaseMode === 'crystal') {
      drawAtoms(pa, theta, tk);
      label(ctx, labels.real, pa.x + 10, pa.y + 16, tk.green, { size: 12, weight: 600 });
    } else {
      drawImagePanel(pattImg, pa, theta, tk.dark);
      label(ctx, labels.patterson, pa.x + 10, pa.y + 16, tk.green, { size: 11, weight: 600 });
    }

    // right: diffraction |F|²
    drawImagePanel(diffImg, pb, theta, tk.dark);
    label(ctx, labels.recip, pb.x + 10, pb.y + 16, tk.gold, { size: 12, weight: 600 });
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  window.addEventListener('resize', resize);
  resize();
  rafId = requestAnimationFrame(draw);
  emit();

  return {
    setSpacing(px) {
      dPix = Math.max(12, Math.min(44, px));
      dirty = true;
      emit();
    },
    setLattice(l) {
      lattice = l;
      dirty = true;
      emit();
    },
    setBasis(count) {
      basis = count === 2 ? 2 : 1;
      dirty = true;
      emit();
    },
    setPhaseMode(m) {
      phaseMode = m;
      emit();
    },
    dispose() {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('resize', resize);
    },
  };
}
