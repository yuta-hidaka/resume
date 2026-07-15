import { describe, it, expect } from 'bun:test';
import { askConfig } from '../profile';
import { factLines, buildSelectMessages, parseSelection } from '../pipeline';
import { buildMessages } from '../retrieve';

const ja = askConfig('ja');
const en = askConfig('en');

describe('factLines — numbered fact sentences', () => {
  it('splits core + relevant chunks into numbered, non-empty, deduped sentences', () => {
    const lines = factLines(ja, '経歴を教えて');
    expect(lines.length).toBeGreaterThan(4);
    lines.forEach((l, i) => {
      expect(l.n).toBe(i + 1);
      expect(l.text.trim().length).toBeGreaterThan(0);
    });
    expect(new Set(lines.map((l) => l.text)).size).toBe(lines.length);
  });

  it('every line is a true résumé sentence (verbatim from core or a chunk)', () => {
    const corpus = [ja.core, ...ja.chunks.map((c) => c.text)].join('\n').replace(/\s+/g, ' ');
    for (const l of factLines(ja, 'Kafkaの経験は？')) {
      expect(corpus.includes(l.text)).toBe(true);
    }
  });

  it('caps the list length', () => {
    expect(factLines(ja, '経歴を教えて').length).toBeLessThanOrEqual(30);
  });
});

describe('buildSelectMessages — stage-A prompt', () => {
  it('contains the numbered listing, the question, and the numbers-only rule', () => {
    const lines = factLines(en, 'What is your experience with Kafka?');
    const [msg] = buildSelectMessages('What is your experience with Kafka?', lines);
    expect(msg.role).toBe('user');
    expect(msg.content).toContain('1. ');
    expect(msg.content).toContain('What is your experience with Kafka?');
    expect(msg.content).toMatch(/ONLY the numbers/);
  });
});

describe('parseSelection — hallucination-proof mapping', () => {
  const lines = [
    { n: 1, text: 'fact one' },
    { n: 2, text: 'fact two' },
    { n: 3, text: 'fact three' },
  ];

  it('maps clean number output back to the real sentences', () => {
    expect(parseSelection('1,3', lines).map((l) => l.text)).toEqual(['fact one', 'fact three']);
  });

  it('tolerates prose noise around the numbers', () => {
    expect(parseSelection('The answer needs facts 2 and 3.', lines).map((l) => l.n)).toEqual([2, 3]);
  });

  it('ignores out-of-range and duplicate numbers', () => {
    expect(parseSelection('7, 2, 2, 99', lines).map((l) => l.n)).toEqual([2]);
  });

  it('returns empty for "0", garbage, or empty output (→ full-context fallback)', () => {
    expect(parseSelection('0', lines)).toEqual([]);
    expect(parseSelection('わかりません', lines)).toEqual([]);
    expect(parseSelection('', lines)).toEqual([]);
  });

  it('caps the number of picks', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ n: i + 1, text: `f${i + 1}` }));
    expect(parseSelection('1,2,3,4,5,6,7,8,9,10', many).length).toBeLessThanOrEqual(6);
  });
});

describe('buildMessages with factsOverride — stage-B grounding', () => {
  it('injects only the selected facts (plus the always-on core profile)', () => {
    const content = buildMessages(ja, '経歴を教えて', [], ['選ばれた事実その一。'])
      .at(-1)!.content;
    expect(content).toContain('選ばれた事実その一。');
    expect(content).toContain(ja.core.slice(0, 20)); // core stays
    // A chunk that keyword-retrieval would normally pull in is absent.
    const bulky = ja.chunks.find((c) => c.id === 'skills')!.text.slice(0, 24);
    expect(content).not.toContain(bulky);
  });

  it('keeps every anti-invention guardrail in the instruction', () => {
    const content = buildMessages(ja, '経歴を教えて', [], ['事実。']).at(-1)!.content;
    expect(content).toMatch(/Use ONLY the reference facts/);
    expect(content).toMatch(/Invent nothing/);
  });

  it('without an override, behaves exactly as before (retrieved chunks included)', () => {
    const content = buildMessages(ja, 'Kafkaの経験は？', []).at(-1)!.content;
    expect(content.toLowerCase()).toContain('kafka');
  });
});
