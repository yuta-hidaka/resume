import { profile } from '../../data/profile/profile';
import { esc, type RenderedDoc } from './html';
import { FONTS_CSS } from './fonts-css';

// ————————————————————————————————————————————————————————————————
// 履歴書 (JIS-style) — generated from the canonical profile.
// Two fixed A4 sheets; the timeline derives from education[] and
// companies[] (employment → 入社/退社, self-employed → 開業/廃業,
// freelance → 開始行のみ, leaveDate null → 現在に至る).
// ————————————————————————————————————————————————————————————————

interface TimelineRow {
  year: string;
  month: string;
  label: string;
  align?: 'center' | 'right';
}

const y = (d: string) => d.slice(0, 4);
const m = (d: string) => String(Number(d.slice(5, 7)));

function buildTimeline(): TimelineRow[] {
  const rows: TimelineRow[] = [];

  rows.push({ year: '', month: '', label: '学　歴', align: 'center' });
  for (const school of profile.education) {
    if (school.startDate) {
      rows.push({ year: y(school.startDate), month: m(school.startDate), label: `${school.rirekishoLabel} 入学` });
    }
    rows.push({ year: y(school.endDate), month: m(school.endDate), label: `${school.rirekishoLabel} 卒業` });
  }

  rows.push({ year: '', month: '', label: '職　歴', align: 'center' });
  let ongoing = false;
  for (const c of profile.companies) {
    const joinLabel = c.kind === 'self-employed' ? '開業' : c.kind === 'freelance' ? '' : '入社';
    const leaveLabel = c.kind === 'self-employed' ? '廃業' : '退社';
    rows.push({ year: y(c.joinDate), month: m(c.joinDate), label: `${c.legalName}${joinLabel ? ` ${joinLabel}` : ''}` });
    if (c.leaveDate === null) {
      ongoing = true;
    } else if (c.kind !== 'freelance') {
      rows.push({ year: y(c.leaveDate), month: m(c.leaveDate), label: `${c.legalName} ${leaveLabel}` });
    }
  }
  if (ongoing) rows.push({ year: '', month: '', label: '現在に至る' });
  rows.push({ year: '', month: '', label: '以上', align: 'right' });
  return rows;
}

function age(onDate: Date): number {
  const b = profile.person.birthDate;
  const by = Number(b.slice(0, 4));
  const bm = Number(b.slice(5, 7));
  const bd = Number(b.slice(8, 10));
  let a = onDate.getFullYear() - by;
  if (onDate.getMonth() + 1 < bm || (onDate.getMonth() + 1 === bm && onDate.getDate() < bd)) a -= 1;
  return a;
}

const CSS = `
${FONTS_CSS}
@page {
  size: A4;
  margin: 0;
}

.rirekisho {
  /* Self-hosted Noto subsets (400/700 only — synthetic weights force Type 3
     embedding in the PDF, which some viewers render blank). */
  font-family: 'Noto Serif JP', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
  color: #111111;
  background: #ffffff;
  width: 210mm;
  margin: 0 auto;
  font-size: 10.5pt;
  line-height: 1.4;
}

.rirekisho .sheet {
  width: 210mm;
  height: 296mm;
  padding: 12mm 14mm;
  box-sizing: border-box;
  overflow: hidden;
  background: #ffffff;
  position: relative;
}

.rirekisho .sheet + .sheet {
  border-top: 1px dashed #cccccc;
}

@media print {
  .rirekisho .sheet {
    page-break-after: always;
    break-after: page;
    height: 297mm;
  }
  .rirekisho .sheet:last-child {
    page-break-after: auto;
    break-after: auto;
  }
  .rirekisho .sheet + .sheet {
    border-top: none;
  }
}

.rirekisho .head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3mm;
}

.rirekisho .head h1 {
  font-size: 18pt;
  letter-spacing: 1.2em;
  margin: 0;
  font-weight: 700;
}

.rirekisho .head .asof {
  font-size: 9.5pt;
}

.rirekisho table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.rirekisho td,
.rirekisho th {
  border: 1.2px solid #333333;
  padding: 0.8mm 2mm;
  line-height: 1.3;
  vertical-align: middle;
  font-weight: 400;
  word-break: break-all;
}

.rirekisho .basic {
  margin-bottom: 4mm;
}

.rirekisho .basic .furigana {
  font-size: 8.5pt;
  height: 7mm;
}

.rirekisho .basic .name {
  font-size: 17pt;
  height: 16mm;
  font-weight: 700;
}

.rirekisho .basic .name .label,
.rirekisho .basic .label {
  font-size: 9pt;
  font-weight: 400;
  color: #333333;
}

.rirekisho .basic .birth {
  height: 9mm;
}

.rirekisho .photo-cell {
  width: 34mm;
  text-align: center;
  vertical-align: middle;
  padding: 1mm;
}

.rirekisho .photo-cell img {
  width: 30mm;
  height: 40mm;
  object-fit: cover;
  display: inline-block;
}

.rirekisho .gender-mark {
  display: inline-block;
  border: 1.4px solid #333333;
  border-radius: 50%;
  width: 1.7em;
  height: 1.7em;
  line-height: 1.7em;
  text-align: center;
}

.rirekisho .timeline col.c-year { width: 14mm; }
.rirekisho .timeline col.c-month { width: 10mm; }

.rirekisho .timeline th {
  text-align: center;
  font-weight: 700;
  height: 6.4mm;
  background: #ffffff;
  font-size: 9.5pt;
}

.rirekisho .timeline td {
  height: 6.6mm;
  font-size: 9.5pt;
  line-height: 1.25;
}

.rirekisho .timeline .num {
  text-align: center;
}

.rirekisho .timeline .section-label {
  text-align: center;
  font-weight: 700;
  letter-spacing: 0.6em;
}

.rirekisho .timeline .right {
  text-align: right;
}

.rirekisho .licenses {
  margin-bottom: 6mm;
}

.rirekisho .motivation-title {
  font-size: 9pt;
}

.rirekisho .motivation-body {
  height: 62mm;
  vertical-align: top;
  font-size: 10pt;
  line-height: 1.65;
}

.rirekisho .side-table {
  margin-bottom: 6mm;
}

.rirekisho .side-table td {
  height: 8mm;
}

.rirekisho .side-label {
  font-size: 9pt;
  width: 52mm;
}

.rirekisho .requests-body {
  height: 26mm;
  vertical-align: top;
}
`;

