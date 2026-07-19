import type { Lang } from '../../data/profile/types';
import { buildCareerDoc } from './career';

/** Text-resume rendering (the downloadable "レジュメ（テキスト）" documents). */
export function renderCareerMarkdown(lang: Lang): string {
  const doc = buildCareerDoc(lang);
  const out: string[] = [];
  const push = (...lines: string[]) => out.push(...lines);

  push(`# ${lang === 'ja' ? 'レジュメ' : 'Resume'}`, '');
  push(`### ${lang === 'ja' ? '基本情報' : 'Basic Information'}`, '');
  for (const b of doc.basics) push(`- **${b.label}**: ${b.value}`);
  push('', `_${doc.updatedLine}_`, '');

  push(`### ${doc.summaryHeading}`, '', doc.summary, '');

  push(`### ${doc.experienceHeading}`, '');
  for (const company of doc.companies) {
    push(`#### ${company.header}`, '');
    for (const block of company.blocks) {
      push(`**${block.heading}${block.meta ? ` ${block.meta}` : ''}**`, '');
      for (const b of block.bullets) push(`- ${b}`);
      push('');
    }
    if (company.techStack.length) {
      push(`**${lang === 'ja' ? '技術スタック' : 'Tech Stack'}**: ${company.techStack.join(', ')}`, '');
    }
    push('---', '');
  }

  push(`### ${doc.educationHeading}`, '');
  for (const e of doc.education) {
    push(`**${e.heading}**`, '');
    for (const b of e.bullets) push(`- ${b}`);
    push('');
  }

  push(`### ${doc.certificationsHeading}`, '');
  for (const c of doc.certifications) push(`- ${c}`);
  push('');

  push(`### ${doc.skillsHeading}`, '');
  for (const line of doc.skillLines) push(`- **${line.label}**: ${line.items}`);
  push('');

  push(`### ${doc.strengthsHeading}`, '');
  for (const s of doc.strengths) {
    push(`**${s.title}**`, '');
    for (const b of s.bullets) push(`- ${b}`);
    push('');
  }

  push(`### ${doc.selfProjectsHeading}`, '');
  for (const sp of doc.selfProjects) push(`- ${sp.title} — ${sp.desc}`);
  push('');

  return out.join('\n');
}
