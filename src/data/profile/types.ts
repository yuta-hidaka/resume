// ————————————————————————————————————————————————————————————————
// Canonical résumé data model — the single source of truth.
//
// Design rule: a FACT (date, number, tag, URL, count) is stored exactly
// once, language-neutral. Only PROSE is localized. `Localizable` is a
// plain string when both languages share the text, or {ja, en} when they
// differ — so a fact can never drift between languages again.
//
// Everything the site, the /ask grounding, and the generated documents
// (職務経歴書 / 履歴書 / CV / text resume) need derives from `Profile`.
// ————————————————————————————————————————————————————————————————

export type Lang = 'ja' | 'en';

export type Localizable = string | { ja: string; en: string };

export interface Person {
  familyName: { ja: string; en: string };
  givenName: { ja: string; en: string };
  /** 履歴書のふりがな欄 */
  furigana: string;
  /** YYYY-MM-DD */
  birthDate: string;
  /** 履歴書の性別欄 (null = 無記入) */
  gender: '男' | '女' | null;
  profession: string;
  bio: { ja: string; en: string };
  address: { ja: string; en: string };
  /** public URL path of the 履歴書 photo */
  photo: string;
}

export interface SocialLink {
  name: string;
  url: string;
}

export type CompanyKind = 'employment' | 'self-employed' | 'freelance';

/**
 * One employment period. The 履歴書's 学歴・職歴 rows derive from these:
 * employment → 入社/退社, self-employed → 開業/廃業, freelance → 開始行のみ.
 */
export interface Company {
  id: string;
  /** display name used on the site / CV */
  name: { ja: string; en: string } | string;
  /** formal name used in the 履歴書 (e.g. 株式会社◯◯) */
  legalName: string;
  kind: CompanyKind;
  /** YYYY-MM-DD */
  joinDate: string;
  /** YYYY-MM-DD, null = 在職中 (現在に至る) */
  leaveDate: string | null;
}

export interface Project {
  /** must reference a Company.id; the project period must fall inside the company period */
  companyId: string;
  jobTitle: Localizable;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD, null = 継続中 */
  endDate: string | null;
  tags: Localizable[];
  job: Localizable;
  jobDescription: Localizable;
  experienceBullets?: Localizable[];
  team?: number;
}

export interface SelfProject {
  title: string;
  desc: { ja: string; en: string };
  link: string;
  tags: string[];
}

export interface School {
  institution: Localizable;
  degree: Localizable;
  /** row label in the 履歴書 (e.g. 東京理科大学 第二部 化学科) */
  rirekishoLabel: string;
  /** YYYY-MM-DD, null = 入学行を出さない (不明・省略) */
  startDate: string | null;
  /** YYYY-MM-DD (卒業) */
  endDate: string;
  description: Localizable;
  /** shown on the site's about/career pages (the 履歴書 lists all schools) */
  showOnSite: boolean;
}

export interface Certification {
  name: string;
  year: number;
  month?: number;
}

export interface Motivation {
  title: { ja: string; en: string };
  desc: { ja: string; en: string };
}

export interface LanguageSkill {
  name: { ja: string; en: string };
  level: { ja: string; en: string };
}

export interface ProgrammingSkill {
  name: string;
  description: string;
  years: number;
}

/** Fields that only exist on the 履歴書 (JIS format). */
export interface RirekishoExtras {
  /** 志望の動機、特技、好きな学科、アピールポイントなど */
  motivationText: string;
  commute: { hours: number; minutes: number };
  /** 扶養家族数（配偶者を除く） */
  dependents: number;
  /** null = 無記入 */
  spouse: boolean | null;
  /** 配偶者の扶養義務, null = 無記入 */
  spouseSupportObligation: boolean | null;
  /** 本人希望記入欄 */
  requests: string;
}

export interface Profile {
  person: Person;
  social: SocialLink[];
  companies: Company[];
  projects: Project[];
  selfProjects: SelfProject[];
  education: School[];
  certifications: Certification[];
  motivations: Motivation[];
  job: { title: { ja: string; en: string }; desc: { ja: string; en: string } };
  skills: {
    languages: LanguageSkill[];
    programming: ProgrammingSkill[];
  };
  rirekisho: RirekishoExtras;
}

/** Resolve a Localizable to one language. */
export function text(value: Localizable, lang: Lang): string {
  return typeof value === 'string' ? value : value[lang];
}
