import { profile } from '../../data/profile/profile';
import { text, type Lang, type Localizable } from '../../data/profile/types';

// ————————————————————————————————————————————————————————————————
// Career document model: one language-resolved structure that feeds
// every downloadable career document —
//   職務経歴書 (ja HTML) / CV (en HTML) / text resume (ja+en Markdown).
// Facts (names, periods, tech) derive from the canonical profile;
// prose comes from the curated detail blocks stored there.
// ————————————————————————————————————————————————————————————————

export interface CareerBlock {
  heading: string;
  /** e.g. "（2025-01 〜 2025-06）- テックリード / 5名" */
  meta: string;
  bullets: string[];
}

export interface CareerCompany {
  /** e.g. "Monstarlab / Tech Lead, Full-Stack Engineer（2022-09 〜 2025-06）" */
  header: string;
  blocks: CareerBlock[];
  techStack: string[];
}

export interface CareerDoc {
  lang: Lang;
  name: string;
  updatedLine: string;
  summaryHeading: string;
  summary: string;
  experienceHeading: string;
  companies: CareerCompany[];
  skillsHeading: string;
  skillLines: { label: string; items: string }[];
  educationHeading: string;
  education: { heading: string; bullets: string[] }[];
  certificationsHeading: string;
  certifications: string[];
  strengthsHeading: string;
  strengths: { title: string; bullets: string[] }[];
  selfProjectsHeading: string;
  selfProjects: { title: string; desc: string }[];
  basics: { label: string; value: string }[];
}

const ym = (date: string): string => date.slice(0, 7);

function period(lang: Lang, start: string, end: string | null): string {
  const sep = lang === 'ja' ? ' 〜 ' : ' – ';
  const present = lang === 'ja' ? '現在' : 'Present';
  return `${ym(start)}${sep}${end ? ym(end) : present}`;
}

const SKILL_GROUP_LABELS: Record<string, { ja: string; en: string }> = {
  backend: { ja: 'バックエンド', en: 'Backend' },
  frontend: { ja: 'フロントエンド', en: 'Frontend' },
  infra: { ja: 'インフラ', en: 'Infrastructure' },
  db: { ja: 'データベース', en: 'Databases' },
  other: { ja: 'その他', en: 'Other' },
};

