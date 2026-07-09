// Main-thread controller for the in-browser assistant. Owns the worker,
// exposes a small promise/callback API, and keeps model state so both the
// floating widget and the /ask page can share one loaded model per tab.

import {
  detectCapabilities,
  DEFAULT_MODEL_ID,
  getModel,
  dtypeFor,
  type Capabilities,
  type ChatMessage,
  type Dtype,
  type Progress,
} from './config';

export { detectCapabilities } from './config';
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
  readonly caps: Capabilities = detectCapabilities();
  ready = false;
  loading = false;
  busy = false;
  loadedModelId: string | null = null;

  private spawn() {
    if (this.worker) return;
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  }

  /** Download + initialize a model (idempotent per model). Switching model reloads. */
  load(opts?: { modelId?: string; dtype?: Dtype; onProgress?: (p: Progress) => void }): Promise<void> {
    const modelId = opts?.modelId ?? DEFAULT_MODEL_ID;
    const model = getModel(modelId);
    const dtype = dtypeFor(model, this.caps.device, opts?.dtype);
    const key = `${modelId}|${dtype}`;

    if (this.ready && this.loadedKey === key) return Promise.resolve();
    if (this.loading && this.loadPromise && this.loadingKey === key) return this.loadPromise;

    // Switching to a different model/dtype: throw away the old worker.
    if (this.worker && (this.loadedKey || this.loadingKey) && (this.loadedKey ?? this.loadingKey) !== key) {
      this.worker.terminate();
      this.worker = null;
      this.ready = false;
      this.loadPromise = null;
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
    this.worker?.postMessage({ type: 'interrupt' });
  }

  /** Tear down the worker (e.g. after a hung generation) so the next load starts
   *  clean instead of queueing behind a stuck one. The model re-loads from the
   *  browser cache, so it's fast — no re-download. */
  reset() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
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
