import type { Data, ExperienceEntity, Projects } from '../../types/data';
import { profile } from './profile';
import { text, type Lang, type Localizable } from './types';

// Derives the legacy `Data` shape (consumed by the site pages and the
// /ask grounding) from the canonical profile. Output is byte-identical
// to the former hand-maintained about.ja.ts / about.en.ts objects.

const langOf = (locale: string | undefined): Lang => (locale === 'ja' ? 'ja' : 'en');

export function deriveData(locale: string | undefined): Data {
  const lang = langOf(locale);
  const t = (v: Localizable) => text(v, lang);
  const companyName = new Map(profile.companies.map((c) => [c.id, t(c.name)]));

  const experience: ExperienceEntity[] = profile.projects.map((p) => {
    const projects: Projects = {
      tags: p.tags.map(t),
      job: t(p.job),
      jobDescription: t(p.jobDescription),
    };
    if (p.experienceBullets) projects.experience = p.experienceBullets.map(t);
    if (p.team !== undefined) projects.team = p.team;
    return {
      jobTitle: t(p.jobTitle),
      company: companyName.get(p.companyId) ?? p.companyId,
      startDate: p.startDate,
      endDate: p.endDate ?? '',
      projects,
    };
  });

  return {
    family_name: profile.person.familyName[lang],
    given_name: profile.person.givenName[lang],
    profession: profile.person.profession,
    bio: profile.person.bio[lang],
    address: profile.person.address[lang],
    social: profile.social.map((s) => ({ ...s })),
    experience,
    selfProject: profile.selfProjects.map((sp) => ({
      title: sp.title,
      desc: sp.desc[lang],
      link: sp.link,
      tags: [...sp.tags],
    })),
    education: profile.education
      .filter((s) => s.showOnSite)
      .map((s) => ({
        degree: t(s.degree),
        institution: t(s.institution),
        startDate: s.startDate ?? '',
        endDate: s.endDate,
        description: t(s.description),
      })),
    motivation: profile.motivations.map((m) => ({ title: m.title[lang], desc: m.desc[lang] })),
    job: { title: profile.job.title[lang], desc: profile.job.desc[lang] },
    skills: {
      LanguageSkills: profile.skills.languages.map((s) => ({
        name: s.name[lang],
        description: s.level[lang],
        year: -1,
      })),
      ProgrammingSkills: profile.skills.programming.map((s) => ({
        name: s.name,
        description: s.description,
        year: s.years,
      })),
    },
  };
}
