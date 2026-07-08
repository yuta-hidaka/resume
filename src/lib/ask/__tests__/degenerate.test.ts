import { describe, it, expect } from 'bun:test';
import { askConfig } from '../profile';
import { looksDegenerate, guardedAnswer } from '../verify';

const ja = askConfig('ja');
const en = askConfig('en');

describe('looksDegenerate — catches repetition-loop garbage', () => {
  it('flags the exact "先のこと、" loop a small model produced', () => {
    const garbage = 'テックリードとして何をしたければ、つまり、' + '先のこと、'.repeat(120);
    expect(looksDegenerate(garbage)).toBe(true);
  });

  it('flags a short unit repeated back-to-back', () => {
    expect(looksDegenerate('はいはいはいはいはいはいはいはい')).toBe(true);
    expect(looksDegenerate('go go go go go go go go go go')).toBe(true);
    expect(looksDegenerate('あああああああああああ')).toBe(true);
  });

  it('flags near-zero token diversity', () => {
    expect(looksDegenerate('先のこと先のこと先のこと先のこと先のこと先のこと')).toBe(true);
  });

  it('treats empty / whitespace as degenerate', () => {
    expect(looksDegenerate('')).toBe(true);
    expect(looksDegenerate('   \n  ')).toBe(true);
  });
});

describe('looksDegenerate — does NOT flag real answers', () => {
  // Real résumé facts must always survive — a false positive would hide good answers.
  for (const cfg of [ja, en] as const) {
    it(`keeps coreProfile (${cfg.lang})`, () => {
      expect(looksDegenerate(cfg.core)).toBe(false);
    });
    for (const ch of cfg.chunks) {
      it(`keeps chunk "${ch.id}" (${cfg.lang})`, () => {
        expect(looksDegenerate(ch.text)).toBe(false);
      });
    }
  }

  it('keeps ordinary short answers', () => {
    expect(looksDegenerate('はい、Go・TypeScriptを軸としたバックエンドエンジニアです。')).toBe(false);
    expect(looksDegenerate('He is a backend engineer who works with Go and Kafka.')).toBe(false);
    expect(looksDegenerate('現在は SUPER STUDIO でバックエンドエンジニアとして働いています。')).toBe(false);
  });
});

describe('guardedAnswer — never shows degenerate output as verified', () => {
  it('drops the repetition loop and falls back to facts', () => {
    const garbage = 'テックリードとして、' + '先のこと、'.repeat(100);
    const g = guardedAnswer(ja, 'テックリードとして何をしましたか？', garbage);
    expect(g.verified).toBe(false);
    expect(g.text).not.toContain('先のこと、先のこと');
    expect(g.text.length).toBeGreaterThan(0); // still gives the user real facts
  });
});
