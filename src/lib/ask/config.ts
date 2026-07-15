// Shared config for the in-browser assistant.
//
// Models run client-side on one of two runtimes:
//  - transformers.js (ONNX): WebGPU or WASM — the default path.
//  - WebLLM (MLC): compiled WebGPU kernels — much faster, but WebGPU-only.
// Both libraries are loaded from CDNs inside the worker so the static
// Astro/Vite build never has to bundle their wasm assets (a well-known
// bundler headache).

export const TRANSFORMERS_URL =
  'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

// Pinned to the version Sakana AI's own TinySwallow-ChatUI ships with — a
// proven combo of runtime + prebuilt Qwen2 model lib + MLC weights.
export const WEBLLM_URL = 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.48/+esm';

export const MAX_NEW_TOKENS = 200; // short résumé answers; keeps a weak model fast

export type Dtype = 'q4f16' | 'q8' | 'q4' | 'q4f32';

export type EngineKind = 'transformers' | 'webllm';

export type ModelOption = {
  id: string;
  label: string;
  by: string;
  params: string;
  noteJa: string;
  noteEn: string;
  /** Approx download size in GB, per dtype — for display. */
  sizes: Partial<Record<Dtype, number>>;
  /** Best dtype per backend (WebGPU can do fp16; WASM cannot). */
  webgpuDtype: Dtype;
  wasmDtype: Dtype;
  /** Runtime. 'webllm' = MLC weights via WebLLM; id is then the HF MLC repo. */
  engine?: EngineKind;
  /** WebLLM only: prebuilt model-lib wasm filename (appended to the lib CDN). */
  modelLib?: string;
  /** True for WebLLM models — they have no WASM fallback. */
  webgpuOnly?: boolean;
};

// Models are downloaded once, in the browser, and cached. Order matters: the
// first option is the default; the UI falls back to the first WASM-capable one
// when WebGPU is unavailable. The verifier is model-agnostic.
export const MODELS: ModelOption[] = [
  {
    // Sakana's official MLC build, run on WebLLM — the same combo as their
    // TinySwallow-ChatUI demo. Faster and smaller than the old ONNX build,
    // but WebGPU-only (WebLLM has no WASM fallback). Default: the best
    // Japanese answers, which is what this page is mostly asked in.
    id: 'SakanaAI/TinySwallow-1.5B-Instruct-q4f32_1-MLC',
    label: 'TinySwallow 1.5B',
    by: 'Sakana AI',
    params: '1.5B',
    noteJa: '日本語が得意・高品質。WebLLMで高速動作（WebGPU必須）。',
    noteEn: 'Strong Japanese, higher quality — fast on WebLLM (needs WebGPU).',
    sizes: { q4f32: 0.88 },
    webgpuDtype: 'q4f32',
    wasmDtype: 'q4f32', // unused — the option is disabled without WebGPU
    engine: 'webllm',
    modelLib: 'Qwen2-1.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm',
    webgpuOnly: true,
  },
  {
    id: 'onnx-community/Qwen2.5-0.5B-Instruct',
    label: 'Qwen2.5 0.5B',
    by: 'Alibaba',
    params: '0.5B',
    noteJa: '軽量・多言語・高速。',
    noteEn: 'Light, multilingual, fast.',
    sizes: { q4f16: 0.5, q8: 0.6, q4: 0.7 },
    webgpuDtype: 'q4f16',
    wasmDtype: 'q8',
  },
  {
    id: 'onnx-community/Qwen3-0.6B-ONNX',
    label: 'Qwen3 0.6B',
    by: 'Alibaba',
    params: '0.6B',
    noteJa: '新しめ・高品質。思考なしモードで直接回答（実験的）。',
    noteEn: 'Newer, higher quality; answers directly (thinking off). Experimental.',
    sizes: { q4f16: 0.57, q8: 0.62, q4: 0.92 },
    webgpuDtype: 'q4f16',
    wasmDtype: 'q8',
  },
];

// Default = the first model (TinySwallow). Without WebGPU the UI falls back
// to the first non-disabled option (Qwen 0.5B).
export const DEFAULT_MODEL_ID = MODELS[0].id;

export function getModel(id: string): ModelOption {
  return MODELS.find((m) => m.id === id) ?? MODELS[0];
}

/** Best dtype for a model on the current backend (or an explicit override). */
export function dtypeFor(model: ModelOption, device: Device, override?: Dtype): Dtype {
  if (override && model.sizes[override] != null) {
    // WASM can't run fp16 — never hand it q4f16.
    if (device === 'wasm' && override === 'q4f16') return model.wasmDtype;
    return override;
  }
  return device === 'webgpu' ? model.webgpuDtype : model.wasmDtype;
}

/** Approx download size (GB) for a model + dtype, for the UI. */
export function sizeGb(model: ModelOption, dtype: Dtype): number {
  return model.sizes[dtype] ?? model.sizes[model.webgpuDtype] ?? 1;
}

export type Progress = {
  status: string; // 'initiate' | 'download' | 'progress' | 'done' | 'ready'
  name?: string;
  file?: string;
  progress?: number; // 0–100
  loaded?: number;
  total?: number;
};

export type Device = 'webgpu' | 'wasm';

export type Capabilities = {
  webgpu: boolean;
  device: Device;
};

export function detectCapabilities(): Capabilities {
  // Escape hatch: ?backend=wasm (or =webgpu) forces a backend. Handy when a
  // machine reports WebGPU but its driver actually can't run the compute.
  let forced: Device | null = null;
  if (typeof location !== 'undefined') {
    const q = new URLSearchParams(location.search).get('backend');
    if (q === 'wasm' || q === 'webgpu') forced = q;
  }

  const hasGpu =
    typeof navigator !== 'undefined' && 'gpu' in navigator && !!(navigator as any).gpu;
  const device: Device = forced ?? (hasGpu ? 'webgpu' : 'wasm');
  return { webgpu: device === 'webgpu', device };
}

/** Whether WebGPU actually works. `'gpu' in navigator` alone is a false
 *  positive on some setups (e.g. hardware acceleration off, GPU blocklisted):
 *  the object exists but requestAdapter() returns null and every WebGPU model
 *  load then fails. Async, so it complements the sync detectCapabilities(). */
export async function probeWebGPU(): Promise<boolean> {
  try {
    const gpu = typeof navigator !== 'undefined' ? (navigator as any).gpu : null;
    if (!gpu) return false;
    return !!(await gpu.requestAdapter());
  } catch {
    return false;
  }
}

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
