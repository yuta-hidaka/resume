import type { Lang } from '../../i18n/utils';

// Microcopy for the assistant UI, kept next to the feature.
export const askStrings = {
  ja: {
    eyebrow: 'ブラウザ内で動くAI',
    pageTitle: 'AIに質問する',
    pageLead:
      '日髙悠太について、なんでも聞いてください。ブラウザ内で動く小型AIモデルが答えます。モデルは初回だけ読み込み、以降はブラウザにキャッシュされて再ダウンロード不要です。ダウンロード不要で、LLMを使わず即答する「LLM利用なし」も選べます。',
    placeholder: '日髙について質問する…',
    send: '質問する',
    stop: '停止',
    thinking: '考えています…',
    selecting: '関連する事実を選んでいます…',
    generating: '生成中…',
    retrying: '生成し直しています…',
    error: 'うまく答えられませんでした。もう一度お試しください。',
    startHint: '最初の質問で、モデル（約1GB）をブラウザに読み込みます。以降はキャッシュされ、次回から高速です。',
    loading: 'モデルを読み込み中',
    loadingBrowser: 'ブラウザ内にモデルを読み込んでいます…',
    loadingCache: 'キャッシュからモデルを読み込んでいます…',
    cached: 'キャッシュ済み・再DL不要',
    factsLead: '確実な経歴データからお答えします。',
    device: (d: string) => (d === 'webgpu' ? 'WebGPU で高速動作' : 'CPU (WASM) で動作'),
    // Verification
    verified: '事実確認済み',
    verifiedHint: '回答は経歴データと照合し、確認できた内容のみ表示しています。',
    corrected: '確認できた事実のみ表示',
    correctedHint: 'モデルの下書きに裏づけの取れない記述があったため、経歴データから確実な情報だけをお見せしています。',
    timeoutTitle: '応答に時間がかかりました',
    timeoutHint: 'モデルの生成が時間内に終わらなかったため、確実な経歴データをお見せします。上で「LLM利用なし」を選ぶと即答できます。',
    checking: '事実を照合中…',
    sources: '根拠にした経歴データ',
    disclaimer: '小型モデルのため表現は不完全なことがありますが、内容は経歴データと自動照合し、裏づけの取れない記述は表示しません。',
    // Retrieval (no-model) answers
    retrievalBadge: 'LLM利用なし',
    retrievalHint: 'LLMを使わず、経歴データの該当箇所をそのまま表示しています。上でモデルを選ぶと、AIが自然な文章で答えます。',
    // Answer-mode picker (always visible)
    modeQuestion: '回答の作り方',
    modeRetrieval: 'LLM利用なし（即答）',
    modeRetrievalNote: '即答・ダウンロード不要',
    modeAi: 'AIモデルで生成',
    modeAiNote: 'ブラウザ内の小型LLM・要DL',
    // Model picker
    engineTitle: 'AIモデル（任意）',
    engineLead: 'AIモデルはブラウザ内で動きます。モデルと精度を選んで読み込むと、以降はキャッシュされます。',
    engineRetrieval: '経歴データ（即時・DL不要）',
    engineModelLabel: 'モデル',
    enginePrecisionLabel: '精度',
    engineLoad: (gb: number) => `このモデルを読み込む（約${gb}GB）`,
    engineLoaded: (label: string) => `${label} を読み込み済み`,
    engineSwitch: '変更',
    engineSizePrefix: '約',
    // Download confirmation
    confirmTitle: (label: string, mb: number) => `『${label}』を 約${mb.toLocaleString()} MB ダウンロードします`,
    confirmNote: '通信量にご注意ください（Wi-Fi 推奨）。一度読み込めば以降はキャッシュされ、次回から高速です。',
    confirmGo: 'ダウンロードする',
    confirmCancel: 'やめる',
    // How it works
    howTitle: '仕組み',
    howLead: 'サーバーもAPIキーも使いません。すべてあなたのブラウザの中で動きます。',
    howModelLabel: 'モデル（選択可）',
    howModelName: 'TinySwallow 1.5B / Qwen2.5',
    howModelBy: 'Sakana AI / Alibaba',
    howModelDesc:
      '日本語が得意な Sakana AI の TinySwallow-1.5B（約0.9GB・TAID蒸留・既定）か、軽量な Qwen2.5-0.5B を選べます。TinySwallow は WebGPU 対応の PC ブラウザ向けで、スマホ（iPhone Safari 等）では自動的に、llama.cpp で動く省メモリの Qwen2.5-0.5B（約0.4GB・GGUF）に切り替わります。モデルは初回だけ読み込み、以降はブラウザにキャッシュ。ダウンロード不要の「LLM利用なし」も選べます。',
    howRuntimeLabel: '実行環境',
    howRuntimeName: 'transformers.js / WebLLM · WebGPU',
    howRuntimeDesc:
      'モデルの重みは量子化済み（2〜4bit）。数GB級のモデルを約0.5〜0.9GBに抑えているので、これ以上の圧縮は効きません。1.5B級は WebLLM（MLC・WebGPU専用・Sakana 公式デモと同構成）、軽量版は transformers.js（ONNX）と wllama（llama.cpp WASM）で動作。初回だけ Hugging Face から読み込み、以降はブラウザにキャッシュ（再DL不要）。Web Worker 上なので UI は固まりません。',
    howGroundLabel: 'グラウンディング',
    howGroundName: '検索 + 事実照合',
    howGroundDesc:
      '質問に関連する経歴データだけを検索して根拠に渡し、生成後は固有名詞・数値・学歴などを照合。裏づけの取れない記述は表示せず、経歴データそのものに差し替えます。',
    stackNote: '静的サイト（Astro）／サーバー送信なし／APIキーなし',
  },
  en: {
    eyebrow: 'AI that runs in your browser',
    pageTitle: 'Ask me anything',
    pageLead:
      "Ask anything about Yuta Hidaka. A small AI model running inside your browser answers. The model loads once and is then cached in your browser — no re-download afterward. You can also pick a no-download “No LLM” mode for instant answers.",
    placeholder: 'Ask about Yuta…',
    send: 'Ask',
    stop: 'Stop',
    thinking: 'Thinking…',
    selecting: 'Selecting relevant facts…',
    generating: 'Generating…',
    retrying: 'Retrying…',
    error: "I couldn't answer that well. Please try again.",
    startHint:
      'Your first question downloads the model (~1 GB) into the browser. It is cached, so it is fast afterwards.',
    loading: 'Loading the model',
    loadingBrowser: 'Loading the model into your browser…',
    loadingCache: 'Loading the model from cache…',
    cached: 'Cached — no re-download',
    factsLead: 'Here is what the résumé confirms.',
    device: (d: string) => (d === 'webgpu' ? 'Accelerated with WebGPU' : 'Running on CPU (WASM)'),
    verified: 'Fact-checked',
    verifiedHint: 'The answer was checked against the résumé data; only confirmed content is shown.',
    corrected: 'Showing only verified facts',
    correctedHint:
      "The model's draft contained claims that couldn't be confirmed, so only verified facts from the résumé are shown.",
    timeoutTitle: 'The model took too long',
    timeoutHint:
      "The model didn't finish in time, so here are verified résumé facts. Pick “No LLM” above for an instant answer.",
    checking: 'Checking the facts…',
    sources: 'Résumé data used',
    disclaimer:
      "It is a small model, so wording can be rough — but every answer is auto-checked against the résumé data, and unverifiable claims are never shown.",
    // Retrieval (no-model) answers
    retrievalBadge: 'No LLM used',
    retrievalHint: 'Answered without an LLM — straight from the résumé data. Pick a model above for a naturally-phrased answer.',
    // Answer-mode picker (always visible)
    modeQuestion: 'How to answer',
    modeRetrieval: 'No LLM (instant)',
    modeRetrievalNote: 'instant · no download',
    modeAi: 'Generate with AI',
    modeAiNote: 'in-browser LLM · needs download',
    // Model picker
    engineTitle: 'AI model (optional)',
    engineLead: 'The AI model runs inside your browser. Pick a model and precision, then load it — it is cached afterwards.',
    engineRetrieval: 'Résumé data (instant · no download)',
    engineModelLabel: 'Model',
    enginePrecisionLabel: 'Precision',
    engineLoad: (gb: number) => `Load this model (~${gb} GB)`,
    engineLoaded: (label: string) => `${label} loaded`,
    engineSwitch: 'Change',
    engineSizePrefix: '~',
    // Download confirmation
    confirmTitle: (label: string, mb: number) => `This will download ~${mb.toLocaleString()} MB for “${label}”`,
    confirmNote: 'Mind your data usage (Wi-Fi recommended). It downloads once and is cached, so it is fast next time.',
    confirmGo: 'Download',
    confirmCancel: 'Cancel',
    howTitle: 'How it works',
    howLead: 'No server, no API key. Everything runs inside your browser.',
    howModelLabel: 'Model (selectable)',
    howModelName: 'Qwen2.5 / TinySwallow 1.5B',
    howModelBy: 'Alibaba / Sakana AI',
    howModelDesc:
      "Defaults to Qwen2.5-1.5B (~0.9 GB) — the strongest English answers here; Sakana AI's TAID-distilled TinySwallow-1.5B covers Japanese. Both target WebGPU-capable desktop browsers; phones (incl. iPhone Safari) automatically fall back to a low-memory Qwen2.5-0.5B GGUF running on llama.cpp (~0.4 GB). The model loads once, then is cached; a no-download “No LLM” mode is also available.",
    howRuntimeLabel: 'Runtime',
    howRuntimeName: 'transformers.js / WebLLM · WebGPU',
    howRuntimeDesc:
      'The weights are 2–4-bit quantized — that is how a multi-GB model fits in ~0.5–0.9 GB, and why further compression does not help. The 1.5B models run on WebLLM (MLC, WebGPU-only, the same stack as Sakana\'s official demo); the light builds run on transformers.js (ONNX) and wllama (llama.cpp WASM). Weights stream from Hugging Face once, then stay cached in your browser. Everything runs in a Web Worker, so the UI never freezes.',
    howGroundLabel: 'Grounding',
    howGroundName: 'Retrieval + fact-check',
    howGroundDesc:
      'Only the résumé facts relevant to your question are retrieved as context. After generation, names, numbers, and credentials are verified; anything unconfirmed is dropped and replaced with the real data.',
    stackNote: 'Static site (Astro) · nothing sent to a server · no API key',
  },
} satisfies Record<Lang, Record<string, any>>;

export type AskStrings = (typeof askStrings)['en'];

export function getAskStrings(lang: Lang): AskStrings {
  return (askStrings[lang] ?? askStrings.en) as AskStrings;
}
