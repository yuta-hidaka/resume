// Shared config for the in-browser assistant.
//
// The model runs client-side via transformers.js. We load the library from
// jsDelivr inside the worker so the static Astro/Vite build never has to
// bundle onnxruntime-web's wasm assets (a well-known bundler headache).

export const TRANSFORMERS_URL =
  'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

// Sakana AI's TinySwallow-1.5B-Instruct — a Japanese-specialized small model
// distilled (via TAID) from Qwen2.5-32B into a 1.5B student. Same Qwen2 arch,
// so transformers.js runs it as-is, but with markedly stronger Japanese than the
// stock Qwen2.5-1.5B. ONNX build for the browser: onnx-community/…-ONNX.
export const MODEL_ID = 'onnx-community/TinySwallow-1.5B-Instruct-ONNX';
export const MODEL_LABEL = 'Sakana AI · TinySwallow-1.5B-Instruct';

export const MAX_NEW_TOKENS = 384;

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
  dtype: 'q4f16' | 'q4';
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
  return {
    webgpu: device === 'webgpu',
    device,
    dtype: device === 'webgpu' ? 'q4f16' : 'q4',
  };
}

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
