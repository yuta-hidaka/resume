// ————————————————————————————————————————————————————————————————
// The "never lie" layer — multilingual.
//
// A small model can fabricate in any language. We can't stop it generating, but
// we refuse to SHOW anything we can't trace to the résumé. After generation we
// extract every checkable claim and confirm it against the source; if anything
// is unconfirmed the answer is dropped and replaced by real résumé facts.
//
// A blacklist of "fabrication shapes" has infinite holes, so the guarantee is
// ASYMMETRIC:
//   • In the résumé's own scripts (Latin + Japanese/Han) we allow prose but catch
//     entity-shaped claims: proper nouns (verified against source *tokens*, not
//     substrings), numbers (incl. CJK numerals), org/school/title phrases, and —
//     since Yuta holds no title — any professor/CEO/PhD-style word on sight.
//   • In ANY other script (Hangul, Cyrillic, Arabic, Devanagari, Thai, Hebrew,
//     Greek…) nothing can be a real fact, so every run is flagged and the answer
//     falls back to verified facts.
// Bias is intentional: any doubt → truth. (Validated by multilingual.test.ts,
// whose fixtures come from an 18-language red-team workflow.)
// ————————————————————————————————————————————————————————————————

import type { AskConfig } from './retrieve';
import { retrieve, relevantChunks } from './retrieve';

export type Verification = { ok: boolean; issues: string[] };

const COMMON = new Set(
  (
    'a an and or but if then so as at by for from in into of on to up with within without over under about across after before between during through per via not no yes do does did done has have had is are was were be been being am the this that these those it its they them their there here what when where which who whom whose why how all any both each few more most other some such only own same than too very can could would will shall may might must just should now also i you your yours we our us he she his her my me mine ' +
    'am able above according actually additionally afterwards again against ago along already although always among another any anyone anything around because become becomes became becoming been beyond both bring brings build builds building built cannot come comes contributed contributing core create created creates current currently deep deeply define designed designing deploy deployed deploying developing development developed direct directly enjoy ensure ensuring especially expertise experience experienced extensively focus focused focusing further furthermore hands help helped helping high highly hi hello however implement implemented including includes involved involving key large largely leading led lead leads like likely main mainly maintain maintaining make makes making manage managed managing many may meanwhile meet met moreover multiple my name natural new now online opportunity overall part performance please previous previously primarily professional project projects proper provide providing question range real really responsible robust role roles scalable scale services set setting several short significantly simple simply since solution solutions sorry specialized specific standards strong stronger such sure team teams technical technologies technology thank thanks therefore throughout thus tools towards understanding unique use used using utilizing various well work worked working years'
  )
    .toLowerCase()
    .split(/\s+/),
);

// Latin org/school markers. If a capitalized phrase contains one, we verify the
// WHOLE phrase (catches "University of Tokyo" reshuffled from the real
// "Tokyo University of Science").
const LATIN_MARKER =
  /^(universit\p{L}*|colleg\p{L}*|institut\p{L}*|polytechni\p{L}*|facult\p{L}*|académ\p{L}*|academ\p{L}*|hochschule|corp|corporation|compan\p{L}*|inc|ltd|llc|gmbh|société|entreprise|empresa|azienda|firma|unternehmen)$/iu;

