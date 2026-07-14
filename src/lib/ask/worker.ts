/// <reference lib="webworker" />
// In-browser LLM worker. Everything heavy (the runtime library and the model
// weights) is fetched from CDNs on demand and runs here, off the main thread,
// so the UI never freezes during generation.
//
// Two runtimes, picked per model (see config.ts):
//  - transformers.js (ONNX) — WebGPU or WASM.
//  - WebLLM (MLC)           — compiled WebGPU kernels; used for TinySwallow.

import { TRANSFORMERS_URL, WEBLLM_URL, MAX_NEW_TOKENS, getModel } from './config';
import { stripThinking } from './format';

type LoadMsg = { type: 'load'; model: string; device: string; dtype: string };
type GenMsg = { type: 'generate'; messages: any[]; options?: { maxNewTokens?: number; sample?: boolean } };
type InterruptMsg = { type: 'interrupt' };
type InMsg = LoadMsg | GenMsg | InterruptMsg;

let tf: any = null; // the transformers.js module
let tokenizer: any = null;
let model: any = null;
let stopper: any = null;
let mlc: any = null; // the WebLLM engine (used instead of tokenizer/model)
let loadPromise: Promise<void> | null = null;

const post = (m: any) => (self as any).postMessage(m);

async function loadTransformers(msg: LoadMsg): Promise<void> {
  // Dynamic import from CDN — kept out of the Vite bundle on purpose.
  tf = await import(/* @vite-ignore */ TRANSFORMERS_URL);
  const { AutoTokenizer, AutoModelForCausalLM, InterruptableStoppingCriteria } = tf;

  // Cache the (large) model files in the browser's Cache Storage so a return
  // visit reads from disk instead of re-downloading. Paired with the page's
  // navigator.storage.persist() request, which keeps them from being evicted.
  if (tf.env) tf.env.useBrowserCache = true;

  const progress_callback = (p: any) => post({ type: 'progress', data: p });

  tokenizer = await AutoTokenizer.from_pretrained(msg.model, { progress_callback });
  model = await AutoModelForCausalLM.from_pretrained(msg.model, {
    dtype: msg.dtype,
    device: msg.device,
    progress_callback,
  });
  stopper = new InterruptableStoppingCriteria();
}

async function loadWebllm(msg: LoadMsg): Promise<void> {
  const webllm = await import(/* @vite-ignore */ WEBLLM_URL);
  const opt = getModel(msg.model);
  // The MLC weights live on HF under the model id; the compiled kernel lib is
  // the prebuilt one for the matching base architecture (TinySwallow = Qwen2).
  const appConfig = {
    model_list: [
      {
        model: `https://huggingface.co/${msg.model}`,
        model_id: msg.model,
        model_lib: webllm.modelLibURLPrefix + webllm.modelVersion + '/' + opt.modelLib,
      },
    ],
  };
  mlc = await webllm.CreateMLCEngine(msg.model, {
    appConfig,
    // Map WebLLM's 0–1 report onto the transformers.js-style progress shape
    // the page already renders (weights are cached the same way, in Cache
    // Storage, so the cached/uncached UI logic holds too).
    initProgressCallback: (r: any) =>
      post({
        type: 'progress',
        data: { status: 'progress', progress: Math.round((r.progress ?? 0) * 100), file: r.text },
      }),
  });
}

async function ensureLoaded(msg: LoadMsg): Promise<void> {
  if (mlc || (model && tokenizer)) return;
  if (loadPromise) return loadPromise;

  loadPromise = getModel(msg.model).engine === 'webllm' ? loadWebllm(msg) : loadTransformers(msg);

  try {
    await loadPromise;
  } catch (err) {
    loadPromise = null; // allow a retry
    throw err;
  }
}

async function generateWebllm(messages: any[], opts: { maxNewTokens: number; sample?: boolean }): Promise<void> {
  post({ type: 'start' });
  const stream = await mlc.chat.completions.create({
    messages,
    stream: true,
    max_tokens: opts.maxNewTokens,
    frequency_penalty: 0.5, // Sakana's ChatUI default; curbs small-model loops
    // First pass greedy (most factual); the retry pass samples for variety.
    ...(opts.sample ? { temperature: 0.7, top_p: 0.9 } : { temperature: 0 }),
  });

  let full = '';
  for await (const chunk of stream) {
    const tok = chunk.choices?.[0]?.delta?.content || '';
    if (tok) {
      full += tok;
      post({ type: 'token', text: tok });
    }
  }
  post({ type: 'done', text: stripThinking(full) });
}

async function generate(messages: any[], opts: { maxNewTokens: number; sample?: boolean }): Promise<void> {
  const { TextStreamer } = tf;
  stopper.reset();

  const inputs = tokenizer.apply_chat_template(messages, {
    add_generation_prompt: true,
    return_dict: true,
    enable_thinking: false, // reasoning models (Qwen3) — answer directly; others ignore it
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

  const genOpts: any = {
    ...inputs,
    max_new_tokens: opts.maxNewTokens,
    repetition_penalty: 1.3, // small models loop badly; needs a firm hand
    no_repeat_ngram_size: 3, // hard-block any repeated 3-gram (kills "先のこと、…" loops)
    streamer,
    stopping_criteria: stopper,
    return_dict_in_generate: true,
  };
  if (opts.sample) {
    // Retry pass: greedy already failed/degenerated, so sample for a different result.
    genOpts.do_sample = true;
    genOpts.temperature = 0.7;
    genOpts.top_p = 0.9;
  } else {
    genOpts.do_sample = false; // first pass: greedy — most factual for a small model
  }

  post({ type: 'start' });
  await model.generate(genOpts);

  post({ type: 'done', text: stripThinking(full) });
}

self.addEventListener('message', async (e: MessageEvent<InMsg>) => {
  const data = e.data;
  try {
    if (data.type === 'load') {
      await ensureLoaded(data);
      post({ type: 'ready' });
    } else if (data.type === 'generate') {
      if (mlc) {
        await generateWebllm(data.messages, {
          maxNewTokens: data.options?.maxNewTokens ?? MAX_NEW_TOKENS,
          sample: data.options?.sample,
        });
      } else if (model) {
        await generate(data.messages, {
          maxNewTokens: data.options?.maxNewTokens ?? MAX_NEW_TOKENS,
          sample: data.options?.sample,
        });
      } else {
        throw new Error('model-not-loaded');
      }
    } else if (data.type === 'interrupt') {
      if (mlc) mlc.interruptGenerate();
      else stopper?.interrupt();
    }
  } catch (err: any) {
    // The page falls back to résumé facts on error; log the cause for devtools.
    console.error('[ask-worker]', err);
    post({ type: 'error', message: String(err?.message || err) });
  }
});
