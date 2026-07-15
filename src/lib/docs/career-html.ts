import type { Lang } from '../../data/profile/types';
import { buildCareerDoc } from './career';
import { esc, type RenderedDoc } from './html';

// HTML skin for the career documents: 職務経歴書 (ja) and CV (en).
// A4-safe: @page sets the per-page margins for print/PDF, so every page
// of the flowing document keeps its margins; blocks avoid awkward breaks.

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap');

@page {
  size: A4;
  margin: 14mm 15mm;
}

.career-doc {
  font-family: 'Inter', 'Noto Sans JP', system-ui, -apple-system, 'Segoe UI', sans-serif;
  color: #0f172a;
  line-height: 1.55;
  font-size: 10pt;
  width: 210mm;
  margin: 0 auto;
  padding: 14mm 15mm;
  background: #ffffff;
  box-sizing: border-box;
}

.career-doc .doc-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  border-bottom: 2px solid #0f172a;
  padding-bottom: 6px;
  margin-bottom: 4px;
}

.career-doc h1 {
  font-size: 20pt;
  margin: 0;
}

.career-doc .updated {
  color: #475569;
  font-size: 9pt;
  white-space: nowrap;
}

.career-doc .doc-name {
  font-size: 12pt;
  font-weight: 600;
  margin: 6px 0 14px;
}

.career-doc h2 {
  font-size: 13pt;
  margin: 16px 0 6px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 3px;
  break-after: avoid;
  page-break-after: avoid;
}

.career-doc h3 {
  font-size: 11pt;
  margin: 12px 0 2px;
  color: #334155;
  font-weight: 700;
  break-after: avoid;
  page-break-after: avoid;
}

.career-doc .block {
  margin: 6px 0 8px;
}

.career-doc .block-head {
  font-size: 10.5pt;
  font-weight: 600;
  margin: 8px 0 2px;
  break-after: avoid;
  page-break-after: avoid;
}

.career-doc .block-head .meta {
  font-weight: 500;
  color: #475569;
  font-size: 9.5pt;
}

.career-doc ul {
  margin: 2px 0 6px;
  padding-left: 18px;
}

.career-doc li {
  margin: 1.5px 0;
  break-inside: avoid;
  page-break-inside: avoid;
}

.career-doc .chips {
  margin: 4px 0 2px;
}

.career-doc .chip {
  display: inline-block;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 1px 8px;
  margin: 1.5px 3px 1.5px 0;
  font-size: 8.5pt;
  color: #334155;
}

.career-doc .skill-line {
  margin: 2px 0;
}

.career-doc .strength {
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 6px;
}

.career-doc p {
  margin: 4px 0;
}

.career-doc a {
  color: #0f172a;
  text-decoration: none;
}

@media print {
  .career-doc {
    width: auto;
    padding: 0;
    margin: 0;
  }
}
`;

export function renderCareerHtml(lang: Lang): RenderedDoc {
  const doc = buildCareerDoc(lang);
  const title = lang === 'ja' ? '職務経歴書' : 'Curriculum Vitae';
  const html: string[] = [];

  html.push('<div class="doc-header">');
  html.push(`<h1>${esc(title)}</h1>`);
  html.push(`<span class="updated">${esc(doc.updatedLine)}</span>`);
  html.push('</div>');
  html.push(`<div class="doc-name">${esc(doc.name)}</div>`);

  html.push(`<h2>${esc(doc.summaryHeading)}</h2>`);
  html.push(`<p>${esc(doc.summary)}</p>`);

  html.push(`<h2>${esc(doc.experienceHeading)}</h2>`);
  for (const company of doc.companies) {
    html.push(`<h3>${esc(company.header)}</h3>`);
    for (const block of company.blocks) {
      html.push('<div class="block">');
      html.push(
        `<div class="block-head">${esc(block.heading)}${block.meta ? ` <span class="meta">${esc(block.meta)}</span>` : ''}</div>`,
      );
      html.push('<ul>');
      for (const b of block.bullets) html.push(`<li>${esc(b)}</li>`);
      html.push('</ul>');
      html.push('</div>');
    }
    if (company.techStack.length) {
      html.push(
        `<div class="chips">${company.techStack.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>`,
      );
    }
  }

  html.push(`<h2>${esc(doc.skillsHeading)}</h2>`);
  for (const line of doc.skillLines) {
    html.push(`<div class="skill-line"><strong>${esc(line.label)}</strong>: ${esc(line.items)}</div>`);
  }

  html.push(`<h2>${esc(doc.educationHeading)}</h2>`);
  for (const e of doc.education) {
    html.push(`<div class="block-head">${esc(e.heading)}</div>`);
    if (e.bullets.length) {
      html.push('<ul>');
      for (const b of e.bullets) html.push(`<li>${esc(b)}</li>`);
      html.push('</ul>');
    }
  }

  html.push(`<h2>${esc(doc.certificationsHeading)}</h2>`);
  html.push('<ul>');
  for (const c of doc.certifications) html.push(`<li>${esc(c)}</li>`);
  html.push('</ul>');

  html.push(`<h2>${esc(doc.strengthsHeading)}</h2>`);
  for (const s of doc.strengths) {
    html.push('<div class="strength">');
    html.push(`<div class="block-head">${esc(s.title)}</div>`);
    html.push('<ul>');
    for (const b of s.bullets) html.push(`<li>${esc(b)}</li>`);
    html.push('</ul>');
    html.push('</div>');
  }

  return { title, bodyClass: 'career-doc', css: CSS, bodyHtml: html.join('\n') };
}
