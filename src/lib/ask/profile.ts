import { getData } from '../../data/about.ja';
import { profile } from '../../data/profile/profile';
import { text as loc } from '../../data/profile/types';
import type { Data, ExperienceEntity } from '../../types/data';
import type { Lang } from '../../i18n/utils';
import type { AskConfig, FactChunk } from './retrieve';

// ————————————————————————————————————————————————————————————————
// Grounding knowledge for the in-browser assistant (build-time).
//
// A small model (Qwen2.5-1.5B) will confidently invent facts, so we don't
// hand it the whole résumé and hope. Instead we split the résumé into small
// FACT CHUNKS; at query time the client retrieves only the chunks relevant to
// the question (see retrieve.ts) and feeds those — plus a short always-on core
// profile — as the sole source of truth. Focused context + an anti-invention
// instruction is what keeps it from fabricating degrees, employers, or URLs.
// ————————————————————————————————————————————————————————————————

function year(date: string): string {
  return date ? date.slice(0, 4) : '';
}

/** first 1–2 sentences, trimmed, so each fact stays compact */
function gist(text: string, max = 200): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  const parts = clean.split(/(?<=[。.])\s*/).filter(Boolean);
  let out = '';
  for (const p of parts) {
    if (out && out.length + p.length > max) break;
    out += p;
    if (out.length >= max) break;
  }
  return (out || clean).slice(0, max + 40).trim();
}

function period(exp: ExperienceEntity, present: string): string {
  const start = year(exp.startDate);
  const end = exp.endDate ? year(exp.endDate) : present;
  return start === end ? start : `${start}–${end}`;
}

// Japanese synonyms for a role, so JA queries retrieve the right chunk even
// though the source job titles are in English.
function roleTagsJa(jobTitle: string): string[] {
  const t = jobTitle.toLowerCase();
  const out: string[] = [];
  if (t.includes('lead')) out.push('テックリード', 'リーダー', 'マネジメント', 'チーム');
  if (t.includes('back')) out.push('バックエンド', 'サーバーサイド');
  if (t.includes('full')) out.push('フルスタック');
  return out;
}

/** Short, always-included profile — the anchor facts, regardless of the query. */
export function coreProfile(lang: Lang): string {
  const d: Data = getData(lang);
  const present = lang === 'ja' ? '現在' : 'present';
  const cur = d.experience?.[0];
  const skills = (d.skills?.ProgrammingSkills ?? []).slice(0, 10).map((s) => s.name).join(', ');
  const bits = [
    `${d.given_name} ${d.family_name} (日髙 悠太 / Yuta Hidaka), ${d.profession}, ${d.address}.`,
    gist(d.bio, 200),
  ];
  if (cur) {
    bits.push(
      (lang === 'ja' ? '現職: ' : 'Currently: ') +
        `${cur.company} — ${cur.jobTitle} (${year(cur.startDate)}–${present}).`,
    );
  }
  // Always carry the career timeline and education so a broad "tell me about
  // yourself" can't tempt the model into inventing employers or a degree.
  // The employer list comes from the canonical employment timeline (all of
  // them, newest first) — not inferred from project entries.
  const companies = [...profile.companies].reverse().map((c) => loc(c.name, lang));
  if (companies.length) bits.push((lang === 'ja' ? '在籍企業: ' : 'Companies: ') + companies.join(', ') + '.');
  if (d.education?.length) {
    bits.push(
      (lang === 'ja' ? '学歴: ' : 'Education: ') +
        d.education.map((e) => `${e.institution} ${e.degree} (${year(e.startDate)}–${year(e.endDate)})`).join('; ') +
        '.',
    );
  }
  if (skills) bits.push((lang === 'ja' ? '主な技術: ' : 'Core tech: ') + skills + '.');
  return bits.join(' ');
}

