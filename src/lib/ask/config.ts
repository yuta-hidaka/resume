// Shared config for the in-browser assistant.
//
// The model runs client-side via transformers.js. We load the library from
// jsDelivr inside the worker so the static Astro/Vite build never has to
// bundle onnxruntime-web's wasm assets (a well-known bundler headache).

export const TRANSFORMERS_URL =
  'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

export const MAX_NEW_TOKENS = 200; // short résumé answers; keeps a weak model fast

export type Dtype = 'q4f16' | 'q8' | 'q4';

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
};

// Models are downloaded once, in the browser, and cached. Sizes are the ~total
// of the ONNX weight files (onnx-community builds). The verifier is model-agnostic.
export const MODELS: ModelOption[] = [
  {
    id: 'onnx-community/Qwen2.5-0.5B-Instruct',
    label: 'Qwen2.5 0.5B',
    by: 'Alibaba',
    params: '0.5B',
    noteJa: '軽量・多言語・高速。まずはこれで十分。',
    noteEn: 'Light, multilingual, fast — a good default.',
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
  {
    id: 'onnx-community/TinySwallow-1.5B-Instruct-ONNX',
    label: 'TinySwallow 1.5B',
    by: 'Sakana AI',
    params: '1.5B',
    noteJa: '日本語が得意・高品質。ただし重い。',
    noteEn: 'Strong Japanese, higher quality — but heavier.',
    sizes: { q4f16: 1.2, q8: 1.56, q4: 1.77 },
    webgpuDtype: 'q4f16',
    wasmDtype: 'q8',
  },
];

// Default to the lightest model — most visitors never need the big one.
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

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
