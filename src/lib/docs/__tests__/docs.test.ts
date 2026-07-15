import { describe, expect, test } from 'bun:test';

import { buildCareerDoc } from '../career';
import { downloadFileName } from '../filenames';
import { renderCareerMarkdown } from '../career-markdown';
import { renderCareerHtml } from '../career-html';
import { renderRirekisho } from '../rirekisho';
import { toHtmlDocument } from '../html';

describe('buildCareerDoc', () => {
  test('companies are newest-first and derive periods from the canonical timeline', () => {
    const doc = buildCareerDoc('ja');
    expect(doc.companies[0].header).toBe('SUPER STUDIO / Backend Engineer（2025-07 〜 現在）');
    expect(doc.companies.at(-1)!.header).toBe('住友化学 / 研究開発（2012-04 〜 2018-03）');
  });

  test('project blocks carry curated bullets in both languages', () => {
    for (const lang of ['ja', 'en'] as const) {
      const doc = buildCareerDoc(lang);
      const monstarlab = doc.companies.find((c) => c.header.startsWith('Monstarlab'))!;
      expect(monstarlab.blocks.length).toBe(4);
      for (const block of monstarlab.blocks) expect(block.bullets.length).toBeGreaterThan(0);
    }
  });

  test('block meta omits the period when it matches the company period', () => {
    const doc = buildCareerDoc('ja');
    const ss = doc.companies[0];
    expect(ss.blocks[0].meta).toBe('');
    const kitera = doc.companies.find((c) => c.header.startsWith('KiteRa'))!;
    expect(kitera.blocks[0].meta).not.toContain('2021');
  });

  test('certifications are newest-first with reconciled years', () => {
    const doc = buildCareerDoc('ja');
    expect(doc.certifications[0]).toBe('2012年: 普通自動車免許');
    expect(doc.certifications.at(-1)).toBe('2010年7月: ボイラー技士Ⅱ種');
  });
});

describe('renderCareerMarkdown', () => {
  test('contains every major section in both languages', () => {
    const ja = renderCareerMarkdown('ja');
    for (const heading of ['# レジュメ', '### 基本情報', '### 概要', '### 職務経歴', '### 学歴', '### 資格', '### スキル', '### 自己PR', '### 個人プロジェクト（抜粋）']) {
      expect(ja).toContain(heading);
    }
    const en = renderCareerMarkdown('en');
    for (const heading of ['# Resume', '### Summary', '### Experience', '### Education', '### Certifications', '### Skills', '### Personal Strengths', '### Personal Projects (Selected)']) {
      expect(en).toContain(heading);
    }
  });

  test('has no leaked undefined/null placeholders', () => {
    for (const lang of ['ja', 'en'] as const) {
      const md = renderCareerMarkdown(lang);
      expect(md).not.toContain('undefined');
      expect(md).not.toContain('[object Object]');
    }
  });
});

describe('renderCareerHtml', () => {
  test('declares A4 page rules and per-page margins', () => {
    for (const lang of ['ja', 'en'] as const) {
      const doc = renderCareerHtml(lang);
      expect(doc.css).toContain('size: A4');
      expect(doc.css).toMatch(/@page\s*\{[^}]*margin:/);
    }
  });

  test('escapes HTML in content', () => {
    const doc = renderCareerHtml('ja');
    expect(doc.bodyHtml).not.toContain('undefined');
    expect(doc.bodyHtml).toContain('Backend Team → xfunction Team');
  });
});

describe('renderRirekisho', () => {
  const now = new Date(2026, 6, 15);
  const doc = renderRirekisho(now);

  test('renders exactly two A4 sheets', () => {
    expect(doc.bodyHtml.match(/class="sheet"/g)?.length).toBe(2);
    expect(doc.css).toContain('size: A4');
  });

  test('timeline derives from the canonical employment data', () => {
    expect(doc.bodyHtml).toContain('宮崎県立 宮崎工業高校 化学環境学科 卒業');
    expect(doc.bodyHtml).toContain('Monstarlab株式会社 入社');
    expect(doc.bodyHtml).toContain('現在に至る');
    expect(doc.bodyHtml).toContain('以上');
    // freelance: start row only, no 退社 row
    expect(doc.bodyHtml).toContain('フリーランス');
    expect(doc.bodyHtml).not.toContain('フリーランス 退社');
    // 開業/廃業 for self-employed
    expect(doc.bodyHtml).toContain('個人事業主 開業');
    expect(doc.bodyHtml).toContain('個人事業主 廃業');
  });

  test('computes 満年齢 from the birth date', () => {
    expect(doc.bodyHtml).toContain('満32歳');
    expect(renderRirekisho(new Date(2027, 2, 22)).bodyHtml).toContain('満33歳');
    expect(renderRirekisho(new Date(2027, 2, 21)).bodyHtml).toContain('満32歳');
  });

  test('licenses are listed oldest-first with reconciled years', () => {
    const first = doc.bodyHtml.indexOf('ボイラー技士Ⅱ種');
    const last = doc.bodyHtml.indexOf('普通自動車免許');
    expect(first).toBeGreaterThan(-1);
    expect(last).toBeGreaterThan(first);
  });
});

describe('downloadFileName', () => {
  const date = new Date(2026, 6, 15);
  test('japanese pages get japanese names with a datestamp', () => {
    expect(downloadFileName('rirekisho', 'ja', date)).toBe('履歴書_日髙悠太_20260715.pdf');
    expect(downloadFileName('cv', 'ja', date)).toBe('職務経歴書_日髙悠太_20260715.pdf');
    expect(downloadFileName('resume-text', 'ja', date)).toBe('レジュメ_日髙悠太_20260715.pdf');
  });
  test('english pages get english names with a datestamp', () => {
    expect(downloadFileName('cv', 'en', date)).toBe('yuta-hidaka-cv-en-20260715.pdf');
    expect(downloadFileName('resume-text', 'en', date)).toBe('yuta-hidaka-resume-en-20260715.pdf');
  });
});

describe('toHtmlDocument', () => {
  test('produces a self-contained document DocumentSection can parse', () => {
    const html = toHtmlDocument(renderCareerHtml('ja'));
    expect(html).toContain('<body class="career-doc">');
    expect(html).toContain('<style>');
  });
});