// Titles Yuta does NOT hold — flag on sight, in any Latin or Han script. (Hangul,
// Cyrillic, Arabic, Devanagari, Thai titles are caught by the opaque-script rule.)
const TITLE_LATIN = [
  'directeur général', 'consejero delegado', 'amministratore delegato', 'direktur utama',
  'tổng giám đốc', 'genel müdür', 'guru besar', 'giám đốc', 'giáo sư', 'chủ tịch', 'bác sĩ', 'tiến sĩ',
  'professor', 'professeur', 'professore', 'professoressa', 'professora', 'profesor', 'profesora',
  'profesör', 'catedrático', 'chairman', 'director', 'directora', 'direktor', 'diretor', 'diretora',
  'direttore', 'dirigente', 'direktur', 'doctorat', 'doctorado', 'doctora', 'doctor', 'doutorado',
  'doutora', 'doutor', 'doctorate', 'docteur', 'dottorato', 'dottoressa', 'dottore', 'doktortitel',
  'doktora', 'doktor', 'doçent', 'dokter', 'geschäftsführer', 'presidente', 'president', 'rektör',
  'rektor', 'rector', 'reitora', 'reitor', 'mestre', 'vorstand', 'başkan', 'chairwoman',
  'prof', 'phd', 'ceo', 'cto', 'coo', 'cfo', 'pdg', 'dr',
];
const TITLE_CJK = [
  '名誉教授', '客座教授', '客員教授', '准教授', '副教授', '助教授', '教授', '助教', '博士課程', '博士号',
  '博士后', '博士', '修士', '院士', '首席执行官', '首席技术官', '最高経営責任者', '代表取締役', '取締役',
  '執行長', '總經理', '董事长', '董事長', '总裁', '總裁', '社長', '会長', '医師', '医生', '醫師', '醫生',
];

const CJK_SUFFIX = [
  '大学院', '大学', '大學', '学院', '學院', '大学校', '高校', '学校', '研究所', '研究院',
  '株式会社', '有限会社', '合同会社', '有限公司', '股份有限公司', '公司', '会社', '企業', '企业', '集团', '集團', '学園', '学园',
];

// Scripts the résumé is NOT written in — any run here cannot be a real fact.
const OPAQUE =
  /[가-힣ᄀ-ᇿ㄰-㆏Ѐ-ԯⷠ-ⷿꙀ-ꚟ֐-׿؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿ऀ-ॿঀ-৿਀-ൿ฀-๿຀-ໟͰ-Ͽ԰-֏Ⴀ-ჿ]{2,}/g;

// Famous employers/schools Yuta has no tie to, written in Han (bare, marker-less).
// Not a guarantee — a pragmatic net for the common cases; Latin & katakana brand
// names and any 〜大学/〜公司 form are already caught by the rules above.
const NOT_HIS = [
  '谷歌', '亚马逊', '亞馬遜', '微软', '微軟', '苹果', '蘋果', '脸书', '臉書', '百度', '华为', '華為',
  '腾讯', '騰訊', '阿里巴巴', '字节跳动', '字節跳動', '甲骨文', '英伟达', '輝達', '哈佛', '斯坦福',
  '剑桥', '劍橋', '牛津', '麻省理工', '东京大学', '東京大学', '京都大学', '清华', '清華', '北京大学',
];

const HAN_KANA = '\\u3040-\\u30FF\\u3400-\\u4DBF\\u4E00-\\u9FFF\\uF900-\\uFAFF';
const CJK_NUM = /[〇零一二三四五六七八九十百千万億]{2,}/g;

function isUpper(w: string): boolean {
  return /^\p{Lu}/u.test(w) || /\p{Lu}{2,}/u.test(w);
}

/** Normalize for substring matching: NFKC, lowercase, drop spaces & punctuation. */
function norm(s: string): string {
  return s
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s​-‍﻿­、。，,.\-—–・()（）「」『』:：;；!！?？"'`~＝=/|#＃･]/g, '');
}

/** Fold away tricks that hide an entity: full-width (NFKC), zero-width chars, and
 *  spaces inserted between two CJK characters ("東 京 大 学"). */
function preprocess(answer: string): string {
  return answer
    .normalize('NFKC')
    .replace(/[​-‍﻿­]/g, '')
    .replace(new RegExp(`(?<=[${HAN_KANA}])\\s+(?=[${HAN_KANA}])`, 'gu'), '');
}

export function sourceText(cfg: AskConfig): string {
  return norm([cfg.core, ...cfg.chunks.map((c) => c.text + ' ' + c.tags.join(' '))].join(' '));
}

function rawCorpus(cfg: AskConfig): string {
  return [cfg.core, ...cfg.chunks.map((c) => c.text + ' ' + c.tags.join(' '))].join(' ');
}

