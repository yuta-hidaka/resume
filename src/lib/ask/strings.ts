import type { Lang } from '../../i18n/utils';

// Microcopy for the assistant UI, kept next to the feature.
export const askStrings = {
  ja: {
    eyebrow: 'ブラウザ内で動くAI',
    pageTitle: 'AIに質問する',
    pageLead:
      '日髙悠太について、なんでも聞いてください。既定では経歴データから即座に答えます（ダウンロード不要）。必要ならブラウザ内で動く小型AIモデルを読み込んで、より自然な文章にもできます。',
    placeholder: '日髙について質問する…',
    send: '質問する',
    stop: '停止',
    thinking: '考えています…',
    generating: '生成中',
    error: 'うまく答えられませんでした。もう一度お試しください。',
    startHint: '最初の質問で、モデル（約1GB）をブラウザに読み込みます。以降はキャッシュされ、次回から高速です。',
    loading: 'モデルを読み込み中',
    loadingBrowser: 'ブラウザ内にモデルを読み込んでいます…',
    device: (d: string) => (d === 'webgpu' ? 'WebGPU で高速動作' : 'CPU (WASM) で動作'),
    // Verification
    verified: '事実確認済み',
    verifiedHint: '回答は経歴データと照合し、確認できた内容のみ表示しています。',
    corrected: '確認できた事実のみ表示',
    correctedHint: 'モデルの下書きに裏づけの取れない記述があったため、経歴データから確実な情報だけをお見せしています。',
    checking: '事実を照合中…',
    sources: '根拠にした経歴データ',
    disclaimer: '小型モデルのため表現は不完全なことがありますが、内容は経歴データと自動照合し、裏づけの取れない記述は表示しません。',
    // Retrieval (no-model) answers
    retrievalBadge: '経歴データより',
    retrievalHint: 'これは経歴データからの抜粋です。下の「AIモデル」を読み込むと、より自然な文章で答えます。',
    // Model picker
    engineTitle: 'AIモデル（任意）',
    engineLead: '既定は経歴データから即答（ダウンロード不要）。より自然な文章にはAIモデルを読み込めます。一度だけDLされ、以降はキャッシュされます。',
    engineRetrieval: '経歴データ（即時・DL不要）',
    engineModelLabel: 'モデル',
    enginePrecisionLabel: '精度',
    engineLoad: (gb: number) => `このモデルを読み込む（約${gb}GB）`,
    engineLoaded: (label: string) => `${label} を読み込み済み`,
    engineSwitch: '変更',
    engineSizePrefix: '約',
    // How it works
    howTitle: '仕組み',
    howLead: 'サーバーもAPIキーも使いません。すべてあなたのブラウザの中で動きます。',
    howModelLabel: 'モデル（選択可）',
    howModelName: 'Qwen2.5 0.5B / TinySwallow 1.5B',
    howModelBy: 'Alibaba / Sakana AI',
    howModelDesc:
      '軽量な Qwen2.5-0.5B（約0.5GB）か、日本語が得意な Sakana AI の TinySwallow-1.5B（約1.2GB・TAID蒸留）を選べます。既定は経歴データからの即答でダウンロード不要。',
    howRuntimeLabel: '実行環境',
    howRuntimeName: 'transformers.js · WebGPU',
    howRuntimeDesc:
      'ONNX 量子化した重みを Hugging Face から読み込み、WebGPU（非対応時は WASM）で推論。Web Worker 上で動くので UI は固まりません。',
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
      "Ask anything about Yuta Hidaka. By default it answers instantly straight from the résumé data (no download). You can also load a small in-browser AI model to phrase answers more naturally.",
    placeholder: 'Ask about Yuta…',
    send: 'Ask',
    stop: 'Stop',
    thinking: 'Thinking…',
    generating: 'Generating',
    error: "I couldn't answer that well. Please try again.",
    startHint:
      'Your first question downloads the model (~1 GB) into the browser. It is cached, so it is fast afterwards.',
    loading: 'Loading the model',
    loadingBrowser: 'Loading the model into your browser…',
    device: (d: string) => (d === 'webgpu' ? 'Accelerated with WebGPU' : 'Running on CPU (WASM)'),
    verified: 'Fact-checked',
    verifiedHint: 'The answer was checked against the résumé data; only confirmed content is shown.',
    corrected: 'Showing only verified facts',
    correctedHint:
      "The model's draft contained claims that couldn't be confirmed, so only verified facts from the résumé are shown.",
    checking: 'Checking the facts…',
    sources: 'Résumé data used',
    disclaimer:
      "It is a small model, so wording can be rough — but every answer is auto-checked against the résumé data, and unverifiable claims are never shown.",
    // Retrieval (no-model) answers
    retrievalBadge: 'From the résumé',
    retrievalHint: 'This is straight from the résumé data. Load a model below for a more naturally-phrased answer.',
    // Model picker
    engineTitle: 'AI model (optional)',
    engineLead: 'By default, answers come straight from the résumé (no download). Load an AI model for more natural phrasing — it downloads once and is cached.',
    engineRetrieval: 'Résumé data (instant · no download)',
    engineModelLabel: 'Model',
    enginePrecisionLabel: 'Precision',
    engineLoad: (gb: number) => `Load this model (~${gb} GB)`,
    engineLoaded: (label: string) => `${label} loaded`,
    engineSwitch: 'Change',
    engineSizePrefix: '~',
    howTitle: 'How it works',
    howLead: 'No server, no API key. Everything runs inside your browser.',
    howModelLabel: 'Model (selectable)',
    howModelName: 'Qwen2.5 0.5B / TinySwallow 1.5B',
    howModelBy: 'Alibaba / Sakana AI',
    howModelDesc:
      "Choose the light Qwen2.5-0.5B (~0.5 GB) or Sakana AI's Japanese-strong TinySwallow-1.5B (~1.2 GB, TAID-distilled). The default needs no download at all.",
    howRuntimeLabel: 'Runtime',
    howRuntimeName: 'transformers.js · WebGPU',
    howRuntimeDesc:
      'Quantized ONNX weights are streamed from Hugging Face and run on WebGPU (WASM fallback), inside a Web Worker so the UI stays smooth.',
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
