/// <reference lib="webworker" />
// In-browser LLM worker. Everything heavy (the transformers.js library and the
// model weights) is fetched from CDNs on demand and runs here, off the main
// thread, so the UI never freezes during generation.

import { TRANSFORMERS_URL, MAX_NEW_TOKENS } from './config';

type LoadMsg = { type: 'load'; model: string; device: string; dtype: string };
type GenMsg = { type: 'generate'; messages: any[]; options?: { maxNewTokens?: number } };
type InterruptMsg = { type: 'interrupt' };
type InMsg = LoadMsg | GenMsg | InterruptMsg;

let tf: any = null; // the transformers.js module
let tokenizer: any = null;
let model: any = null;
let stopper: any = null;
let loadPromise: Promise<void> | null = null;

const post = (m: any) => (self as any).postMessage(m);

async function ensureLoaded(msg: LoadMsg): Promise<void> {
  if (model && tokenizer) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    // Dynamic import from CDN — kept out of the Vite bundle on purpose.
    tf = await import(/* @vite-ignore */ TRANSFORMERS_URL);
    const { AutoTokenizer, AutoModelForCausalLM, InterruptableStoppingCriteria } = tf;

    const progress_callback = (p: any) => post({ type: 'progress', data: p });

    tokenizer = await AutoTokenizer.from_pretrained(msg.model, { progress_callback });
    model = await AutoModelForCausalLM.from_pretrained(msg.model, {
      dtype: msg.dtype,
      device: msg.device,
      progress_callback,
    });
    stopper = new InterruptableStoppingCriteria();
  })();

  try {
    await loadPromise;
  } catch (err) {
    loadPromise = null; // allow a retry
    throw err;
  }
}

async function generate(messages: any[], maxNewTokens: number): Promise<void> {
  const { TextStreamer } = tf;
  stopper.reset();

  const inputs = tokenizer.apply_chat_template(messages, {
    add_generation_prompt: true,
    return_dict: true,
  });

  let full = '';
  const streamer = new TextStreamer(tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (text: string) => {
      full += text;
      post({ type: 'token', text });
    },
  });

  post({ type: 'start' });
  await model.generate({
    ...inputs,
    max_new_tokens: maxNewTokens,
    do_sample: false, // greedy — most factual for a small model
    repetition_penalty: 1.1, // sweet spot: higher over-constrains JA into generic filler
    streamer,
    stopping_criteria: stopper,
    return_dict_in_generate: true,
  });

  post({ type: 'done', text: full.trim() });
}

self.addEventListener('message', async (e: MessageEvent<InMsg>) => {
  const data = e.data;
  try {
    if (data.type === 'load') {
      await ensureLoaded(data);
      post({ type: 'ready' });
    } else if (data.type === 'generate') {
      if (!model) throw new Error('model-not-loaded');
      await generate(data.messages, data.options?.maxNewTokens ?? MAX_NEW_TOKENS);
    } else if (data.type === 'interrupt') {
      stopper?.interrupt();
    }
  } catch (err: any) {
    post({ type: 'error', message: String(err?.message || err) });
  }
});
