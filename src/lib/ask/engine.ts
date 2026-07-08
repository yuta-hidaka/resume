// Main-thread controller for the in-browser assistant. Owns the worker,
// exposes a small promise/callback API, and keeps model state so both the
// floating widget and the /ask page can share one loaded model per tab.

import { detectCapabilities, MODEL_ID, type Capabilities, type ChatMessage, type Progress } from './config';

export { detectCapabilities, MODEL_ID } from './config';
export type { Capabilities, ChatMessage, Progress } from './config';

type AskHandlers = {
  onStart?: () => void;
  onToken?: (text: string) => void;
  onDone?: (text: string) => void;
  onError?: (err: Error) => void;
  maxNewTokens?: number;
};

export class AskEngine {
  private worker: Worker | null = null;
  readonly caps: Capabilities = detectCapabilities();
  ready = false;
  loading = false;
  busy = false;

  private spawn() {
    if (this.worker) return;
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  }

  /** Download + initialize the model (idempotent). */
  load(onProgress?: (p: Progress) => void): Promise<void> {
    this.spawn();
    if (this.ready) return Promise.resolve();
    if (this.loading && this.loadPromise) return this.loadPromise;

    this.loading = true;
    this.loadPromise = new Promise<void>((resolve, reject) => {
      const w = this.worker!;
      const handler = (e: MessageEvent) => {
        const m = e.data;
        if (m.type === 'progress') onProgress?.(m.data as Progress);
        else if (m.type === 'ready') {
          w.removeEventListener('message', handler);
          this.ready = true;
          this.loading = false;
          resolve();
        } else if (m.type === 'error') {
          w.removeEventListener('message', handler);
          this.loading = false;
          this.loadPromise = null;
          reject(new Error(m.message));
        }
      };
      w.addEventListener('message', handler);
      w.postMessage({
        type: 'load',
        model: MODEL_ID,
        device: this.caps.device,
        dtype: this.caps.dtype,
      });
    });
    return this.loadPromise;
  }
  private loadPromise: Promise<void> | null = null;

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
    w.postMessage({ type: 'generate', messages, options: { maxNewTokens: handlers.maxNewTokens } });
  }

  /** Interrupt an in-flight generation. */
  stop() {
    this.worker?.postMessage({ type: 'interrupt' });
  }
}

// One shared engine per tab (module singleton) so opening the widget after
// visiting /ask (or vice-versa) reuses the already-downloaded model.
let shared: AskEngine | null = null;
export function getEngine(): AskEngine {
  if (!shared) shared = new AskEngine();
  return shared;
}
