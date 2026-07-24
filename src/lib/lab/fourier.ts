/**
 * The Fourier transform as a *measurement* instrument. Measure a signal x(t) —
 * from the laptop microphone (real) or a synthesized source — then apply the
 * linear transform X = F·x and watch the frequency content appear. Top of the
 * main canvas: the measured waveform. Bottom: its magnitude spectrum |X(f)|.
 * A side canvas shows the DFT matrix F itself: X = F·x is just a change of basis
 * into pure frequencies, and each row of F is one of those frequencies.
 *
 * The pure transform lives in ./fft (DOM-free, unit-tested headless). This file
 * is the measuring + rendering glue.
 */

import { tokens, ramp, sampleRamp, rgb, glowStroke, glowDot, areaFill, subtleGrid, label } from './viz';
import { fft, hann, magnitude, peakBin, dftMatrixCos } from './fft';

export type SourceKind = 'tone' | 'chord' | 'square' | 'noise' | 'mic';

export interface FourierLabels {
  measured: string; // "測定：信号 x(t)"
  transform: string; // "フーリエ変換  X = F x"
  spectrum: string; // "スペクトル |X(f)|"
  time: string; // "時間 →"
  freq: string; // "周波数 (Hz)"
  micDenied: string; // fallback note when the mic can't be opened
  matrixRow: string; // "各行 = 1つの周波数"
}

export interface FourierInfo {
  source: SourceKind;
  peakHz: number | null;
  micActive: boolean;
  micError: boolean;
}

export interface FourierScope {
  setSource(kind: SourceKind): Promise<void>;
  setFrequency(hz: number): void;
  reset(): void;
  dispose(): void;
}

const N = 2048; // analysis window (power of two for the radix-2 FFT)
const SYNTH_SR = 8000; // synth sample rate — puts musical tones in a clean bin range
const FMAX_HZ = 2000; // top of the displayed frequency axis
const N_MAT = 32; // size of the illustrative DFT matrix heatmap