/** The résumé split into retrievable chunks, each tagged for keyword matching. */
export function factChunks(lang: Lang): FactChunk[] {
  const d: Data = getData(lang);
  const present = lang === 'ja' ? '現在' : 'present';
  const c: FactChunk[] = [];

  c.push({
    id: 'bio',
    text: gist(d.bio, 260),
    tags: ['bio', 'profile', 'background', 'summary', 'about', '経歴', '自己紹介', 'プロフィール', '概要'],
  });

  (d.experience ?? []).forEach((e, i) => {
    c.push({
      id: `exp${i}`,
      text: `${period(e, present)} ${e.company}, ${e.jobTitle}${e.projects.team ? ` (team ${e.projects.team})` : ''}. ${gist(e.projects.jobDescription, 210)}`,
      // company + role + tech are language-neutral; add JA career/role synonyms
      tags: [
        e.company,
        e.jobTitle,
        ...(e.projects.tags ?? []),
        ...roleTagsJa(e.jobTitle),
        '経歴', '職歴', 'キャリア', 'career', 'experience', 'work', '仕事', 'プロジェクト',
      ],
    });
  });

  const ps = d.skills?.ProgrammingSkills ?? [];
  if (ps.length) {
    c.push({
      id: 'skills',
      text:
        (lang === 'ja' ? '主な技術スキル: ' : 'Core technical skills: ') +
        ps.map((s) => (s.year > 0 ? `${s.name} (${s.year}y)` : s.name)).join(', ') +
        '.',
      tags: ['skills', 'tech', 'stack', 'technologies', '技術', 'スキル', '得意', ...ps.map((s) => s.name)],
    });
  }

  const ls = d.skills?.LanguageSkills ?? [];
  if (ls.length) {
    c.push({
      id: 'langs',
      text: (lang === 'ja' ? '語学: ' : 'Languages: ') + ls.map((s) => `${s.name} (${s.description})`).join(', ') + '.',
      tags: ['language', 'languages', 'english', 'japanese', '語学', '英語', '日本語'],
    });
  }

  (d.education ?? []).forEach((e, i) => {
    c.push({
      id: `edu${i}`,
      text: `${lang === 'ja' ? '学歴: ' : 'Education: '}${e.institution}, ${e.degree} (${year(e.startDate)}–${year(e.endDate)}). ${gist(e.description, 150)}`,
      tags: ['education', 'university', 'degree', 'school', 'study', '学歴', '大学', '学校', '専攻', e.institution],
    });
  });

  (d.selfProject ?? []).forEach((p, i) => {
    c.push({
      id: `proj${i}`,
      text: `${p.title}: ${gist(p.desc, 180)}`,
      tags: ['project', 'side project', 'personal', '個人開発', 'アプリ', '作品', p.title, ...(p.tags ?? []).filter(Boolean) as string[]],
    });
  });

  // ——— chunks sourced directly from the canonical profile ———
  // (certifications / strengths / employment timeline / project highlights —
  //  content that the legacy Data shape doesn't carry)

  const present2 = lang === 'ja' ? '現在' : 'present';
  const timeline = [...profile.companies]
    .reverse()
    .map((co) => {
      const from = co.joinDate.slice(0, 7);
      const to = co.leaveDate ? co.leaveDate.slice(0, 7) : present2;
      return `${loc(co.name, lang)} (${from}–${to})`;
    })
    .join(', ');
  c.push({
    id: 'timeline',
    text: (lang === 'ja' ? '職歴タイムライン（入社〜退社）: ' : 'Employment timeline: ') + timeline + '.',
    tags: [
      'timeline', 'employers', 'companies', 'history', 'when', 'join', 'career',
      '職歴', '入社', '退社', '在籍', 'いつ', '経歴',
      ...profile.companies.map((co) => loc(co.name, lang)),
    ],
  });

  const certs = profile.certifications
    .map((cert) => `${loc(cert.name, lang)} (${cert.year})`)
    .join(', ');
  c.push({
    id: 'certs',
    text: (lang === 'ja' ? '免許・資格: ' : 'Licenses and certifications: ') + certs + '.',
    tags: [
      'certification', 'certifications', 'license', 'licenses', 'qualification', 'qualifications',
      '資格', '免許', '取得',
      ...profile.certifications.map((cert) => loc(cert.name, lang)),
    ],
  });

  profile.strengths.forEach((s, i) => {
    c.push({
      id: `strength${i}`,
      text: `${lang === 'ja' ? '自己PR' : 'Strength'} — ${s.title[lang]}: ${gist(s.bullets[lang].join(' '), 220)}`,
      tags: [
        'strength', 'strengths', 'personality', 'appeal',
        '自己PR', '強み', '長所', 'アピール',
        s.title[lang],
      ],
    });
  });

  // Fact-dense highlights from the curated career-document bullets
  // (numbers like 1600社 / 20億PV / 36協定 that the short jobDescription
  // gists cut off). One compact chunk per detailed project.
  profile.projects.forEach((pr, i) => {
    if (!pr.detail) return;
    const company = profile.companies.find((co) => co.id === pr.companyId);
    const heading = loc(pr.detail.heading, lang);
    c.push({
      id: `hl${i}`,
      text: `${company ? loc(company.name, lang) : ''} — ${heading}: ${gist(pr.detail.bullets[lang].join(lang === 'ja' ? '。' : '. '), 230)}`,
      tags: [
        company ? loc(company.name, lang) : '',
        heading,
        ...(pr.detail.roleTeam ? [loc(pr.detail.roleTeam, lang)] : []),
        ...pr.tags.map((t) => loc(t, lang)),
        'プロジェクト', 'project', '実績', 'achievement',
      ].filter(Boolean),
    });
  });

  c.push({
    id: 'meta',
    text:
      lang === 'ja'
        ? 'このチャット自体について: サーバーを使わず、あなたのブラウザ内だけで動く小型言語モデル（Qwen2.5-1.5B、transformers.js + WebGPU）です。日髙がブラウザで動くLLMを実装したコーディングテストにちなんで作りました。'
        : 'About this chat itself: it is a small language model (Qwen2.5-1.5B via transformers.js + WebGPU) running entirely in your browser — no server. Yuta built it as a nod to a coding test about running an LLM in the browser.',
    tags: ['chat', 'bot', 'model', 'llm', 'ai', 'webgpu', 'transformers', 'browser', 'how', 'run', '動', '仕組み', 'モデル', 'ブラウザ'],
  });

  return c;
}

