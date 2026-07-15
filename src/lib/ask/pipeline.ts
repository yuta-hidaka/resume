// Staged grounding pipeline — the generation-side anti-hallucination layer.
//
// Stage A (select): the relevant chunks are split into short NUMBERED fact
// sentences and the model is asked to output only the numbers of the ones the
// question needs. The numbers are mapped back to the real sentences in code,
// so this stage is structurally incapable of fabricating content — the worst
// a bad selection can do is pick an irrelevant true sentence.
//
// Stage B (compose): the answer is generated from ONLY the selected sentences
// (see buildMessages' factsOverride). A small, tightly relevant context keeps
// a small model extractive; a wall of loosely relevant text invites drift.
//
// Stage C is the existing verify.ts gate — nothing shown that can't be traced
// to the résumé. When stage B fails that gate, the UI falls back to the
// stage-A sentences themselves (always-true, and more on-topic than a fresh
// keyword retrieval).

import type { AskConfig, ChatMessage } from './retrieve';
import { relevantChunks } from './retrieve';

export type FactLine = { n: number; text: string };

const MAX_LINES = 30; // prompt-size cap; 3 chunks + core stay well under this
const MAX_PICK = 6; // a 1–2 sentence answer never needs more facts than this

/** Split the core profile + relevant chunks into numbered fact sentences. */
export function factLines(cfg: AskConfig, query: string): FactLine[] {
  const hits = relevantChunks(query, cfg.chunks, 3);
  const seen = new Set<string>();
  const out: FactLine[] = [];
  for (const block of [cfg.core, ...hits.map((h) => h.text)]) {
    for (const part of block.split(/(?<=[。．.!?！？])\s*|\n+/)) {
      const text = part.replace(/\s+/g, ' ').trim();
      if (!text || seen.has(text)) continue;
      seen.add(text);
      out.push({ n: out.length + 1, text });
      if (out.length >= MAX_LINES) return out;
    }
  }
  return out;
}

/** Stage-A prompt: pick fact numbers. The output is just digits, so it works
 *  in any visitor language, and stays a few tokens long. No system role (see
 *  buildMessages for why). */
export function buildSelectMessages(query: string, lines: FactLine[]): ChatMessage[] {
  const listing = lines.map((l) => `${l.n}. ${l.text}`).join('\n');
  const inst = [
    'Below is a numbered list of facts about Yuta Hidaka, then a question.',
    'Choose the facts needed to answer the question.',
    `Output ONLY the numbers, comma-separated (example: 2,5). No other words. At most ${MAX_PICK}. If none are relevant, output 0.`,
  ].join('\n');
  return [{ role: 'user', content: `${inst}\n\nFacts:\n${listing}\n\nQuestion: ${query}\n\nNumbers:` }];
}

/** Map the model's number output back to real sentences. Tolerant of noise:
 *  ignores words, out-of-range and duplicate numbers. Empty result (garbage,
 *  "0", a hang cut short) means "no usable selection" — callers then fall
 *  back to the full retrieved context, i.e. the pre-pipeline behavior. */
export function parseSelection(raw: string, lines: FactLine[], max = MAX_PICK): FactLine[] {
  const picked: FactLine[] = [];
  const seen = new Set<number>();
  for (const m of (raw || '').matchAll(/\d{1,2}/g)) {
    const n = parseInt(m[0], 10);
    if (n < 1 || n > lines.length || seen.has(n)) continue;
    seen.add(n);
    picked.push(lines[n - 1]);
    if (picked.length >= max) break;
  }
  return picked;
}
