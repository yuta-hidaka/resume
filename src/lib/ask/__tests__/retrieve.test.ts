import { describe, it, expect } from 'bun:test';
import { askConfig } from '../profile';
import { detectLanguage, retrieve, buildMessages } from '../retrieve';

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
