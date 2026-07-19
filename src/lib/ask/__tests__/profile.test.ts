import { describe, it, expect } from 'bun:test';
import { askConfig, coreProfile, factChunks } from '../profile';

describe('coreProfile', () => {
  it('carries the REAL school, not a fabricated one', () => {
    const core = coreProfile('en');
    expect(core).toContain('Tokyo University of Science');
    expect(core).not.toContain('University of Tokyo');
    expect(coreProfile('ja')).toContain('理科大');
  });
  it('carries the real current employer and companies', () => {
    const core = coreProfile('en');
    expect(core).toContain('SUPER STUDIO');
    expect(core.toLowerCase()).toContain('go');
  });
});

describe('factChunks', () => {
  it('produces the expected anchor chunks', () => {
    const ids = factChunks('ja').map((c) => c.id);
    for (const id of ['bio', 'skills', 'meta', 'timeline', 'certs']) expect(ids).toContain(id);
    expect(ids.some((id) => id.startsWith('exp'))).toBe(true);
    expect(ids.some((id) => id.startsWith('edu'))).toBe(true);
    expect(ids.some((id) => id.startsWith('strength'))).toBe(true);
    expect(ids.some((id) => id.startsWith('hl'))).toBe(true);
  });
  it('canonical-profile chunks carry the new facts', () => {
    const ja = factChunks('ja');
    const certs = ja.find((c) => c.id === 'certs')!;
    expect(certs.text).toContain('甲種危険物取扱者');
    expect(certs.text).toContain('普通自動車免許 (2012)');
    const timeline = ja.find((c) => c.id === 'timeline')!;
    expect(timeline.text).toContain('住友化学 (2012-04–2018-03)');
    expect(timeline.text).toContain('SUPER STUDIO (2025-07–現在)');
    const en = factChunks('en');
    expect(en.find((c) => c.id === 'certs')!.text).toContain('Boiler Operator');
    expect(en.some((c) => c.id.startsWith('hl') && c.text.includes('1,600+'))).toBe(true);
  });
  it('retrieves certifications for a 資格 question', async () => {
    const { relevantChunks } = await import('../retrieve');
    const hits = relevantChunks('何か資格を持っていますか？', factChunks('ja'));
    expect(hits.some((c) => c.id === 'certs')).toBe(true);
    const hitsEn = relevantChunks('Do you have any certifications or licenses?', factChunks('en'));
    expect(hitsEn.some((c) => c.id === 'certs')).toBe(true);
  });
  it('every chunk has text and tags', () => {
    for (const c of factChunks('en')) {
      expect(c.text.length).toBeGreaterThan(0);
      expect(Array.isArray(c.tags)).toBe(true);
    }
  });
});

describe('askConfig', () => {
  it('bundles everything the client needs', () => {
    const cfg = askConfig('ja');
    expect(cfg.lang).toBe('ja');
    expect(typeof cfg.core).toBe('string');
    expect(cfg.chunks.length).toBeGreaterThan(3);
    expect(cfg.fewShot.length).toBeGreaterThan(0);
  });
});
