// Main-thread controller for the in-browser assistant. Owns the worker,
// exposes a small promise/callback API, and keeps model state so both the
// floating widget and the /ask page can share one loaded model per tab.

import {
  detectCapabilities,
  DEFAULT_MODEL_ID,
  getModel,
  dtypeFor,
  MAX_NEW_TOKENS,
  WLLAMA_URL,
  WLLAMA_WASM_URL,
  type Capabilities,
  type ChatMessage,
  type Dtype,
  type ModelOption,
  type Progress,
} from './config';
import { stripThinking } from './format';

export { detectCapabilities, probeWebGPU } from './config';
export type { Capabilities, ChatMessage, Progress } from './config';

type AskHandlers = {
  onStart?: () => void;
  onToken?: (text: string) => void;
  onDone?: (text: string) => void;
  onError?: (err: Error) => void;
  maxNewTokens?: number;
  sample?: boolean;
};

export class AskEngine {
  private worker: Worker | null = null;
  // wllama (llama.cpp WASM, GGUF) runs on the MAIN thread — it cannot start
  // inside our worker (it touches `document` while wiring up its own internal
  // inference worker, which also means it never blocks the UI from here).
  private wllama: any = null;
  private wllamaAbort: AbortController | null = null;
  readonly caps: Capabilities = detectCapabilities();
  ready = false;
  loading = false;
  busy = false;
  loadedModelId: string | null = null;

  private spawn() {
    if (this.worker) return;
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  }

  private disposeWllama() {
    try {
      this.wllama?.exit?.();
    } catch {}
    this.wllama = null;
    this.wllamaAbort = null;
  }

  private async loadWllama(model: ModelOption, onProgress?: (p: Progress) => void): Promise<void> {
    const mod = await import(/* @vite-ignore */ WLLAMA_URL);
    // Suppress llama.cpp's very chatty native logging; keep warnings/errors.
    const w = new mod.Wllama({ default: WLLAMA_WASM_URL }, { logger: mod.LoggerWithoutDebug });
    await w.loadModelFromUrl(`https://huggingface.co/${model.id}/resolve/main/${model.ggufFile}`, {
      // Small context + q8 KV cache: on phones every hundred MB counts.
      n_ctx: 2048,
      cache_type_k: 'q8_0',
      cache_type_v: 'q8_0',
      progressCallback: ({ loaded, total }: { loaded: number; total: number }) =>
        onProgress?.({
          status: 'progress',
          progress: total ? Math.round((loaded / total) * 100) : 0,
          loaded,
          total,
        }),
    });
    this.wllama = w;
  }

  /** Download + initialize a model (idempotent per model). Switching model reloads. */
  load(opts?: { modelId?: string; dtype?: Dtype; onProgress?: (p: Progress) => void }): Promise<void> {
    const modelId = opts?.modelId ?? DEFAULT_MODEL_ID;
    const model = getModel(modelId);
    const dtype = dtypeFor(model, this.caps.device, opts?.dtype);
    const key = `${modelId}|${dtype}`;

    if (this.ready && this.loadedKey === key) return Promise.resolve();
    if (this.loading && this.loadPromise && this.loadingKey === key) return this.loadPromise;

    // Switching to a different model/dtype: throw away the old runtime.
    if ((this.worker || this.wllama) && (this.loadedKey || this.loadingKey) && (this.loadedKey ?? this.loadingKey) !== key) {
      this.worker?.terminate();
      this.worker = null;
      this.disposeWllama();
      this.ready = false;
      this.loadPromise = null;
    }

    if (model.engine === 'wllama') {
      this.loading = true;
      this.loadingKey = key;
      this.loadPromise = this.loadWllama(model, opts?.onProgress)
        .then(() => {
          this.ready = true;
          this.loading = false;
          this.loadedKey = key;
          this.loadedModelId = modelId;
        })
        .catch((err) => {
          this.loading = false;
          this.loadPromise = null;
          throw err;
        });
      return this.loadPromise;
    }

    this.spawn();
    this.loading = true;
    this.loadingKey = key;
    this.loadPromise = new Promise<void>((resolve, reject) => {
      const w = this.worker!;
      const handler = (e: MessageEvent) => {
        const m = e.data;
        if (m.type === 'progress') opts?.onProgress?.(m.data as Progress);
        else if (m.type === 'ready') {
          w.removeEventListener('message', handler);
          this.ready = true;
          this.loading = false;
          this.loadedKey = key;
          this.loadedModelId = modelId;
          resolve();
        } else if (m.type === 'error') {
          w.removeEventListener('message', handler);
          this.loading = false;
          this.loadPromise = null;
          reject(new Error(m.message));
        }
      };
      w.addEventListener('message', handler);
      w.postMessage({ type: 'load', model: modelId, device: this.caps.device, dtype });
    });
    return this.loadPromise;
  }
  private loadPromise: Promise<void> | null = null;
  private loadedKey: string | null = null;
  private loadingKey: string | null = null;