export function createFourierScope(
  main: HTMLCanvasElement,
  matrixCanvas: HTMLCanvasElement,
  labels: FourierLabels,
  onInfo?: (info: FourierInfo) => void,
): FourierScope {
  const ctx = main.getContext('2d')!;
  const mctx = matrixCanvas.getContext('2d')!;

  const win = hann(N);
  const timeBuf = new Float64Array(N); // measured samples x[n]
  const micTime = new Float32Array(N); // scratch for AnalyserNode reads
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  const magSmooth = new Float64Array(N / 2 + 1); // temporally-averaged |X|
  let specMax = 1e-6; // auto-scale for the spectrum band
  let waveMax = 0.5; // auto-gain for the waveform display (helps quiet mic input)

  let source: SourceKind = 'tone';
  let toneHz = 440;
  let clock = 0; // synth sample clock (advances the waveform)
  let peakHz: number | null = null;
  let currentSR = SYNTH_SR; // sample rate of the window now in timeBuf

  // ——— audio input (real measurement), opened lazily and fully guarded ———
  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let micStream: MediaStream | null = null;
  let micError = false;
  let micGen = 0; // bumped on every setSource; invalidates in-flight mic opens

  const emit = () =>
    onInfo?.({ source, peakHz, micActive: source === 'mic' && !!analyser, micError });

  const stopMic = () => {
    if (micStream) {
      for (const tr of micStream.getTracks()) tr.stop();
      micStream = null;
    }
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
    analyser = null;
  };

  // `gen` is this request's generation. If the user switches source while the
  // permission prompt is open (or double-clicks the mic chip), a newer request
  // bumps micGen and this call becomes stale — it must tear down whatever it
  // created rather than commit it, so no orphaned stream keeps recording.
  const startMic = async (gen: number): Promise<boolean> => {
    micError = false;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    const abandon = () => {
      if (stream) for (const tr of stream.getTracks()) tr.stop();
      if (ctx) ctx.close().catch(() => {});
    };
    try {
      const AC: typeof AudioContext =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC || !navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      if (gen !== micGen) return abandon(), false; // superseded during the prompt
      ctx = new AC();
      if (ctx.state === 'suspended') await ctx.resume().catch(() => {});
      if (gen !== micGen) return abandon(), false; // superseded during resume
      const srcNode = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = N;
      an.smoothingTimeConstant = 0;
      srcNode.connect(an); // analyser is a sink; not connected to destination (no playback / feedback)
      stopMic(); // replace any previously-committed mic before taking ownership
      micStream = stream;
      audioCtx = ctx;
      analyser = an;
      return true;
    } catch {
      micError = true;
      abandon();
      return false;
    }
  };

  // ——— signal sources: fill timeBuf with the current measured window ———
  const synthSample = (tSec: number): number => {
    const w = 2 * Math.PI * tSec;
    switch (source) {
      case 'chord': // just-intonation major triad 4:5:6 → three clean peaks
        return (Math.sin(w * toneHz) + Math.sin(w * toneHz * 1.25) + Math.sin(w * toneHz * 1.5)) / 3;
      case 'square': // odd harmonics f, 3f, 5f, …
        return 0.7 * Math.sign(Math.sin(w * toneHz) || 1);
      case 'noise':
        return Math.random() * 2 - 1;
      case 'tone':
      default:
        return Math.sin(w * toneHz);
    }
  };

  // Fills timeBuf with the current measured window and records its sample rate.
  const measure = (dt: number): void => {
    if (source === 'mic' && analyser && audioCtx) {
      analyser.getFloatTimeDomainData(micTime);
      for (let n = 0; n < N; n++) timeBuf[n] = micTime[n];
      currentSR = audioCtx.sampleRate;
      return;
    }
    // synth: slide the analysis window forward so the waveform scrolls
    clock += SYNTH_SR * dt;
    for (let n = 0; n < N; n++) timeBuf[n] = synthSample((clock + n) / SYNTH_SR);
    currentSR = SYNTH_SR;
  };

  // ——— the transform + readouts ———
  const transform = () => {
    const sr = currentSR;
    let wmax = 1e-4;
    for (let n = 0; n < N; n++) {
      const v = timeBuf[n];
      const a = v < 0 ? -v : v;
      if (a > wmax) wmax = a;
      re[n] = v * win[n];
      im[n] = 0;
    }
    waveMax += (wmax - waveMax) * 0.1; // smooth auto-gain
    fft(re, im, -1);
    const mag = magnitude(re, im);
    let mmax = 1e-6;
    for (let k = 0; k < mag.length; k++) {
      magSmooth[k] += (mag[k] - magSmooth[k]) * 0.35; // temporal averaging → calm display
      if (magSmooth[k] > mmax) mmax = magSmooth[k];
    }
    specMax = Math.max(specMax * 0.985, mmax);

    // dominant frequency, only reported when there is a genuine peak
    const loBin = Math.max(2, Math.round((50 * N) / sr));
    const hiBin = Math.max(loBin, Math.min(magSmooth.length - 1, Math.round((FMAX_HZ * N) / sr)));
    let sum = 0;
    for (let k = loBin; k <= hiBin; k++) sum += magSmooth[k];
    const mean = sum / Math.max(1, hiBin - loBin + 1);
    const pb = peakBin(magSmooth, loBin, hiBin);
    const pv = magSmooth[Math.round(pb)];
    peakHz = pv > 4 * mean ? (pb * sr) / N : null;
    return { mag: magSmooth, sr, hiBin };
  };

  // ——— DFT matrix heatmap (static; rebuilt on theme/size change) ———
  const matCells = dftMatrixCos(N_MAT);
  let matOff: HTMLCanvasElement | null = null;
  let matDark: boolean | null = null;
  const buildMatrix = (dark: boolean) => {
    const off = document.createElement('canvas');
    off.width = N_MAT;
    off.height = N_MAT;
    const octx = off.getContext('2d')!;
    const phase = ramp('phase'); // gold ↔ mint diverging, for signed cos values
    const img = octx.createImageData(N_MAT, N_MAT);
    for (let k = 0; k < N_MAT; k++) {
      for (let n = 0; n < N_MAT; n++) {
        const v = matCells[k * N_MAT + n]; // cos ∈ [-1, 1]
        const c = sampleRamp(phase, (v + 1) / 2);
        const o = (k * N_MAT + n) * 4;
        const dim = dark ? 1 : 0.92;
        img.data[o] = c[0] * dim;
        img.data[o + 1] = c[1] * dim;
        img.data[o + 2] = c[2] * dim;
        img.data[o + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    matOff = off;
    matDark = dark;
  };

  const drawMatrix = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = matrixCanvas.clientWidth || 1;
    const h = matrixCanvas.clientHeight || 1;
    if (matrixCanvas.width !== Math.round(w * dpr) || matrixCanvas.height !== Math.round(h * dpr)) {
      matrixCanvas.width = Math.max(1, Math.round(w * dpr));
      matrixCanvas.height = Math.max(1, Math.round(h * dpr));
    }
    const tk = tokens();
    if (!matOff || matDark !== tk.dark) buildMatrix(tk.dark);
    mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mctx.clearRect(0, 0, w, h);
    const pad = 22; // room for axis labels
    const gx = pad;
    const gy = 6;
    const gw = w - pad - 6;
    const gh = h - gy - 18;
    mctx.imageSmoothingEnabled = false;
    mctx.globalAlpha = tk.dark ? 0.95 : 1;
    mctx.drawImage(matOff!, gx, gy, gw, gh);
    mctx.globalAlpha = 1;

    // highlight the matrix row for the currently-dominant frequency
    if (peakHz != null) {
      const row = Math.round((peakHz * N_MAT) / currentSR);
      if (row >= 1 && row < N_MAT) {
        const rh = gh / N_MAT;
        mctx.strokeStyle = rgb(tk.gold, tk.dark ? 0.95 : 0.85);
        mctx.lineWidth = 1.5;
        mctx.strokeRect(gx, gy + row * rh, gw, rh);
      }
    }
    // axis labels
    label(mctx, `k ${labels.matrixRow}`, gx, h - 5, tk.inkMuted, { size: 10, align: 'left' });
    label(mctx, 'n →', gx + gw, h - 5, tk.inkMuted, { size: 10, align: 'right' });
    label(mctx, 'F', gx - 13, gy + 11, tk.gold, { size: 12, weight: 600, align: 'center' });
  };

  // ——— main render: measured waveform (top) → spectrum (bottom) ———
  const draw = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = main.width / dpr;
    const h = main.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const tk = tokens();
    const greenRamp = ramp('emerald');
    const goldRamp = ramp('gold');
    const pad = 14;
    const waveTop = pad;
    const waveBot = h * 0.44;
    const specTop = h * 0.54;
    const specBot = h - 26;
    const waveMid = (waveTop + waveBot) / 2;

    subtleGrid(ctx, w, h, Math.max(28, w / 16), tk.grid);

    // waveform (measurement)
    const waveH = (waveBot - waveTop) * 0.9;
    const gain = 1 / (waveMax * 1.15);
    const wpts: { x: number; y: number }[] = [];
    const step = Math.max(1, Math.floor(N / Math.max(64, w)));
    for (let n = 0; n < N; n += step) {
      const x = pad + (n / (N - 1)) * (w - 2 * pad);
      const y = waveMid - Math.max(-1.2, Math.min(1.2, timeBuf[n] * gain)) * (waveH / 2);
      wpts.push({ x, y });
    }
    glowStroke(ctx, wpts, sampleRamp(greenRamp, 0.72), 1.4, tk.glowAlpha, tk.dark);
    label(ctx, labels.measured, pad, waveTop + 12, tk.green, { size: 12, weight: 600 });
    label(ctx, labels.time, w - pad, waveBot - 2, tk.inkMuted, { size: 10, align: 'right' });

    // the transform, between the two bands
    label(ctx, labels.transform, w / 2, (waveBot + specTop) / 2 + 4, tk.inkMuted, {
      size: 12,
      align: 'center',
    });

    // spectrum (frequency domain) — measure() already filled timeBuf this frame
    const { mag, sr, hiBin } = transform();
    const specW = w - 2 * pad;
    const spts: { x: number; y: number }[] = [];
    const norm = 1 / specMax;
    for (let px = 0; px <= specW; px++) {
      const freq = (px / specW) * FMAX_HZ;
      const binF = (freq * N) / sr;
      const k = Math.min(hiBin, Math.round(binF));
      const v = Math.min(1, mag[k] * norm);
      const y = specBot - Math.pow(v, 0.7) * (specBot - specTop);
      spts.push({ x: pad + px, y });
    }
    areaFill(ctx, spts, specBot, sampleRamp(goldRamp, 0.7), tk.dark ? 0.3 : 0.22);
    glowStroke(ctx, spts, sampleRamp(goldRamp, 0.82), 1.4, tk.glowAlpha, tk.dark);
    label(ctx, labels.spectrum, pad, specTop + 12, tk.gold, { size: 12, weight: 600 });

    // frequency axis ticks
    for (let f = 0; f <= FMAX_HZ; f += 500) {
      const x = pad + (f / FMAX_HZ) * specW;
      label(ctx, f === 0 ? '0' : `${f}`, x, specBot + 14, tk.inkMuted, {
        size: 9,
        align: f === 0 ? 'left' : f === FMAX_HZ ? 'right' : 'center',
      });
    }
    label(ctx, labels.freq, w - pad, specTop + 12, tk.inkMuted, { size: 10, align: 'right' });

    // dominant-frequency marker
    if (peakHz != null && peakHz <= FMAX_HZ) {
      const x = pad + (peakHz / FMAX_HZ) * specW;
      ctx.save();
      ctx.strokeStyle = rgb(tk.gold, tk.dark ? 0.5 : 0.6);
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, specTop);
      ctx.lineTo(x, specBot);
      ctx.stroke();
      ctx.restore();
      const yMark = specBot - Math.pow(Math.min(1, mag[Math.round((peakHz * N) / sr)] * norm), 0.7) * (specBot - specTop);
      glowDot(ctx, x, yMark, 2.2, sampleRamp(goldRamp, 1), tk.dark ? 1 : 0.8);
      label(ctx, `${Math.round(peakHz)} Hz`, Math.min(w - pad, x + 6), specTop + 26, tk.gold, {
        size: 11,
        weight: 600,
        align: x > w - 60 ? 'right' : 'left',
      });
    }
  };

  // ——— rAF loop drives both canvases; dt from a wall clock ———
  let rafId = 0;
  let last = performance.now();
  let lastEmitKey = '';
  const loop = (now: number) => {
    rafId = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    measure(dt); // fill timeBuf + set currentSR (also advances the synth clock)
    draw();
    drawMatrix();
    // emit only on a meaningful change (rounded Hz / source / mic state), not every frame
    const key = `${source}|${peakHz == null ? '-' : Math.round(peakHz)}|${!!analyser}|${micError}`;
    if (key !== lastEmitKey) {
      lastEmitKey = key;
      emit();
    }
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    main.width = Math.max(1, Math.round(main.clientWidth * dpr));
    main.height = Math.max(1, Math.round(main.clientHeight * dpr));
  };
  const ro = new ResizeObserver(resize);
  ro.observe(main);
  window.addEventListener('resize', resize);
  resize();
  rafId = requestAnimationFrame(loop);
  emit();

  return {
    async setSource(kind) {
      if (kind === source) return;
      const gen = ++micGen; // invalidate any mic open still in flight
      let changed = false;
      if (kind === 'mic') {
        // Opening the mic can fail (no device / denied); on failure keep the
        // current synth source and surface micError to the page.
        const okMic = await startMic(gen);
        if (gen !== micGen) return; // superseded by a newer setSource
        if (okMic) {
          source = 'mic';
          changed = true;
        }
      } else {
        if (source === 'mic') stopMic();
        source = kind;
        micError = false; // a successful non-mic switch clears any stale denial
        changed = true;
      }
      if (changed) {
        // reset scaling so the new source fills the display cleanly
        specMax = 1e-6;
        waveMax = 0.5;
        magSmooth.fill(0);
        peakHz = null;
      }
      emit();
    },
    setFrequency(hz) {
      toneHz = Math.max(50, Math.min(FMAX_HZ, hz));
    },
    reset() {
      specMax = 1e-6;
      waveMax = 0.5;
      magSmooth.fill(0);
      clock = 0;
    },
    dispose() {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('resize', resize);
      stopMic();
    },
  };
}