/** Lowercased Latin word tokens from the résumé (for token-level, not substring, checks). */
function latinTokens(cfg: AskConfig): Set<string> {
  return new Set([...rawCorpus(cfg).toLowerCase().matchAll(/[a-z][a-z0-9.+#]*/g)].map((m) => m[0].replace(/\.+$/, '')));
}

/** A Latin proper token is OK iff it's a source token, or a prefix of one (Go→golang, Type→typescript). */
function latinOk(c: string, set: Set<string>): boolean {
  if (set.has(c)) return true;
  for (const t of set) if (t.startsWith(c)) return true;
  return false;
}

function numbers(s: string): string[] {
  return [...s.normalize('NFKC').matchAll(/\d[\d,]{1,}/g)].map((m) => m[0].replace(/,/g, ''));
}

/** Capitalized org/school phrases containing a marker (connectors trimmed at the ends). */
function latinEntityPhrases(answer: string): string[] {
  const toks = [...answer.matchAll(/[\p{L}][\p{L}.&]*/gu)].map((m) => ({
    w: m[0],
    start: m.index ?? 0,
    end: (m.index ?? 0) + m[0].length,
  }));
  const isConn = (w: string) => /^(of|de|the|for|and|du|van|von|für|di|da|del|la|le|los|das|der|den|à|au|aux|dos|degli|della)$/iu.test(w);
  const isMarker = (w: string) => LATIN_MARKER.test(w);
  const out: string[] = [];
  let i = 0;
  while (i < toks.length) {
    if (!isUpper(toks[i].w) && !isMarker(toks[i].w)) { i++; continue; }
    const run = [toks[i]];
    let j = i + 1;
    while (j < toks.length) {
      if (!/^\s+$/.test(answer.slice(toks[j - 1].end, toks[j].start))) break;
      const w = toks[j].w;
      if (!(isMarker(w) || isConn(w) || isUpper(w))) break;
      run.push(toks[j]);
      j++;
    }
    // trim leading/trailing connectors so "…of Science and" → "…of Science"
    let words = run.map((t) => t.w);
    while (words.length && isConn(words[0])) words = words.slice(1);
    while (words.length && isConn(words[words.length - 1])) words = words.slice(0, -1);
    if (words.length >= 2 && words.some(isMarker) && words.some((w) => isUpper(w) && !isMarker(w))) {
      out.push(words.join(' '));
    }
    i = j > i ? j : i + 1;
  }
  return out;
}

/** Verify an answer against the résumé. ok=false ⇒ contains something we can't confirm. */
export function verifyAnswer(answer: string, cfg: AskConfig): Verification {
  const pre = preprocess(answer);
  const src = sourceText(cfg);
  const srcNums = new Set(numbers(rawCorpus(cfg)));
  const srcLatin = latinTokens(cfg);
  const issues: string[] = [];
  const flagSub = (t: string) => { if (!src.includes(norm(t))) issues.push(t); };

  // Numbers (digits), CJK numeral runs, and CJK-numeral + counter (六割 / 三十五歳 / 四十名).
  for (const n of numbers(pre)) if (!srcNums.has(n)) issues.push(n);
  for (const m of pre.matchAll(CJK_NUM)) issues.push(m[0]);
  for (const m of pre.matchAll(/[〇零一二三四五六七八九十百千]+(?:割|歳|歲|才|名|人|年|パーセント|㌫)/g)) issues.push(m[0]);
  // Age is never stated — flag any "X years old" (digits or number-words).
  if (/\byears?\s+old\b|\byear-old\b|\baged\s+\d|\bage\s+of\s+\d/iu.test(pre)) issues.push('age-claim');

  // Latin proper tokens → source-token check (so "CTO" isn't excused by "director").
  for (const m of pre.matchAll(/[A-Za-z][A-Za-z0-9.+#]{1,}/g)) {
    const w = m[0].replace(/\.+$/, ''); // drop a sentence-ending period
    if (w.length >= 2 && isUpper(w) && !COMMON.has(w.toLowerCase()) && !latinOk(w.toLowerCase(), srcLatin)) issues.push(w);
  }
  // Latin org/school phrases, katakana, Japanese/Chinese entities, opaque scripts → substring check.
  for (const p of latinEntityPhrases(pre)) flagSub(p);
  for (const m of pre.matchAll(/[ァ-ヶー]{2,}/g)) flagSub(m[0]);
  // Well-known brands/schools written bare in Han (which shares glyphs with the
  // Japanese source, so can't be blanket-flagged). A non-exhaustive safety net.
  for (const b of NOT_HIS) if (pre.includes(b)) issues.push(b);
  for (const m of pre.matchAll(new RegExp(`[\\u3400-\\u4DBF\\u4E00-\\u9FFF\\u3040-\\u30FF]{1,14}(?:${CJK_SUFFIX.join('|')})`, 'g'))) flagSub(m[0]);
  for (const m of pre.matchAll(OPAQUE)) flagSub(m[0]);

  // Titles Yuta doesn't hold — flag on sight.
  const alpha = pre.replace(/\./g, '').toLowerCase();
  for (const t of TITLE_LATIN) {
    if (new RegExp(`(?<![\\p{L}])${t}(?![\\p{L}])`, 'u').test(alpha)) issues.push(t);
  }
  for (const t of TITLE_CJK) if (pre.includes(t)) issues.push(t);

  return { ok: issues.length === 0, issues };
}

/** The relevant résumé facts for a query, as separate strings — for the UI to
 *  render as a clean list. Same source material as {@link safeFallback}. */
export function fallbackFacts(cfg: AskConfig, query: string): string[] {
  const hits = relevantChunks(query, cfg.chunks, 3);
  const facts = hits.length ? hits.map((h) => h.text) : [cfg.core];
  return facts.map((f) => f.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

/** A deterministic, always-true answer assembled only from real résumé facts. */
export function safeFallback(cfg: AskConfig, query: string): string {
  const hits = retrieve(query, cfg.chunks, 2);
  const facts = (hits.length ? hits.map((h) => h.text) : [cfg.core]).join(' ');
  return facts.replace(/\s+/g, ' ').trim();
}

/** Detect degenerate model output — repetition loops / near-zero diversity that a
 *  tiny model can fall into (e.g. "先のこと、先のこと、…" hundreds of times). Such
 *  text carries no false facts, so the verifier would pass it, but it is garbage
 *  and must never be shown as a "verified" answer. */
export function looksDegenerate(answer: string): boolean {
  const s = (answer || '').trim();
  if (!s) return true;
  // A short unit (even a single char) repeated back-to-back many times.
  if (/(.{1,12}?)\1{5,}/s.test(s)) return true;
  // Near-zero diversity: mostly the same handful of tokens on a loop.
  const toks = s.toLowerCase().match(/[a-z0-9]+|[぀-ヿ㐀-鿿]/g) ?? [];
  if (toks.length >= 12) {
    const counts = new Map<string, number>();
    for (const t of toks) counts.set(t, (counts.get(t) ?? 0) + 1);
    const uniqRatio = counts.size / toks.length;
    const topShare = Math.max(...counts.values()) / toks.length;
    if (uniqRatio < 0.28 || topShare > 0.42) return true;
  }
  return false;
}

/** The single gate every shown answer passes through. If the model's answer is
 *  empty, degenerate (a repetition loop), or contains anything we can't confirm
 *  against the résumé, it is dropped and replaced with real résumé facts. The
 *  returned `text` is therefore ALWAYS facts-only — in any language. This is the
 *  function the UI and tests rely on. */
export function guardedAnswer(
  cfg: AskConfig,
  query: string,
  rawAnswer: string,
): { text: string; verified: boolean } {
  const text = (rawAnswer || '').trim();
  if (text && !looksDegenerate(text) && verifyAnswer(text, cfg).ok) return { text, verified: true };
  return { text: safeFallback(cfg, query), verified: false };
}
