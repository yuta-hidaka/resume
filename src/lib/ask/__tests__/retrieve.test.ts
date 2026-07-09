import { describe, it, expect } from 'bun:test';
import { askConfig } from '../profile';
import { detectLanguage, retrieve, retrieveScored, relevantChunks, buildMessages } from '../retrieve';

const ja = askConfig('ja');
const en = askConfig('en');

describe('detectLanguage', () => {
  it('detects by script', () => {
    expect(detectLanguage('これまでの経歴を教えて').code).toBe('ja');
    expect(detectLanguage('커리어를 소개해 주세요').code).toBe('ko');
    expect(detectLanguage('简单介绍一下你的经历').code).toBe('zh');
  });
  it('detects Latin-script languages by keyword', () => {
    expect(detectLanguage('Parlez-moi de votre expérience').code).toBe('fr');
    expect(detectLanguage('háblame de tu experiencia').code).toBe('es');
    expect(detectLanguage('erzähl mir von deiner Erfahrung').code).toBe('de');
    expect(detectLanguage('tell me about your work').code).toBe('en');
  });
});

describe('retrieve', () => {
  it('finds the meta chunk for a question about the chat itself', () => {
    const ids = retrieve('このチャットは何で動いているの？', ja.chunks, 3).map((c) => c.id);
    expect(ids).toContain('meta');
  });
  it('finds an education chunk for a school question', () => {
    const ids = retrieve('学歴を教えて', ja.chunks, 3).map((c) => c.id);
    expect(ids.some((id) => id.startsWith('edu'))).toBe(true);
  });
  it('surfaces a Kafka-tagged experience chunk', () => {
    const hits = retrieve('Kafkaの経験は？', ja.chunks, 3);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((c) => (c.text + c.tags.join(' ')).toLowerCase().includes('kafka'))).toBe(true);
  });
  it('returns nothing for an empty query', () => {
    expect(retrieve('   ', ja.chunks, 3)).toEqual([]);
  });
});

describe('relevantChunks — confidence-aware selection', () => {
  it('a weak/subjective query falls back to the bio+skills overview, not a random old side job', () => {
    const ids = relevantChunks('この人を雇うべき？', ja.chunks, 3).map((h) => h.id);
    expect(ids).toContain('bio');
    expect(ids).toContain('skills');
    expect(ids[0]).not.toBe('exp14'); // was surfacing 生ハムの輸入販売
  });
  it('"what kind of person" also gets the overview', () => {
    expect(relevantChunks('どんな人？', ja.chunks, 3).map((h) => h.id)).toContain('bio');
  });
  it('a strong keyword query still returns the specific relevant chunk', () => {
    expect(relevantChunks('英語話せる？', ja.chunks, 3).map((h) => h.id)).toContain('langs');
    const tl = relevantChunks('テックリードとして何をしましたか？', ja.chunks, 3).map((h) => h.id);
    expect(tl.some((id) => id.startsWith('exp'))).toBe(true);
  });
});

describe('retrieveScored — hiragana particles do not inflate score', () => {
  it('a subjective question stays below the strong-match bar (→ overview)', () => {
    const top = retrieveScored('この人を雇うべき？', ja.chunks, 1)[0];
    expect(!top || top.score < 3).toBe(true);
  });
});

describe('buildMessages', () => {
  it('never uses a system role (TinySwallow emits EOS on system messages)', () => {
    const msgs = buildMessages(ja, 'テックリードとして何をしましたか？', []);
    expect(msgs.some((m) => m.role === 'system')).toBe(false);
  });
  it('ends with a grounded user turn that contains the question and the facts', () => {
    const msgs = buildMessages(ja, 'テックリードとして何をしましたか？', []);
    const last = msgs[msgs.length - 1];
    expect(last.role).toBe('user');
    expect(last.content).toContain('テックリードとして何をしましたか？');
    expect(last.content).toContain('Reference facts:');
  });
  it('keeps every core guardrail in the grounded turn (facts-only, no-invention, language, brevity)', () => {
    const content = buildMessages(ja, 'テックリードとして何をしましたか？', []).at(-1)!.content;
    expect(content).toContain('ONLY'); // facts-only
    expect(content.toLowerCase()).toContain('invent nothing'); // no fabrication
    expect(content).toContain("visitor's language"); // reply language
    expect(content).toMatch(/1[–-]2/); // brevity cap
  });
  it('includes few-shot for a same-language first turn', () => {
    const msgs = buildMessages(ja, '自己紹介して', []);
    expect(msgs.some((m) => m.role === 'assistant')).toBe(true);
  });
  it('adds a hard language directive for a cross-language question, and drops few-shot', () => {
    const msgs = buildMessages(ja, 'Parlez-moi de votre expérience', []);
    expect(msgs[msgs.length - 1].content).toContain('French');
    // no few-shot assistant turns before the user question
    expect(msgs.filter((m) => m.role === 'assistant')).toHaveLength(0);
  });
});
