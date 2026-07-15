import { describe, expect, test } from 'bun:test';

import { profile } from '../profile';
import { validateProfile } from '../validate';
import { deriveData } from '../derive';
import type { Profile } from '../types';

const clone = (): Profile => structuredClone(profile);

describe('validateProfile', () => {
  test('the shipped profile is valid', () => {
    expect(() => validateProfile(profile)).not.toThrow();
  });

  test('rejects an employment overlap (the 2021 Monstarlab join-date bug)', () => {
    const p = clone();
    // Regression for the real bug this model was built to prevent: the
    // 履歴書 claimed Monstarlab was joined 2021-09 while KiteRa was left
    // 2022-07 — an overlap the old copy-pasted documents couldn't detect.
    const monstarlab = p.companies.find((c) => c.id === 'monstarlab')!;
    monstarlab.joinDate = '2021-09-01';
    expect(() => validateProfile(p)).toThrow(/overlaps/);
  });

  test('rejects a project outside its company period', () => {
    const p = clone();
    const project = p.projects.find((pr) => pr.companyId === 'kitera')!;
    project.startDate = '2020-01-01';
    expect(() => validateProfile(p)).toThrow(/before joining/);
  });

  test('rejects an ongoing project at a company that was left', () => {
    const p = clone();
    const project = p.projects.find((pr) => pr.companyId === 'monstarlab')!;
    project.endDate = null;
    expect(() => validateProfile(p)).toThrow(/ongoing/);
  });

  test('rejects a leave date before the join date', () => {
    const p = clone();
    const c = p.companies.find((c) => c.id === 'fignny')!;
    c.leaveDate = '2019-01-01';
    expect(() => validateProfile(p)).toThrow(/before joinDate/);
  });

  test('rejects malformed and impossible dates', () => {
    const p = clone();
    p.companies[0].joinDate = '2012-4-1';
    expect(() => validateProfile(p)).toThrow(/invalid date/);

    const q = clone();
    q.companies[0].joinDate = '2012-02-31';
    expect(() => validateProfile(q)).toThrow(/invalid date/);
  });

  test('rejects an unknown companyId on a project', () => {
    const p = clone();
    p.projects[0].companyId = 'nonexistent';
    expect(() => validateProfile(p)).toThrow(/unknown companyId/);
  });

  test('rejects two current employments', () => {
    const p = clone();
    p.companies.find((c) => c.id === 'monstarlab')!.leaveDate = null;
    expect(() => validateProfile(p)).toThrow();
  });
});

describe('deriveData', () => {
  test('resolves language-specific company names', () => {
    expect(deriveData('ja').experience?.some((e) => e.company === 'シスナビ')).toBe(true);
    expect(deriveData('en').experience?.some((e) => e.company === 'SysNavi')).toBe(true);
  });

  test('current role has an empty endDate (legacy shape)', () => {
    const current = deriveData('ja').experience?.[0];
    expect(current?.company).toBe('SUPER STUDIO');
    expect(current?.endDate).toBe('');
  });

  test('entries without bullets/team omit those keys entirely', () => {
    const sumitomo = deriveData('en').experience?.find((e) => e.company === 'Sumitomo Chemical');
    expect(sumitomo).toBeDefined();
    expect('team' in sumitomo!.projects).toBe(false);
    expect('experience' in sumitomo!.projects).toBe(false);
  });

  test('non-ja locales fall back to English', () => {
    expect(deriveData(undefined).family_name).toBe('Hidaka');
    expect(deriveData('fr').family_name).toBe('Hidaka');
    expect(deriveData('ja').family_name).toBe('日髙');
  });

  test('the employment timeline in companies[] stays chronological', () => {
    const joins = profile.companies.map((c) => c.joinDate);
    expect([...joins].sort()).toEqual(joins);
  });
});