// A couple of example turns — few-shot priming. The second teaches the model to
// decline politely instead of inventing an answer. Not shown in the UI.
export function fewShot(lang: Lang): { role: 'user' | 'assistant'; content: string }[] {
  if (lang === 'ja') {
    return [
      { role: 'user', content: '簡単に自己紹介してください。' },
      {
        role: 'assistant',
        content:
          '日髙悠太と申します。GoとTypeScriptを軸に、数千RPS規模の高トラフィックなバックエンドやAWS/GCPのインフラ、Kafka・Sparkを使ったデータ基盤を手がけてきました。テックリードとしてチームづくりやコスト最適化にも取り組んでいます。',
      },
      { role: 'user', content: '好きな食べ物は何ですか？' },
      {
        role: 'assistant',
        content: 'すみません、その情報は公開していません。経歴や使っている技術についてでしたら、お答えできます。',
      },
    ];
  }
  return [
    { role: 'user', content: 'Please introduce yourself briefly.' },
    {
      role: 'assistant',
      content:
        "I'm Yuta Hidaka, a backend and full-stack engineer focused on Go and TypeScript. I've built and run high-traffic systems (thousands of RPS), cloud infra on AWS/GCP, and event-driven data platforms with Kafka and Spark, and I've led teams as a tech lead.",
    },
    { role: 'user', content: "What's your favorite food?" },
    {
      role: 'assistant',
      content: "I haven't shared that publicly — but I'm happy to talk about my work, tech stack, or career.",
    },
  ];
}

/** Everything the client needs to run retrieval + prompt-building for one locale. */
export function askConfig(lang: Lang): AskConfig {
  return { lang, core: coreProfile(lang), chunks: factChunks(lang), fewShot: fewShot(lang) };
}

/** Localized starter prompts shown as chips. */
export function samplePrompts(lang: Lang): string[] {
  return lang === 'ja'
    ? [
        '経歴を簡単に教えて',
        'テックリードとして何をしましたか？',
        'Go・Kafka・Sparkの経験は？',
        'このチャットは何で動いているの？',
      ]
    : [
        'Give me a quick overview of your background',
        'What did you do as a tech lead?',
        'Tell me about your Go / Kafka / Spark work',
        'What is this chat running on?',
      ];
}
