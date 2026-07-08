// Client-safe retrieval + prompt building. No data imports here, so this stays
// tiny in the browser bundle; the résumé facts are handed in via AskConfig.

export type FactChunk = { id: string; text: string; tags: string[] };

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export type AskConfig = {
  lang: 'ja' | 'en';
  core: string;
  chunks: FactChunk[];
  fewShot: { role: 'user' | 'assistant'; content: string }[];
};

const CJK = /[぀-ヿ㐀-鿿가-힯]/;

/** Latin words + CJK single chars and bigrams, so matching works across scripts. */
function tokenize(q: string): string[] {
  const s = q.toLowerCase();
  const latin = s.match(/[a-z0-9][a-z0-9+.#-]*/g) ?? [];
  const cjk = s.match(/[぀-ヿ㐀-鿿가-힯]/g) ?? [];
  const bigrams: string[] = [];
  for (let i = 0; i < cjk.length - 1; i++) bigrams.push(cjk[i] + cjk[i + 1]);
  return [...new Set([...latin, ...cjk, ...bigrams])];
}

/** Score chunks by keyword overlap and return the top-k relevant ones. */
export function retrieve(query: string, chunks: FactChunk[], k = 3): FactChunk[] {
  const qt = tokenize(query);
  if (!qt.length) return [];
  const scored = chunks.map((ch) => {
    const tagset = ch.tags.map((t) => t.toLowerCase());
    const hay = (ch.text + ' ' + tagset.join(' ')).toLowerCase();
    let score = 0;
    for (const t of qt) {
      // skip 1-char latin noise, but keep single CJK chars (they carry meaning)
      if (t.length < 2 && !CJK.test(t)) continue;
      if (tagset.some((tg) => tg === t)) score += 3;
      else if (hay.includes(t)) score += 1;
    }
    return { ch, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.ch);
}

const INSTRUCTION = [
  'You are Yuta Hidaka, answering visitors on your portfolio website.',
  'Follow these rules strictly:',
  '- Use ONLY the reference facts below. Never add or guess anything not written there — no schools, employers, job titles, names, dates, numbers, or URLs beyond the facts.',
  '- If the facts do not answer the question, say you have not shared that publicly, and offer to talk about your work or background instead.',
  "- Reply in the same language the visitor used, and answer their actual question directly (do not drift into a generic essay).",
  '- Answer in 2–3 short, natural sentences. No headings, bullet lists, tables, URLs, or code.',
].join('\n');

/** Detect the reply language. Script first (reliable), then a keyword heuristic
 *  for the common Latin-script languages a resume visitor might use. */
export function detectLanguage(q: string): { code: string; name: string } {
  if (/[가-힯]/.test(q)) return { code: 'ko', name: 'Korean' };
  if (/[぀-ヿ]/.test(q)) return { code: 'ja', name: 'Japanese' };
  if (/[一-鿿]/.test(q)) return { code: 'zh', name: 'Chinese' };
  if (/[Ѐ-ӿ]/.test(q)) return { code: 'ru', name: 'Russian' };
  if (/[؀-ۿ]/.test(q)) return { code: 'ar', name: 'Arabic' };
  const s = ' ' + q.toLowerCase() + ' ';
  if (/\b(je|vous|votre|expérience|parlez|parle|quelle|avec|bonjour|salut|merci|pouvez|comment|qu'est)\b/.test(s)) return { code: 'fr', name: 'French' };
  if (/\b(qué|cuál|cuáles|tú|tus|experiencia|háblame|cuéntame|sobre|hola|gracias|eres|puedes|cómo)\b/.test(s)) return { code: 'es', name: 'Spanish' };
  if (/\b(was|wie|deine|deiner|erfahrung|erzähl|erzähle|über|hallo|danke|bist|kannst)\b/.test(s)) return { code: 'de', name: 'German' };
  if (/\b(qual|sua|seu|experiência|fale|conte|sobre|olá|obrigado|você|pode)\b/.test(s)) return { code: 'pt', name: 'Portuguese' };
  if (/\b(cosa|tua|tuo|esperienza|parlami|raccontami|ciao|grazie|sei|puoi|come)\b/.test(s)) return { code: 'it', name: 'Italian' };
  return { code: 'en', name: 'English' };
}

/** Build the system message: instruction + core profile + retrieved facts.
 *  `foreignLang` is set only when the visitor writes in a language other than the
 *  page's — then we add a hard directive to answer in that language. For the
 *  page's own language the few-shot examples already anchor it, and adding a
 *  directive tends to make the small model loop, so we leave it off. */
export function buildSystem(cfg: AskConfig, query: string, foreignLang?: string): string {
  const hits = retrieve(query, cfg.chunks, 3);
  const facts = [cfg.core, ...hits.map((h) => h.text)].join('\n');
  const base = `${INSTRUCTION}\n\nReference facts:\n${facts}`;
  return foreignLang
    ? `${base}\n\nThe visitor is writing in ${foreignLang}. You MUST write your entire reply in ${foreignLang}, and in no other language.`
    : base;
}

/** Full message stack for one turn: few-shot + history + a grounded user turn.
 *
 *  We deliberately do NOT use a system role: TinySwallow (and some other small
 *  models) emit an immediate end-of-turn when a system message is present, so the
 *  instruction + retrieved facts are folded into the current user turn instead.
 *  The few-shot examples anchor the reply language, so they're only included when
 *  the visitor writes in the page's own language; otherwise an explicit
 *  "reply in X" directive carries it. */
export function buildMessages(cfg: AskConfig, query: string, history: ChatMessage[] = []): ChatMessage[] {
  const det = detectLanguage(query);
  const cross = det.code !== cfg.lang;
  const grounding = buildSystem(cfg, query, cross ? det.name : undefined);
  return [
    ...(!cross && history.length === 0 ? cfg.fewShot : []),
    ...history,
    { role: 'user', content: `${grounding}\n\n———\n${query}` },
  ];
}
