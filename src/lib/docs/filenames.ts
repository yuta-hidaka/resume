import { profile } from '../../data/profile/profile';
import type { Lang } from '../../data/profile/types';

// Download filenames for the generated documents, stamped with the build date
// (= the date the served PDFs were generated). Japanese pages get Japanese
// names, English pages English ones — applied via the <a download> attribute.

export type DocKind = 'resume-text' | 'cv' | 'rirekisho';

function stamp(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export function downloadFileName(kind: DocKind, lang: Lang, date: Date = new Date()): string {
  const s = stamp(date);
  if (lang === 'ja') {
    const name = `${profile.person.familyName.ja}${profile.person.givenName.ja}`;
    const label = kind === 'rirekisho' ? '履歴書' : kind === 'cv' ? '職務経歴書' : 'レジュメ';
    return `${label}_${name}_${s}.pdf`;
  }
  const slug = `${profile.person.givenName.en}-${profile.person.familyName.en}`.toLowerCase();
  const label = kind === 'cv' ? 'cv' : 'resume';
  return `${slug}-${label}-en-${s}.pdf`;
}