export function formatBuildDate(lang: Lang, date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return lang === 'ja'
    ? `${y}年${m}月${d}日現在`
    : `Updated: ${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function buildCareerDoc(lang: Lang): CareerDoc {
  const t = (v: Localizable) => text(v, lang);
  const p = profile;

  const companies: CareerCompany[] = [...p.companies]
    .reverse() // newest first
    .map((company) => {
      const projects = p.projects.filter((pr) => pr.companyId === company.id && pr.detail);
      const companyPeriod = period(lang, company.joinDate, company.leaveDate);
      const rolePart = company.role ? ` / ${t(company.role)}` : '';
      const header =
        lang === 'ja'
          ? `${t(company.name)}${rolePart}（${companyPeriod}）`
          : `${t(company.name)}${rolePart} (${companyPeriod})`;

      const blocks: CareerBlock[] = projects.map((pr) => {
        const detail = pr.detail!;
        const metaParts: string[] = [];
        const projPeriod = detail.periodLabel
          ? t(detail.periodLabel)
          : period(lang, pr.startDate, pr.endDate);
        const samePeriod =
          !detail.periodLabel &&
          ym(pr.startDate) === ym(company.joinDate) &&
          (pr.endDate ? ym(pr.endDate) : null) === (company.leaveDate ? ym(company.leaveDate) : null);
        if (!samePeriod) metaParts.push(lang === 'ja' ? `（${projPeriod}）` : ` (${projPeriod})`);
        if (detail.roleTeam) metaParts.push(`- ${t(detail.roleTeam)}`);
        return {
          heading: t(detail.heading),
          meta: metaParts.join(' ').trim(),
          bullets: detail.bullets[lang],
        };
      });

      for (const extra of company.extraBlocks ?? []) {
        blocks.push({ heading: t(extra.heading), meta: '', bullets: extra.bullets[lang] });
      }

      return { header, blocks, techStack: company.techStack ?? [] };
    });

  const skillLines = (['backend', 'frontend', 'infra', 'db', 'other'] as const).map((group) => ({
    label: SKILL_GROUP_LABELS[group][lang],
    items: p.skills.programming
      .filter((s) => s.group === group)
      .map((s) => s.name)
      .join(', '),
  }));
  skillLines.unshift({
    label: lang === 'ja' ? '言語' : 'Languages',
    items: p.skills.languages.map((s) => `${s.name[lang]}（${s.level[lang]}）`).join('、'),
  });
  if (lang === 'en') {
    skillLines[0].items = p.skills.languages.map((s) => `${s.name.en} (${s.level.en})`).join(', ');
  }

  const certifications = [...p.certifications].reverse().map((c) => {
    if (lang === 'ja') return `${c.year}年${c.month ? `${c.month}月` : ''}: ${t(c.name)}`;
    const month = c.month
      ? `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][c.month - 1]} `
      : '';
    return `${month}${c.year}: ${t(c.name)}`;
  });

  const education = p.education
    .filter((s) => s.showOnSite)
    .map((s) => ({
      heading:
        lang === 'ja'
          ? `${s.rirekishoLabel}（${period('ja', s.startDate ?? s.endDate, s.endDate)}）`
          : `${t(s.institution)}, ${t(s.degree)} (${period('en', s.startDate ?? s.endDate, s.endDate)})`,
      bullets: s.description ? [t(s.description)] : [],
    }));

  const birth = p.person.birthDate;
  const basics =
    lang === 'ja'
      ? [
          { label: '氏名', value: `${p.person.familyName.ja} ${p.person.givenName.ja}` },
          { label: '職種', value: p.person.profession },
          { label: '所在地', value: p.person.address.ja },
          { label: '生年月日', value: `${birth.slice(0, 4)}年${Number(birth.slice(5, 7))}月${Number(birth.slice(8, 10))}日` },
        ]
      : [
          { label: 'Name', value: `${p.person.givenName.en} ${p.person.familyName.en}` },
          { label: 'Role', value: p.person.profession },
          { label: 'Location', value: p.person.address.en },
          { label: 'Date of Birth', value: birth },
        ];
  for (const s of p.social) {
    if (s.name === 'GitHub' || s.name === 'LinkedIn') basics.push({ label: s.name, value: s.url });
  }

  return {
    lang,
    name:
      lang === 'ja'
        ? `${p.person.familyName.ja} ${p.person.givenName.ja}（${p.person.givenName.en} ${p.person.familyName.en}）`
        : `${p.person.givenName.en} ${p.person.familyName.en}`,
    updatedLine: formatBuildDate(lang),
    summaryHeading: lang === 'ja' ? '概要' : 'Summary',
    summary: p.person.bio[lang],
    experienceHeading: lang === 'ja' ? '職務経歴' : 'Experience',
    companies,
    skillsHeading: lang === 'ja' ? 'スキル' : 'Skills',
    skillLines,
    educationHeading: lang === 'ja' ? '学歴' : 'Education',
    education,
    certificationsHeading: lang === 'ja' ? '資格' : 'Certifications',
    certifications,
    strengthsHeading: lang === 'ja' ? '自己PR' : 'Personal Strengths',
    strengths: p.strengths.map((s) => ({ title: s.title[lang], bullets: s.bullets[lang] })),
    selfProjectsHeading: lang === 'ja' ? '個人プロジェクト（抜粋）' : 'Personal Projects (Selected)',
    selfProjects: p.selfProjects.map((sp) => ({ title: sp.title, desc: sp.desc[lang] })),
    basics,
  };
}