  /** Stream an answer for the given chat messages. */
  ask(messages: ChatMessage[], handlers: AskHandlers) {
    if (this.wllama && this.ready) {
      this.busy = true;
      this.wllamaAbort = new AbortController();
      let full = '';
      handlers.onStart?.();
      this.wllama
        .createChatCompletion({
          messages,
          stream: true,
          max_tokens: handlers.maxNewTokens ?? MAX_NEW_TOKENS,
          abortSignal: this.wllamaAbort.signal,
          // temp 0 = greedy in llama.cpp; the retry pass samples for variety.
          temperature: handlers.sample ? 0.7 : 0,
          ...(handlers.sample ? { top_p: 0.9 } : {}),
          onData: (chunk: any) => {
            const tok = chunk?.choices?.[0]?.delta?.content || '';
            if (tok) {
              full += tok;
              handlers.onToken?.(tok);
            }
          },
        })
        .then(() => {
          this.busy = false;
          handlers.onDone?.(stripThinking(full));
        })
        .catch((err: any) => {
          this.busy = false;
          // An interrupt surfaces as an abort error — deliver the partial
          // text like the worker engines do; anything else is a real failure.
          if (/abort/i.test(String(err?.name || err?.message || err))) {
            handlers.onDone?.(stripThinking(full));
          } else {
            handlers.onError?.(err instanceof Error ? err : new Error(String(err)));
          }
        });
      return;
    }
    if (!this.worker || !this.ready) {
      handlers.onError?.(new Error('not-ready'));
      return;
    }
    this.busy = true;
    const w = this.worker;
    const handler = (e: MessageEvent) => {
      const m = e.data;
      if (m.type === 'start') handlers.onStart?.();
      else if (m.type === 'token') handlers.onToken?.(m.text);
      else if (m.type === 'done') {
        w.removeEventListener('message', handler);
        this.busy = false;
        handlers.onDone?.(m.text);
      } else if (m.type === 'error') {
        w.removeEventListener('message', handler);
        this.busy = false;
        handlers.onError?.(new Error(m.message));
      }
    };
    w.addEventListener('message', handler);
    w.postMessage({
      type: 'generate',
      messages,
      options: { maxNewTokens: handlers.maxNewTokens, sample: handlers.sample },
    });
  }

  /** Interrupt an in-flight generation. */
  stop() {
    if (this.wllama) {
      this.wllamaAbort?.abort();
      return;
    }
    this.worker?.postMessage({ type: 'interrupt' });
  }

  /** Downgrade to WASM when the async probe finds the advertised WebGPU
   *  adapter is actually unusable (see probeWebGPU in config). */
  setDevice(device: 'webgpu' | 'wasm') {
    this.caps.device = device;
    this.caps.webgpu = device === 'webgpu';
  }

  /** Tear down the worker (e.g. after a hung generation) so the next load starts
   *  clean instead of queueing behind a stuck one. The model re-loads from the
   *  browser cache, so it's fast — no re-download. */
  reset() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.disposeWllama();
    this.ready = false;
    this.loading = false;
    this.busy = false;
    this.loadPromise = null;
    this.loadedKey = null;
    this.loadingKey = null;
    this.loadedModelId = null;
  }
}

// One shared engine per tab (module singleton) so opening the widget after
// visiting /ask (or vice-versa) reuses the already-downloaded model.
let shared: AskEngine | null = null;
export function getEngine(): AskEngine {
  if (!shared) shared = new AskEngine();
  return shared;
}
