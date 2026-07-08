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
    for (const id of ['bio', 'skills', 'meta']) expect(ids).toContain(id);
    expect(ids.some((id) => id.startsWith('exp'))).toBe(true);
    expect(ids.some((id) => id.startsWith('edu'))).toBe(true);
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