export function renderRirekisho(now: Date = new Date()): RenderedDoc {
  const p = profile.person;
  const asof = `${now.getFullYear()}年 ${now.getMonth() + 1}月 ${now.getDate()}日現在`;
  const birth = `${y(p.birthDate)}年 ${m(p.birthDate)}月 ${Number(p.birthDate.slice(8, 10))}日生（満${age(now)}歳）`;
  const genderCell =
    p.gender === null
      ? '男 ・ 女'
      : p.gender === '男'
        ? '<span class="gender-mark">男</span> ・ 女'
        : '男 ・ <span class="gender-mark">女</span>';

  const timeline = buildTimeline();
  const r = profile.rirekisho;
  const commute =
    r.commute.hours > 0 ? `約 ${r.commute.hours}時間 ${r.commute.minutes}分` : `約 ${r.commute.minutes}分`;
  const mark = (v: boolean | null, yes: string, no: string) =>
    v === null ? `${yes} ・ ${no}` : v ? `<span class="gender-mark">${yes}</span> ・ ${no}` : `${yes} ・ <span class="gender-mark">${no}</span>`;

  const html: string[] = [];

  // ——— Sheet 1: 基本情報 + 学歴・職歴 ———
  html.push('<div class="sheet">');
  html.push('<div class="head"><h1>履歴書</h1>' + `<span class="asof">${esc(asof)}</span></div>`);
  html.push('<table class="basic">');
  html.push('<colgroup><col /><col style="width:34mm" /></colgroup>');
  html.push(
    `<tr><td class="furigana"><span class="label">ふりがな</span>　${esc(p.furigana)}</td>` +
      `<td class="photo-cell" rowspan="3"><img src="${esc(p.photo)}" alt="証明写真" /></td></tr>`,
  );
  html.push(
    `<tr><td class="name"><span class="label">氏　名</span>　${esc(p.familyName.ja)} ${esc(p.givenName.ja)}</td></tr>`,
  );
  html.push(`<tr><td class="birth">${esc(birth)}　　${genderCell}</td></tr>`);
  html.push(`<tr><td colspan="2"><span class="label">現住所</span>　${esc(p.address.ja)}</td></tr>`);
  html.push('</table>');

  html.push('<table class="timeline">');
  html.push('<colgroup><col class="c-year" /><col class="c-month" /><col /></colgroup>');
  html.push('<tr><th>年</th><th>月</th><th>学歴・職歴（各別にまとめて書く）</th></tr>');
  for (const row of timeline) {
    const cls = row.align === 'center' ? 'section-label' : row.align === 'right' ? 'right' : '';
    html.push(
      `<tr><td class="num">${esc(row.year)}</td><td class="num">${esc(row.month)}</td>` +
        `<td class="${cls}">${esc(row.label)}</td></tr>`,
    );
  }
  html.push('</table>');
  html.push('</div>');

  // ——— Sheet 2: 免許・資格 + 志望動機ほか ———
  html.push('<div class="sheet">');
  html.push('<table class="timeline licenses">');
  html.push('<colgroup><col class="c-year" /><col class="c-month" /><col /></colgroup>');
  html.push('<tr><th>年</th><th>月</th><th>免許・資格</th></tr>');
  for (const c of profile.certifications) {
    const name = typeof c.name === 'string' ? c.name : c.name.ja;
    html.push(
      `<tr><td class="num">${c.year}</td><td class="num">${c.month ?? ''}</td><td>${esc(name)} 取得</td></tr>`,
    );
  }
  html.push('</table>');

  html.push('<table style="margin-bottom:6mm">');
  html.push(
    `<tr><td class="motivation-title">志望の動機、特技、好きな学科、アピールポイントなど</td></tr>` +
      `<tr><td class="motivation-body">${esc(r.motivationText)}</td></tr>`,
  );
  html.push('</table>');

  html.push('<table class="side-table">');
  html.push(`<tr><td class="side-label">通勤時間</td><td>${esc(commute)}</td></tr>`);
  html.push(`<tr><td class="side-label">扶養家族数（配偶者を除く）</td><td>${r.dependents} 人</td></tr>`);
  html.push(`<tr><td class="side-label">配偶者</td><td>${mark(r.spouse, '有', '無')}</td></tr>`);
  html.push(`<tr><td class="side-label">配偶者の扶養義務</td><td>${mark(r.spouseSupportObligation, '有', '無')}</td></tr>`);
  html.push('</table>');

  html.push('<table>');
  html.push(
    `<tr><td class="motivation-title">本人希望記入欄（特に給料・職種・勤務時間・勤務地・その他についての希望などがあれば記入）</td></tr>` +
      `<tr><td class="requests-body">${esc(r.requests)}</td></tr>`,
  );
  html.push('</table>');
  html.push('</div>');

  return { title: '履歴書', bodyClass: 'rirekisho', css: CSS, bodyHtml: html.join('\n') };
}
