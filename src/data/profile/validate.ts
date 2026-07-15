import type { Profile } from './types';

// Consistency rules for the canonical profile. Runs on import (see
// profile.ts), so `astro build`, `bun test`, and the PDF pipeline all
// fail loudly on inconsistent data instead of shipping it — e.g. a
// company join date that contradicts the employment timeline.

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value: string): boolean {
  if (!DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function validateProfile(profile: Profile): void {
  const errors: string[] = [];
  const err = (msg: string) => errors.push(msg);

  const checkDate = (value: string, label: string) => {
    if (!isValidDate(value)) err(`${label}: invalid date "${value}" (expected YYYY-MM-DD)`);
  };

  checkDate(profile.person.birthDate, 'person.birthDate');

  // — companies: chronological, non-overlapping, at most one current —
  const companies = profile.companies;
  const byId = new Map(companies.map((c) => [c.id, c]));
  if (byId.size !== companies.length) err('companies: duplicate id');

  let current = 0;
  for (const c of companies) {
    checkDate(c.joinDate, `companies[${c.id}].joinDate`);
    if (c.leaveDate === null) {
      current += 1;
    } else {
      checkDate(c.leaveDate, `companies[${c.id}].leaveDate`);
      if (c.leaveDate < c.joinDate) {
        err(`companies[${c.id}]: leaveDate ${c.leaveDate} is before joinDate ${c.joinDate}`);
      }
    }
  }
  if (current > 1) err('companies: more than one company has leaveDate=null (在職中)');

  for (let i = 1; i < companies.length; i++) {
    const prev = companies[i - 1];
    const cur = companies[i];
    if (prev.leaveDate === null) {
      err(`companies[${prev.id}]: has leaveDate=null but is not the last entry`);
      continue;
    }
    if (cur.joinDate <= prev.leaveDate) {
      err(
        `companies: ${cur.id} joins ${cur.joinDate}, which overlaps ${prev.id} (until ${prev.leaveDate}) — keep the list chronological and non-overlapping`,
      );
    }
  }

  // — projects: must fit inside their company's employment period —
  profile.projects.forEach((p, i) => {
    const label = `projects[${i}] (${p.companyId})`;
    const company = byId.get(p.companyId);
    if (!company) {
      err(`${label}: unknown companyId "${p.companyId}"`);
      return;
    }
    checkDate(p.startDate, `${label}.startDate`);
    if (p.startDate < company.joinDate) {
      err(`${label}: starts ${p.startDate}, before joining ${company.id} (${company.joinDate})`);
    }
    if (p.endDate === null) {
      if (company.leaveDate !== null) {
        err(`${label}: is ongoing (endDate=null) but ${company.id} was left on ${company.leaveDate}`);
      }
    } else {
      checkDate(p.endDate, `${label}.endDate`);
      if (p.endDate < p.startDate) err(`${label}: endDate ${p.endDate} is before startDate ${p.startDate}`);
      if (company.leaveDate !== null && p.endDate > company.leaveDate) {
        err(`${label}: ends ${p.endDate}, after leaving ${company.id} (${company.leaveDate})`);
      }
    }
  });

  // — education: chronological by graduation —
  profile.education.forEach((s, i) => {
    const label = `education[${i}] (${s.rirekishoLabel})`;
    checkDate(s.endDate, `${label}.endDate`);
    if (s.startDate !== null) {
      checkDate(s.startDate, `${label}.startDate`);
      if (s.endDate < s.startDate) err(`${label}: endDate before startDate`);
    }
    if (i > 0 && s.endDate < profile.education[i - 1].endDate) {
      err(`${label}: graduation dates must be chronological`);
    }
  });

  // — certifications: sane years —
  profile.certifications.forEach((c, i) => {
    if (c.year < 1900 || c.year > 2100) err(`certifications[${i}] (${c.name}): implausible year ${c.year}`);
    if (c.month !== undefined && (c.month < 1 || c.month > 12)) {
      err(`certifications[${i}] (${c.name}): invalid month ${c.month}`);
    }
  });

  if (errors.length) {
    throw new Error(`Invalid résumé profile data:\n  - ${errors.join('\n  - ')}`);
  }
}
