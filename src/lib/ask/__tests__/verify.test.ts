import { describe, it, expect } from 'bun:test';
import { askConfig } from '../profile';
import { verifyAnswer, safeFallback, sourceText } from '../verify';

const ja = askConfig('ja');
const en = askConfig('en');

describe('verifyAnswer — blocks fabrication', () => {
  it('rejects a fake University of Tokyo degree (the real school is Tokyo Univ. of Science)', () => {
    const r = verifyAnswer('2018年に東京大学理工学部を卒業しました。', ja);
    expect(r.ok).toBe(false);
    expect(r.issues.join(' ')).toContain('東京大学');
  });

  it('rejects a fabricated employer', () => {
    const r = verifyAnswer('以前はGoogle Japanでエンジニアとして働いていました。', ja);
    expect(r.ok).toBe(false);
    expect(r.issues).toContain('Google');
  });

  it('rejects invented academic titles', () => {
    expect(verifyAnswer('現在は大学院の准教授を務めています。', ja).ok).toBe(false);
    expect(verifyAnswer('I hold a PhD and work as a professor.', en).ok).toBe(false);
  });

  it('rejects a made-up number (fake age / headcount)', () => {
    expect(verifyAnswer('私は29歳です。', ja).ok).toBe(false);
    // 100 now legitimately appears in the résumé (100-member Furusato project),
    // so the fabricated headcount uses a number that stays absent.
    expect(verifyAnswer('The company grew to 450 employees.', en).ok).toBe(false);
  });

  it('rejects romaji aliases of schools he did not attend', () => {
    expect(verifyAnswer('日髙さんは toudai の出身です。', ja).ok).toBe(false);
    expect(verifyAnswer('He graduated from waseda.', en).ok).toBe(false);
  });

  it('rejects a fabricated framework while allowing a real one', () => {
    // Django is in the résumé; Flask is not.
    const r = verifyAnswer('I mostly use Flask these days.', en);
    expect(r.ok).toBe(false);
    expect(r.issues).toContain('Flask');
    expect(verifyAnswer('I have used Django with Python.', en).ok).toBe(true);
  });
});

describe('verifyAnswer — passes grounded answers', () => {
  it('accepts a real self-intro (JA)', () => {
    const r = verifyAnswer(
      'GoとTypeScriptを軸にしたバックエンドエンジニアで、KafkaやSparkも使います。',
      ja,
    );
    expect(r.ok).toBe(true);
    expect(r.issues).toEqual([]);
  });

  it('accepts real employer + real numbers (EN)', () => {
    const r = verifyAnswer(
      'At SUPER STUDIO I work with Kafka and Spark. I became an engineer in 2018.',
      en,
    );
    expect(r.ok).toBe(true);
  });

  it('accepts the real school', () => {
    expect(verifyAnswer('東京理科大学を卒業しました。', ja).ok).toBe(true);
  });
});

describe('sourceText & safeFallback', () => {
  it('source of truth carries key résumé facts', () => {
    const src = sourceText(ja);
    for (const fact of ['golang', 'kafka', 'superstudio', '理科大学']) {
      expect(src).toContain(fact.toLowerCase());
    }
  });

  it('safeFallback returns non-empty, verifiable résumé text', () => {
    const ans = safeFallback(ja, 'Kafkaの経験を教えて');
    expect(ans.length).toBeGreaterThan(10);
    // The fallback is built from the résumé, so it must pass verification itself.
    expect(verifyAnswer(ans, ja).ok).toBe(true);
  });
});

describe('verifyAnswer — generic katakana vs fabricated brands', () => {
  it('passes natural answers that use everyday katakana not in the résumé', () => {
    expect(verifyAnswer('英語は日常会話レベルです。', ja).ok).toBe(true);
    expect(verifyAnswer('システムのパフォーマンスを改善しました。', ja).ok).toBe(true);
    expect(verifyAnswer('インフラコストを30パーセント削減しました。', ja).ok).toBe(true); // % → パーセント
    expect(verifyAnswer('マイクロサービスをリアルタイムで処理します。', ja).ok).toBe(true);
  });
  it('still catches fabricated katakana company/brand names', () => {
    expect(verifyAnswer('以前グーグルで働いていました。', ja).ok).toBe(false);
    expect(verifyAnswer('アマゾンでエンジニアをしていました。', ja).ok).toBe(false);
    expect(verifyAnswer('セールスフォースの認定資格を持っています。', ja).ok).toBe(false);
  });
});
